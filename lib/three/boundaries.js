const X_LIMIT = { min: -41, max: 41 };
const Y_LIMIT = { min: 0, max: 5 };
const Z_LIMIT = { min: -38, max: 36 };

const FP_Y_LIMIT = 2.5;

function limitFirstPersonControls(camera) {
  const { position } = camera;
  position.y = FP_Y_LIMIT;

  if (position.x < X_LIMIT.min) position.x = X_LIMIT.min;
  if (position.x > X_LIMIT.max) position.x = X_LIMIT.max;
  if (position.z < Z_LIMIT.min) position.z = Z_LIMIT.min;
  if (position.z > Z_LIMIT.max) position.z = Z_LIMIT.max;
}

function limitTransformControls(object) {
  const { position } = object;
  if (position.x < X_LIMIT.min) position.x = X_LIMIT.min;
  if (position.x > X_LIMIT.max) position.x = X_LIMIT.max;
  if (position.y < Y_LIMIT.min) position.y = Y_LIMIT.min;
  if (position.y > Y_LIMIT.max) position.y = Y_LIMIT.max;
  if (position.z < Z_LIMIT.min) position.z = Z_LIMIT.min;
  if (position.z > Z_LIMIT.max) position.z = Z_LIMIT.max;
}

export { limitFirstPersonControls, limitTransformControls };
