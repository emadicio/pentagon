import { useEffect } from 'react';
import Three from '../lib/three/Three';
import styles from '../styles/Home.module.css';

const Home = () => {
  useEffect(() => {
    new Three();
  }, []);
  return (
    <div className={styles.container}>
      <div id="threejs"></div>
    </div>
  );
};

export default Home;
