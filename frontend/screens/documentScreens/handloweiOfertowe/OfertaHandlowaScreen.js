import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { AuthContext } from '../../../contexts/AuthContext';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { fetchTemplateById, uploadDocument } from '../../../api';

export default function OfertaHandlowaScreen({ route, navigation }) {
  const { template: templateParam, document } = route.params || {};
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
    logo: '',
    podpis: '',
  });
  const [error, setError] = useState('');
  const [templateHtml, setTemplateHtml] = useState('');

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
            data_wystawienia:
              document.data_wystawienia || prev.data_wystawienia,
            data_waznosci: document.data_waznosci || '',
            numer_oferty: document.numer_oferty || '',
            wartosc_netto_suma: document.wartosc_netto_suma || '',
            stawka_vat: document.stawka_vat || '23',
            wartosc_vat: document.wartosc_vat || '',
            wartosc_brutto_suma: document.wartosc_brutto_suma || '',
            products: Array.isArray(document.products) ? document.products : [],
            logo: document.logo || '',
            podpis: document.podpis || '',
            numer_konta_bankowego: document.numer_konta_bankowego || '',
            nazwa_banku: document.nazwa_banku || '',
            swift_bic: document.swift_bic || '',
            forma_platnosci: document.forma_platnosci || 'przelew',
          }));
          // console.log('Loaded document products:', document.products);
        }

        // console.log('Fetching template with ID 1...');
        const selectedTemplate = await fetchTemplateById(1);
        // console.log('Template received:', selectedTemplate);

        if (selectedTemplate && selectedTemplate.content) {
          // console.log('Template found:', selectedTemplate);
          setTemplateHtml(selectedTemplate.content);
        } else {
          throw new Error('Nie znaleziono szablonu o ID 1 w odpowiedzi API');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(
          i18n.t('errorLoading') ||
            `Błąd podczas ładowania danych: ${err.message}`,
        );
      }
    };
    loadData();
  }, [user, document, i18n]);

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
      const newProduct = {
        nazwa_uslugi_towaru: formData.nazwa_uslugi_towaru,
        ilosc: formData.ilosc,
        cena_netto: formData.cena_netto,
        wartosc_netto: formData.wartosc_netto,
      };
      setFormData((prev) => ({
        ...prev,
        products: [...prev.products, newProduct],
        nazwa_uslugi_towaru: '',
        ilosc: '',
        cena_netto: '',
        wartosc_netto: '',
      }));
      // console.log('Added product:', newProduct);
      // console.log('Current products:', [...formData.products, newProduct]);
      setError('');
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
    console.log('Removed product at index:', index);
    console.log(
      'Current products:',
      formData.products.filter((_, i) => i !== index),
    );
  };

  const saveDocument = async () => {
    try {
      if (
        !formData.nazwa_firmy_klienta ||
        !formData.nip_klienta ||
        !formData.nazwa_firmy_wystawcy ||
        !formData.nip_wystawcy ||
        !formData.wartosc_brutto_suma
      ) {
        Alert.alert(
          'Błąd',
          i18n.t('fillAllFields') || 'Wypełnij wszystkie wymagane pola',
        );
        setError(i18n.t('fillAllFields') || 'Wypełnij wszystkie wymagane pola');
        return;
      }

      await AsyncStorage.setItem(
        'userData',
        JSON.stringify({
          nazwa_firmy_wystawcy: formData.nazwa_firmy_wystawcy,
          nip_wystawcy: formData.nip_wystawcy,
          adres_wystawcy: formData.adres_wystawcy,
          nazwa_banku: formData.nazwa_banku,
          numer_konta_bankowego: formData.numer_konta_bankowego,
          swift_bic: formData.swift_bic,
        }),
      );

      if (!templateHtml) {
        throw new Error('Szablon nie został załadowany');
      }

      let htmlContent = templateHtml;
      const productsHtml =
        formData.products.length > 0
          ? formData.products
              .map(
                (product) => `
              <tr>
                <td>${product.nazwa_uslugi_towaru}</td>
                <td>${product.ilosc}</td>
                <td>${product.cena_netto}</td>
                <td>${product.wartosc_netto}</td>
              </tr>
            `,
              )
              .join('')
          : '<tr><td colspan="4">Brak pozycji</td></tr>';

      htmlContent = htmlContent.replace('{{products}}', productsHtml);

      const templateFields = [
        'nazwa_firmy_klienta',
        'adres_firmy_klienta',
        'nip_klienta',
        'clientEmail',
        'data_wystawienia',
        'data_waznosci',
        'numer_oferty',
        'wartosc_netto_suma',
        'stawka_vat',
        'wartosc_vat',
        'wartosc_brutto_suma',
        'nazwa_firmy_wystawcy',
        'nip_wystawcy',
        'adres_wystawcy',
        'nazwa_banku',
        'numer_konta_bankowego',
        'swift_bic',
        'forma_platnosci',
        'logo',
        'podpis',
        'products',
      ];

      templateFields.forEach((key) => {
        const placeholder = `{{${key}}}`;
        const value = formData[key] || '';
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      });

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const fileName = `oferta_handlowa_${Date.now()}`;
      const formDataToSend = new FormData();

      formDataToSend.append('file', {
        uri,
        type: 'application/pdf',
        name: `${fileName}.pdf`,
      });
      formDataToSend.append('templateId', '1');
      formDataToSend.append(
        'title',
        `Oferta Handlowa ${formData.nazwa_firmy_wystawcy}`,
      );
      formDataToSend.append('type', 'Oferta Handlowa');

      templateFields.forEach((key) => {
        let value = formData[key];
        if (key === 'products') {
          value = JSON.stringify(formData.products || []);
        } else {
          value = value || '';
        }
        formDataToSend.append(key, value);
      });

      console.log('Products to send:', formData.products);
      console.log('FormData fields:', Array.from(formDataToSend.entries()));

      const response = await uploadDocument(formDataToSend);
      if (!response?.document?.id) {
        throw new Error('Nie udało się zapisać dokumentu');
      }

      const newDocument = {
        id: String(response.document.id),
        name: `Oferta Handlowa ${formData.nazwa_firmy_wystawcy}`,
        type: 'Oferta Handlowa',
        template_name: 'Oferta Handlowa',
        created_at: new Date().toISOString(),
        url: response.document.url || uri,
        logo: formData.logo,
        podpis: formData.podpis,
        products: formData.products,
        ...formData,
      };

      console.log('New document products:', newDocument.products);

      Alert.alert(
        i18n.t('success') || 'Sukces',
        i18n.t('documentSaved') || 'Dokument został zapisany.',
      );
      navigation.navigate('Documents', {
        newDocument,
        category: 'Handlowe',
      });
    } catch (err) {
      console.error('Error in saveDocument:', err);
      Alert.alert(
        i18n.t('error') || 'Błąd',
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
        {i18n.t('addProduct') || 'Dodaj Produkt'}
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
            {i18n.t('remove') || 'Usuń'}
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
// koko nowa
