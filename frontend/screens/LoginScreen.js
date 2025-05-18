import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LanguageContext } from '../contexts/LanguageContext';
import { storeToken, getToken } from '../authUtils';
import API from '../api';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setIsLoggedIn } = useContext(AuthContext);
  const { i18n } = useContext(LanguageContext);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await getToken();
      if (token) {
        setIsLoggedIn(true);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    // Usuwanie spacji przed wysłaniem
    const cleanedEmail = email.trim();
    const cleanedPassword = password.trim();

    try {
      const response = await API.post('/auth/login', {
        email: cleanedEmail,
        password: cleanedPassword,
      });

      await storeToken(response.data.token);
      setIsLoggedIn(true);
      console.log('✅ Użytkownik został poprawnie zalogowany');
    } catch (err) {
      console.error(err);
      Alert.alert(
        i18n.t('login_failed'),
        err.response?.data?.message || i18n.t('server_error'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View
        style={styles.container}
        accessible
        accessibilityLabel={i18n.t('login_screen_label')}
        accessibilityRole="form"
      >
        <Image
          source={require('../assets/images/automation-of-beruaucratic-processes-logo.png')}
          style={styles.image}
          accessible
          accessibilityLabel={i18n.t('app_logo_label')}
          accessibilityHint={i18n.t('app_logo_hint')}
          accessibilityRole="image"
        />

        <Text
          style={styles.title}
          accessibilityRole="header"
          accessibilityLabel={i18n.t('access_account_label')}
        >
          {i18n.t('access_account')}
        </Text>
        <Text
          style={styles.subtitle}
          accessibilityLabel={i18n.t('manage_docs_label')}
          accessibilityRole="text"
        >
          {i18n.t('manage_docs')}
        </Text>

        <TextInput
          mode="outlined"
          label={i18n.t('email')}
          value={email}
          onChangeText={(text) => setEmail(text.trim())}
          left={
            <TextInput.Icon
              icon="email"
              accessibilityLabel={i18n.t('email_icon_label')}
            />
          }
          style={styles.input}
          accessibilityLabel={i18n.t('email_label')}
          accessibilityHint={i18n.t('email_hint')}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          mode="outlined"
          label={i18n.t('password')}
          value={password}
          onChangeText={(text) => setPassword(text.trim())}
          secureTextEntry={!showPassword}
          left={
            <TextInput.Icon
              icon="lock"
              accessibilityLabel={i18n.t('password_icon_label')}
            />
          }
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={
                showPassword
                  ? i18n.t('hide_password_icon_label')
                  : i18n.t('show_password_icon_label')
              }
              accessibilityHint={
                showPassword
                  ? i18n.t('hide_password_hint')
                  : i18n.t('show_password_hint')
              }
              accessibilityRole="button"
            />
          }
          style={styles.input}
          accessibilityLabel={i18n.t('password_label')}
          accessibilityHint={i18n.t('password_hint')}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.loginButton}
          labelStyle={styles.buttonText}
          rippleColor="#ffffff"
          loading={loading}
          accessibilityLabel={i18n.t('login_button_label')}
          accessibilityHint={i18n.t('login_button_hint')}
          accessibilityRole="button"
        >
          {i18n.t('login')}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Register')}
          style={styles.createButton}
          labelStyle={styles.createButtonText}
          accessibilityLabel={i18n.t('create_account_button_label')}
          accessibilityHint={i18n.t('create_account_button_hint')}
          accessibilityRole="button"
        >
          {i18n.t('create_account')}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    color: '#424242',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },
  loginButton: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#001426FF',
    marginBottom: 10,
  },
  createButton: {
    width: '100%',
    borderRadius: 8,
    borderColor: '#001426FF',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#001426FF',
    fontSize: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    tintColor: '#001426FF',
  },
});
