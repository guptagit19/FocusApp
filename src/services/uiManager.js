// src/services/uiManager.js
import { DeviceEventEmitter } from 'react-native';
import { useAppContext } from '../context/AppContext';

// Hold context reference
let appContext = null;

// Set context reference
export const setAppContext = context => {
  appContext = context;
};

// Show lock screen for a package
export const showLockScreen = packageName => {
  if (!appContext) return;

  // Find app by packageName
  const app = [...appContext.distractingApps, ...appContext.installedApps].find(
    a => a.packageName === packageName,
  );

  if (app) {
    appContext.showLockScreen(app);
  }
};

// Show access setup modal
export const showAccessSetup = packageName => {
  console.log('[DEBUG][uiManager.js] inside showAccessSetup packageName - ', packageName);
  console.log('[DEBUG][uiManager.js] inside showAccessSetup appContext - ', appContext);
  if (!appContext) return;

  const app = [...appContext.distractingApps, ...appContext.installedApps].find(
    a => a.packageName === packageName,
  );
  console.log('[DEBUG][uiManager.js] inside showAccessSetup app - ', app);
  if (app) {
    console.log('[DEBUG][uiManager.js] inside showAccessSetup app inside - ', app);
    appContext.showAccessSetup(app);
  }
};

// Setup event listeners
export const setupEventListeners = () => {
  DeviceEventEmitter.addListener('SHOW_LOCK_SCREEN', event => {
    showLockScreen(event.packageName);
  });

  DeviceEventEmitter.addListener('SHOW_ACCESS_SETUP', event => {
    showAccessSetup(event.packageName);
  });
};
