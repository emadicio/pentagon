import * as THREE from 'three';
import loadExtensions from './loadExtensions';
import { limitFirstPersonControls, limitTransformControls } from './boundaries';
import updateCustomAnimations from './updateCustomAnimations';
const THREEx = {};

const PENTAGON_SIZE = [45, 45, 1];
const ORBIT_CONTROLS_CAMERA_DEFAULT_POSITION = [0, 15, 80];
const ORBIT_CONTROLS_TARGET_POSITION = [0, 0.5, 0];
const ORBIT_CONTROLS_MAX_POLAR_ANGLE = Math.PI / 2 - 2 * (Math.PI / 360);
const ORBIT_CONTROLS_MIN_DISTANCE = 20;
const ORBIT_CONTROLS_MAX_DISTANCE = 130;
const FIRST_PERSON_CAMERA_Y = 2.5;
const FIRST_PERSON_MOVEMENT_SPEED = 9;
const FIRST_PERSON_LOOK_SPEED = 0.09;
const CAMERA_FOV = 55;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 20000;

/*
 * Three:
 * A Class which operates directly with the Three.js
 * Objects, inner workings
 */
class Three {
  constructor() {
    this._scene = null;
    this._camera = null;
    this._renderer = null;
    this._light = null;
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

  /*
   * Inits the fundamental Three.js objects and components
   * and injects the scene into the DOM
   */
  async _init(scenery) {
    await loadExtensions(THREEx);

    this._setScenery(scenery);
    this._addRenderer();
    this._setBackground();
    this._addClock();
    this._addScene();
    this._addCamera();
    this._addLight();
    await this._addOrbitControls();
    await this._addTransformControls();

    this._addFloor();
    await this._addObject();

    this._handleResize();
    this._startRenderer();
  }

  /*
   * The scenery determines:
   * - Background image
   * - Light
   * - Floor texture
   * - Model
   * of the scene
   */
  async _setScenery(scenery) {
    if (this._scenery) {
      // If the scenery is being changed

      //TODO: It would be great to implement some kind of caching system
      this._scenery = scenery;

      this._setBackground();
      this._addLight();
      this._addFloor();

      this._transformControls.detach();
      this._addObject();
    } else {
      this._scenery = scenery;
    }
  }

  /*
   * Inits the Three.js WebGLRenderer
   */
  _addRenderer() {
    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.needsUpdate = true;
    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /*
   * Sets the background of the scene
   */
  _setBackground() {
    const { image } = this._scenery.background;

    const loader = new THREE.TextureLoader();
    const texture = loader.load(image, () => {
      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(this._renderer, texture);
      this._scene.background = rt;
    });
  }

  /*
   * Sets the clock used for custom animations
   */
  _addClock() {
    this._clock = new THREE.Clock();
  }

  /*
   * Inits the scene, the container for the meshes
   */
  _addScene() {
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0xebe5e7);
  }

  /*
   * Inits the perspective camera
   */
  _addCamera() {
    this._camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      CAMERA_NEAR,
      CAMERA_FAR
    );
  }

  /*
   * Inits the light into the scene
   */
  _addLight() {
    const { intensity, distance, position } = this._scenery.light;

    /*
     * If a light already exists set the new parameters
     */
    if (this._light) {
      this._light.intensity = intensity;
      this._light.position.set(...position);
      this._light.distance = distance;
      return;
    }

    this._light = new THREE.SpotLight(0xffffff, intensity, distance);
    this._light.position.set(...position);
    this._light.castShadow = true;

    this._light.shadow.mapSize.width = 3000;
    this._light.shadow.mapSize.height = 3000;

    this._scene.add(this._light);

    // Dev utility for tracing light
    // const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
    // this._scene.add(shadowHelper);
  }

  /*
   * Inits into the scene orbit controls
   * Used for third person view
   */
  async _addOrbitControls() {
    this._orbitControls = new THREEx.OrbitControls(
      this._camera,
      this._renderer.domElement
    );

    this._orbitControls.enablePan = false;
    this._orbitControls.enableDamping = true;
    this._orbitControls.maxPolarAngle = ORBIT_CONTROLS_MAX_POLAR_ANGLE;
    this._orbitControls.minDistance = ORBIT_CONTROLS_MIN_DISTANCE;
    this._orbitControls.maxDistance = ORBIT_CONTROLS_MAX_DISTANCE;
    this._camera.position.set(...ORBIT_CONTROLS_CAMERA_DEFAULT_POSITION);

    if (this._savedThirdPersonControlsPosition) {
      this._camera.position.set(...this._savedThirdPersonControlsPosition);
    } else {
      this._camera.position.set(...ORBIT_CONTROLS_CAMERA_DEFAULT_POSITION);
    }

    this._orbitControls.target.set(...ORBIT_CONTROLS_TARGET_POSITION);

    this._orbitControls.update();
  }

  /*
   * Inits first person controls,
   * Used for VR Mode
   */
  async _initFirstPersonControls() {
    this._firstPersonControls = new THREEx.FirstPersonControls(
      this._camera,
      this._renderer.domElement
    );
    this._firstPersonControls.movementSpeed = FIRST_PERSON_MOVEMENT_SPEED;
    this._firstPersonControls.lookSpeed = FIRST_PERSON_LOOK_SPEED;

    if (this._savedFirstPersonControlsPosition) {
      this._camera.position.set(...this._savedFirstPersonControlsPosition);
    } else {
      this._camera.position.set(
        ...[0, FIRST_PERSON_CAMERA_Y, this._object.position.z + 30]
      );
    }

    this._firstPersonControls.lookAt(this._object.position);

    this._firstPersonControls.update(this._clock.getDelta());
  }

