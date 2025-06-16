import React, { createContext, useContext, useEffect, useState } from 'react';
import Storage, { 
  APP_SETTINGS_KEY, 
  DISTRACTING_APPS_KEY, 
  ACCESS_RULES_KEY 
} from '../services/storage';
import { initAppMonitor, updateAccessRules } from '../services/appMonitor';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [distractingApps, setDistractingApps] = useState([]);
  const [accessRules, setAccessRules] = useState({});
  const [appSettings, setAppSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app monitor
  useEffect(() => {
    if (!isLoading) {
      initAppMonitor(accessRules);
    }
  }, [isLoading, accessRules]);

  // Update app monitor when rules change
  useEffect(() => {
    if (!isLoading) {
      updateAccessRules(accessRules);
    }
  }, [accessRules, isLoading]);



  // Load initial data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const apps = await Storage.getArrayAsync(DISTRACTING_APPS_KEY) || [];
        const rules = await Storage.getMapAsync(ACCESS_RULES_KEY) || {};
        const settings = await Storage.getMapAsync(APP_SETTINGS_KEY) || {};
        
        setDistractingApps(apps);
        setAccessRules(rules);
        setAppSettings(settings);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (!isLoading) {
      Storage.setArrayAsync(DISTRACTING_APPS_KEY, distractingApps);
    }
  }, [distractingApps, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      Storage.setMapAsync(ACCESS_RULES_KEY, accessRules);
    }
  }, [accessRules, isLoading]);

  const addDistractingApp = (app) => {
    setDistractingApps(prev => [...prev, app]);
  };

  const removeDistractingApp = (appId) => {
    setDistractingApps(prev => prev.filter(app => app.id !== appId));
  };

  const updateAccessRule = (appId, rule) => {
    setAccessRules(prev => ({
      ...prev,
      [appId]: rule
    }));
  };

  const setMotivationalMessage = (message) => {
    setAppSettings(prev => ({
      ...prev,
      motivationalMessage: message
    }));
    Storage.setMapAsync(APP_SETTINGS_KEY, {
      ...appSettings,
      motivationalMessage: message
    });
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        distractingApps,
        accessRules,
        appSettings,
        addDistractingApp,
        removeDistractingApp,
        updateAccessRule,
        setMotivationalMessage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);