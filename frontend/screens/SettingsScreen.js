import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import {
  Button,
  Divider,
  Text,
  useTheme as usePaperTheme,
  Snackbar,
} from 'react-native-paper';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageContext } from '../contexts/LanguageContext';

export default function SettingsScreen({ navigation }) {
  const { setIsLoggedIn, user, loading, login } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, colorScheme, changeColorScheme, colors } =
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
    console.log('SettingsScreen loading:', loading);
    console.log('SettingsScreen notificationsEnabled:', notificationsEnabled);
    console.log('SettingsScreen colorScheme:', colorScheme);
    console.log('SettingsScreen isDarkMode:', isDarkMode);
    console.log('SettingsScreen colors:', colors);
  }, [
    locale,
    i18n,
    user,
    loading,
    notificationsEnabled,
    colorScheme,
    isDarkMode,
    colors,
  ]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Błąd wylogowania:', error);
      setSnackbarVisible(true);
    }
  };

  const handleAccountManagement = () => {
    navigation.navigate('AccountManagement');
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
  };

  const retryFetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await login(null, null, token);
      } else {
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Retry fetch user error:', error);
      setSnackbarVisible(true);
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
        style={[styles.scrollView, { backgroundColor: colors.background }]}
      >
        {/* Sekcja danych użytkownika */}
        <Text
          style={[styles.header, { color: colors.text, textAlign: 'center' }]}
        >
          {i18n.t('userInfo')}
        </Text>
        <View style={styles.userInfo}>
          {(() => {
            if (loading) {
              return (
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  {i18n.t('loading') || 'Loading...'}
                </Text>
              );
            }

            if (user) {
              return (
                <>
                  <View style={styles.userInfoRow}>
                    <View style={styles.labelContainer}>
                      <FontAwesome
                        name="user"
                        size={20}
                        color={colors.primary}
                        style={styles.icon}
                      />
                      <Text style={[styles.userLabel, { color: colors.text }]}>
                        {i18n.t('fullName') || 'Full Name'}
                      </Text>
                    </View>
                    <Text style={[styles.userValue, { color: colors.text }]}>
                      {`${user.firstName} ${user.lastName}`}
                    </Text>
                  </View>
                  <View style={styles.userInfoRow}>
                    <View style={styles.labelContainer}>
                      <FontAwesome
                        name="envelope"
                        size={20}
                        color={colors.primary}
                        style={styles.icon}
                      />
                      <Text style={[styles.userLabel, { color: colors.text }]}>
                        {i18n.t('email') || 'Email'}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.userValue,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {user.email}
                    </Text>
                  </View>
                </>
              );
            }

            return (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {i18n.t('userFetchError') || 'Failed to load user data'}
                </Text>
                <Button
                  mode="outlined"
                  onPress={retryFetchUser}
                  style={[styles.retryButton, { borderColor: colors.primary }]}
                  labelStyle={{ color: colors.primary }}
                >
                  {i18n.t('retry') || 'Try Again'}
                </Button>
              </View>
            );
          })()}
        </View>

        <Divider
          style={[styles.divider, { backgroundColor: colors.secondaryText }]}
        />

        {/* Sekcja ustawień */}
        <Text style={[styles.header, { color: colors.text }]}>
          {i18n.t('settings')}
        </Text>

        <View style={styles.settingItem}>
          <Text style={[styles.label, { color: colors.text }]}>
            {i18n.t('darkMode')}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.secondaryText, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.label, { color: colors.text }]}>
            {i18n.t('language')}
          </Text>
          <Button
            mode="text"
            onPress={toggleLanguage}
            textColor={colors.primary}
          >
            {locale === 'en' ? 'PL' : 'EN'}
          </Button>
        </View>

        <View style={styles.settingItem}>
          <Text style={[styles.label, { color: colors.text }]}>
            {i18n.t('notifications')}
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: colors.secondaryText, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>

        <View style={styles.colorSchemeContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            {i18n.t('colorScheme')}
          </Text>
          <View style={styles.colorSchemeButtons}>
            <Button
              mode="outlined"
              onPress={() => changeColorScheme('blue')}
              style={[
                styles.colorButton,
                {
                  backgroundColor:
                    colorScheme === 'blue'
                      ? colors.activeSchemeIndicator
                      : colors.surface,
                  borderColor: colors.primary,
                },
              ]}
              labelStyle={{
                color:
                  colorScheme === 'blue'
                    ? isDarkMode
                      ? colors.background
                      : colors.surface
                    : colors.primary,
              }}
            >
              {i18n.t('blueTheme')}
            </Button>
            <Button
              mode="outlined"
              onPress={() => changeColorScheme('darkBlue')}
              style={[
                styles.colorButton,
                {
                  backgroundColor:
                    colorScheme === 'darkBlue'
                      ? colors.activeSchemeIndicator
                      : colors.surface,
                  borderColor: colors.primary,
                },
              ]}
              labelStyle={{
                color:
                  colorScheme === 'darkBlue'
                    ? isDarkMode
                      ? colors.background
                      : colors.surface
                    : colors.primary,
              }}
            >
              {i18n.t('darkBlueTheme')} // Zaktualizowano nazwę
            </Button>
            <Button
              mode="outlined"
              onPress={() => changeColorScheme('grey')}
              style={[
                styles.colorButton,
                {
                  backgroundColor:
                    colorScheme === 'grey'
                      ? colors.activeSchemeIndicator
                      : colors.surface,
                  borderColor: colors.primary,
                },
              ]}
              labelStyle={{
                color:
                  colorScheme === 'grey'
                    ? isDarkMode
                      ? colors.background
                      : colors.surface
                    : colors.primary,
              }}
            >
              {i18n.t('greyTheme')}
            </Button>
          </View>
        </View>

        <Divider
          style={[styles.divider, { backgroundColor: colors.secondaryText }]}
        />

        {/* Statystyki użytkowania */}
        <Text
          style={[styles.header, { textAlign: 'center', color: colors.text }]}
        >
          {i18n.t('stats')}
        </Text>
        <View style={styles.stats}>
          <Text
            style={[
              styles.statItem,
              { textAlign: 'center', color: colors.text },
            ]}
          >
            {i18n.t('incomingsoon')}
          </Text>
        </View>

        <Divider
          style={[styles.divider, { backgroundColor: colors.secondaryText }]}
        />

        {/* Przyciski akcji */}
        <Button
          mode="outlined"
          onPress={handleAccountManagement}
          style={[styles.button, { borderColor: colors.primary }]}
          labelStyle={{ color: colors.primary }}
        >
          {i18n.t('accountManagement')}
        </Button>

        <Button
          mode="outlined"
          onPress={handleHelpSupport}
          style={[styles.button, { borderColor: colors.primary }]}
          labelStyle={{ color: colors.primary }}
        >
          {i18n.t('helpSupport')}
        </Button>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          labelStyle={{ color: colors.surface }}
        >
          {i18n.t('logout')}
        </Button>

        <Text style={[styles.version, { color: colors.secondaryText }]}>
          {i18n.t('appVersion')}: {Constants?.manifest?.version || '1.0.0'}
        </Text>

        <Text
          style={{
            color: colors.secondaryText,
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          © All rights reserved
        </Text>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}
        style={{ backgroundColor: colors.error }}
      >
        <Text style={{ color: colors.surface }}>{i18n.t('underDev')}</Text>
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 20,
    marginVertical: 50,
    paddingBottom: 70,
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 5,
  },
  userInfo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  labelContainer: {
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
    width: '10%',
  },
  userLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userValue: {
    width: '50%',
    fontSize: 16,
    textAlign: 'right',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 10,
    borderWidth: 1,
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
    borderWidth: 1,
  },
  stats: {
    marginTop: 5,
    marginBottom: 5,
  },
  statItem: {
    fontSize: 16,
    marginBottom: 6,
  },
  button: {
    marginTop: 20,
    borderWidth: 1,
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
