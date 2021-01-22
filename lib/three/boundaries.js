const X_LIMIT = { min: -7, max: 7 };
const Y_LIMIT = { min: 0, max: 1 };
const Z_LIMIT = { min: -7, max: 6 };

const FIRST_PERSON_Y_LIMIT = 0.75;

function limitFirstPersonControls(camera) {
  const { position } = camera;
  position.y = FIRST_PERSON_Y_LIMIT;

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
