import { useState, useContext } from 'react';
import GlobalContext from '../../contexts/GlobalContext';
import PentagonController from '../../lib/PentagonController';
const { UIModes, TransformControlsModes } = PentagonController;

import styles from './UIControlBar.module.scss';

const UIControlBar = () => {
  const {
    contextData: { pentagonController, uiMode },
    updateContextData,
  } = useContext(GlobalContext);

  const onClickTranslateButton = () => {
    updateContextData({
      uiMode: UIModes.translate,
    });
    pentagonController.setTransformControlsMode(
      TransformControlsModes.translate
    );
  };

  const onClickRotateButton = () => {
    updateContextData({
      uiMode: PentagonController.UIModes.rotate,
    });
    pentagonController.setTransformControlsMode(TransformControlsModes.rotate);
  };

  const onClickResetButton = () => {
    pentagonController.resetTransformControls();
  };

  if (!pentagonController) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}>LG</div>
      <div className={`${styles.button} ${styles.vr}`}>VR</div>
      <div
        className={`${styles.button} ${
          uiMode === UIModes.translate ? styles.buttonActive : ''
        }`}
        onClick={onClickTranslateButton}
      >
        TR
      </div>
      <div
        className={`${styles.button} ${
          uiMode === UIModes.rotate ? styles.buttonActive : ''
        }`}
        onClick={onClickRotateButton}
      >
        RT
      </div>
      <div className={styles.button} onClick={onClickResetButton}>
        RS
      </div>
    </div>
  );
};

export default UIControlBar;
