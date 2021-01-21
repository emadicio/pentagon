import Three from './three/Three';

const UIModes = {
  vr: 'vr',
  translate: 'translate',
  rotate: 'rotate',
};

const TransformControlsModes = {
  translate: 'translate',
  rotate: 'rotate',
};

class PentagonController extends Three {
  static get UIModes() {
    return UIModes;
  }

  static get TransformControlsModes() {
    return TransformControlsModes;
  }

  async boot() {
    await this._init();
  }

  setTransformControlsMode(mode) {
    this._setTransformControlsMode(TransformControlsModes[mode]);
  }

  resetTransformControls() {
    this._resetObjectPosition();
    this._resetObjectRotation();
  }

  setScenery() {}
}

export default PentagonController;
