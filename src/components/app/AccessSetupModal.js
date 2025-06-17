import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import TimePicker from './TimePicker';
import Button from '../common/Button';
import Storage from '../../services/storage';
const AccessSetupModal = ({ appId, onClose }) => {
  const [accessTime, setAccessTime] = useState(15); // minutes
  const [lockTime, setLockTime] = useState(30); // minutes

  const handleSave = async () => {
    // Save access rules
    const currentTime = Date.now();
    const accessEnd = currentTime + accessTime * 60000;

    await Storage.setMapAsync(`blocking:${appId}`, {
      accessTime,
      lockTime,
      accessEnd,
    });

    onClose();
  };

  return (
    <Modal transparent visible={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Set Access Rules</Text>

          <View style={styles.row}>
            <Text>Access Time (minutes):</Text>
            <TimePicker
              value={accessTime}
              onChange={setAccessTime}
              min={1}
              max={120}
            />
          </View>

          <View style={styles.row}>
            <Text>Lock Time (minutes):</Text>
            <TimePicker
              value={lockTime}
              onChange={setLockTime}
              min={5}
              max={1440}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              onPress={onClose}
              style={styles.cancelButton}
            />
            <Button
              title="Save"
              onPress={handleSave}
              style={styles.saveButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
});

export default AccessSetupModal;
