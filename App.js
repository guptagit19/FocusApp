// App.js
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { AppProvider, useAppContext } from './src/context/AppContext';
import FocusScreen from './src/screens/FocusScreen';
import LockOverlay from './src/components/LockOverlay';
import AccessSetupModal from './src/components/AccessSetupModal';
import { setupEventListeners, setAppContext } from './src/services/uiManager';
import { setupAppDetectionListener } from './src/utils/nativeModules';
import { checkAppBlocking } from './src/services/appBlocker';
import { initAppMonitor, updateAccessRules } from './src/services/appMonitor';
import { DeviceEventEmitter } from 'react-native';

// Main app content with overlays
const AppContent = () => {
  const context = useAppContext();

  // Setup context reference for services and Add this useEffect to keep uiManager's context reference updated
  useEffect(() => {
    setAppContext(context);
    setupEventListeners();
    const accessSubscription = DeviceEventEmitter.addListener(
      'ACCESS_SETUP_COMPLETE',
      ({ packageName, duration }) => {
        context.setAppAccess(packageName, duration);
      },
    );

    return () => {
      accessSubscription.remove();
    };
  }, [context]); // Update on every context change

  // Initialize app monitor
  // Modify existing effect
  useEffect(() => {
    console.log('Initialize app monitor', context.isLoading);
    if (!context.isLoading) {
      initAppMonitor();
      console.log('[DEBUG][App.js] setupAppDetectionListener initialized');

      const subscription = setupAppDetectionListener(packageName => {
        console.log('[DEBUG][App.js] Detected app launch:', packageName);
        checkAppBlocking(packageName);
      });

      return () => subscription.remove();
    }
  }, [context.isLoading]);

  // Update rules when changed
  useEffect(() => {
    if (!context.isLoading) {
      updateAccessRules();
    }
  }, [context.accessRules, context.isLoading]);

  return (
    <>
      <FocusScreen />

      {/*      
      // Lock Screen Overlay /
      {context.activeOverlay === 'lockScreen' && (
        <LockOverlay
          app={context.overlayApp}
          onUnlockRequest={() => context.showAccessSetup(context.overlayApp)}
        />
      )}

      // Access Setup Modal
      <AccessSetupModal
        visible={context.activeOverlay === 'accessSetup'}
        app={context.overlayApp}
        onClose={context.closeOverlay}
        onSave={(packageName, duration) => {
          context.setAppAccess(packageName, duration);
        }}
        />

       */}
    </>
  );
};

// App entry point
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
