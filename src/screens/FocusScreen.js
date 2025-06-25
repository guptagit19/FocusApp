// src/screens/FocusScreen.js
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import useInstalledApps from '../hooks/useInstalledApps';
import AppListItem from '../components/AppListItem';
import SectionHeader from '../components/SectionHeader';

const FocusScreen = () => {
  const { isLoading, distractingApps, toggleApp } = useAppContext();
  const installedApps = useInstalledApps();

  // Separate apps into selected and unselected
  const selectedApps = distractingApps;
  const unselectedApps = installedApps.filter(
    app =>
      !distractingApps.some(
        selected => selected.packageName === app.packageName,
      ),
  );

  // Render app list item
  const renderItem = useCallback(
    ({ item }) => (
      <AppListItem
        app={item}
        isSelected={distractingApps.some(
          a => a.packageName === item.packageName,
        )}
        onToggle={toggleApp}
      />
    ),
    [distractingApps, toggleApp],
  );

  // Render sectioned lists
  const renderSection = useCallback(
    (title, data) => (
      <>
        <SectionHeader title={title} />
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.packageName}
          initialNumToRender={15}
          windowSize={10}
        />
      </>
    ),
    [renderItem],
  );

  if (isLoading || installedApps.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading apps...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selectedApps.length > 0 ? (
        renderSection('Your Distracting Apps', selectedApps)
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No apps selected yet</Text>
          <Text style={styles.emptySubtext}>
            Select apps below to block during focus sessions
          </Text>
        </View>
      )}

      {unselectedApps.length > 0 &&
        renderSection('Select More Apps', unselectedApps)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#212121',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#757575',
  },
});

export default FocusScreen;
