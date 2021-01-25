import { useContext, useEffect } from 'react';
import GlobalContext from '../../contexts/GlobalContext';
import PentagonController from '../../lib/PentagonController';
const { UIModes } = PentagonController;

import styles from './UIControlBar.module.scss';

/*
 * Control Bar UI Component
 */
const UIControlBar = () => {
  const {
    contextData: { pentagonController, uiMode, sceneries, currentScenery },
    updateContextData,
  } = useContext(GlobalContext);

  useEffect(() => {
    console.log(sceneries);
  }, []);

  const onSelectScenery = (e) => {
    const sceneryId = e.target.value;
    const scenery = sceneries.find((scenery) => scenery.id === sceneryId);
    updateContextData({
      currentScenery: scenery,
    });
    pentagonController.changeScenery(scenery);
  };

  const onClickVRButton = () => {
    if (uiMode === UIModes.vr) return;
    setUIMode(UIModes.vr);

    /*
     * Exit VR mode on click
     */
    document.addEventListener('mousedown', () => setUIMode(UIModes.translate), {
      capture: true,
      once: true,
    });
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
      <div className={styles.scenerySelect}>
        <select
          className={styles.select}
          value={currentScenery.id}
          onChange={onSelectScenery}
          style={{
            backgroundImage: `url('${currentScenery.preview.image}')`,
          }}
        >
          {sceneries.map((scenery) => (
            <option value={scenery.id} key={scenery.id}>
              {scenery.preview.name}
            </option>
          ))}
        </select>
      </div>

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
