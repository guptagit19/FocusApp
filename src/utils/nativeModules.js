// src/utils/nativeModules.js
import { NativeModules, DeviceEventEmitter } from 'react-native';

export const AppUtilsModule = NativeModules.AppUtilsModule;

// Add promise-based methods
export const initAppMonitor = accessRules => {
  return AppUtilsModule.initAppMonitor(JSON.stringify(accessRules));
};

export const updateAccessRules = accessRules => {
  return AppUtilsModule.updateAccessRules(JSON.stringify(accessRules));
};

// Add missing native method implementations
// AppUtilsModule.getInstalledApps = async () => {
//   return new Promise((resolve, reject) => {
//     NativeModules.AppUtilsModule.getInstalledApps((error, appsJson) => {
//       if (error) reject(error);
//       else resolve(appsJson);
//     });
//   });
// };

// Enhanced methods
AppUtilsModule.getInstalledApps = async () => {
  const appsJson = await AppUtilsModule.getInstalledApps();
  return JSON.parse(appsJson);
};

AppUtilsModule.getAppPackageName = () => {
  return NativeModules.AppUtilsModule.getPackageName();
};

// Event setup
export const setupAppDetectionListener = (callback) => {
  return DeviceEventEmitter.addListener(
    'APP_IN_FOREGROUND',
    (event) => callback(event.packageName)
  );
};