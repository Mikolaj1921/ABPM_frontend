import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function FakturaVATScreen({ navigation, route }) {
  const { category, document } = route.params;

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    nip: '',
    netAmount: '',
    vatRate: '',
    issueDate: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    console.log('Saving Faktura VAT:', { category, document, formData });
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Faktura VAT</Text>
      <Text style={styles.subtitle}>Category: {category.name}</Text>

      <TextInput
        label="Invoice Number"
        value={formData.invoiceNumber}
        onChangeText={(text) => handleInputChange('invoiceNumber', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="NIP (Tax ID)"
        value={formData.nip}
        onChangeText={(text) => handleInputChange('nip', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Net Amount"
        value={formData.netAmount}
        onChangeText={(text) => handleInputChange('netAmount', text)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="VAT Rate (%)"
        value={formData.vatRate}
        onChangeText={(text) => handleInputChange('vatRate', text)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Issue Date (DD/MM/YYYY)"
        value={formData.issueDate}
        onChangeText={(text) => handleInputChange('issueDate', text)}
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
        onPress={() => navigation.goBack()}
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
