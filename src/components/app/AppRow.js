import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AppRow = ({ app, isSelected, onPress, onSettingsPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {app.icon ? (
        <Image
          source={{ uri: app.icon }}
          style={styles.appIcon}
          onError={e => console.log('Error loading icon:', e.nativeEvent.error)}
        />
      ) : (
        <View style={styles.iconPlaceholder}>
          <Icon name="apps" size={20} color="#fff" />
        </View>
      )}
      <Text style={styles.appName} numberOfLines={1} ellipsizeMode="tail">
        {app.name}
      </Text>

      {isSelected ? (
        <View style={styles.rightSection}>
          <Switch
            value={app.isEnabled}
            onValueChange={value => onPress(app)}
            trackColor={{ false: '#767577', true: '#3498db' }}
            thumbColor={app.isEnabled ? '#f4f3f4' : '#f4f3f4'}
          />
          <TouchableOpacity
            onPress={() => onSettingsPress(app)}
            style={styles.settingsButton}
          >
            <Icon name="settings" size={24} color="#3498db" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => onPress(app)} style={styles.addButton}>
          <Icon name="add" size={24} color="#3498db" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  iconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    padding: 6,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    marginLeft: 10,
    padding: 4,
  },
});

export default AppRow;
