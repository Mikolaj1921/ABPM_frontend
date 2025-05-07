import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const UmowaSprzedazyScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Umowa Sprzedaży</Text>
      <Text>Ekran w trakcie rozwoju...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default UmowaSprzedazyScreen;
