import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LanguageContext } from '../contexts/LanguageContext';

import FakturaVATScreen from '../screens/documentScreens/finansowe/FakturaVATScreen';
import NotaKsiegowaScreen from '../screens/documentScreens/finansowe/NotaKsiegowaScreen';
import WezwanieDoZaplatyScreen from '../screens/documentScreens/finansowe/WezwanieDoZaplatyScreen';

const Stack = createStackNavigator();

const FinansoweNavigator = () => {
  const { i18n } = useContext(LanguageContext);

  return (
    <Stack.Navigator initialRouteName="FakturaVAT">
      <Stack.Screen
        name="FakturaVAT"
        component={FakturaVATScreen}
        options={{ headerShown: false, title: i18n.t('fakturaVAT') }}
      />
      <Stack.Screen
        name="NotaKsiegowa"
        component={NotaKsiegowaScreen}
        options={{ headerShown: false, title: i18n.t('notaKsiegowa') }}
      />
      <Stack.Screen
        name="WezwanieDoZaplaty"
        component={WezwanieDoZaplatyScreen}
        options={{ headerShown: false, title: i18n.t('wezwanieDoZaplaty') }}
      />
    </Stack.Navigator>
  );
};

export default FinansoweNavigator;
