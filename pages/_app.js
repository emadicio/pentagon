import { useState } from 'react';
import GlobalContext from '../contexts/GlobalContext';

import '../styles/globals.css';

const defaultContextData = {
  pentagonController: null,
};

const App = ({ Component, pageProps }) => {
  const [contextData, setContextData] = useState(defaultContextData);

  const updateContextData = (newData) => {
    setContextData({
      ...contextData,
      ...newData,
    });
  };

  return (
    <GlobalContext.Provider value={{ contextData, updateContextData }}>
      <Component {...pageProps} />;
    </GlobalContext.Provider>
  );
};

export default App;
