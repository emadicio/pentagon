import { useContext, useEffect } from 'react';
import GlobalContext from '../contexts/GlobalContext';
import Head from '../components/Head';
import UIControlBar from '../components/UIControlBar';
import UIVRInstructions from '../components/UIVRInstructions';
import PentagonController from '../lib/PentagonController';
const { UIModes } = PentagonController;

import styles from '../styles/pages/Home.module.css';

const Home = () => {
  const {
    contextData: { uiMode },
    updateContextData,
  } = useContext(GlobalContext);

  useEffect(async () => {
    const pentagonController = new PentagonController();
    updateContextData({ pentagonController });
    await pentagonController.boot();
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
