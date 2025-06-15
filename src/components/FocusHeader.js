import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

const FocusHeader = () => (
  <View style={styles.headerContainer}>
    <Text style={styles.header}>Focus</Text>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
  },
  header: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

export default FocusHeader;
