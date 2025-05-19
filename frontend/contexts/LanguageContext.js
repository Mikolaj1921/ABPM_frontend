import React, { createContext, useState, useMemo, useEffect } from 'react';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '../i18n/translations';

export const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(
    Localization.locale?.split('-')[0] || 'en',
  );

  // ladowanie języka z AsyncStorage
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLocale = await AsyncStorage.getItem('language');
        if (savedLocale) {
          setLocale(savedLocale);
        }
      } catch (error) {
        console.error('Błąd ładowania języka:', error);
      }
    };
    loadLanguage();
  }, []);

  // tworzenie instancję i18n z aktualnym locale
  const i18n = useMemo(() => {
    const i18nInstance = new I18n(translations);
    i18nInstance.locale = locale;
    i18nInstance.enableFallback = true;
    return i18nInstance;
  }, [locale]);

  const changeLanguage = async (newLocale) => {
    try {
      setLocale(newLocale);
      await AsyncStorage.setItem('language', newLocale);
      console.log('LanguageProvider changeLanguage to:', newLocale);
    } catch (error) {
      console.error('Błąd zapisywania języka:', error);
    }
  };

  const value = useMemo(
    () => ({ i18n, locale, changeLanguage }),
    [i18n, locale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
