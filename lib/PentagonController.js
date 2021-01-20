import Three from './three/Three';

const BuildingControlsModes = {
  translate: 'translate',
  rotate: 'rotate',
};

class PentagonController extends Three {
  static get BuildingControlsModes() {
    return BuildingControlsModes;
  }

  async boot() {
    await this._init();
  }

  setBuildingControlsMode(mode) {
    this._setTransformControlsMode(BuildingControlsModes[mode]);
  }

  setFloorImage() {}
  setBackgroundImage() {}
}

export default PentagonController;
