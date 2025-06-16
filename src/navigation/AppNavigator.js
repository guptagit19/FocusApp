import { createStackNavigator } from '@react-navigation/stack';
import FocusScreen from '../screens/FocusScreen';
import AppAccessScreen from '../screens/AppAccessScreen';
import LockedAppScreen from '../screens/LockedAppScreen';
import MotivationalSettings from '../screens/MotivationalSettings';
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Focus" component={FocusScreen} />
      <Stack.Screen name="AppAccess" component={AppAccessScreen} />
      <Stack.Screen name="LockedApp" component={LockedAppScreen} />
      <Stack.Screen
        name="MotivationalSettings"
        component={MotivationalSettings}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
