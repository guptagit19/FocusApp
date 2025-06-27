// src/services/appBlocker.js
import { getDistractingApps, getAccessRules } from './storage';
import { showLockScreen, showAccessSetup } from './uiManager';
import { saveAccessRules } from './storage';
import { Alert } from 'react-native';
import { AppUtilsModule } from '../utils/nativeModules';

// Check if an app should be blocked
export const checkAppBlocking = async packageName => {
  // Add brief delay to allow context updates
  //await new Promise(resolve => setTimeout(resolve, 100));
  
  const distractingApps = getDistractingApps();
  const accessRules = getAccessRules();

  console.log('[DEBUG][appBlocker] distractingApps', distractingApps);
  console.log('[DEBUG][appBlocker] accessRules - ', accessRules);
  // Skip if not a distracting app
  if (!distractingApps.some(app => app.packageName === packageName)) {
    console.log('[DEBUG][appBlocker] inside', packageName);
    console.log('[DEBUG][appBlocker] inside', 'Returning back ..................................................');
    return;
  }
  Alert.alert('Distracted app', packageName)
  console.log('[DEBUG][appBlocker] packageName - ', packageName);
  const now = Date.now();
  const rule = accessRules[packageName];

  console.log('[DEBUG][appBlocker] outside now - ', now);
  console.log('[DEBUG][appBlocker] outside rule - ', rule);
  // Case 1: No existing rule
  // if (!rule) {
  //   console.log('[DEBUG][appBlocker] inside rule - ', rule);
  //   console.log('[DEBUG][appBlocker] inside rule packageName - ', packageName);
  //   showAccessSetup(packageName);
  //   return;
  // }

  if (!rule) {
    console.log('[DEBUG][appBlocker] inside rule if - ', rule);
    AppUtilsModule.showOverlay(packageName, 'access');
  } else if (now > rule.accessEnd) {
    console.log('[DEBUG][appBlocker] inside rule else - ', rule);
    AppUtilsModule.showOverlay(packageName, 'lock');
  }

console.log('[DEBUG][appBlocker] after showOverlay - ', rule);
  // Case 2: Within access window
  if (now < rule.accessEnd) {
    // Track usage time if needed
    console.log('[DEBUG][appBlocker] Within access window - ', rule.accessEnd);
    return;
  }

  // Case 3: Access expired - show lock screen
  showLockScreen(packageName);

  // Case 4: Lock period ended - reset rules
  if (rule.lockEnd && now > rule.lockEnd) {
    const newRules = { ...accessRules };
    delete newRules[packageName];
    saveAccessRules(newRules);
  }
  console.log('[DEBUG][appBlocker] before return checkAppBlocking - ', rule);
};

// Create a new access rule
export const createAccessRule = (packageName, durationMinutes) => {
  const now = Date.now();
  const accessEnd = now + durationMinutes * 60 * 1000;

  return {
    accessEnd,
    lockDuration: durationMinutes * 60 * 1000,
    lockEnd: accessEnd + durationMinutes * 60 * 1000,
  };
};
