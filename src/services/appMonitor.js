// src/services/appMonitor.js
import { AppUtilsModule } from '../utils/nativeModules';
import { getAccessRules } from './storage';

// Initialize app monitor with current rules
export const initAppMonitor = async () => {
  try {
    const rules = getAccessRules();
    await AppUtilsModule.initAppMonitor(JSON.stringify(rules));
  } catch (error) {
    console.error('Failed to initialize app monitor:', error);
  }
};

// Update access rules in native module
export const updateAccessRules = async () => {
  try {
    const rules = getAccessRules();
    await AppUtilsModule.updateAccessRules(JSON.stringify(rules));
  } catch (error) {
    console.error('Failed to update access rules:', error);
  }
};

// Start/stop monitoring
export const startAppMonitor = async () => {
  try {
    await AppUtilsModule.startAppMonitor();
  } catch (error) {
    console.error('Failed to start app monitor:', error);
  }
};

export const stopAppMonitor = async () => {
  try {
    await AppUtilsModule.stopAppMonitor();
  } catch (error) {
    console.error('Failed to stop app monitor:', error);
  }
};
