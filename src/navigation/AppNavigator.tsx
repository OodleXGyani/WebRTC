import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateOfferScreen from '../screens/CreateOfferScreen';
import JoinCallScreen from '../screens/JoinCallScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Create" component={CreateOfferScreen} />
      <Stack.Screen name="Join" component={JoinCallScreen} />
    </Stack.Navigator>
  );
}
