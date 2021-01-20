const loadExtensions = async (THREEx) => {
  THREEx.OrbitControls = (
    await import('three/examples/jsm/controls/OrbitControls')
  ).OrbitControls;

  THREEx.TransformControls = (
    await import('three/examples/jsm/controls/TransformControls')
  ).TransformControls;

  THREEx.GLTFLoader = (
    await import('three/examples/jsm/loaders/GLTFLoader')
  ).GLTFLoader;
};

export default loadExtensions;
