import { useContext } from 'react';
import GlobalContext from '../../contexts/GlobalContext';

import styles from './UIControlBar.module.scss';

const UIControlBar = () => {
  const {
    contextData: { pentagonController },
  } = useContext(GlobalContext);

  return <div className={styles.wrapper}>aaaaaaa</div>;
};

export default UIControlBar;
