import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import UmowaOPraceScreen from '../screens/documentScreens/kadroweiAdministracyjne/UmowaOPraceScreen';
import ZaswiadczenieOZatrudnieniuScreen from '../screens/documentScreens/kadroweiAdministracyjne/ZaswiadczenieOZatrudnieniuScreen';
import WniosekUrlopowyScreen from '../screens/documentScreens/kadroweiAdministracyjne/WniosekUrlopowyScreen';
import EditScreen from '../screens/documentScreens/EditScreen';
import PreviewScreen from '../screens/documentScreens/PreviewScreen';
import GenerateScreen from '../screens/documentScreens/GenerateScreen';

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
      <Stack.Screen name="Edit" component={EditScreen} />
      <Stack.Screen name="Preview" component={PreviewScreen} />
      <Stack.Screen name="Generate" component={GenerateScreen} />
    </Stack.Navigator>
  );
};

export default KadroweNavigator;
