// src/components/LockOverlay.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LockOverlay = ({ app, onUnlockRequest }) => {
  if (!app) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={{ uri: app.icon }} style={styles.icon} />
        <Text style={styles.title}>Focus Mode Active</Text>
        <Text style={styles.message}>
          You're trying to access {app.name} during a focus session.
        </Text>

        <TouchableOpacity style={styles.button} onPress={onUnlockRequest}>
          <Text style={styles.buttonText}>Request Access</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: Dimensions.get('window').width * 0.8,
    alignItems: 'center',
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#212121',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#757575',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LockOverlay;
