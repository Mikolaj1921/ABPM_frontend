import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LanguageContext } from '../contexts/LanguageContext';

import UmowaOPraceScreen from '../screens/documentScreens/kadroweiAdministracyjne/UmowaOPraceScreen';
import ZaswiadczenieOZatrudnieniuScreen from '../screens/documentScreens/kadroweiAdministracyjne/ZaswiadczenieOZatrudnieniuScreen';
import WniosekUrlopowyScreen from '../screens/documentScreens/kadroweiAdministracyjne/WniosekUrlopowyScreen';

const Stack = createStackNavigator();

const KadroweNavigator = () => {
  const { i18n } = useContext(LanguageContext);

  return (
    <Stack.Navigator initialRouteName="UmowaOPrace">
      <Stack.Screen
        name="UmowaOPrace"
        component={UmowaOPraceScreen}
        options={{ headerShown: false, title: i18n.t('umowaOPrace') }}
      />
      <Stack.Screen
        name="ZaswiadczenieOZatrudnieniu"
        component={ZaswiadczenieOZatrudnieniuScreen}
        options={{
          headerShown: false,
          title: i18n.t('zaswiadczenieOZatrudnieniu'),
        }}
      />
      <Stack.Screen
        name="WniosekUrlopowy"
        component={WniosekUrlopowyScreen}
        options={{ headerShown: false, title: i18n.t('wniosekUrlopowy') }}
      />
    </Stack.Navigator>
  );
};

export default KadroweNavigator;
