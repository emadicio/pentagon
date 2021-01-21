const xLimit = { min: -7, max: 7 };
const yLimit = { min: 0, max: 1 };
const zLimit = { min: -7, max: 6 };

function limitTransformControls(object) {
  const { position } = object;
  if (position.x < xLimit.min) position.x = xLimit.min;
  if (position.x > xLimit.max) position.x = xLimit.max;
  if (position.y < yLimit.min) position.y = yLimit.min;
  if (position.y > yLimit.max) position.y = yLimit.max;
  if (position.z < zLimit.min) position.z = zLimit.min;
  if (position.z > zLimit.max) position.z = zLimit.max;
}

export default limitTransformControls;
