import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, BackHandler } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function UmowaSprzedazyScreen({ navigation, route }) {
  const { category, document } = route.params;

  const [formData, setFormData] = useState({
    buyerName: '',
    product: '',
    price: '',
    saleDate: '',
    terms: '',
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
    console.log('Saving Umowa Sprzedaży:', { category, document, formData });
    navigation.navigate('Home');
  };

  const handleCancel = () => {
    navigation.navigate('Home');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Umowa Sprzedaży</Text>
      <Text style={styles.subtitle}>Category: {category.name}</Text>

      <TextInput
        label="Buyer Name"
        value={formData.buyerName}
        onChangeText={(text) => handleInputChange('buyerName', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Product"
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
        label="Sale Date (DD/MM/YYYY)"
        value={formData.saleDate}
        onChangeText={(text) => handleInputChange('saleDate', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Terms"
        value={formData.terms}
        onChangeText={(text) => handleInputChange('terms', text)}
        mode="outlined"
        multiline
        numberOfLines={3}
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
