import React, { useState, useEffect } from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import LockOverlay from './src/components/app/LockOverlay';
import AccessSetupModal from './src/components/app/AccessSetupModal';
import { startAppMonitoring } from './src/services/appMonitor';

const App = () => {
  const [lockedApp, setLockedApp] = useState(null);
  const [setupApp, setSetupApp] = useState(null);

  useEffect(() => {
    // Start app monitoring
    startAppMonitoring();
    
    // Listen for lock events
    const lockSubscription = DeviceEventEmitter.addListener(
      'SHOW_LOCK_SCREEN',
      data => setLockedApp(data.appId),
    );

    // Listen for access setup events
    const setupSubscription = DeviceEventEmitter.addListener(
      'SHOW_ACCESS_SETUP',
      data => setSetupApp(data.appId),
    );

    return () => {
      lockSubscription.remove();
      setupSubscription.remove();
    };
  }, []);

  return (
    <AppProvider>
      <NavigationContainer>
        <AppNavigator />

        {/* Lock Screen Overlay */}
        {lockedApp && (
          <LockOverlay appId={lockedApp} onClose={() => setLockedApp(null)} />
        )}

        {/* Access Setup Modal */}
        {setupApp && (
          <AccessSetupModal
            appId={setupApp}
            onClose={() => setSetupApp(null)}
          />
        )}
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;
