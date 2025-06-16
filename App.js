import React, { useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { enableScreens } from 'react-native-screens';

// Enable native screens for better performance
enableScreens();

const App = () => {
  const navigationRef = useRef();

  useEffect(() => {
    // Handle lock screen events
    const subscription = DeviceEventEmitter.addListener(
      'showLockScreen',
      data => {
        navigationRef.current?.navigate('LockedApp', {
          appId: data.appId,
        });
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <AppProvider>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;
