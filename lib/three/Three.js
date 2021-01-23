import * as THREE from 'three';
import loadExtensions from './loadExtensions';
import { limitFirstPersonControls, limitTransformControls } from './boundaries';
import updateCustomAnimations from './updateCustomAnimations';
const THREEx = {};

const PENTAGON_SIZE = [45, 45, 1];
const OBJECT_SCALE = 0.04;
const OBJECT_DEFAULT_POSITION = [0, 2.4, 0];
const OBJECT_DEFAULT_ROTATION = [0, -Math.PI / 2, 0];
const TP_CAMERA_DEFAULT_POSITION = [0, 15, 80];
const ZOOM_MIN = 20;
const ZOOM_MAX = 130;
const LIGHT_PARAMS = [0xffffff, 4.6, 360];
const LIGHT_POSITION = [21, 24, 100];
const FP_CAMERA_Y = 2.5;
const FP_MOVEMENT_SPEED = 9;
const FP_CAMERA_SPEED = 0.09;
const BACKGROUND_IMG_URL = '/images/zurich.jpg';
const FLOOR_TEXTURE_IMG_URL = '/images/tile.jpg';

class Three {
  constructor() {
    this._scene = null;
    this._camera = null;
    this._renderer = null;
    this._clock = null;
    this._orbitControls = null;
    this._firstPersonControls = null;
    this._transformControls = null;
    this._floor = null;
    this._object = null;
    this._container = null;

    this._savedOrbitControlsPosition = null;
    this._savedFirstPersonControlsPosition = null;
  }

  async _init() {
    await loadExtensions(THREEx);
    this._initRenderer();
    this._initClock();
    this._initScene();
    this._initCamera();
    this._initLight();
    await this._initOrbitControls();
    await this._initTransformControls();

    this._initFloor();
    await this._initObject();

    this._handleResize();
    this._startRenderer();
  }

  _initRenderer() {
    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.needsUpdate = true;
    this._renderer.setSize(window.innerWidth, window.innerHeight);

    this._initBackground();
  }

