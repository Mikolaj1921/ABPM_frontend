import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import OfertaHandlowaScreen from '../screens/documentScreens/handloweiOfertowe/OfertaHandlowaScreen';
import UmowaSprzedazyScreen from '../screens/documentScreens/handloweiOfertowe/UmowaSprzedazyScreen';
import ZapytanieOfertoweScreen from '../screens/documentScreens/handloweiOfertowe/ZapytanieOfertoweScreen';

const Stack = createStackNavigator();

const HandloweNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="OfertaHandlowa">
      <Stack.Screen
        name="OfertaHandlowa"
        component={OfertaHandlowaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UmowaSprzedazy"
        component={UmowaSprzedazyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ZapytanieOfertowe"
        component={ZapytanieOfertoweScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default HandloweNavigator;
