import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { storeToken, getToken } from '../authUtils';
import API from '../api';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn } = useContext(AuthContext);

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
    try {
      const response = await API.post('/auth/login', {
        email,
        password,
      });

      await storeToken(response.data.token);
      setIsLoggedIn(true);
      console.log('✅ Użytkownik został poprawnie zalogowany');
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Login failed',
        err.response?.data?.message || 'Server error',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View
        style={styles.container}
        accessible={true}
        accessibilityLabel="Ekran logowania"
      >
        <Image
          source={require('../assets/images/automation-of-beruaucratic-processes-logo.png')}
          style={styles.image}
          accessible={true}
          accessibilityLabel="Logotyp aplikacji automatyzującej dokumenty"
        />

        <Text style={styles.title} accessibilityRole="header">
          Access Account
        </Text>
        <Text style={styles.subtitle}>Manage your documents efficiently</Text>

        <TextInput
          mode="outlined"
          label="Your email address"
          value={email}
          onChangeText={setEmail}
          left={<TextInput.Icon icon="email" />}
          style={styles.input}
          accessibilityLabel="Adres e-mail"
          accessibilityHint="Wprowadź swój adres e-mail"
        />

        <TextInput
          mode="outlined"
          label="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          left={<TextInput.Icon icon="lock" />}
          right={<TextInput.Icon icon="eye" />}
          style={styles.input}
          accessibilityLabel="Hasło"
          accessibilityHint="Wprowadź swoje hasło"
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.loginButton}
          labelStyle={styles.buttonText}
          rippleColor="#ffffff"
          loading={loading}
          accessibilityLabel="Zaloguj się"
          accessibilityHint="Naciśnij, aby się zalogować"
          accessibilityRole="button"
        >
          Log In
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Register')}
          style={styles.createButton}
          labelStyle={styles.createButtonText}
          accessibilityLabel="Utwórz konto"
          accessibilityHint="Przejdź do ekranu rejestracji"
          accessibilityRole="button"
        >
          Create Account
        </Button>
      </View>
    </ScrollView>
  );
}

// Style pozostają без змін
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
