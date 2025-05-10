import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import FakturaVATScreen from '../screens/documentScreens/finansowe/FakturaVATScreen';
import NotaKsiegowaScreen from '../screens/documentScreens/finansowe/NotaKsiegowaScreen';
import WezwanieDoZaplatyScreen from '../screens/documentScreens/finansowe/WezwanieDoZaplatyScreen';

const Stack = createStackNavigator();

const FinansoweNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="FakturaVAT">
      <Stack.Screen
        name="FakturaVAT"
        component={FakturaVATScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotaKsiegowa"
        component={NotaKsiegowaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WezwanieDoZaplaty"
        component={WezwanieDoZaplatyScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default FinansoweNavigator;
