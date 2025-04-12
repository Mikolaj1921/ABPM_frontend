import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, View, Text } from 'react-native';

const EditScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [documentData, setDocumentData] = useState(
    'Przykładowy tekst do edycji.',
  );

  const handleSave = () => {
    navigation.goBack(); // Powrót do poprzedniego ekranu
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit {category.name}</Text>
      <TextInput
        style={styles.input}
        placeholder="Wprowadź dane"
        value={documentData}
        onChangeText={setDocumentData}
      />
      <Button title="Save" onPress={handleSave} />
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
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
});

export default EditScreen;
