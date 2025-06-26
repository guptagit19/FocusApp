// src/context/AppContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppState } from 'react-native';
import { readFromStorage, saveToStorage } from '../services/storage';
import { initAppMonitor, updateAccessRules } from '../services/appMonitor';

const AppContext = createContext();

const STORAGE_KEYS = {
  DISTRACTING_APPS: 'distractingApps',
  ACCESS_RULES: 'accessRules',
};

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [installedApps, setInstalledApps] = useState([]);
  const [distractingApps, setDistractingApps] = useState([]);
  const [accessRules, setAccessRules] = useState({});
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [overlayApp, setOverlayApp] = useState(null);

  // Load initial data from storage
  useEffect(() => {
    // Modify loadInitialData to load ALL required data
    const loadInitialData = async () => {
      try {
        const [savedApps, savedRules, savedInstalled] = await Promise.all([
          readFromStorage(STORAGE_KEYS.DISTRACTING_APPS) || [],
          readFromStorage(STORAGE_KEYS.ACCESS_RULES) || {},
          readFromStorage('installedApps') || [], // Add this line
        ]);

        setDistractingApps(savedApps);
        setAccessRules(savedRules);
        setInstalledApps(savedInstalled); // Initialize installed apps
        setIsLoading(false);

        initAppMonitor(savedRules);
      } catch (error) {
        console.error('Initialization failed:', error);
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Add this to persist installed apps
  const setInstalledAppsPersist = async apps => {
    setInstalledApps(apps);
    await saveToStorage('installedApps', apps);
  };

  // Sync rules with native module when changed
  useEffect(() => {
    if (!isLoading) {
      updateAccessRules(accessRules);
      saveToStorage(STORAGE_KEYS.ACCESS_RULES, accessRules);
    }
  }, [accessRules, isLoading]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        // Re-initialize monitor when app comes to foreground
        initAppMonitor(accessRules);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [accessRules]);

  // Toggle app selection (add/remove from distracting apps)
  const toggleApp = async app => {
    const isSelected = distractingApps.some(
      a => a.packageName === app.packageName,
    );
    let updatedApps;

    if (isSelected) {
      // Remove app from distracting apps
      updatedApps = distractingApps.filter(
        a => a.packageName !== app.packageName,
      );

      // Remove associated access rules
      const newRules = { ...accessRules };
      delete newRules[app.packageName];
      setAccessRules(newRules);
    } else {
      // Add app to distracting apps
      updatedApps = [...distractingApps, app];
    }

    setDistractingApps(updatedApps);
    await saveToStorage(STORAGE_KEYS.DISTRACTING_APPS, updatedApps);
  };

  // Set access rules for an app
  const setAppAccess = (packageName, durationMinutes) => {
    const now = Date.now();
    const accessEnd = now + durationMinutes * 60 * 1000;
    const lockDuration = durationMinutes * 60 * 1000;

    setAccessRules(prev => ({
      ...prev,
      [packageName]: {
        accessEnd,
        lockDuration,
        // Lock ends after access period + lock duration
        lockEnd: accessEnd + lockDuration,
      },
    }));

    // Close overlays after setting access
    setActiveOverlay(null);
    setOverlayApp(null);
  };

  // Show access setup modal
  const showAccessSetup = app => {
    console.log('[DEBUG][AppContext] showAccessSetup:', app);
    setOverlayApp(app);
    setActiveOverlay('accessSetup');
  };

  // Show lock screen
  const showLockScreen = app => {
    setOverlayApp(app);
    setActiveOverlay('lockScreen');
  };

  // Close overlays
  const closeOverlay = () => {
    setActiveOverlay(null);
    setOverlayApp(null);
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        installedApps,
        setInstalledApps,
        distractingApps,
        accessRules,
        toggleApp,
        setAppAccess,
        showAccessSetup,
        showLockScreen,
        closeOverlay,
        activeOverlay,
        overlayApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
