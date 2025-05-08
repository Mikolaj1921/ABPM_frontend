import React from 'react';
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
} from 'react-native-paper';
import { LogBox } from 'react-native';
import RootNavigator from './navigation/RootNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import LanguageProvider from './contexts/LanguageContext';

LogBox.ignoreLogs([
  'Warning: TRenderEngineProvider: Support for defaultProps will be removed',
  'Warning: MemoizedTNodeRenderer: Support for defaultProps will be removed',
  'Warning: TNodeChildrenRenderer: Support for defaultProps will be removed',
  'Warning: IMGElement: Support for defaultProps will be removed',
]);

const ThemedApp = () => {
  const { isDarkMode, colorScheme, colorSchemes } = useTheme();
  const baseTheme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colorSchemes[colorScheme].primary,
      accent: colorSchemes[colorScheme].accent,
      text: isDarkMode ? '#ffffff' : baseTheme.colors.text, // Biały tekst w trybie ciemnym
      onSurfaceDisabled: isDarkMode
        ? '#bbbbbb'
        : baseTheme.colors.onSurfaceDisabled, // Jasnoszary dla wyłączonych elementów
    },
  };

  console.log('ThemedApp theme.colors:', theme.colors);

  return (
    <PaperProvider theme={theme}>
      <RootNavigator />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
