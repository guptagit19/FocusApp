// ../services/appMonitor.js
import { NativeModules, DeviceEventEmitter } from 'react-native';
import { checkAppBlocking } from './appBlocker';

const { AppUtilsModule } = NativeModules;

// Add these new exports
export const initAppMonitor = (accessRules) => {
  AppUtilsModule.updateAccessRules(accessRules);
  startAppMonitoring();
};

export const updateAccessRules = (accessRules) => {
  AppUtilsModule.updateAccessRules(accessRules);
};

// Existing functions
export const startAppMonitoring = () => {
  AppUtilsModule.startAppMonitoring();
  DeviceEventEmitter.addListener('APP_IN_FOREGROUND', appId => {
    checkAppBlocking(appId);
  });
};

export const stopAppMonitoring = () => {
  AppUtilsModule.stopAppMonitoring();
};

// import { AppState } from 'react-native';
// import Storage from './storage';

// let currentApp = null;
// let accessRules = {};

// // Initialize with access rules
// export const initAppMonitor = rules => {
//   accessRules = rules;
//   startAppMonitoring();
// };

// // Update rules when they change
// export const updateAccessRules = newRules => {
//   accessRules = newRules;
// };

// export const startAppMonitoring = () => {
//   console.log('App monitoring started');
//   // Platform-specific monitoring would be implemented here
// };

// export const trackAppLaunch = appId => {
//   currentApp = appId;
//   checkAppAccessRules(appId);
// };

// const checkAppAccessRules = async appId => {
//   const rules = accessRules[appId];

//   if (!rules) return;

//   const now = Date.now();
//   const lastAccessKey = `lastAccess:${appId}`;
//   const lockedUntilKey = `lockedUntil:${appId}`;

//   const lastAccess = (await Storage.getIntAsync(lastAccessKey)) || 0;
//   const lockedUntil = (await Storage.getIntAsync(lockedUntilKey)) || 0;

//   // If app is currently locked
//   if (now < lockedUntil) {
//     triggerLockScreen(appId);
//     return;
//   }

//   // If access time has expired
//   if (now > lastAccess + rules.accessTime * 60000) {
//     // Lock the app
//     const newLockedUntil = now + rules.lockTime * 60000;
//     await Storage.setIntAsync(lockedUntilKey, newLockedUntil);
//     triggerLockScreen(appId);
//     return;
//   }

//   // Start tracking usage
//   await Storage.setIntAsync(lastAccessKey, now);
// };

// // Trigger lock screen via event emitter
// import { DeviceEventEmitter } from 'react-native';

// export const triggerLockScreen = appId => {
//   DeviceEventEmitter.emit('showLockScreen', { appId });
// };

// // Track app state changes
// AppState.addEventListener('change', nextAppState => {
//   if (nextAppState === 'active' && currentApp) {
//     checkAppAccessRules(currentApp);
//   }
// });