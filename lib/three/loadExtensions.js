/*
 * This method load Three.js extensions from the examples library
 * into the parameter object
 */
const loadExtensions = async (THREEx) => {
  THREEx.OrbitControls = (
    await import('three/examples/jsm/controls/OrbitControls')
  ).OrbitControls;

  THREEx.FirstPersonControls = (
    await import('three/examples/jsm/controls/FirstPersonControls')
  ).FirstPersonControls;

  THREEx.TransformControls = (
    await import('three/examples/jsm/controls/TransformControls')
  ).TransformControls;

  THREEx.GLTFLoader = (
    await import('three/examples/jsm/loaders/GLTFLoader')
  ).GLTFLoader;
};

export default loadExtensions;
