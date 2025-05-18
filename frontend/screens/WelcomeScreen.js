import React from 'react';
import { Text, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LanguageContext } from '../contexts/LanguageContext';
import FadeInView from '../components/animations/FadeInView';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { i18n } = React.useContext(LanguageContext);

  return (
    <FadeInView
      style={styles.container}
      accessibilityLabel={i18n.t('welcome_screen_label')}
      accessibilityRole="dialog"
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
        style={styles.logo}
        accessibilityRole="header"
        accessibilityLabel={i18n.t('app_name_label')}
      >
        {i18n.t('app_name')}
      </Text>
      <Text
        style={styles.tagline}
        accessibilityLabel={i18n.t('tagline_label')}
        accessibilityRole="text"
      >
        {i18n.t('tagline')}
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Login')}
        style={styles.button}
        labelStyle={styles.buttonText}
        accessibilityLabel={i18n.t('get_started_button_label')}
        accessibilityHint={i18n.t('get_started_button_hint')}
        accessibilityRole="button"
      >
        {i18n.t('get_started')}
      </Button>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001426FF',
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
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    color: '#1A2525',
    fontSize: 16,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});
