import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import OfertaHandlowaScreen from '../screens/documentScreens/handloweiOfertowe/OfertaHandlowaScreen';
import UmowaSprzedazyScreen from '../screens/documentScreens/handloweiOfertowe/UmowaSprzedazyScreen';
import ZapytanieOfertoweScreen from '../screens/documentScreens/handloweiOfertowe/ZapytanieOfertoweScreen';
import EditScreen from '../screens/documentScreens/EditScreen';
import GenerateScreen from '../screens/documentScreens/GenerateScreen';
import PreviewScreen from '../screens/documentScreens/PreviewScreen';

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
      <Stack.Screen
        name="EditScreen"
        component={EditScreen}
        options={{ title: 'Edytuj Szablon' }}
      />
      <Stack.Screen
        name="GenerateScreen"
        component={GenerateScreen}
        options={{ title: 'Generuj Dokument' }}
      />
      <Stack.Screen
        name="PreviewScreen"
        component={PreviewScreen}
        options={{ title: 'Podgląd Dokumentu' }}
      />
    </Stack.Navigator>
  );
};

export default HandloweNavigator;
