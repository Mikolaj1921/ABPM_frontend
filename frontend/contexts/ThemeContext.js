import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colorScheme, setColorScheme] = useState('darkBlue');

  // Schematy kolorów z obsługą jasnego i ciemnego motywu
  const colorSchemes = {
    blue: {
      light: {
        primary: '#42A5F5', // Jasny, przyjazny niebieski
        accent: '#E3F2FD', // Bardzo jasny niebieski (dla teł, np. quick stats)
        background: '#F5F5F5', // Tło jasne
        text: '#212121', // Tekst główny
        secondaryText: '#757575', // Tekst drugorzędny
        surface: '#FFFFFF', // Powierzchnia kart
        error: '#D32F2F', // Kolor błędów
        activeSchemeIndicator: '#1976D2', // Ciemniejszy niebieski dla kontrastu w jasnym motywie
      },
      dark: {
        primary: '#64B5F6', // Jaśniejszy niebieski dla ciemnego motywu
        accent: '#263238', // Ciemny, subtelny akcent w ciemnym motywie
        background: '#121212', // Ciemne tło
        text: '#E0E0E0', // Jasny tekst
        secondaryText: '#B0BEC5', // Jasnoszary tekst drugorzędny
        surface: '#1E1E1E', // Ciemna powierzchnia kart
        error: '#EF5350', // Czerwień błędów w ciemnym motywie
        activeSchemeIndicator: '#90CAF9', // Jaśniejszy niebieski dla kontrastu w ciemnym motywie
      },
    },
    darkBlue: {
      light: {
        primary: '#01579B', // Ciemny niebieski (głęboki odcień)
        accent: '#E3F0FF', // Bardzo jasny, czysty niebieski (zmieniono z #B3E5FC)
        background: '#F5F5F5',
        text: '#212121',
        secondaryText: '#757575',
        surface: '#FFFFFF',
        error: '#D32F2F',
        activeSchemeIndicator: '#003F6F', // Bardzo ciemny niebieski dla kontrastu
      },
      dark: {
        primary: '#0288D1', // Jaśniejszy ciemny niebieski dla ciemnego motywu
        accent: '#1E3A5F', // Ciemniejszy, ale bardziej niebieski odcień (zmieniono z #263238)
        background: '#121212',
        text: '#E0E0E0',
        secondaryText: '#B0BEC5',
        surface: '#1E1E1E',
        error: '#EF5350',
        activeSchemeIndicator: '#4FC3F7', // Jasnoniebieski dla kontrastu w ciemnym motywie
      },
    },
    grey: {
      light: {
        primary: '#757575', // Ciepły szary
        accent: '#ECEFF1', // Bardzo jasny szary (dla teł)
        background: '#F5F5F5',
        text: '#212121',
        secondaryText: '#757575',
        surface: '#FFFFFF',
        error: '#D32F2F',
        activeSchemeIndicator: '#616161', // Ciemniejszy szary dla kontrastu
      },
      dark: {
        primary: '#B0BEC5', // Jaśniejszy szary dla ciemnego motywu
        accent: '#263238', // Subtelny akcent w ciemnym motywie
        background: '#121212',
        text: '#E0E0E0',
        secondaryText: '#B0BEC5',
        surface: '#1E1E1E',
        error: '#EF5350',
        activeSchemeIndicator: '#CFD8DC', // Jaśniejszy szary dla kontrastu
      },
    },
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
        if (savedColorScheme && colorSchemes[savedColorScheme]) {
          setColorScheme(savedColorScheme);
        } else {
          setColorScheme('darkBlue');
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
      if (colorSchemes[scheme]) {
        setColorScheme(scheme);
        await AsyncStorage.setItem('colorScheme', scheme);
        console.log('ThemeContext changed colorScheme:', scheme);
      } else {
        console.warn('Nieznany schemat kolorów:', scheme);
      }
    } catch (error) {
      console.error('Błąd zapisywania schematu kolorów:', error);
    }
  };

  // Dynamiczne wybieranie schematu w zależności od trybu
  const currentColors =
    colorSchemes[colorScheme][isDarkMode ? 'dark' : 'light'];

  const contextValue = React.useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      colorScheme,
      changeColorScheme,
      colors: currentColors,
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
