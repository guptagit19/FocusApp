// src/components/AppListItem.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AppListItem = ({ app, isSelected, onToggle }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onToggle(app)}>
      <Image source={{ uri: app.icon }} style={styles.icon} />
      <Text style={styles.name} numberOfLines={1}>
        {app.name}
      </Text>

      <View style={styles.checkbox}>
        {isSelected ? (
          <Icon name="check-box" size={24} color="#4CAF50" />
        ) : (
          <Icon name="check-box-outline-blank" size={24} color="#BDBDBD" />
        )}
      </View>
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
    borderBottomColor: '#EEEEEE',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  checkbox: {
    marginLeft: 'auto',
  },
});

export default AppListItem;
