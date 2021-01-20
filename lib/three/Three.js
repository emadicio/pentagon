import * as THREE from 'three';
import loadExtensions from './loadExtensions';
const THREEx = {};

class Three {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.orbitControls = null;
    this.transformControls = null;
    this.floor = null;
    this.cube = null;
    this.container = null;

    this.init();
  }

  async init() {
    await loadExtensions(THREEx);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      20000
    );
    this.camera.position.set(5, 6, 15);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.initFloor();
    //this.initCube();
    this.initFog();
    await this.initHelmet();

    await this.initOrbitControls();
    await this.initTransformControls();

    const light = new THREE.AmbientLight(0xffffff, 20);
    this.scene.add(light);

    this.renderer.render(this.scene, this.camera);
    this.animate();

    this.container = document.getElementById('threejs');
    this.container.appendChild(this.renderer.domElement);
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.update();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  update() {
    this.orbitControls.update();
  }

  async initOrbitControls() {
    this.orbitControls = new THREEx.OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    this.orbitControls.enablePan = false;
    this.orbitControls.enableDamping = true;
    this.orbitControls.maxPolarAngle = Math.PI / 2 - 2 * (Math.PI / 360);
    this.orbitControls.minDistance = 2;
    this.orbitControls.maxDistance = 35;
    this.orbitControls.target.set(0, 0.5, 0);
    this.orbitControls.update();
  }

  async initTransformControls() {
    this.transformControls = new THREEx.TransformControls(
      this.camera,
      this.renderer.domElement
    );

    this.transformControls.setSpace();

    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.orbitControls.enabled = !event.value;
    });

    const xLimit = { min: -1, max: 1 };
    const yLimit = { min: -1, max: 1 };
    const zLimit = { min: -1, max: 1 };
    this.transformControls.addEventListener('change', () => {
      const { position } = this.gltf;
      console.log(position);
      if (position.x < xLimit.min) position.x = xLimit.min;
      else if (position.x > xLimit.max) position.x = xLimit.max;
      else if (position.y < yLimit.min) position.y = yLimit.min;
      else if (position.y > yLimit.max) position.y = yLimit.max;
      else if (position.z < zLimit.min) position.x = zLimit.min;
      else if (position.z > zLimit.max) position.x = zLimit.max;
    });
  }

  initFloor() {
    const floorGeometry = new THREE.CylinderGeometry(8, 8, 0.25, 5, 1);

    const floorTexture = new THREE.TextureLoader().load(
      '/images/checkerboard.jpg'
    );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    const floorMaterial = new THREE.MeshBasicMaterial({
      map: floorTexture,
      side: THREE.DoubleSide,
    });

    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.position.y = -0.5;
    this.floor.rotation.x = Math.PI;
    this.scene.add(this.floor);
  }

  initCube() {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xcd853f });

    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);
  }

  initFog() {
    this.scene.fog = new THREE.FogExp2(0x9999ff, 0.015);
  }

  async initHelmet() {
    const loader = new THREEx.GLTFLoader().setPath('models/');
    loader.load('DamagedHelmet.gltf', (gltf) => {
      this.gltf = gltf.scene;
      this.scene.add(this.gltf);
      this.transformControls.attach(this.gltf);
      this.scene.add(this.transformControls);
    });
  }
}

export default Three;
