import React from 'react';
import { Text, StyleSheet, Image } from 'react-native'; // Dodano import Image
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import FadeInView from '../components/animations/FadeInView'; // Ensure this exists

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <FadeInView style={styles.container}>
      <Image
        source={require('../assets/images/automation-of-beruaucratic-processes-logo.png')} // Poprawiona ścieżka
        style={styles.image}
      />
      <Text style={styles.logo}>Automation of Bureaucratic Processes</Text>
      <Text style={styles.tagline}>Document automation at your fingertips</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Login')}
        style={styles.button}
        labelStyle={styles.buttonText}
      >
        <Text>Get Started</Text>
      </Button>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001426FF', // Dark blue background from image
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 48,
    color: '#FFFFFF',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Roboto',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    width: '80%',
    borderRadius: 8,
    backgroundColor: '#FFFFFF', // White button
  },
  buttonText: {
    color: '#1A2525', // Dark blue text on button
    fontSize: 16,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});
