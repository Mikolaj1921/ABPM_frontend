import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { removeToken } from '../authUtils';
import { AuthContext } from '../contexts/AuthContext';

function SettingsScreen() {
  const { setIsLoggedIn } = useContext(AuthContext);

  const handleLogout = async () => {
    await removeToken();
    setIsLoggedIn(false); // Przełączy na ekran logowania
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Screen</Text>
      <Text style={styles.text}>
        Here you can adjust your app settings in the future.
      </Text>
      <Button title="Wyloguj się" onPress={handleLogout} color="#001426" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontSize: 18,
    color: '#001426',
    marginBottom: 10,
  },
});

export default SettingsScreen;
