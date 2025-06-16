import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useAppContext } from '../context/AppContext';
import TimePicker from '../components/app/TimePicker';
import Button from '../components/common/Button';

const AppAccessScreen = ({ route, navigation }) => {
  const { app } = route.params;
  const { updateAccessRule } = useAppContext();
  const [accessTime, setAccessTime] = useState(5); // minutes
  const [lockTime, setLockTime] = useState(30); // minutes

  const handleSave = () => {
    updateAccessRule(app.id, {
      accessTime, // in minutes
      lockTime, // in minutes
      lastAccess: null,
      lockedUntil: null,
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Access Rules for {app.name}</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Access Time (minutes)</Text>
        <TimePicker
          value={accessTime}
          onChange={setAccessTime}
          minValue={1}
          maxValue={120}
        />
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Lock Time (minutes)</Text>
        <TimePicker
          value={lockTime}
          onChange={setLockTime}
          minValue={5}
          maxValue={1440} // 24 hours
        />
      </View>

      <Text style={styles.description}>
        You can use {app.name} for {accessTime} minutes. After that, it will be
        locked for {lockTime} minutes.
      </Text>

      <Button
        title="Save Settings"
        onPress={handleSave}
        style={styles.saveButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
    color: '#555',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
});

export default AppAccessScreen;
