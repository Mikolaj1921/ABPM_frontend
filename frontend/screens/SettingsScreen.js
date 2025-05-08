import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import {
  Button,
  Divider,
  Text,
  useTheme as usePaperTheme,
  Snackbar,
} from 'react-native-paper';
// eslint-disable-next-line
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { removeToken } from '../authUtils';
import { LanguageContext } from '../contexts/LanguageContext';

export default function SettingsScreen({ navigation }) {
  const { setIsLoggedIn, user } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, colorScheme, changeColorScheme } =
    useTheme();
  const { i18n, locale, changeLanguage } = useContext(LanguageContext);
  const paperTheme = usePaperTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Ładowanie ustawienia powiadomień
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const savedNotifications = await AsyncStorage.getItem('notifications');
        if (savedNotifications !== null) {
          setNotificationsEnabled(JSON.parse(savedNotifications));
        }
      } catch (error) {
        console.error('Błąd ładowania ustawienia powiadomień:', error);
      }
    };
    loadNotifications();
  }, []);

  // Debugowanie
  useEffect(() => {
    console.log('SettingsScreen locale:', locale);
    console.log('SettingsScreen i18n.t("settings"):', i18n.t('settings'));
    console.log('SettingsScreen user:', user);
    console.log('SettingsScreen notificationsEnabled:', notificationsEnabled);
    console.log('SettingsScreen colorScheme:', colorScheme);
    console.log('SettingsScreen isDarkMode:', isDarkMode);
    console.log('SettingsScreen paperTheme.colors:', paperTheme.colors);
  }, [
    locale,
    i18n,
    user,
    notificationsEnabled,
    colorScheme,
    isDarkMode,
    paperTheme,
  ]);

  const handleLogout = async () => {
    try {
      await removeToken();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Błąd wylogowania:', error);
      setSnackbarVisible(true);
    }
  };

  const handleAccountManagement = () => {
    navigation.navigate('AccountManagement');
    setSnackbarVisible(true);
  };

  const toggleLanguage = () => {
    const nextLanguage = locale === 'en' ? 'pl' : 'en';
    changeLanguage(nextLanguage);
    console.log('Zmieniono język na:', nextLanguage);
  };

  const toggleNotifications = async () => {
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      await AsyncStorage.setItem('notifications', JSON.stringify(newValue));
    } catch (error) {
      console.error('Błąd zapisywania ustawienia powiadomień:', error);
    }
  };

  const handleHelpSupport = () => {
    navigation.navigate('Help');
    setSnackbarVisible(true);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: paperTheme.colors.background },
        ]}
        style={[
          styles.scrollView,
          { backgroundColor: paperTheme.colors.background },
        ]}
      >
        {/* Sekcja danych użytkownika */}
        <Text
          style={[
            styles.header,
            {
              color: paperTheme.colors.text,
              justifyContent: 'center',
              textAlign: 'center',
            },
          ]}
        >
          {i18n.t('userInfo')}
        </Text>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: paperTheme.colors.text }]}>
            {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
          </Text>
          <Text
            style={[
              styles.userEmail,
              { color: paperTheme.colors.onSurfaceDisabled },
            ]}
          >
            {user ? user.email : ''}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Sekcja ustawień */}
        <Text style={[styles.header, { color: paperTheme.colors.text }]}>
          {i18n.t('settings')}
        </Text>

        <View style={styles.settingItem}>
          <Text style={[styles.label, { color: paperTheme.colors.text }]}>
            {i18n.t('darkMode')}
          </Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.label, { color: paperTheme.colors.text }]}>
            {i18n.t('language')}
          </Text>
          <Button
            mode="text"
            onPress={toggleLanguage}
            textColor={paperTheme.colors.primary}
          >
            {locale === 'en' ? 'PL' : 'EN'}
          </Button>
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.label, { color: paperTheme.colors.text }]}>
            {i18n.t('notifications')}
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
          />
        </View>

        <View style={styles.colorSchemeContainer}>
          <Text style={[styles.label, { color: paperTheme.colors.text }]}>
            {i18n.t('colorScheme')}
          </Text>
          <View style={styles.colorSchemeButtons}>
            <Button
              mode={colorScheme === 'blue' ? 'contained' : 'outlined'}
              onPress={() => changeColorScheme('blue')}
              style={styles.colorButton}
              labelStyle={{
                color:
                  colorScheme === 'blue' ? '#fff' : paperTheme.colors.primary,
              }}
            >
              {i18n.t('blueTheme')}
            </Button>
            <Button
              mode={colorScheme === 'green' ? 'contained' : 'outlined'}
              onPress={() => changeColorScheme('green')}
              style={styles.colorButton}
              labelStyle={{
                color:
                  colorScheme === 'green' ? '#fff' : paperTheme.colors.primary,
              }}
            >
              {i18n.t('greenTheme')}
            </Button>

            <Button
              mode={colorScheme === 'grey' ? 'contained' : 'outlined'}
              onPress={() => changeColorScheme('grey')}
              style={styles.colorButton}
              labelStyle={{
                color:
                  colorScheme === 'grey' ? '#fff' : paperTheme.colors.primary,
              }}
            >
              {i18n.t('greyTheme')}
            </Button>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Statystyki użytkowania */}
        <Text style={[styles.header, { color: paperTheme.colors.text }]}>
          {i18n.t('stats')}
        </Text>
        <View style={styles.stats}>
          <Text style={[styles.statItem, { color: paperTheme.colors.text }]}>
            {i18n.t('documentsGenerated')}: 42
          </Text>
          <Text style={[styles.statItem, { color: paperTheme.colors.text }]}>
            {i18n.t('joinedDate')}: 2023-01-15
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Przyciski akcji */}
        <Button
          mode="outlined"
          onPress={handleAccountManagement}
          style={styles.button}
          labelStyle={{ color: paperTheme.colors.primary }}
          theme={{ colors: { outline: paperTheme.colors.primary } }}
        >
          {i18n.t('accountManagement')}
        </Button>

        <Button
          mode="outlined"
          onPress={handleHelpSupport}
          style={styles.button}
          labelStyle={{ color: paperTheme.colors.primary }}
          theme={{ colors: { outline: paperTheme.colors.primary } }}
        >
          {i18n.t('helpSupport')}
        </Button>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          theme={{ colors: { primary: paperTheme.colors.primary } }}
        >
          {i18n.t('logout')}
        </Button>

        <Text
          style={[
            styles.version,
            { color: paperTheme.colors.onSurfaceDisabled },
          ]}
        >
          {i18n.t('appVersion')}: {Constants?.manifest?.version || '1.0.0'}
        </Text>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}
      >
        {i18n.t('underDev')}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 50,
    paddingBottom: 20,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center',
  },
  colorSchemeContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  colorSchemeButtons: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  colorButton: {
    marginBottom: 10,
    width: '100%',
  },
  stats: {
    marginBottom: 20,
  },
  statItem: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    marginTop: 20,
  },
  logoutButton: {
    marginTop: 10,
  },
  version: {
    marginTop: 40,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 15,
  },
});
