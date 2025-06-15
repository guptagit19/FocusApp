import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Switch,
  ActivityIndicator,
  Platform,
  Linking,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getInstalledApps,
  filterUserApps,
  preselectCommonApps,
} from '../utils/appUtils';
import AppRow from '../components/AppRow';
import SectionHeader from '../components/SectionHeader';
import FocusHeader from '../components/FocusHeader';

const FocusScreen = () => {
  const [apps, setApps] = useState([]);
  const [focusEnabled, setFocusEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const installedApps = await getInstalledApps();
        const userApps = filterUserApps(installedApps);
        const appsWithSelection = preselectCommonApps(userApps);

        setApps(appsWithSelection);
        setError(null);
      } catch (error) {
        console.error('Failed to load apps:', error);
        setError('Failed to load installed apps. Please restart the app.');
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  // Toggle app selection (add/remove from distracting apps)
  const toggleAppSelection = appId => {
    setApps(prevApps =>
      prevApps.map(app =>
        app.id === appId ? { ...app, isSelected: !app.isSelected } : app,
      ),
    );
  };

  // Toggle enabled state of a distracting app
  const toggleAppEnabled = (appId, value) => {
    setApps(prevApps =>
      prevApps.map(app =>
        app.id === appId ? { ...app, isEnabled: value } : app,
      ),
    );
  };

  // Get selected apps (distracting apps)
  const distractingApps = apps.filter(app => app.isSelected);

  // Get non-selected apps (available for selection)
  const nonSelectedApps = apps.filter(app => !app.isSelected);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading installed apps...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={60} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryButtonText}>Restart App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FocusHeader />

      {/* Set a schedule */}
      <View style={styles.row}>
        <Text style={styles.rowText}>Set a schedule</Text>
        <Icon name="chevron-right" size={24} color="#777" />
      </View>

      {/* Turn on now */}
      <View style={styles.row}>
        <Text style={styles.rowText}>Turn on now</Text>
        <Switch
          value={focusEnabled}
          onValueChange={setFocusEnabled}
          trackColor={{ false: '#767577', true: '#3498db' }}
          thumbColor={focusEnabled ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>

      {/* Your distracting apps section */}
      <SectionHeader title="Your distracting apps" iconName="remove" />
      <FlatList
        data={distractingApps}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AppRow app={item} type="switch" onToggle={toggleAppEnabled} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No distracting apps selected</Text>
          </View>
        }
      />

      {/* Select more apps section */}
      <SectionHeader title="Select more apps" iconName="add" />
      <FlatList
        data={nonSelectedApps}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AppRow app={item} type="add" onAdd={toggleAppSelection} />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  errorText: {
    marginTop: 20,
    marginBottom: 30,
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FocusScreen;
