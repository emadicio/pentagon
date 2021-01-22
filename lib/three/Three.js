import * as THREE from 'three';
import loadExtensions from './loadExtensions';
import { limitFirstPersonControls, limitTransformControls } from './boundaries';
import updateCustomAnimations from './updateCustomAnimations';
const THREEx = {};
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
    const texture = loader.load('/images/background.jpg', () => {
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
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      20000
    );
  }

  _initLight() {
    const light = new THREE.SpotLight(0xffffff, 3.2, 65);
    light.position.set(4, 18, -10);
    light.castShadow = true;

    light.shadow.mapSize.width = 3000;
    light.shadow.mapSize.height = 3000;

    this._scene.add(light);

    /* const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
    this._scene.add(shadowHelper); */
  }

  async _initOrbitControls() {
    this._orbitControls = new THREEx.OrbitControls(
      this._camera,
      this._renderer.domElement
    );

    this._orbitControls.enablePan = false;
    this._orbitControls.enableDamping = true;
    this._orbitControls.maxPolarAngle = Math.PI / 2 - 2 * (Math.PI / 360);
    this._orbitControls.minDistance = 8;
    this._orbitControls.maxDistance = 35;
    this._camera.position.set(5, 6, 15);
    this._orbitControls.target.set(0, 0.5, 0);

    this._orbitControls.update();
  }

  async _initFirstPersonControls() {
    this._firstPersonControls = new THREEx.FirstPersonControls(
      this._camera,
      this._renderer.domElement
    );
    this._firstPersonControls.movementSpeed = 4;
    this._firstPersonControls.lookSpeed = 0.06;
    this._camera.position.set(0, 0.7, 0);
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
    const floorGeometry = new THREE.CylinderGeometry(8, 8, 0.4, 5, 1);

    const floorTexture = new THREE.TextureLoader().load('/images/tile.jpg');
    floorTexture.rotation = Math.PI / 2;
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
      const loader = new THREEx.GLTFLoader().setPath('models/');
      loader.load('DamagedHelmet.gltf', (gltf) => {
        this._object = gltf.scene;

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
    if (this._orbitControls) this._orbitControls.dispose();
    this._orbitControls = null;
    if (this._transformControls) this._transformControls.detach();

    await this._initFirstPersonControls();
  }

  async _setThirdPersonView(mode) {
    if (this._firstPersonControls) this._firstPersonControls.dispose();
    this._firstPersonControls = null;
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
    this._setObjectTargetPositon(0, 0, 0);
    this._object.rotation.set(0, 0, 0);
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