  _initBackground() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(BACKGROUND_IMG_URL, () => {
      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(this._renderer, texture);
      this._scene.background = rt;
    });
  }

  _initClock() {
    this._clock = new THREE.Clock();
  }

  _initScene() {
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0xebe5e7);
  }

  _initCamera() {
    this._camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      20000
    );
  }

  _initLight() {
    const light = new THREE.SpotLight(...LIGHT_PARAMS);
    light.position.set(...LIGHT_POSITION);
    light.castShadow = true;

    light.shadow.mapSize.width = 3000;
    light.shadow.mapSize.height = 3000;

    this._scene.add(light);

    // const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
    // this._scene.add(shadowHelper);
  }

  async _initOrbitControls() {
    this._orbitControls = new THREEx.OrbitControls(
      this._camera,
      this._renderer.domElement
    );

    this._orbitControls.enablePan = false;
    this._orbitControls.enableDamping = true;
    this._orbitControls.maxPolarAngle = Math.PI / 2 - 2 * (Math.PI / 360);
    this._orbitControls.minDistance = ZOOM_MIN;
    this._orbitControls.maxDistance = ZOOM_MAX;
    this._camera.position.set(...TP_CAMERA_DEFAULT_POSITION);

    if (this._savedThirdPersonControlsPosition) {
      this._camera.position.set(...this._savedThirdPersonControlsPosition);
    } else {
      this._camera.position.set(...TP_CAMERA_DEFAULT_POSITION);
    }

    this._orbitControls.target.set(0, 0.5, 0);

    this._orbitControls.update();
  }

  async _initFirstPersonControls() {
    this._firstPersonControls = new THREEx.FirstPersonControls(
      this._camera,
      this._renderer.domElement
    );
    this._firstPersonControls.movementSpeed = FP_MOVEMENT_SPEED;
    this._firstPersonControls.lookSpeed = FP_CAMERA_SPEED;

    if (this._savedFirstPersonControlsPosition) {
      this._camera.position.set(...this._savedFirstPersonControlsPosition);
    } else {
      this._camera.position.set(
        ...[0, FP_CAMERA_Y, this._object.position.z + 30]
      );
    }

    this._firstPersonControls.lookAt(this._object.position);

    this._firstPersonControls.update(this._clock.getDelta());
  }

  async _initTransformControls() {
    this._transformControls = new THREEx.TransformControls(
      this._camera,
      this._renderer.domElement
    );
    this._transformControls.setSpace();

    this._transformControls.addEventListener('dragging-changed', (event) => {
      if (this._orbitControls) this._orbitControls.enabled = !event.value;
    });

    this._transformControls.addEventListener('change', () => {
      if (this._transformControls.mode === 'rotate') {
        this._transformControls.showX = false;
        this._transformControls.showZ = false;
      } else {
        this._transformControls.showX = true;
        this._transformControls.showZ = true;
      }
      limitTransformControls(this._object);
    });
  }

  _initFloor() {
    const floorGeometry = new THREE.CylinderGeometry(...PENTAGON_SIZE, 5);

    const floorTexture = new THREE.TextureLoader().load(FLOOR_TEXTURE_IMG_URL);
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(3.8, 3.8);
    floorTexture.anisotropy = new THREE.WebGLRenderer().capabilities.getMaxAnisotropy();

    const floorMaterial = new THREE.MeshPhongMaterial({
      map: floorTexture,
      alphaMap: floorTexture,
      bumpMap: floorTexture,
      bumpScale: 0.1,
      shininess: 10,
      side: THREE.DoubleSide,
    });

    this._floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this._floor.receiveShadow = true;
    this._floor.position.y = -0.5;
    this._floor.rotation.x = Math.PI;
    this._scene.add(this._floor);
  }

  async _initObject() {
    return new Promise((resolve) => {
      const loader = new THREEx.GLTFLoader().setPath('models/hotel/');
      loader.load('hotel.gltf', (gltf) => {
        this._object = gltf.scene;

        this._object.scale.x *= OBJECT_SCALE;
        this._object.scale.y *= OBJECT_SCALE;
        this._object.scale.z *= OBJECT_SCALE;

        this._object.position.set(...OBJECT_DEFAULT_POSITION);
        this._object.rotation.set(...OBJECT_DEFAULT_ROTATION);

        this._object.traverse(function (node) {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
          }
        });

        this._scene.add(this._object);
        this._transformControls.attach(this._object);
        this._scene.add(this._transformControls);
        resolve();
      });
    });
  }

  _startRenderer() {
    this._handleResize();
    this._renderer.render(this._scene, this._camera);
    this._animate();
    this._container = document.getElementById('pentagon-app');
    this._container.appendChild(this._renderer.domElement);
  }

  _handleResize() {
    window.addEventListener(
      'resize',
      () => {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
      },
      false
    );
  }

  _animate() {
    window.requestAnimationFrame(this._animate.bind(this));
    this._update();
    this._render();
  }

  _update() {
    if (this._orbitControls) {
      this._orbitControls.update();
    }
    if (this._firstPersonControls) {
      this._firstPersonControls.update(this._clock.getDelta());
      limitFirstPersonControls(this._camera);
    }

    updateCustomAnimations.apply(this);
  }

  _render() {
    this._renderer.render(this._scene, this._camera);
  }

  async _setFirstPersonView() {
    const { x, y, z } = this._camera.position;
    this._savedThirdPersonControlsPosition = [x, y, z];
    if (this._orbitControls) {
      this._orbitControls.dispose();
      this._orbitControls = null;
    }
    if (this._transformControls) this._transformControls.detach();

    await this._initFirstPersonControls();
  }

  async _setThirdPersonView(mode) {
    const { x, y, z } = this._camera.position;
    this._savedFirstPersonControlsPosition = [x, y, z];
    if (this._firstPersonControls) {
      this._firstPersonControls.dispose();
      this._firstPersonControls = null;
    }
    if (this._transformControls) {
      this._transformControls.setMode(mode);
      this._transformControls.attach(this._object);
    }

    await this._initOrbitControls();
  }

  _setTransformControlsMode(mode) {
    this._transformControls.setMode(mode);
  }

  _setObjectTargetPositon(x, y, z) {
    this._object.targetPosition = {
      x,
      y,
      z,
    };
  }

  _resetObjectTransform() {
    this._setObjectTargetPositon(...OBJECT_DEFAULT_POSITION);
    this._object.rotation.set(...OBJECT_DEFAULT_ROTATION);
  }

  // Might need this later
  // _getDefaultObjectY() {
  //   const boundingBox = new THREE.Box3().setFromObject(this._object);
  //   const size = new THREE.Vector3();
  //   boundingBox.getSize(size);
  //   return size.y / 2;
  // }
}

export default Three;
