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

const EditScreen = ({ route, navigation }) => {
  const { category, template, formData: initialFormData } = route.params || {};

  const [formData, setFormData] = useState(
    initialFormData || {
      // Dane Klienta
      nazwa_firmy_klienta: '',
      adres_firmy_klienta: '',
      nip_klienta: '',
      // Dane Oferty
      data_wystawienia: new Date().toISOString().split('T')[0],
      data_waznosci: '',
      numer_oferty: '',
      // Pozycje Oferty
      nazwa_uslugi_towaru: '',
      ilosc: '',
      cena_netto: '',
      wartosc_netto: '',
      // Podsumowanie
      wartosc_netto_suma: '',
      stawka_vat: '23',
      wartosc_vat: '',
      wartosc_brutto_suma: '',
      // Dane Wystawcy
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

  const handleSave = () => {
    Alert.alert('Sukces', 'Dane zostały zapisane.');

    // Przekazujemy dane do 'PreviewScreen' poprawnie
    navigation.navigate('PreviewScreen', {
      category,
      template,
      formData: formData, // Poprawka: Przekazujemy formData z edytowanymi danymi
    });
  };

  if (!template) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Brak szablonu do edycji.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edytuj: {template.name}</Text>

      {/* Dane Klienta */}
      <Text style={styles.sectionTitle}>Dane Klienta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa firmy klienta"
        value={formData.nazwa_firmy_klienta}
        onChangeText={(text) => handleInputChange('nazwa_firmy_klienta', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Adres firmy klienta"
        value={formData.adres_firmy_klienta}
        onChangeText={(text) => handleInputChange('adres_firmy_klienta', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="NIP klienta"
        value={formData.nip_klienta}
        onChangeText={(text) => handleInputChange('nip_klienta', text)}
      />

      {/* Dane Oferty */}
      <Text style={styles.sectionTitle}>Dane Oferty</Text>
      <TextInput
        style={styles.input}
        placeholder="Data wystawienia (YYYY-MM-DD)"
        value={formData.data_wystawienia}
        onChangeText={(text) => handleInputChange('data_wystawienia', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Data ważności (YYYY-MM-DD)"
        value={formData.data_waznosci}
        onChangeText={(text) => handleInputChange('data_waznosci', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Numer oferty"
        value={formData.numer_oferty}
        onChangeText={(text) => handleInputChange('numer_oferty', text)}
      />

      {/* Pozycje Oferty */}
      <Text style={styles.sectionTitle}>Pozycje Oferty</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa usługi/towaru"
        value={formData.nazwa_uslugi_towaru}
        onChangeText={(text) => handleInputChange('nazwa_uslugi_towaru', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Ilość"
        value={formData.ilosc}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('ilosc', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Cena netto"
        value={formData.cena_netto}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('cena_netto', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Wartość netto"
        value={formData.wartosc_netto}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('wartosc_netto', text)}
      />

      {/* Podsumowanie */}
      <Text style={styles.sectionTitle}>Podsumowanie</Text>
      <TextInput
        style={styles.input}
        placeholder="Wartość netto suma"
        value={formData.wartosc_netto_suma}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('wartosc_netto_suma', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Stawka VAT (%)"
        value={formData.stawka_vat}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('stawka_vat', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Wartość VAT"
        value={formData.wartosc_vat}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('wartosc_vat', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Wartość brutto suma"
        value={formData.wartosc_brutto_suma}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('wartosc_brutto_suma', text)}
      />

      {/* Dane Wystawcy */}
      <Text style={styles.sectionTitle}>Dane Wystawcy</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa firmy wystawcy"
        value={formData.nazwa_firmy_wystawcy}
        onChangeText={(text) => handleInputChange('nazwa_firmy_wystawcy', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="NIP wystawcy"
        value={formData.nip_wystawcy}
        onChangeText={(text) => handleInputChange('nip_wystawcy', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Adres wystawcy"
        value={formData.adres_wystawcy}
        onChangeText={(text) => handleInputChange('adres_wystawcy', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Nazwa banku"
        value={formData.nazwa_banku}
        onChangeText={(text) => handleInputChange('nazwa_banku', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Numer konta bankowego"
        value={formData.numer_konta_bankowego}
        onChangeText={(text) =>
          handleInputChange('numer_konta_bankowego', text)
        }
      />
      <TextInput
        style={styles.input}
        placeholder="SWIFT/BIC"
        value={formData.swift_bic}
        onChangeText={(text) => handleInputChange('swift_bic', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Forma płatności"
        value={formData.forma_platnosci}
        onChangeText={(text) => handleInputChange('forma_platnosci', text)}
      />

      {/* Przycisk */}
      <View style={styles.buttonContainer}>
        <Button
          title="Zapisz i zobacz podgląd"
          onPress={handleSave}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    color: 'red',
    fontSize: 18,
  },
});

export default EditScreen;
