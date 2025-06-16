import { MMKVLoader } from 'react-native-mmkv-storage';

const Storage = new MMKVLoader()
  .withEncryption() // Encrypt storage for security
  .initialize();

export const APP_SETTINGS_KEY = 'appSettings';
export const DISTRACTING_APPS_KEY = 'distractingApps';
export const ACCESS_RULES_KEY = 'accessRules';

export default Storage;