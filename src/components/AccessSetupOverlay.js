import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeModules, DeviceEventEmitter } from 'react-native';

export const AppUtilsModule = NativeModules.AppUtilsModule;

const AccessSetupOverlay = ({ packageName }) => {
  const handleSave = (duration) => {
    // Communicate back to main app
    DeviceEventEmitter.emit('ACCESS_SETUP_COMPLETE', { 
      packageName, 
      duration 
    });
    // Close the overlay
    AppUtilsModule.finishOverlay();
  };

  return (
    <View style={{ 
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <View style={{ backgroundColor: 'white', padding: 20 }}>
        <Text>Set access time for {packageName}</Text>
        {/* Your duration selection UI */}
        <Button title="Allow 15 mins" onPress={() => handleSave(15)} />
        <Button title="Cancel" onPress={AppUtilsModule.finishOverlay} />
      </View>
    </View>
  );
};