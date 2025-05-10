import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import UmowaOPraceScreen from '../screens/documentScreens/kadroweiAdministracyjne/UmowaOPraceScreen';
import ZaswiadczenieOZatrudnieniuScreen from '../screens/documentScreens/kadroweiAdministracyjne/ZaswiadczenieOZatrudnieniuScreen';
import WniosekUrlopowyScreen from '../screens/documentScreens/kadroweiAdministracyjne/WniosekUrlopowyScreen';

const Stack = createStackNavigator();

const KadroweNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="UmowaOPrace">
      <Stack.Screen
        name="UmowaOPrace"
        component={UmowaOPraceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ZaswiadczenieOZatrudnieniu"
        component={ZaswiadczenieOZatrudnieniuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WniosekUrlopowy"
        component={WniosekUrlopowyScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default KadroweNavigator;
