import Storage from './storage';
import { showLockScreen, showAccessSetup } from './uiManager';
import { startTimeTracking } from './timeTracker';

export const checkAppBlocking = async appId => {
  const blockingRules = (await Storage.getMapAsync(`blocking:${appId}`)) || {};

  // Check if app is in blocked list
  const isBlocked = await Storage.getArrayAsync('blockedApps').then(apps =>
    apps.some(app => app.id === appId),
  );

  if (!isBlocked) return;

  const currentTime = Date.now();
  const { accessEnd, lockEnd } = blockingRules;

  // App is currently locked
  if (lockEnd && currentTime < lockEnd) {
    showLockScreen(appId);
    return;
  }

  // Access time not set
  if (!accessEnd) {
    showAccessSetup(appId);
    return;
  }

  // Access time expired
  if (currentTime > accessEnd) {
    // Start lock period
    const lockTime = blockingRules.lockTime || 30; // minutes
    const lockEnd = currentTime + lockTime * 60000;

    await Storage.setMapAsync(`blocking:${appId}`, {
      ...blockingRules,
      lockEnd,
    });

    showLockScreen(appId);
    return;
  }

  // Start tracking usage time
  startTimeTracking(appId, accessEnd);
};
