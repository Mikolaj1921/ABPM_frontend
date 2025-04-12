import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Dodaj NavigationContainer
import AuthNavigator from './AuthNavigator'; // Nawigacja logowania
import AppNavigator from './AppNavigator'; // Nawigacja główna po zalogowaniu

const RootNavigator = () => {
  // Tymczasowo ustawiamy isLoggedIn na true, by pominąć logowanie
  const isLoggedIn = true; // Możesz później to dynamicznie ustawiać z kontekstu lub logiki

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