  /*
   * Transform controls are used to drag the object around the scene
   */
  async _addTransformControls() {
    this._transformControls = new THREEx.TransformControls(
      this._camera,
      this._renderer.domElement
    );
    this._transformControls.setSpace();

    /*
     * Prevents the camera from rotating while dragging an object
     * By disabling orbit controls
     */
    this._transformControls.addEventListener('dragging-changed', (event) => {
      if (this._orbitControls) this._orbitControls.enabled = !event.value;
    });

    this._transformControls.addEventListener('change', () => {
      if (this._transformControls.mode === 'rotate') {
        // In rotation mode, only allow rotation on Y axis
        this._transformControls.showX = false;
        this._transformControls.showZ = false;
      } else {
        // In translation mode, allow translate on all axis
        this._transformControls.showX = true;
        this._transformControls.showZ = true;
      }
      // Prevent the mesh from being dragged beyond the boundaries of the floor
      limitTransformControls(this._object);
    });
  }

  /*
   * Adds the floor/pentagon mesh
   */
  _addFloor() {
    const { image, shininess, bumpScale } = this._scenery.floor;

    if (this._floor) {
      // If a floor already exists, dispose of the old one
      this._scene.remove(this._object);
      if (this._floor.geometry) this._floor.geometry.dispose();
      if (this._floor.material) this._floor.material.dispose();
      this._renderer.renderLists.dispose();
    }

    const floorGeometry = new THREE.CylinderGeometry(...PENTAGON_SIZE, 5);
    const floorTexture = new THREE.TextureLoader().load(image);
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(3.8, 3.8);
    floorTexture.anisotropy = new THREE.WebGLRenderer().capabilities.getMaxAnisotropy();

    const floorMaterial = new THREE.MeshPhongMaterial({
      map: floorTexture,
      alphaMap: floorTexture,
      bumpMap: floorTexture,
      side: THREE.DoubleSide,
      bumpScale,
      shininess,
    });

    this._floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this._floor.receiveShadow = true;
    this._floor.position.y = -0.5;
    this._floor.rotation.x = Math.PI;
    this._scene.add(this._floor);
  }

  /*
   * Adds the building object mesh into the scene
   */
  async _addObject() {
    const {
      path,
      filename,
      scale,
      defaultPosition,
      defaultRotation,
    } = this._scenery.object;

    if (this._object) {
      // If an object already exists, dispose of the old one
      this._scene.remove(this._object);
      this._object.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          if (node.geometry) node.geometry.dispose();
          if (node.material) node.material.dispose();
        }
      });

      this._renderer.renderLists.dispose();
    }

    return new Promise((resolve) => {
      const loader = new THREEx.GLTFLoader().setPath(path);
      loader.load(filename, (gltf) => {
        this._object = gltf.scene;

        this._object.scale.x *= scale;
        this._object.scale.y *= scale;
        this._object.scale.z *= scale;

        this._object.position.set(...defaultPosition);
        this._object.rotation.set(...defaultRotation);

        // The loaded object is actually a collection of meshes
        this._object.traverse((node) => {
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

  /*
   * Handle resizing of the window
   */
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

  /*
   * Starts the renderer, the animate cycle and adds the scene to the document
   */
  _startRenderer() {
    this._handleResize();
    this._renderer.render(this._scene, this._camera);
    this._animate();
    this._container = document.getElementById('pentagon-app');
    this._container.appendChild(this._renderer.domElement);
  }

  /*
   * This is the "heartbeat" of the application
   * which triggers the re-rendering of the scene frame many times per second
   */
  _animate() {
    window.requestAnimationFrame(this._animate.bind(this));
    this._update();
    this._render();
  }

  /*
   * Update objects inner parameters
   */
  _update() {
    if (this._orbitControls) {
      this._orbitControls.update();
    }
    if (this._firstPersonControls) {
      this._firstPersonControls.update(this._clock.getDelta());
      limitFirstPersonControls(this._camera);
    }

    // Triggers custom animations
    updateCustomAnimations.apply(this);
  }

  /*
   * Renders the scene frame
   */
  _render() {
    this._renderer.render(this._scene, this._camera);
  }

  /*
   * Switches to First Person controls
   */
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

  /*
   * Switches to Third Person controls
   */
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

    await this._addOrbitControls();
  }

  /*
   * Changes the type of transform controls (rotate/translate)
   */
  _setTransformControlsMode(mode) {
    this._transformControls.setMode(mode);
  }

  /*
   * Sets the flag targetParameter to the object
   * The custom animation handler will translate the object
   * to this position over time
   */
  _setObjectTargetPositon(x, y, z) {
    this._object.targetPosition = {
      x,
      y,
      z,
    };
  }

  /*
   * Resets object position and rotation to default values
   */
  _resetObjectTransform() {
    const { defaultPosition, defaultRotation } = this._scenery.object;

    this._setObjectTargetPositon(...defaultPosition);
    this._object.rotation.set(...defaultRotation);
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
