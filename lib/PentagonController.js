import Three from './three/Three';

const UIModes = {
  vr: 'vr',
  translate: 'translate',
  rotate: 'rotate',
};
class PentagonController extends Three {
  constructor() {
    super();
    this.uiMode = UIModes.translate;
  }
  static get UIModes() {
    return UIModes;
  }

  static get TransformControlsModes() {
    return TransformControlsModes;
  }

  async boot() {
    await this._init();
  }

  setUIMode(mode) {
    if (mode === this.uiMode) return;

    if (mode === UIModes.vr) {
      this._setFirstPersonView();
      this.uiMode = UIModes.vr;
    } else if (mode === UIModes.translate) {
      if (this.uiMode === UIModes.vr) {
        this._setThirdPersonView('translate');
      } else {
        this._setTransformControlsMode('translate');
      }
      this.uiMode = UIModes.translate;
    } else if (mode === UIModes.rotate) {
      if (this.uiMode === UIModes.vr) {
        this._setThirdPersonView('rotate');
      } else {
        this._setTransformControlsMode('rotate');
      }
      this.uiMode = UIModes.rotate;
    }
  }

  resetObjectPosition() {
    this._resetObjectTransform();
  }

  setScenery() {}
}

export default PentagonController;
