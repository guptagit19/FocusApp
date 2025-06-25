// src/hooks/useInstalledApps.js
import { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { useAppContext } from '../context/AppContext';

const useInstalledApps = () => {
  const { installedApps, setInstalledApps } = useAppContext();

  useEffect(() => {
    if (installedApps.length === 0) {
      const fetchApps = async () => {
        try {
          const appsJson =
            await NativeModules.AppUtilsModule.getInstalledApps();
          const apps = JSON.parse(appsJson);

          // Filter out system apps and this app itself
          const filteredApps = apps.filter(
            app =>
              !app.isSystemApp &&
              app.packageName !==
                NativeModules.AppUtilsModule.getAppPackageName(),
          );

          setInstalledApps(filteredApps);
        } catch (error) {
          console.log('Failed to fetch installed apps:', error);
        }
      };

      fetchApps();
    }
  }, []);

  return installedApps;
};

export default useInstalledApps;
