import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colorScheme, setColorScheme] = useState('blue');

  // Schematy kolorów
  const colorSchemes = {
    blue: { primary: '#1e88e5', accent: '#64b5f6' }, // Stonowany niebieski
    green: { primary: '#2e7d32', accent: '#66bb6a' }, // Zielony
    grey: { primary: '#7F7F7F', accent: '#9E9E9E' }, // Szary
  };

  // Ładowanie ustawień z AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedDarkMode = await AsyncStorage.getItem('darkMode');
        const savedColorScheme = await AsyncStorage.getItem('colorScheme');
        if (savedDarkMode !== null) {
          setIsDarkMode(JSON.parse(savedDarkMode));
        }
        if (savedColorScheme) {
          setColorScheme(savedColorScheme);
        }
        console.log('ThemeContext loaded darkMode:', savedDarkMode);
        console.log('ThemeContext loaded colorScheme:', savedColorScheme);
      } catch (error) {
        console.error('Błąd ładowania ustawień motywu:', error);
      }
    };
    loadSettings();
  }, []);

  // Zapisywanie ustawień
  const toggleTheme = async () => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newDarkMode));
      console.log('ThemeContext toggled darkMode:', newDarkMode);
    } catch (error) {
      console.error('Błąd zapisywania trybu ciemnego:', error);
    }
  };

  const changeColorScheme = async (scheme) => {
    try {
      setColorScheme(scheme);
      await AsyncStorage.setItem('colorScheme', scheme);
      console.log('ThemeContext changed colorScheme:', scheme);
    } catch (error) {
      console.error('Błąd zapisywania schematu kolorów:', error);
    }
  };

  const contextValue = React.useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      colorScheme,
      changeColorScheme,
      colorSchemes,
    }),
    [isDarkMode, colorScheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
