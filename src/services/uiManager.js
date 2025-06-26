// src/services/uiManager.js
import { DeviceEventEmitter } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { getDistractingApps, readFromStorage } from './storage';

// Hold context reference
let appContext = null;

// Unified app finder using storage
const findAppEverywhere = (packageName) => {
  // 1. Check storage first
  const storageApps = [
    ...(getDistractingApps() || []),
    ...(readFromStorage('installedApps') || [])
  ];
  const appFromStorage = storageApps.find(a => a.packageName === packageName);
  console.log('[DEBUG][uiManager] findAppEverywhere: before ', appFromStorage);
  if (appFromStorage) return appFromStorage;
  
  console.log('[DEBUG][uiManager] findAppEverywhere: after ', appFromStorage);
  // 2. Fallback to context
  return [
    ...(appContext?.distractingApps || []),
    ...(appContext?.installedApps || [])
  ].find(a => a.packageName === packageName);
};

// Updated showAccessSetup
export const showAccessSetup = packageName => {
  const app = findAppEverywhere(packageName);
  console.log('[DEBUG][uiManager] showAccessSetup:', app);
  if (app && appContext) {
    console.log('[DEBUG][uiManager] Showing access for:', app.name);
    appContext.showAccessSetup(app);
  } else {
    console.log('[ERROR][uiManager] App not found:', packageName);
  }
};

// Updated showLockScreen
export const showLockScreen = packageName => {
  const app = findAppEverywhere(packageName);
  
  if (app && appContext) {
    console.log('[DEBUG][uiManager] Locking app:', app.name);
    appContext.showLockScreen(app);
  }
};

// Set context reference
export const setAppContext = context => {
  appContext = context;
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
