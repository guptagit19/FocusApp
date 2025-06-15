import { Platform, NativeModules } from 'react-native';

// Mock data for iOS since we can't access real installed apps
const mockApps = [
  {
    id: 'com.facebook.katana',
    name: 'Facebook',
    icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
    isSelected: true,
    isEnabled: true,
  },
  {
    id: 'com.instagram.android',
    name: 'Instagram',
    icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
    isSelected: true,
    isEnabled: true,
  },
  {
    id: 'com.whatsapp',
    name: 'WhatsApp',
    icon: 'https://cdn-icons-png.flaticon.com/512/124/124034.png',
    isSelected: false,
    isEnabled: false,
  },
  {
    id: 'com.google.android.youtube',
    name: 'YouTube',
    icon: 'https://cdn-icons-png.flaticon.com/512/174/174883.png',
    isSelected: false,
    isEnabled: false,
  },
  {
    id: 'com.pikashow',
    name: 'Pikashow',
    icon: 'https://example.com/pikashow.png',
    isSelected: false,
    isEnabled: false,
  },
];

// Get installed apps - Android implementation only
export const getInstalledApps = async () => {
  if (Platform.OS === 'ios') {
    return mockApps;
  }

  try {
    const apps = await NativeModules.AppUtilsModule.getInstalledApps();
    return apps.map(app => ({
      id: app.packageName,
      name: app.appName,
      icon: `data:image/png;base64,${app.icon}`,
      isSelected: false,
      isEnabled: false,
    }));
  } catch (error) {
    console.error('Error fetching installed apps:', error);
    return mockApps;
  }
};

// Filter out system apps
export const filterUserApps = apps => {
  const systemAppPrefixes = [
    'com.android.',
    'com.google.android.',
    'com.sec.android.',
    'com.samsung.',
    'android',
  ];

  return apps.filter(
    app => !systemAppPrefixes.some(prefix => app.id.startsWith(prefix)),
  );
};

// Preselect common distracting apps
export const preselectCommonApps = apps => {
  const commonAppIds = [
    'com.facebook.katana',
    'com.instagram.android',
    'com.whatsapp',
    'com.google.android.youtube',
    'com.twitter.android',
  ];

  return apps.map(app => ({
    ...app,
    isSelected: commonAppIds.includes(app.id),
    isEnabled: commonAppIds.includes(app.id),
  }));
};
