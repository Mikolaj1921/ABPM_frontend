import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HandloweNavigator from './HandloweNavigator';
import FinansoweNavigator from './FinansoweNavigator';
import KadroweNavigator from './KadroweNavigator';

const Stack = createStackNavigator();

const DocumentNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Handlowe">
      <Stack.Screen
        name="Handlowe"
        component={HandloweNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Finansowe"
        component={FinansoweNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Kadrowe"
        component={KadroweNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default DocumentNavigator;
