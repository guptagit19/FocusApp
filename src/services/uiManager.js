import { DeviceEventEmitter } from 'react-native';

export const showLockScreen = appId => {
  DeviceEventEmitter.emit('SHOW_LOCK_SCREEN', { appId });
};

export const showAccessSetup = appId => {
  DeviceEventEmitter.emit('SHOW_ACCESS_SETUP', { appId });
};
