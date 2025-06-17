import { AppState } from 'react-native';
import Storage from './storage';
import { showLockScreen } from './uiManager';

let currentApp = null;
let accessEnd = 0;

export const startTimeTracking = (appId, endTime) => {
  currentApp = appId;
  accessEnd = endTime;

  // Check time when app comes to foreground
  AppState.addEventListener('change', handleAppStateChange);
};

const handleAppStateChange = async nextAppState => {
  if (nextAppState === 'active' && currentApp) {
    const currentTime = Date.now();

    if (currentTime > accessEnd) {
      // Access time expired - lock app
      const blockingRules =
        (await Storage.getMapAsync(`blocking:${currentApp}`)) || {};
      const lockTime = blockingRules.lockTime || 30; // minutes
      const lockEnd = currentTime + lockTime * 60000;

      await Storage.setMapAsync(`blocking:${currentApp}`, {
        ...blockingRules,
        lockEnd,
      });

      showLockScreen(currentApp);
      stopTimeTracking();
    }
  }
};

export const stopTimeTracking = () => {
  currentApp = null;
  accessEnd = 0;
  AppState.removeEventListener('change', handleAppStateChange);
};
