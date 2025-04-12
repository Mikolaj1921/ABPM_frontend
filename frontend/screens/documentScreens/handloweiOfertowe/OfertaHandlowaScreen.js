import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, BackHandler } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function OfertaHandlowaScreen({ navigation, route }) {
  const { category, document } = route.params;

  const [formData, setFormData] = useState({
    clientName: '',
    product: '',
    price: '',
    offerDate: '',
  });

  // Obsługa sprzętowego przycisku "Wróć"
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Home'); // Wracamy do HomeScreen
      return true; // Zwracamy true, aby potwierdzić obsłużenie zdarzenia
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove(); // Usuwamy listener przy odmontowaniu komponentu
  }, [navigation]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    console.log('Saving Oferta Handlowa:', { category, document, formData });
    navigation.navigate('Home'); // Wracamy do HomeScreen
  };

  const handleCancel = () => {
    navigation.navigate('Home'); // Wracamy do HomeScreen
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Oferta Handlowa</Text>
      <Text style={styles.subtitle}>Category: {category.name}</Text>

      <TextInput
        label="Client Name"
        value={formData.clientName}
        onChangeText={(text) => handleInputChange('clientName', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Product/Service"
        value={formData.product}
        onChangeText={(text) => handleInputChange('product', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Price"
        value={formData.price}
        onChangeText={(text) => handleInputChange('price', text)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Offer Date (DD/MM/YYYY)"
        value={formData.offerDate}
        onChangeText={(text) => handleInputChange('offerDate', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.saveButton}
        labelStyle={styles.buttonText}
      >
        Save
      </Button>
      <Button
        mode="outlined"
        onPress={handleCancel}
        style={styles.cancelButton}
        labelStyle={styles.buttonText}
      >
        Cancel
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001426FF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  saveButton: {
    marginVertical: 10,
    backgroundColor: '#001426FF',
  },
  cancelButton: {
    marginVertical: 5,
    borderColor: '#001426FF',
  },
  buttonText: {
    color: '#FFFFFF',
  },
});
