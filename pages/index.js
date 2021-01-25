import { useContext, useEffect } from 'react';
import GlobalContext from '../contexts/GlobalContext';
import Head from '../components/Head';
import UIControlBar from '../components/UIControlBar';
import UIVRInstructions from '../components/UIVRInstructions';
import PentagonController from '../lib/PentagonController';
import { preloadImages } from '../lib/utils';

const { UIModes } = PentagonController;

import styles from '../styles/pages/Home.module.css';

// TODO: Fetch this data from an API. A GraphQL one maybe?
const SCENERIES = require('../public/api/sceneries.json');

const Home = () => {
  const {
    contextData: { uiMode },
    updateContextData,
  } = useContext(GlobalContext);

  useEffect(async () => {
    const pentagonController = new PentagonController();

    // TODO Fetch thtis data instead
    const sceneries = SCENERIES;

    const currentScenery = sceneries[0];
    updateContextData({
      pentagonController,
      sceneries,
      currentScenery,
    });
    await pentagonController.boot(currentScenery);

    // Preload preview images to avoid flickering on scenery switch
    preloadImages(sceneries.map((scenery) => scenery.preview.image));
  }, []);

  return (
    <div className={styles.container}>
      <Head />
      <UIControlBar />
      {uiMode === UIModes.vr && <UIVRInstructions />}
      <div id="pentagon-app"></div>
    </div>
  );
};

export default Home;
