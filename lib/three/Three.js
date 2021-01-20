import * as THREE from 'three';
import loadExtensions from './loadExtensions';
const THREEx = {};

class Three {
  constructor() {
    this._scene = null;
    this._camera = null;
    this._renderer = null;
    this._orbitControls = null;
    this._transformControls = null;
    this._floor = null;
    this._house = null;
    this._container = null;
  }

  async _init() {
    await loadExtensions(THREEx);
    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initLight();
    await this._initOrbitControls();
    await this._initTransformControls();

    this._initFloor();
    await this._initHouse();

    this._handleResize();
    this._startRenderer();
  }

  _initRenderer() {
    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.setSize(window.innerWidth, window.innerHeight);
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
    this._camera.position.set(5, 6, 15);
  }

  _initLight() {
    const light = new THREE.AmbientLight(0xffffff, 20);
    this._scene.add(light);
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
    this._orbitControls.target.set(0, 0.5, 0);
    this._orbitControls.update();
  }

  async _initTransformControls() {
    this._transformControls = new THREEx.TransformControls(
      this._camera,
      this._renderer.domElement
    );

    this._transformControls.setSpace();

    this._transformControls.addEventListener('dragging-changed', (event) => {
      this._orbitControls.enabled = !event.value;
    });

    const xLimit = { min: -7, max: 7 };
    const yLimit = { min: 0, max: 1 };
    const zLimit = { min: -7, max: 6 };
    this._transformControls.addEventListener('change', () => {
      const { position } = this._house;
      if (position.x < xLimit.min) position.x = xLimit.min;
      if (position.x > xLimit.max) position.x = xLimit.max;
      if (position.y < yLimit.min) position.y = yLimit.min;
      if (position.y > yLimit.max) position.y = yLimit.max;
      if (position.z < zLimit.min) position.z = zLimit.min;
      if (position.z > zLimit.max) position.z = zLimit.max;
    });
  }

  _initFloor() {
    const floorGeometry = new THREE.CylinderGeometry(8, 8, 0.3, 5, 1);

    const floorTexture = new THREE.TextureLoader().load(
      '/images/checkerboard.jpg'
    );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    const floorMaterial = new THREE.MeshBasicMaterial({
      map: floorTexture,
      side: THREE.DoubleSide,
    });

    this._floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this._floor.position.y = -0.5;
    this._floor.rotation.x = Math.PI;
    this._scene.add(this._floor);
  }

  async _initHouse() {
    return new Promise((resolve) => {
      const loader = new THREEx.GLTFLoader().setPath('models/');
      loader.load('DamagedHelmet.gltf', (gltf) => {
        this._house = gltf.scene;
        this._scene.add(this._house);
        this._transformControls.attach(this._house);
        this._scene.add(this._transformControls);
        resolve();
      });
    });
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

  _startRenderer() {
    this._renderer.render(this._scene, this._camera);
    this._animate();
    this._container = document.getElementById('pentagon-app');
    this._container.appendChild(this._renderer.domElement);
  }

  _animate() {
    window.requestAnimationFrame(this._animate.bind(this));
    this._render();
    this._update();
  }

  _render() {
    this._renderer.render(this._scene, this._camera);
  }

  _update() {
    this._orbitControls.update();
  }

  _setTransformControlsMode(mode) {
    this._transformControls.setMode(mode);
  }
}

export default Three;
