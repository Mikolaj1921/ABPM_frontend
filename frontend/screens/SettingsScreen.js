import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Animated,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  Button,
  Card,
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

const TipsSection = ({ i18n, colors }) => {
  const tips = [
    {
      id: '1',
      text: i18n.t('settings_tip_1'),
      icon: 'eye',
    },
    {
      id: '2',
      text: i18n.t('settings_tip_2'),
      icon: 'adjust',
      solid: true,
    },
  ];

  return (
    <Card
      style={[
        styles.tipsCard,
        { backgroundColor: colors.surface, borderColor: colors.accent },
      ]}
      accessible
      accessibilityLabel={i18n.t('tipsSection')}
    >
      <Card.Title
        title={i18n.t('pro_tips')}
        titleStyle={[styles.tipsTitle, { color: colors.text }]}
        accessibilityLabel={i18n.t('pro_tips')}
      />
      <Card.Content>
        <FlatList
          horizontal
          data={tips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.tipItem,
                { backgroundColor: colors.accent, borderColor: colors.primary },
              ]}
            >
              <FontAwesome
                name={item.icon}
                size={16}
                color={colors.primary}
                style={styles.tipIcon}
                accessibilityLabel={i18n.t(`settings_tip_${item.id}_icon`)}
              />
              <Text style={[styles.tipText, { color: colors.text }]}>
                {item.text}
              </Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          style={styles.tipsList}
        />
      </Card.Content>
    </Card>
  );
};

