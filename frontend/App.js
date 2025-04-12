import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigator from './navigation/RootNavigator'; // Importujesz RootNavigator

export default function App() {
  return (
    <PaperProvider>
      <RootNavigator />
      {/* RootNavigator zawiera teraz całą logikę nawigacyjną */}
    </PaperProvider>
  );
}
