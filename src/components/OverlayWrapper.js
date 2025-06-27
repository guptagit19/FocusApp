import React from 'react';
import { View } from 'react-native';
import AccessSetupOverlay from './AccessSetupOverlay';
import LockOverlay from './LockOverlay';

const OverlayWrapper = (props) => {
  const { type, packageName } = props;
  console.log('[DEBUG][OverlayWrapper] - ', type);
  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {type === 'access' && <AccessSetupOverlay {...props} />}
      {type === 'lock' && <LockOverlay {...props} />}
    </View>
  );
};

export default OverlayWrapper;