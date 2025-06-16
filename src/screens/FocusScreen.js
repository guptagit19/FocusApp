import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { getInstalledApps } from '../utils/appUtils';
import FocusHeader from '../components/app/FocusHeader';
import SectionHeader from '../components/app/SectionHeader';
import AppRow from '../components/app/AppRow';
import Button from '../components/common/Button';

const FocusScreen = ({ navigation }) => {
  const {
    distractingApps,
    addDistractingApp,
    removeDistractingApp,
    isLoading: contextLoading,
  } = useAppContext();
  const [availableApps, setAvailableApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const installedApps = await getInstalledApps();
        // Filter out already selected apps
        const available = installedApps.filter(
          app => !distractingApps.some(selected => selected.id === app.id),
        );
        setAvailableApps(available);
      } catch (error) {
        console.error('Error fetching apps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [distractingApps]);

  const handleAppToggle = app => {
    if (distractingApps.some(selected => selected.id === app.id)) {
      removeDistractingApp(app.id);
    } else {
      addDistractingApp(app);
    }
  };

  const navigateToSettings = () => {
    navigation.navigate('MotivationalSettings');
  };

  if (contextLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FocusHeader />

      <View style={styles.row}>
        <Button
          title="Set Motivational Messages"
          onPress={navigateToSettings}
          style={styles.settingsButton}
        />
      </View>

      <SectionHeader title="Your distracting apps" />
      <FlatList
        data={distractingApps}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AppRow
            app={item}
            isSelected={true}
            onPress={() => handleAppToggle(item)}
            onSettingsPress={() =>
              navigation.navigate('AppAccess', { app: item })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No distracting apps selected</Text>
          </View>
        }
      />

      <SectionHeader title="Select more apps" />
      <FlatList
        data={availableApps}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AppRow
            app={item}
            isSelected={false}
            onPress={() => handleAppToggle(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              All apps are in your distracting list
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingsButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default FocusScreen;