export default function SettingsScreen({ navigation }) {
  const { setIsLoggedIn, user, loading, login } = useContext(AuthContext);
  const {
    isDarkMode,
    toggleTheme,
    colorScheme,
    changeColorScheme,
    colors,
    colorSchemes,
  } = useTheme(); // Dodano colorSchemes do destrukturyzacji
  const { i18n, locale, changeLanguage } = useContext(LanguageContext);
  const paperTheme = usePaperTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [fadeAnims, setFadeAnims] = useState({
    userInfo: new Animated.Value(0),
    settings: new Animated.Value(0),
    stats: new Animated.Value(0),
    actions: new Animated.Value(0),
  });
  const [scaleAnims, setScaleAnims] = useState({
    blue: new Animated.Value(1),
    darkBlue: new Animated.Value(1),
    grey: new Animated.Value(1),
  });

  // Debugowanie colorSchemes
  useEffect(() => {
    console.log('SettingsScreen colorSchemes:', colorSchemes);
  }, [colorSchemes]);

  // Animacja fade-in dla kart
  useEffect(() => {
    Object.values(fadeAnims).forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnims]);

  // Debugowanie
  useEffect(() => {
    //console.log('SettingsScreen locale:', locale);
    //console.log('SettingsScreen i18n.t("settings"):', i18n.t('settings'));
    //console.log('SettingsScreen user:', user);
    //console.log('SettingsScreen loading:', loading);
    //console.log('SettingsScreen colorScheme:', colorScheme);
    //console.log('SettingsScreen isDarkMode:', isDarkMode);
    //console.log('SettingsScreen colors:', colors);
  }, [locale, i18n, user, loading, colorScheme, isDarkMode, colors]);

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

  const handleColorSchemePress = (scheme) => {
    changeColorScheme(scheme);
    Animated.sequence([
      Animated.timing(scaleAnims[scheme], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[scheme], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer]}
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        accessibilityLabel={i18n.t('settings_screen')}
      >
        {/* Sekcja danych użytkownika */}
        <Animated.View style={{ opacity: fadeAnims.userInfo }}>
          <Card
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.accent },
            ]}
            accessible
            accessibilityLabel={i18n.t('userInfo')}
          >
            <Card.Title
              title={i18n.t('userInfo')}
              titleStyle={[styles.header, { color: colors.text }]}
              accessibilityLabel={i18n.t('userInfo')}
            />
            <Card.Content>
              {loading ? (
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  {i18n.t('loading')}
                </Text>
              ) : user ? (
                <>
                  <View style={styles.userInfoRow}>
                    <View style={styles.labelContainer}>
                      <FontAwesome
                        name="user"
                        size={16}
                        color={colors.primary}
                        style={styles.icon}
                      />
                      <Text style={[styles.userLabel, { color: colors.text }]}>
                        {i18n.t('fullName')}
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
                        size={16}
                        color={colors.primary}
                        style={styles.icon}
                      />
                      <Text style={[styles.userLabel, { color: colors.text }]}>
                        {i18n.t('email')}
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
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {i18n.t('userFetchError')}
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={retryFetchUser}
                    style={[
                      styles.retryButton,
                      { borderColor: colors.primary },
                    ]}
                    labelStyle={{ color: colors.primary }}
                    accessibilityLabel={i18n.t('retry')}
                    accessibilityHint={i18n.t('retryHint')}
                  >
                    {i18n.t('retry')}
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Sekcja porad */}
        <Animated.View style={{ opacity: fadeAnims.settings }}>
          <TipsSection i18n={i18n} colors={colors} />
        </Animated.View>

        {/* Sekcja ustawień */}
        <Animated.View style={{ opacity: fadeAnims.settings }}>
          <Card
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.accent },
            ]}
            accessible
            accessibilityLabel={i18n.t('settings')}
          >
            <Card.Title
              title={i18n.t('settings')}
              titleStyle={[styles.header, { color: colors.text }]}
              accessibilityLabel={i18n.t('settings')}
            />
            <Card.Content>
              <View style={styles.settingItem}>
                <View style={styles.labelContainer}>
                  <FontAwesome
                    name="moon-o"
                    size={16}
                    color={colors.primary}
                    style={styles.icon}
                  />
                  <Text style={[styles.label, { color: colors.text }]}>
                    {i18n.t('darkMode')}
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{
                    false: colors.secondaryText,
                    true: colors.primary,
                  }}
                  thumbColor={colors.surface}
                  accessibilityLabel={i18n.t('darkMode')}
                  accessibilityHint={i18n.t('toggleDarkModeHint')}
                />
              </View>
              <View style={styles.settingItem}>
                <View style={styles.labelContainer}>
                  <FontAwesome
                    name="globe"
                    size={16}
                    color={colors.primary}
                    style={styles.icon}
                  />
                  <Text style={[styles.label, { color: colors.text }]}>
                    {i18n.t('language')}
                  </Text>
                </View>
                <Button
                  mode="outlined"
                  onPress={toggleLanguage}
                  style={[styles.button, { borderColor: colors.primary }]}
                  labelStyle={{ color: colors.primary }}
                  accessibilityLabel={i18n.t('language')}
                  accessibilityHint={i18n.t('toggleLanguageHint')}
                >
                  {locale === 'en' ? 'Polski' : 'English'}
                </Button>
              </View>

              <View style={styles.colorSchemeContainer}>
                <View style={styles.labelContainer}>
                  <FontAwesome
                    name="paint-brush"
                    size={16}
                    color={colors.primary}
                    style={styles.icon}
                  />
                  <Text style={[styles.label, { color: colors.text }]}>
                    {i18n.t('colorScheme')}
                  </Text>
                </View>
                <View style={styles.colorSchemePreviews}>
                  {['blue', 'darkBlue', 'grey'].map((scheme) => (
                    <Animated.View key={scheme}>
                      <TouchableOpacity
                        onPress={() => handleColorSchemePress(scheme)}
                        style={[
                          styles.colorPreview,
                          {
                            borderColor:
                              colorScheme === scheme
                                ? colors.activeSchemeIndicator
                                : colors.secondaryText,
                            borderWidth: colorScheme === scheme ? 2 : 1,
                          },
                        ]}
                        accessible
                        accessibilityLabel={i18n.t(`${scheme}Theme`)}
                        accessibilityHint={i18n.t('selectColorSchemeHint')}
                      >
                        <View
                          style={[
                            styles.colorPreviewInner,
                            {
                              backgroundColor:
                                colorSchemes[scheme][
                                  isDarkMode ? 'dark' : 'light'
                                ].primary,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.colorPreviewInner,
                            {
                              backgroundColor:
                                colorSchemes[scheme][
                                  isDarkMode ? 'dark' : 'light'
                                ].accent,
                            },
                          ]}
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Sekcja statystyk */}
        <Animated.View style={{ opacity: fadeAnims.stats }}>
          <Card
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.accent },
            ]}
            accessible
            accessibilityLabel={i18n.t('stats')}
          >
            <Card.Title
              title={i18n.t('stats')}
              titleStyle={[styles.header, { color: colors.text }]}
              accessibilityLabel={i18n.t('stats')}
            />
            <Card.Content>
              <Text style={[styles.statItem, { color: colors.text }]}>
                {i18n.t('incomingsoon')}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Sekcja akcji */}
        <Animated.View style={{ opacity: fadeAnims.actions }}>
          <Card
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.accent },
            ]}
            accessible
            accessibilityLabel={i18n.t('actions')}
          >
            <Card.Content>
              <Button
                mode="outlined"
                onPress={handleAccountManagement}
                style={[styles.button, { borderColor: colors.primary }]}
                labelStyle={{ color: colors.primary }}
                accessibilityLabel={i18n.t('accountManagement')}
                accessibilityHint={i18n.t('accountManagementHint')}
              >
                {i18n.t('accountManagement')}
              </Button>
              <Button
                mode="outlined"
                onPress={handleHelpSupport}
                style={[styles.button, { borderColor: colors.primary }]}
                labelStyle={{ color: colors.primary }}
                accessibilityLabel={i18n.t('helpSupport')}
                accessibilityHint={i18n.t('helpSupportHint')}
              >
                {i18n.t('helpSupport')}
              </Button>
              <Button
                mode="contained"
                onPress={handleLogout}
                style={[
                  styles.logoutButton,
                  { backgroundColor: colors.primary },
                ]}
                labelStyle={{ color: colors.surface }}
                accessibilityLabel={i18n.t('logout')}
                accessibilityHint={i18n.t('logoutHint')}
              >
                {i18n.t('logout')}
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Stopka */}
        <View style={[styles.footer, { backgroundColor: colors.primary }]}>
          <FontAwesome
            name="info-circle"
            size={16}
            color={colors.surface}
            style={styles.footerIcon}
          />
          <Text style={[styles.footerText, { color: colors.surface }]}>
            {i18n.t('appVersion')}: {Constants?.manifest?.version || '1.0.0'} ©
            2025
          </Text>
        </View>
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
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 50,
    paddingBottom: 80,
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 1,
    marginBottom: 20,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  userLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  userValue: {
    fontSize: 14,
    fontFamily: 'Roboto',
    textAlign: 'right',
    flex: 1,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 10,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  colorSchemeContainer: {
    marginBottom: 15,
  },
  colorSchemePreviews: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  colorPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 10,
    marginTop: 10,
  },
  colorPreviewInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    margin: 5,
  },
  statItem: {
    fontSize: 14,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  button: {
    marginVertical: 10,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  logoutButton: {
    marginVertical: 10,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  footerIcon: {
    marginRight: 10,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Roboto',
    fontWeight: '500',
  },
  tipsCard: {
    borderRadius: 12,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 1,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  tipsList: {
    paddingVertical: 5,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    width: 200,
  },
  tipIcon: {
    marginRight: 10,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Roboto',
    flex: 1,
  },
});
