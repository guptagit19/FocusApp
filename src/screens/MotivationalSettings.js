import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useAppContext } from '../context/AppContext';
import Button from '../components/common/Button';

const MotivationalSettings = ({ navigation }) => {
  const { appSettings, setMotivationalMessage } = useAppContext();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (appSettings.motivationalMessage) {
      setMessage(appSettings.motivationalMessage);
    }
  }, [appSettings]);

  const handleSave = () => {
    setMotivationalMessage(message);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Motivational Message</Text>
      <Text style={styles.description}>
        Set a motivational message to display when apps are locked. This message
        will encourage you to stay focused.
      </Text>

      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        placeholder="Enter your motivational message here..."
        value={message}
        onChangeText={setMessage}
      />

      <View style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>Example Messages:</Text>
        <Text style={styles.exampleText}>
          • "Stay focused! Your goals are waiting."
        </Text>
        <Text style={styles.exampleText}>
          • "This time is precious. Use it wisely."
        </Text>
        <Text style={styles.exampleText}>
          • "Distraction now, regret later. Stay strong!"
        </Text>
      </View>

      <Button
        title="Save Message"
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 25,
    lineHeight: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 25,
    textAlignVertical: 'top',
  },
  exampleContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 25,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
});

export default MotivationalSettings;
