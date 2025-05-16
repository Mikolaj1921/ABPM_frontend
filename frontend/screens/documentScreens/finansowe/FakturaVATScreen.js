import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { AuthContext } from '../../../contexts/AuthContext';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { fetchTemplateById, uploadDocument } from '../../../api';

export default function FakturaVATScreen({ route, navigation }) {
  const { document } = route.params || {};
  const { user } = useContext(AuthContext);
  const { i18n } = useContext(LanguageContext);
  const paperTheme = useTheme();
  const [formData, setFormData] = useState({
    numer_faktury: '',
    nazwa_firmy_sprzedawcy: '',
    nip_sprzedawcy: '',
    adres_sprzedawcy: '',
    telefon_sprzedawcy: '',
    email_sprzedawcy: '',
    nazwa_firmy_nabywcy: '',
    nip_nabywcy: '',
    adres_nabywcy: '',
    telefon_nabywcy: '',
    email_nabywcy: '',
    data_wystawienia: new Date().toISOString().split('T')[0],
    data_sprzedazy: new Date().toISOString().split('T')[0],
    termin_platnosci: '',
    wystawiajacy: '',
    nazwa_uslugi_towaru: '',
    ilosc: '',
    cena_netto: '',
    stawka_vat: '23',
    wartosc_netto: '',
    wartosc_vat: '',
    wartosc_brutto: '',
    razem_netto: '',
    razem_vat: '',
    wartosc_brutto_suma: '',
    products: [],
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
            nazwa_firmy_sprzedawcy:
              user.firstName || prev.nazwa_firmy_sprzedawcy,
            nip_sprzedawcy: prev.nip_sprzedawcy,
            adres_sprzedawcy: prev.adres_sprzedawcy,
            wystawiajacy: user.firstName || prev.wystawiajacy,
          }));
        }

        if (document) {
          setFormData((prev) => ({
            ...prev,
            id: document.id || '',
            numer_faktury: document.numer_faktury || '',
            nazwa_firmy_sprzedawcy: document.nazwa_firmy_sprzedawcy || '',
            nip_sprzedawcy: document.nip_sprzedawcy || '',
            adres_sprzedawcy: document.adres_sprzedawcy || '',
            telefon_sprzedawcy: document.telefon_sprzedawcy || '',
            email_sprzedawcy: document.email_sprzedawcy || '',
            nazwa_firmy_nabywcy: document.nazwa_firmy_nabywcy || '',
            nip_nabywcy: document.nip_nabywcy || '',
            adres_nabywcy: document.adres_nabywcy || '',
            telefon_nabywcy: document.telefon_nabywcy || '',
            email_nabywcy: document.email_nabywcy || '',
            data_wystawienia:
              document.data_wystawienia || prev.data_wystawienia,
            data_sprzedazy: document.data_sprzedazy || prev.data_sprzedazy,
            termin_platnosci: document.termin_platnosci || '',
            wystawiajacy: document.wystawiajacy || '',
            razem_netto: document.razem_netto || '',
            razem_vat: document.razem_vat || '',
            wartosc_brutto_suma: document.wartosc_brutto_suma || '',
            products: Array.isArray(document.products) ? document.products : [],
          }));
        }

        const selectedTemplate = await fetchTemplateById(2);
        if (selectedTemplate && selectedTemplate.content) {
          setTemplateHtml(selectedTemplate.content);
        } else {
          throw new Error('Nie znaleziono szablonu o ID 2 w odpowiedzi API');
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
      formData.stawka_vat
    ) {
      const ilosc = parseFloat(formData.ilosc) || 0;
      const cena_netto = parseFloat(formData.cena_netto) || 0;
      const stawka_vat = parseFloat(formData.stawka_vat) || 0;
      const wartosc_netto = (ilosc * cena_netto).toFixed(2);
      const wartosc_vat = ((ilosc * cena_netto * stawka_vat) / 100).toFixed(2);
      const wartosc_brutto = (
        parseFloat(wartosc_netto) + parseFloat(wartosc_vat)
      ).toFixed(2);

      const newProduct = {
        nazwa_uslugi_towaru: formData.nazwa_uslugi_towaru,
        ilosc: formData.ilosc,
        cena_netto: formData.cena_netto,
        stawka_vat: formData.stawka_vat,
        wartosc_netto,
        wartosc_vat,
        wartosc_brutto,
      };
      setFormData((prev) => {
        const updatedProducts = [...prev.products, newProduct];
        const razem_netto = updatedProducts
          .reduce((sum, p) => sum + parseFloat(p.wartosc_netto || 0), 0)
          .toFixed(2);
        const razem_vat = updatedProducts
          .reduce((sum, p) => sum + parseFloat(p.wartosc_vat || 0), 0)
          .toFixed(2);
        const wartosc_brutto_suma = updatedProducts
          .reduce((sum, p) => sum + parseFloat(p.wartosc_brutto || 0), 0)
          .toFixed(2);
        return {
          ...prev,
          products: updatedProducts,
          nazwa_uslugi_towaru: '',
          ilosc: '',
          cena_netto: '',
          stawka_vat: '23',
          wartosc_netto: '',
          wartosc_vat: '',
          wartosc_brutto: '',
          razem_netto,
          razem_vat,
          wartosc_brutto_suma,
        };
      });
      setError('');
    } else {
      setError(
        i18n.t('fillProductFields') || 'Wypełnij wszystkie pola produktu',
      );
    }
  };

  const removeProduct = (index) => {
    setFormData((prev) => {
      const updatedProducts = prev.products.filter((_, i) => i !== index);
      const razem_netto = updatedProducts
        .reduce((sum, p) => sum + parseFloat(p.wartosc_netto || 0), 0)
        .toFixed(2);
      const razem_vat = updatedProducts
        .reduce((sum, p) => sum + parseFloat(p.wartosc_vat || 0), 0)
        .toFixed(2);
      const wartosc_brutto_suma = updatedProducts
        .reduce((sum, p) => sum + parseFloat(p.wartosc_brutto || 0), 0)
        .toFixed(2);
      return {
        ...prev,
        products: updatedProducts,
        razem_netto,
        razem_vat,
        wartosc_brutto_suma,
      };
    });
  };

  const saveDocument = async () => {
    try {
      if (
        !formData.numer_faktury ||
        !formData.nazwa_firmy_sprzedawcy ||
        !formData.nip_sprzedawcy ||
        !formData.nazwa_firmy_nabywcy ||
        !formData.nip_nabywcy ||
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
          nazwa_firmy_sprzedawcy: formData.nazwa_firmy_sprzedawcy,
          nip_sprzedawcy: formData.nip_sprzedawcy,
          adres_sprzedawcy: formData.adres_sprzedawcy,
          telefon_sprzedawcy: formData.telefon_sprzedawcy,
          email_sprzedawcy: formData.email_sprzedawcy,
          wystawiajacy: formData.wystawiajacy,
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
                <td>${product.nazwa_uslugi_towaru || ''}</td>
                <td>${product.ilosc || ''}</td>
                <td>${product.cena_netto || ''}</td>
                <td>${product.stawka_vat || ''}%</td>
                <td>${product.wartosc_netto || ''}</td>
                <td>${product.wartosc_vat || ''}</td>
                <td>${product.wartosc_brutto || ''}</td>
              </tr>
            `,
              )
              .join('')
          : '<tr><td colspan="7">Brak pozycji</td></tr>';

      htmlContent = htmlContent.replace('{{#each pozycje}}', productsHtml);

      const templateFields = [
        'numer_faktury',
        'nazwa_firmy_sprzedawcy',
        'nip_sprzedawcy',
        'adres_sprzedawcy',
        'telefon_sprzedawcy',
        'email_sprzedawcy',
        'nazwa_firmy_nabywcy',
        'nip_nabywcy',
        'adres_nabywcy',
        'telefon_nabywcy',
        'email_nabywcy',
        'data_wystawienia',
        'data_sprzedazy',
        'termin_platnosci',
        'wystawiajacy',
        'razem_netto',
        'razem_vat',
        'wartosc_brutto_suma',
      ];

      templateFields.forEach((key) => {
        const placeholder = `{{${key}}}`;
        const value = formData[key] || '';
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      });

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const fileName = `faktura_vat_${formData.numer_faktury || Date.now()}`;
      const formDataToSend = new FormData();

      formDataToSend.append('file', {
        uri,
        type: 'application/pdf',
        name: `${fileName}.pdf`,
      });
      formDataToSend.append('templateId', '2');
      formDataToSend.append('title', `Faktura ${formData.numer_faktury}`);
      formDataToSend.append('type', 'Faktura');

      templateFields.forEach((key) => {
        let value = formData[key];
        if (key === 'products') {
          value = JSON.stringify(formData.products || []);
        } else {
          value = value || '';
        }
        formDataToSend.append(key, value);
      });
      formDataToSend.append(
        'products',
        JSON.stringify(formData.products || []),
      );

      if (formData.id) {
        formDataToSend.append('id', formData.id);
      }

      const response = await uploadDocument(formDataToSend);
      if (!response?.document?.id) {
        throw new Error('Nie udało się zapisać dokumentu');
      }

      const newDocument = {
        id: String(response.document.id),
        name: `Faktura ${formData.numer_faktury}`,
        type: 'Faktura',
        template_name: 'Faktura VAT',
        created_at: new Date().toISOString(),
        url: response.document.url || uri,
        products: formData.products,
        ...formData,
      };

      Alert.alert(
        i18n.t('success') || 'Sukces',
        i18n.t('documentSaved') || 'Dokument został zapisany.',
      );
      navigation.navigate('Documents', {
        newDocument,
        category: 'Faktury',
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
    saveDocument();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.header, { color: paperTheme.colors.text }]}>
        {document
          ? i18n.t('editInvoice') || 'Edytuj Fakturę VAT'
          : i18n.t('createInvoice') || 'Utwórz Fakturę VAT'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>
        {i18n.t('sellerDetails') || 'Dane Sprzedawcy'}
      </Text>
      <TextInput
        label={i18n.t('invoiceNumber') || 'Numer faktury'}
        value={formData.numer_faktury}
        onChangeText={(text) => handleInputChange('numer_faktury', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('companyName') || 'Nazwa firmy'}
        value={formData.nazwa_firmy_sprzedawcy}
        onChangeText={(text) =>
          handleInputChange('nazwa_firmy_sprzedawcy', text)
        }
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('nip') || 'NIP'}
        value={formData.nip_sprzedawcy}
        onChangeText={(text) => handleInputChange('nip_sprzedawcy', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="numeric"
      />
      <TextInput
        label={i18n.t('address') || 'Adres'}
        value={formData.adres_sprzedawcy}
        onChangeText={(text) => handleInputChange('adres_sprzedawcy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('phone') || 'Telefon'}
        value={formData.telefon_sprzedawcy}
        onChangeText={(text) => handleInputChange('telefon_sprzedawcy', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="phone-pad"
      />
      <TextInput
        label={i18n.t('email') || 'Email'}
        value={formData.email_sprzedawcy}
        onChangeText={(text) => handleInputChange('email_sprzedawcy', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="email-address"
      />

      <Text style={styles.sectionTitle}>
        {i18n.t('buyerDetails') || 'Dane Nabywcy'}
      </Text>
      <TextInput
        label={i18n.t('companyName') || 'Nazwa firmy'}
        value={formData.nazwa_firmy_nabywcy}
        onChangeText={(text) => handleInputChange('nazwa_firmy_nabywcy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('nip') || 'NIP'}
        value={formData.nip_nabywcy}
        onChangeText={(text) => handleInputChange('nip_nabywcy', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="numeric"
      />
      <TextInput
        label={i18n.t('address') || 'Adres'}
        value={formData.adres_nabywcy}
        onChangeText={(text) => handleInputChange('adres_nabywcy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('phone') || 'Telefon'}
        value={formData.telefon_nabywcy}
        onChangeText={(text) => handleInputChange('telefon_nabywcy', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="phone-pad"
      />
      <TextInput
        label={i18n.t('email') || 'Email'}
        value={formData.email_nabywcy}
        onChangeText={(text) => handleInputChange('email_nabywcy', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="email-address"
      />

      <Text style={styles.sectionTitle}>
        {i18n.t('invoiceDetails') || 'Szczegóły Faktury'}
      </Text>
      <TextInput
        label={i18n.t('issueDate') || 'Data wystawienia (YYYY-MM-DD)'}
        value={formData.data_wystawienia}
        onChangeText={(text) => handleInputChange('data_wystawienia', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('saleDate') || 'Data sprzedaży (YYYY-MM-DD)'}
        value={formData.data_sprzedazy}
        onChangeText={(text) => handleInputChange('data_sprzedazy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('paymentDueDate') || 'Termin płatności (YYYY-MM-DD)'}
        value={formData.termin_platnosci}
        onChangeText={(text) => handleInputChange('termin_platnosci', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('issuer') || 'Wystawiający'}
        value={formData.wystawiajacy}
        onChangeText={(text) => handleInputChange('wystawiajacy', text)}
        style={styles.input}
        theme={paperTheme}
      />

      <Text style={styles.sectionTitle}>
        {i18n.t('invoiceItems') || 'Pozycje Faktury'}
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
        label={i18n.t('vatRate') || 'Stawka VAT (%)'}
        value={formData.stawka_vat}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('stawka_vat', text)}
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
            {product.cena_netto} | {product.stawka_vat}% |{' '}
            {product.wartosc_netto} | {product.wartosc_vat} |{' '}
            {product.wartosc_brutto}
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
        label={i18n.t('totalNetValue') || 'Razem netto'}
        value={formData.razem_netto}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('razem_netto', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('totalVATValue') || 'Razem VAT'}
        value={formData.razem_vat}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('razem_vat', text)}
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
        onPress={() => navigation.navigate('Documents')}
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
