const UPDATE_OBJECT_TRANSFORM_SPEED = 3;

const hasReachedTarget = (value, targetValue, accuracy) => {
  const parsedValue = parseFloat(parseFloat(value).toFixed(2));

  const targetValeBoundMin = targetValue - accuracy / 2;
  const targetValueBoundMax = targetValue + accuracy / 2;
  const parsedTargetValueBoundMin = parseFloat(
    parseFloat(targetValeBoundMin).toFixed(2)
  );
  const parsedTargetValueBoundMax = parseFloat(
    parseFloat(targetValueBoundMax).toFixed(2)
  );

  return (
    parsedValue >= parsedTargetValueBoundMin &&
    parsedValue <= parsedTargetValueBoundMax
  );
};

const updateObjectTransform = (object, key, targetKey, speed, accuracy) => {
  const valueXYZ = object[key];
  const targetValueXYZ = object[targetKey];

  if (!hasReachedTarget(valueXYZ.x, targetValueXYZ.x, accuracy)) {
    if (valueXYZ.x >= targetValueXYZ.x) valueXYZ.x -= speed;
    else if (valueXYZ.x <= targetValueXYZ.x) valueXYZ.x += speed;
  }

  if (!hasReachedTarget(valueXYZ.y, targetValueXYZ.y, accuracy)) {
    if (valueXYZ.y >= targetValueXYZ.y) valueXYZ.y -= speed;
    else if (valueXYZ.y <= targetValueXYZ.y) valueXYZ.y += speed;
  }

  if (!hasReachedTarget(valueXYZ.z, targetValueXYZ.z, accuracy)) {
    if (valueXYZ.z >= targetValueXYZ.z) valueXYZ.z -= speed;
    else if (valueXYZ.z <= targetValueXYZ.z) valueXYZ.z += speed;
  }

  if (
    hasReachedTarget(valueXYZ.x, targetValueXYZ.x, accuracy) &&
    hasReachedTarget(valueXYZ.y, targetValueXYZ.y, accuracy) &&
    hasReachedTarget(valueXYZ.z, targetValueXYZ.z, accuracy)
  ) {
    const { x, y, z } = object[targetKey];
    object[key].set(x, y, z);
    delete object[targetKey];
  }
};

function updateCustomAnimations() {
  if (this._object.targetPosition)
    updateObjectTransform(
      this._object,
      'position',
      'targetPosition',
      UPDATE_OBJECT_TRANSFORM_SPEED,
      UPDATE_OBJECT_TRANSFORM_SPEED
    );
}

export default updateCustomAnimations;
