import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  View,
  Text,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const GenerateScreen = ({ route, navigation }) => {
  const { category, template, formData: initialFormData } = route.params || {};

  const [formData, setFormData] = useState(
    initialFormData || {
      nazwa_firmy_klienta: '',
      adres_firmy_klienta: '',
      nip_klienta: '',
      data_wystawienia: new Date().toISOString().split('T')[0],
      data_waznosci: '',
      numer_oferty: '',
      nazwa_uslugi_towaru: '',
      ilosc: '',
      cena_netto: '',
      wartosc_netto: '',
      wartosc_netto_suma: '',
      stawka_vat: '23',
      wartosc_vat: '',
      wartosc_brutto_suma: '',
      nazwa_firmy_wystawcy: '',
      nip_wystawcy: '',
      adres_wystawcy: '',
      nazwa_banku: '',
      numer_konta_bankowego: '',
      swift_bic: '',
      forma_platnosci: 'przelew',
    },
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateAndUpload = async () => {
    try {
      // Generowanie pliku PDF (przykład)
      const pdfContent = `
        Dokument: ${formData.nazwa_firmy_klienta}
        Data wystawienia: ${formData.data_wystawienia}
        Wartość brutto: ${formData.wartosc_brutto_suma}
      `;

      const fileUri = `${FileSystem.documentDirectory}document.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, pdfContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Sprawdź, czy plik istnieje
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('Plik PDF nie został wygenerowany.');
      }

      // Przesyłanie pliku PDF do backendu
      const formDataToSend = new FormData();
      formDataToSend.append('file', {
        uri: fileUri,
        name: 'document.pdf',
        type: 'application/pdf',
      });
      formDataToSend.append('templateId', template.id);
      formDataToSend.append('category', category);

      const response = await axios.post(
        'http://192.168.1.105:5000/api/documents',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      Alert.alert('Sukces', 'Dokument został zapisany pomyślnie.');
      navigation.navigate('PreviewScreen', {
        category,
        template,
        formData,
      });
    } catch (error) {
      if (error.response) {
        console.error('Błąd odpowiedzi serwera:', error.response.data);
        Alert.alert(
          'Błąd serwera',
          error.response.data.error || 'Nieznany błąd',
        );
      } else if (error.request) {
        console.error('Brak odpowiedzi od serwera:', error.request);
        Alert.alert('Błąd sieci', 'Nie udało się połączyć z serwerem.');
      } else {
        console.error('Błąd:', error.message);
        Alert.alert('Błąd', error.message);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Generuj Dokument</Text>

      {/* Dane Klienta */}
      <Text style={styles.sectionTitle}>Dane Klienta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa firmy klienta"
        value={formData.nazwa_firmy_klienta}
        onChangeText={(text) => handleInputChange('nazwa_firmy_klienta', text)}
      />
      {/* Dodaj inne pola formularza tutaj */}

      <View style={styles.buttonContainer}>
        <Button
          title="Generuj i Zapisz"
          onPress={handleGenerateAndUpload}
          color="#001426FF"
        />
        <View style={{ marginVertical: 5 }} />
        <Button
          title="Anuluj"
          onPress={() => navigation.goBack()}
          color="#555"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#001426FF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default GenerateScreen;
