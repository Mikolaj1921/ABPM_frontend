import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { AuthContext } from '../../../contexts/AuthContext';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { uploadDocument } from '../../../api';

export default function OfertaHandlowaScreen({ route, navigation }) {
  const { template, document } = route.params || {};
  const { user } = useContext(AuthContext);
  const { i18n } = useContext(LanguageContext);
  const paperTheme = useTheme();
  const [formData, setFormData] = useState({
    nazwa_firmy_klienta: '',
    adres_firmy_klienta: '',
    nip_klienta: '',
    clientEmail: '',
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
    products: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('userData');
        if (savedData) {
          setFormData((prev) => ({ ...prev, ...JSON.parse(savedData) }));
        }
        if (user) {
          setFormData((prev) => ({
            ...prev,
            nazwa_firmy_wystawcy: user.firstName || prev.nazwa_firmy_wystawcy,
            nip_wystawcy: prev.nip_wystawcy,
            adres_wystawcy: prev.adres_wystawcy,
          }));
        }

        if (document) {
          setFormData((prev) => ({
            ...prev,
            nazwa_firmy_klienta: document.nazwa_firmy_klienta || '',
            nip_klienta: document.nip_klienta || '',
            adres_firmy_klienta: document.adres_firmy_klienta || '',
          }));
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(i18n.t('errorLoading') || 'Błąd podczas ładowania danych');
      }
    };
    loadData();
  }, [user, document]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addProduct = () => {
    if (
      formData.nazwa_uslugi_towaru &&
      formData.ilosc &&
      formData.cena_netto &&
      formData.wartosc_netto
    ) {
      setFormData((prev) => ({
        ...prev,
        products: [
          ...prev.products,
          {
            nazwa_uslugi_towaru: prev.nazwa_uslugi_towaru,
            ilosc: prev.ilosc,
            cena_netto: prev.cena_netto,
            wartosc_netto: prev.wartosc_netto,
          },
        ],
        nazwa_uslugi_towaru: '',
        ilosc: '',
        cena_netto: '',
        wartosc_netto: '',
      }));
    } else {
      setError(
        i18n.t('fillProductFields') || 'Wypełnij wszystkie pola produktu',
      );
    }
  };

  const removeProduct = (index) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const saveDocument = async () => {
    console.log('saveDocument started');

    try {
      console.log('Validating form data:', formData);
      if (
        !formData.nazwa_firmy_klienta ||
        !formData.nip_klienta ||
        !formData.nazwa_firmy_wystawcy ||
        !formData.nip_wystawcy ||
        !formData.wartosc_brutto_suma
      ) {
        console.log('Validation failed: Missing required fields');
        Alert.alert(
          'Błąd',
          i18n.t('fillAllFields') || 'Wypełnij wszystkie wymagane pola',
        );
        setError(i18n.t('fillAllFields') || 'Wypełnij wszystkie wymagane pola');
        return;
      }

      console.log('Saving user data to AsyncStorage...');
      await AsyncStorage.setItem(
        'userData',
        JSON.stringify({
          nazwa_firmy_wystawcy: formData.nazwa_firmy_wystawcy,
          nip_wystawcy: formData.nip_wystawcy,
          adres_wystawcy: formData.adres_wystawcy,
        }),
      );

      // Generowanie HTML-a do PDF-a
      console.log('Generating HTML for PDF...');
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Oferta Handlowa</h1>

            <h2>Dane Klienta</h2>
            <p><strong>Firma:</strong> ${formData.nazwa_firmy_klienta}</p>
            <p><strong>Adres:</strong> ${formData.adres_firmy_klienta}</p>
            <p><strong>NIP:</strong> ${formData.nip_klienta}</p>
            <p><strong>Email:</strong> ${formData.clientEmail}</p>

            <h2>Dane Oferty</h2>
            <p><strong>Data wystawienia:</strong> ${formData.data_wystawienia}</p>
            <p><strong>Data ważności:</strong> ${formData.data_waznosci}</p>
            <p><strong>Numer oferty:</strong> ${formData.numer_oferty}</p>

            <h2>Pozycje Oferty</h2>
            ${
              formData.products.length > 0
                ? formData.products
                    .map(
                      (product, index) =>
                        `<p>${index + 1}. ${product.nazwa_uslugi_towaru} | Ilość: ${
                          product.ilosc
                        } | Cena netto: ${product.cena_netto} | Wartość netto: ${
                          product.wartosc_netto
                        }</p>`,
                    )
                    .join('')
                : '<p>Brak pozycji</p>'
            }

            <h2>Podsumowanie</h2>
            <p><strong>Wartość netto suma:</strong> ${formData.wartosc_netto_suma}</p>
            <p><strong>Stawka VAT:</strong> ${formData.stawka_vat}%</p>
            <p><strong>Wartość VAT:</strong> ${formData.wartosc_vat}</p>
            <p><strong>Wartość brutto suma:</strong> ${formData.wartosc_brutto_suma}</p>

            <h2>Dane Wystawcy</h2>
            <p><strong>Firma:</strong> ${formData.nazwa_firmy_wystawcy}</p>
            <p><strong>NIP:</strong> ${formData.nip_wystawcy}</p>
            <p><strong>Adres:</strong> ${formData.adres_wystawcy}</p>
            <p><strong>Bank:</strong> ${formData.nazwa_banku}</p>
            <p><strong>Numer konta:</strong> ${formData.numer_konta_bankowego}</p>
            <p><strong>SWIFT/BIC:</strong> ${formData.swift_bic}</p>
            <p><strong>Forma płatności:</strong> ${formData.forma_platnosci}</p>
          </body>
        </html>
      `;

      // Generowanie PDF-a za pomocą expo-print
      console.log('Generating PDF...');
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log('PDF generated at:', uri);

      // Przygotowanie FormData do wysyłki
      console.log('Preparing FormData for upload...');
      const fileName = `oferta_handlowa_${Date.now()}`;
      const formDataToSend = new FormData();
      formDataToSend.append('file', {
        uri: uri,
        type: 'application/pdf',
        name: `${fileName}.pdf`,
      });
      formDataToSend.append('templateId', template.id);
      formDataToSend.append(
        'title',
        `Oferta Handlowa ${formData.nazwa_firmy_wystawcy}`,
      );
      formDataToSend.append('type', 'Oferta Handlowa');

      console.log('Uploading document...');
      const response = await uploadDocument(formDataToSend);
      console.log('Upload response:', response);

      const newDocument = {
        id: String(response.document.id),
        name: `Oferta Handlowa ${formData.nazwa_firmy_wystawcy}`,
        type: 'Oferta Handlowa',
        template_name: template?.name || 'Oferta Handlowa',
        created_at: new Date().toISOString(),
        url: response.document.url || uri,
      };
      console.log('Prepared newDocument:', newDocument);

      console.log('Navigating to Documents screen...');
      Alert.alert('Sukces', 'Dokument został zapisany.');
      navigation.navigate('Documents', {
        newDocument,
        category: 'Handlowe',
      });
    } catch (err) {
      console.error('Error in saveDocument:', err);
      Alert.alert(
        'Błąd',
        i18n.t('errorSaving') ||
          `Błąd podczas zapisywania dokumentu: ${err.message}`,
      );
      setError(
        i18n.t('errorSaving') ||
          `Błąd podczas zapisywania dokumentu: ${err.message}`,
      );
    }
  };

  const handleSavePress = () => {
    console.log('Save button pressed');
    saveDocument();
  };

  if (!template) {
    return (
      <View style={styles.center}>
        <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
          {i18n.t('noTemplate') || 'Brak szablonu.'}
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Home')}
          style={styles.cancelButton}
        >
          Wróć
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.header, { color: paperTheme.colors.text }]}>
        {document
          ? i18n.t('editDocument') || 'Edytuj Dokument'
          : i18n.t('createOffer') || 'Twórz Ofertę Handlową'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>
        {i18n.t('clientData') || 'Dane Klienta'}
      </Text>
      <TextInput
        label={i18n.t('clientCompanyName') || 'Nazwa firmy klienta'}
        value={formData.nazwa_firmy_klienta}
        onChangeText={(text) => handleInputChange('nazwa_firmy_klienta', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('clientAddress') || 'Adres firmy klienta'}
        value={formData.adres_firmy_klienta}
        onChangeText={(text) => handleInputChange('adres_firmy_klienta', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('clientNip') || 'NIP klienta'}
        value={formData.nip_klienta}
        onChangeText={(text) => handleInputChange('nip_klienta', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('clientEmail') || 'Email klienta'}
        value={formData.clientEmail}
        onChangeText={(text) => handleInputChange('clientEmail', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="email-address"
      />

      <Text style={styles.sectionTitle}>
        {i18n.t('offerData') || 'Dane Oferty'}
      </Text>
      <TextInput
        label={i18n.t('issueDate') || 'Data wystawienia (YYYY-MM-DD)'}
        value={formData.data_wystawienia}
        onChangeText={(text) => handleInputChange('data_wystawienia', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('validityDate') || 'Data ważności (YYYY-MM-DD)'}
        value={formData.data_waznosci}
        onChangeText={(text) => handleInputChange('data_waznosci', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('offerNumber') || 'Numer oferty'}
        value={formData.numer_oferty}
        onChangeText={(text) => handleInputChange('numer_oferty', text)}
        style={styles.input}
        theme={paperTheme}
      />

      <Text style={styles.sectionTitle}>
        {i18n.t('offerItems') || 'Pozycje Oferty'}
      </Text>
      <TextInput
        label={i18n.t('serviceProductName') || 'Nazwa usługi/towaru'}
        value={formData.nazwa_uslugi_towaru}
        onChangeText={(text) => handleInputChange('nazwa_uslugi_towaru', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('quantity') || 'Ilość'}
        value={formData.ilosc}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('ilosc', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('netPrice') || 'Cena netto'}
        value={formData.cena_netto}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('cena_netto', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('netValue') || 'Wartość netto'}
        value={formData.wartosc_netto}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('wartosc_netto', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <Button
        mode="outlined"
        onPress={addProduct}
        style={styles.button}
        labelStyle={{ color: paperTheme.colors.primary }}
      >
        Dodaj Produkt
      </Button>
      {formData.products.map((product, index) => (
        <View
          key={product.nazwa_uslugi_towaru || `product-${index}`}
          style={styles.productItem}
        >
          <Text>
            {product.nazwa_uslugi_towaru} | {product.ilosc} |{' '}
            {product.cena_netto} | {product.wartosc_netto}
          </Text>
          <Button
            mode="outlined"
            onPress={() => removeProduct(index)}
            style={styles.removeButton}
            labelStyle={{ color: paperTheme.colors.error }}
          >
            Usuń
          </Button>
        </View>
      ))}

      <Text style={styles.sectionTitle}>
        {i18n.t('summary') || 'Podsumowanie'}
      </Text>
      <TextInput
        label={i18n.t('totalNetValue') || 'Wartość netto suma'}
        value={formData.wartosc_netto_suma}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('wartosc_netto_suma', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('vatRate') || 'Stawka VAT (%)'}
        value={formData.stawka_vat}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('stawka_vat', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('vatValue') || 'Wartość VAT'}
        value={formData.wartosc_vat}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('wartosc_vat', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('totalGrossValue') || 'Wartość brutto suma'}
        value={formData.wartosc_brutto_suma}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('wartosc_brutto_suma', text)}
        style={styles.input}
        theme={paperTheme}
      />

      <Text style={styles.sectionTitle}>
        {i18n.t('issuerData') || 'Dane Wystawcy'}
      </Text>
      <TextInput
        label={i18n.t('issuerCompanyName') || 'Nazwa firmy wystawcy'}
        value={formData.nazwa_firmy_wystawcy}
        onChangeText={(text) => handleInputChange('nazwa_firmy_wystawcy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('issuerNip') || 'NIP wystawcy'}
        value={formData.nip_wystawcy}
        onChangeText={(text) => handleInputChange('nip_wystawcy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('issuerAddress') || 'Adres wystawcy'}
        value={formData.adres_wystawcy}
        onChangeText={(text) => handleInputChange('adres_wystawcy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('bankName') || 'Nazwa banku'}
        value={formData.nazwa_banku}
        onChangeText={(text) => handleInputChange('nazwa_banku', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('bankAccountNumber') || 'Numer konta bankowego'}
        value={formData.numer_konta_bankowego}
        onChangeText={(text) =>
          handleInputChange('numer_konta_bankowego', text)
        }
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('swiftBic') || 'SWIFT/BIC'}
        value={formData.swift_bic}
        onChangeText={(text) => handleInputChange('swift_bic', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('paymentMethod') || 'Forma płatności'}
        value={formData.forma_platnosci}
        onChangeText={(text) => handleInputChange('forma_platnosci', text)}
        style={styles.input}
        theme={paperTheme}
      />

      <Button
        mode="contained"
        onPress={handleSavePress}
        style={styles.button}
        labelStyle={{ color: '#fff' }}
      >
        {i18n.t('save') || 'Zapisz'}
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Home')}
        style={styles.cancelButton}
        labelStyle={{ color: paperTheme.colors.primary }}
      >
        {i18n.t('cancel') || 'Anuluj'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#001426FF',
  },
  input: { marginBottom: 15 },
  button: {
    marginVertical: 10,
    backgroundColor: '#001426FF',
    paddingVertical: 8,
  },
  cancelButton: { marginVertical: 5, borderColor: '#001426FF' },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
  errorText: { fontSize: 18 },
  productItem: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: { marginLeft: 10 },
});
