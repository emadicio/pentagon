import { useState, useContext } from 'react';
import GlobalContext from '../../contexts/GlobalContext';
import PentagonController from '../../lib/PentagonController';
const { UIModes } = PentagonController;

import styles from './UIControlBar.module.scss';

const UIControlBar = () => {
  const {
    contextData: { pentagonController, uiMode },
    updateContextData,
  } = useContext(GlobalContext);

  const onClickVRButton = () => {
    if (uiMode === UIModes.vr) return;

    updateContextData({
      uiMode: UIModes.vr,
    });
    pentagonController.setUIMode(UIModes.vr);
  };

  const onClickTranslateButton = () => {
    if (uiMode === UIModes.translate) return;

    updateContextData({
      uiMode: UIModes.translate,
    });
    pentagonController.setUIMode(UIModes.translate);
  };

  const onClickRotateButton = () => {
    if (uiMode === UIModes.rotate) return;

    updateContextData({
      uiMode: PentagonController.UIModes.rotate,
    });
    pentagonController.setUIMode(UIModes.rotate);
  };

  const onClickResetButton = () => {
    pentagonController.resetObjectPosition();
  };

  if (!pentagonController) return null;

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.button} ${styles.vr} ${
          uiMode === UIModes.vr ? styles.active : ''
        }`}
        onClick={onClickVRButton}
      >
        <span className={styles.icon} />
      </div>

      <div
        className={`${styles.button} ${styles.translate} ${
          uiMode === UIModes.translate ? styles.active : ''
        }`}
        onClick={onClickTranslateButton}
      >
        <span className={styles.icon} />
      </div>
      <div
        className={`${styles.button} ${styles.rotate} ${
          uiMode === UIModes.rotate ? styles.active : ''
        }`}
        onClick={onClickRotateButton}
      >
        <span className={styles.icon} />
      </div>
      <div
        className={`${styles.button} ${styles.reset}`}
        onClick={onClickResetButton}
      >
        <span className={styles.icon} />
      </div>
    </div>
  );
};

export default UIControlBar;
