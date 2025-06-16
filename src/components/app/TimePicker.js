import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TimePicker = ({ value, onChange, minValue = 1, maxValue = 60 }) => {
  const increment = () => {
    if (value < maxValue) onChange(value + 1);
  };

  const decrement = () => {
    if (value > minValue) onChange(value - 1);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={decrement} style={styles.button}>
        <Icon name="remove" size={24} color="#3498db" />
      </TouchableOpacity>

      <Text style={styles.value}>{value} min</Text>

      <TouchableOpacity onPress={increment} style={styles.button}>
        <Icon name="add" size={24} color="#3498db" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button: {
    padding: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
    minWidth: 80,
    textAlign: 'center',
  },
});
 
export default TimePicker;
