import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import { useAppContext } from '../../context/AppContext';

const LockOverlay = ({ appId }) => {
  const { distractingApps, appSettings } = useAppContext();
  const [app, setApp] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Find app by ID
    const foundApp = distractingApps.find(a => a.id === appId);
    if (foundApp) setApp(foundApp);

    // Calculate time left
    const interval = setInterval(() => {
      // This would come from service
      setTimeLeft(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [appId, distractingApps]);

  if (!app) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Image source={{ uri: app.icon }} style={styles.icon} />
        <Text style={styles.title}>{app.name} is Locked</Text>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        <Text style={styles.message}>
          {appSettings.motivationalMessage ||
            'Stay focused! You can access this app after the timer expires.'}
        </Text>
        <Button title="Close" onPress={() => {}} />
      </View>
    </View>
  );
};

const formatTime = ms => {
  // Format ms to mm:ss
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  icon: {
    width: 64,
    height: 64,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timer: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#e74c3c',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default LockOverlay;
