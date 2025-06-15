import React from 'react';
import FocusScreen from './src/screens/FocusScreen';
import { StatusBar } from 'react-native';

const App = () => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f8f9fa"
        translucent={false}
      />
      <FocusScreen />
    </>
  );
};

export default App;
