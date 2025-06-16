import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, ActivityIndicator } from 'react-native';
import { useAppContext } from '../context/AppContext';
import Button from '../components/common/Button';
import { formatTime } from '../utils/timeUtils';

const LockedAppScreen = ({ route }) => {
  const { appId } = route.params;
  const { distractingApps, appSettings } = useAppContext();
  const [app, setApp] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  useEffect(() => {
    // Find app by ID
    const foundApp = distractingApps.find(a => a.id === appId);
    if (foundApp) setApp(foundApp);
  }, [appId, distractingApps]);

  // Get lock time from context
  const lockTime = appSettings.accessRules?.[app.id]?.lockTime || 30;

  useEffect(() => {
    const unlockTime = Date.now() + lockTime * 60000;
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, unlockTime - now);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        // Automatically close the screen when time is up
        // In a real app, you'd navigate back
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockTime]);

  const handleClose = () => {
    // In a real app, this would close the app
    console.log('App closed');
  };

  if (!app) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/lock.png')}
        style={styles.lockIcon}
      />

      <Text style={styles.title}>{app.name} is Locked</Text>

      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

      <Text style={styles.message}>
        {appSettings.motivationalMessage ||
          "Stay focused! You've got this. Come back when the timer expires."}
      </Text>

      <View style={styles.quoteContainer}>
        <Text style={styles.quote}>
          "The future depends on what you do today."
        </Text>
        <Text style={styles.author}>- Mahatma Gandhi</Text>
      </View>

      <Button
        title="Close App"
        onPress={handleClose}
        style={styles.closeButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  lockIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  timer: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 30,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 26,
    color: '#34495e',
  },
  quoteContainer: {
    backgroundColor: '#ecf0f1',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 5,
  },
  author: {
    fontSize: 14,
    textAlign: 'right',
    color: '#7f8c8d',
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
});

export default LockedAppScreen;
