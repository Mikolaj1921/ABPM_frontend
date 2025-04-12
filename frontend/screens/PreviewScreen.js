import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const PreviewScreen = ({ route }) => {
  const { category } = route.params;

  // Zastępujemy to przykładowym tekstem z EditScreen
  const documentData = 'Przykładowy tekst do podglądu';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Preview {category.name}</Text>
      <Text>{documentData}</Text>
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

export default PreviewScreen;
