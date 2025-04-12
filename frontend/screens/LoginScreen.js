import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Access Account</Text>
        <Text style={styles.subtitle}>Manage your documents efficiently</Text>

        <TextInput
          mode="outlined"
          label="Your email address"
          left={<TextInput.Icon icon="email" />}
          style={styles.input}
          theme={{ colors: { primary: '#001426FF' } }} // Updated primary color
        />
        <TextInput
          mode="outlined"
          label="Enter password"
          secureTextEntry
          left={<TextInput.Icon icon="lock" />}
          right={<TextInput.Icon icon="eye" />}
          style={styles.input}
          theme={{ colors: { primary: '#001426FF' } }} // Updated primary color
        />
        <Text style={styles.forgotText}>Forgot your password?</Text>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('Main')}
          style={styles.loginButton}
          labelStyle={styles.buttonText}
        >
          <Text>Log In</Text>
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Register')}
          style={styles.createButton}
          labelStyle={styles.createButtonText}
        >
          <Text>Create Account</Text>
        </Button>

        <IconButton
          icon="fingerprint"
          size={30}
          // eslint-disable-next-line no-console
          onPress={() => console.log('Biometric login')}
          style={styles.biometricButton}
        />
        <Text style={styles.biometricText}>Use Biometrics</Text>

        <Text style={styles.orText}>Or</Text>

        <Button
          mode="outlined"
          icon="apple"
          // eslint-disable-next-line no-console
          onPress={() => console.log('Apple login')}
          style={styles.socialButton}
          labelStyle={styles.socialButtonText}
        >
          <Text>Continue with Apple</Text>
        </Button>
        <Button
          mode="outlined"
          icon="google"
          // eslint-disable-next-line no-console
          onPress={() => console.log('Google login')}
          style={styles.socialButton}
          labelStyle={styles.socialButtonText}
        >
          <Text>Continue with Google</Text>
        </Button>
        <Button
          mode="outlined"
          icon="facebook"
          // eslint-disable-next-line no-console
          onPress={() => console.log('Facebook login')}
          style={styles.socialButton}
          labelStyle={styles.socialButtonText}
        >
          <Text>Continue with Facebook</Text>
        </Button>

        <Text style={styles.signUpText}>
          Need to create an account?{' '}
          <Text style={styles.signUpLink}>Sign Up</Text>
        </Text>
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
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#424242',
    fontFamily: 'Roboto',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    marginBottom: 15,
  },
  forgotText: {
    alignSelf: 'flex-end',
    color: '#001426FF', // Updated to new primary color
    fontFamily: 'Roboto',
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#001426FF', // Updated to new primary color
    marginBottom: 10,
  },
  createButton: {
    width: '100%',
    borderRadius: 8,
    borderColor: '#001426FF', // Updated to new primary color
    marginBottom: 20,
  },
  createButtonText: {
    color: '#001426FF', // Updated to new primary color
    fontSize: 16,
  },
  biometricButton: {
    marginBottom: 5,
  },
  biometricText: {
    color: '#424242',
    fontFamily: 'Roboto',
    marginBottom: 20,
  },
  orText: {
    color: '#424242',
    fontFamily: 'Roboto',
    marginVertical: 10,
  },
  socialButton: {
    width: '100%',
    borderRadius: 8,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  socialButtonText: {
    color: '#424242',
    fontSize: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  signUpText: {
    color: '#424242',
    fontFamily: 'Roboto',
    marginTop: 20,
    marginBottom: 20,
  },
  signUpLink: {
    color: '#001426FF', // Updated to new primary color
    fontWeight: 'bold',
  },
});
