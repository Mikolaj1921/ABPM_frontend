import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, BackHandler } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function ZapytanieOfertoweScreen({ navigation, route }) {
  const { category, document } = route.params;

  const [formData, setFormData] = useState({
    supplierName: '',
    productService: '',
    quantity: '',
    requestDate: '',
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
    console.log('Saving Zapytanie Ofertowe:', { category, document, formData });
    navigation.navigate('Home');
  };

  const handleCancel = () => {
    navigation.navigate('Home');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Zapytanie Ofertowe</Text>
      <Text style={styles.subtitle}>Category: {category.name}</Text>

      <TextInput
        label="Supplier Name"
        value={formData.supplierName}
        onChangeText={(text) => handleInputChange('supplierName', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Product/Service"
        value={formData.productService}
        onChangeText={(text) => handleInputChange('productService', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Quantity"
        value={formData.quantity}
        onChangeText={(text) => handleInputChange('quantity', text)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Request Date (DD/MM/YYYY)"
        value={formData.requestDate}
        onChangeText={(text) => handleInputChange('requestDate', text)}
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
