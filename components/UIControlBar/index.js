import { useContext } from 'react';
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
    setUIMode(UIModes.vr);

    document.addEventListener(
      'mousedown',
      () => {
        console.log('ciao');
        setUIMode(UIModes.translate);
      },
      { capture: true, once: true }
    );
  };

  const onClickTranslateButton = () => {
    if (uiMode === UIModes.translate) return;
    setUIMode(UIModes.translate);
  };

  const onClickRotateButton = () => {
    if (uiMode === UIModes.rotate) return;
    setUIMode(UIModes.rotate);
  };

  const setUIMode = (uiMode) => {
    updateContextData({
      uiMode,
    });
    pentagonController.setUIMode(uiMode);
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
