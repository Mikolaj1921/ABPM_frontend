import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';

const GenerateScreen = ({ route }) => {
  const { category } = route.params;

  const handleGenerate = () => {
    // eslint-disable-next-line no-console
    console.log(`Generating document for ${category.name}`);
    // Logika generowania dokumentu (na razie tylko logowanie)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Generate {category.name}</Text>
      <Text>Generowanie dokumentu na podstawie wypełnionych danych...</Text>
      <Button title="Generate" onPress={handleGenerate} />
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

export default GenerateScreen;
