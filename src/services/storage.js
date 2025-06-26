// src/services/storage.js
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV instance
export const storage = new MMKV();

// Convenience methods
export const readFromStorage = key => {
  try {
    const value = storage.getString(key);
    console.log(`[DEBUG][storage] Try block storage (key: ${key}):`, value);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.log(`Error reading from storage (key: ${key}):`, error);
    return null;
  }
};

export const saveToStorage = (key, value) => {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (error) {
    console.log(`Error saving to storage (key: ${key}):`, error);
  }
};

export const deleteFromStorage = key => {
  storage.delete(key);
};

// Specific key accessors
export const getDistractingApps = () =>
  readFromStorage('distractingApps') || [];
export const getAccessRules = () => readFromStorage('accessRules') || {};

export const saveDistractingApps = apps =>
  saveToStorage('distractingApps', apps);
export const saveAccessRules = rules => saveToStorage('accessRules', rules);

// Add this helper function
export const getAllStorageData = () => {
  console.log('[STORAGE DUMP]');
  console.log('Distracting apps:', getDistractingApps());
  console.log('Access rules:', getAccessRules());
  console.log('Installed apps:', readFromStorage('installedApps'));
};