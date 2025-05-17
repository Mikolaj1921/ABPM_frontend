import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LanguageContext } from '../contexts/LanguageContext';

import OfertaHandlowaScreen from '../screens/documentScreens/handloweiOfertowe/OfertaHandlowaScreen';
import UmowaSprzedazyScreen from '../screens/documentScreens/handloweiOfertowe/UmowaSprzedazyScreen';
import ZapytanieOfertoweScreen from '../screens/documentScreens/handloweiOfertowe/ZapytanieOfertoweScreen';

const Stack = createStackNavigator();

const HandloweNavigator = () => {
  const { i18n } = useContext(LanguageContext);

  return (
    <Stack.Navigator initialRouteName="OfertaHandlowa">
      <Stack.Screen
        name="OfertaHandlowa"
        component={OfertaHandlowaScreen}
        options={{ headerShown: false, title: i18n.t('ofertaHandlowa') }}
      />
      <Stack.Screen
        name="UmowaSprzedazy"
        component={UmowaSprzedazyScreen}
        options={{ headerShown: false, title: i18n.t('umowaSprzedazy') }}
      />
      <Stack.Screen
        name="ZapytanieOfertowe"
        component={ZapytanieOfertoweScreen}
        options={{ headerShown: false, title: i18n.t('zapytanieOfertowe') }}
      />
    </Stack.Navigator>
  );
};

export default HandloweNavigator;
