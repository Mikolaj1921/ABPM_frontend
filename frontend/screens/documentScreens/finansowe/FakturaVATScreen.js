import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as ImagePicker from 'expo-image-picker';
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
    nazwa_firmy_wystawcy: '',
    nip_wystawcy: '',
    adres_wystawcy: '',
    telefon_wystawcy: '',
    email_wystawcy: '',
    nazwa_firmy_klienta: '',
    nip_klienta: '',
    adres_firmy_klienta: '',
    telefon_klienta: '',
    email_klienta: '',
    data_wystawienia: new Date().toISOString().split('T')[0],
    data_sprzedazy: new Date().toISOString().split('T')[0],
    termin_platnosci: '',
    sposob_platnosci: 'przelew',
    numer_konta_bankowego: '',
    wystawiajacy: '',
    nazwa_uslugi_towaru: '',
    ilosc: '',
    jednostka: 'szt.',
    cena_netto: '',
    stawka_vat: '23',
    wartosc_netto: '',
    wartosc_vat: '',
    wartosc_brutto: '',
    wartosc_netto_suma: '',
    wartosc_vat_suma: '',
    wartosc_brutto_suma: '',
    products: [],
    logo: '', // Dodano pole logo
    podpis: '', // Dodano pole podpis
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
            wystawiajacy: user.firstName || prev.wystawiajacy,
          }));
        }

        if (document) {
          setFormData((prev) => ({
            ...prev,
            numer_faktury: document.numer_faktury || '',
            nazwa_firmy_wystawcy: document.nazwa_firmy_wystawcy || '',
            nip_wystawcy: document.nip_wystawcy || '',
            adres_wystawcy: document.adres_wystawcy || '',
            telefon_wystawcy: document.telefon_wystawcy || '',
            email_wystawcy: document.email_wystawcy || '',
            nazwa_firmy_klienta: document.nazwa_firmy_klienta || '',
            nip_klienta: document.nip_klienta || '',
            adres_firmy_klienta: document.adres_firmy_klienta || '',
            telefon_klienta: document.telefon_klienta || '',
            email_klienta: document.email_klienta || '',
            data_wystawienia:
              document.data_wystawienia || prev.data_wystawienia,
            data_sprzedazy: document.data_sprzedazy || prev.data_sprzedazy,
            termin_platnosci: document.termin_platnosci || '',
            sposob_platnosci: document.sposob_platnosci || 'przelew',
            numer_konta_bankowego: document.numer_konta_bankowego || '',
            wystawiajacy: document.wystawiajacy || '',
            wartosc_netto_suma: document.wartosc_netto_suma || '',
            wartosc_vat_suma: document.wartosc_vat_suma || '',
            wartosc_brutto_suma: document.wartosc_brutto_suma || '',
            products: Array.isArray(document.products) ? document.products : [],
            logo: document.logo || '', // Ładowanie logo z dokumentu
            podpis: document.podpis || '', // Ładowanie podpisu z dokumentu
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

  const pickImage = async (field) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Błąd', 'Potrzebne są uprawnienia do galerii zdjęć.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        [field]: `data:image/png;base64,${result.assets[0].base64}`,
      }));
    }
  };

  const addProduct = () => {
    if (
      formData.nazwa_uslugi_towaru &&
      formData.ilosc &&
      formData.jednostka &&
      formData.cena_netto &&
      formData.stawka_vat
    ) {
      const ilosc = parseFloat(formData.ilosc) || 0;
      // eslint-disable-next-line
      const cena_netto = parseFloat(formData.cena_netto) || 0;
      // eslint-disable-next-line
      const stawka_vat = parseFloat(formData.stawka_vat) || 0;
      // eslint-disable-next-line
      const wartosc_netto = (ilosc * cena_netto).toFixed(2);
      // eslint-disable-next-line
      const wartosc_vat = ((ilosc * cena_netto * stawka_vat) / 100).toFixed(2);
      // eslint-disable-next-line
      const wartosc_brutto = (
        parseFloat(wartosc_netto) + parseFloat(wartosc_vat)
      ).toFixed(2);

      const newProduct = {
        nazwa: formData.nazwa_uslugi_towaru,
        jednostka: formData.jednostka,
        ilosc: formData.ilosc,
        cena_netto: formData.cena_netto,
        stawka_vat: formData.stawka_vat,
        // eslint-disable-next-line
        wartosc_netto,
        // eslint-disable-next-line
        kwota_vat: wartosc_vat,
        // eslint-disable-next-line
        wartosc_brutto,
      };
      setFormData((prev) => {
        const updatedProducts = [...prev.products, newProduct];
        // eslint-disable-next-line
        const wartosc_netto_suma = updatedProducts
          .reduce((sum, p) => sum + parseFloat(p.wartosc_netto || 0), 0)
          .toFixed(2);
        // eslint-disable-next-line
        const wartosc_vat_suma = updatedProducts
          .reduce((sum, p) => sum + parseFloat(p.kwota_vat || 0), 0)
          .toFixed(2);
        // eslint-disable-next-line
        const wartosc_brutto_suma = updatedProducts
          .reduce((sum, p) => sum + parseFloat(p.wartosc_brutto || 0), 0)
          .toFixed(2);
        return {
          ...prev,
          products: updatedProducts,
          nazwa_uslugi_towaru: '',
          jednostka: 'szt.',
          ilosc: '',
          cena_netto: '',
          stawka_vat: '23',
          wartosc_netto: '',
          wartosc_vat: '',
          wartosc_brutto: '',
          // eslint-disable-next-line
          wartosc_netto_suma,
          // eslint-disable-next-line
          wartosc_vat_suma,
          // eslint-disable-next-line
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
      // eslint-disable-next-line
      const wartosc_netto_suma = updatedProducts
        .reduce((sum, p) => sum + parseFloat(p.wartosc_netto || 0), 0)
        .toFixed(2);
      // eslint-disable-next-line
      const wartosc_vat_suma = updatedProducts
        .reduce((sum, p) => sum + parseFloat(p.kwota_vat || 0), 0)
        .toFixed(2);
      // eslint-disable-next-line
      const wartosc_brutto_suma = updatedProducts
        .reduce((sum, p) => sum + parseFloat(p.wartosc_brutto || 0), 0)
        .toFixed(2);
      return {
        ...prev,
        products: updatedProducts,
        // eslint-disable-next-line
        wartosc_netto_suma,
        // eslint-disable-next-line
        wartosc_vat_suma,
        // eslint-disable-next-line
        wartosc_brutto_suma,
      };
    });
  };

  const saveDocument = async () => {
    try {
      if (
        !formData.numer_faktury ||
        !formData.nazwa_firmy_wystawcy ||
        !formData.nip_wystawcy ||
        !formData.nazwa_firmy_klienta ||
        !formData.nip_klienta ||
        !formData.termin_platnosci ||
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
          telefon_wystawcy: formData.telefon_wystawcy,
          email_wystawcy: formData.email_wystawcy,
          numer_konta_bankowego: formData.numer_konta_bankowego,
          wystawiajacy: formData.wystawiajacy,
          logo: formData.logo, // Zapis logo
          podpis: formData.podpis, // Zapis podpisu
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
                (product, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${product.nazwa || ''}</td>
                <td>${product.jednostka || ''}</td>
                <td>${product.cena_netto || ''}</td>
                <td>${product.ilosc || ''}</td>
              </tr>
              <tr>
                <td colspan="2">${product.stawka_vat || ''}%</td>
                <td>${product.kwota_vat || ''}</td>
                <td colspan="2">${product.wartosc_brutto || ''}</td>
              </tr>
            `,
              )
              .join('')
          : '<tr><td colspan="5">Brak pozycji</td></tr>';

      htmlContent = htmlContent.replace('{{#each pozycje}}', productsHtml);

      const templateFields = {
        numer_faktury: formData.numer_faktury,
        firma_sprzedawcy: formData.nazwa_firmy_wystawcy,
        nip_sprzedawcy: formData.nip_wystawcy,
        adres_sprzedawcy: formData.adres_wystawcy,
        telefon_sprzedawcy: formData.telefon_wystawcy,
        email_sprzedawcy: formData.email_wystawcy,
        firma_nabywcy: formData.nazwa_firmy_klienta,
        nip_nabywcy: formData.nip_klienta,
        adres_nabywcy: formData.adres_firmy_klienta,
        telefon_nabywcy: formData.telefon_klienta,
        email_nabywcy: formData.email_klienta,
        data_wystawienia: formData.data_wystawienia,
        data_sprzedazy: formData.data_sprzedazy,
        termin_platnosci: formData.termin_platnosci,
        sposob_platnosci: formData.sposob_platnosci,
        numer_konta: formData.numer_konta_bankowego,
        wystawiajacy: formData.wystawiajacy,
        razem_netto: formData.wartosc_netto_suma,
        razem_vat: formData.wartosc_vat_suma,
        razem_brutto: formData.wartosc_brutto_suma,
        logo: formData.logo || '',
        podpis: formData.podpis || '',
      };

      Object.entries(templateFields).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        if (key === 'logo' && !value) {
          // Usuń element logo, jeśli jest pusty
          htmlContent = htmlContent.replace(
            /<img src="{{logo}}" alt="Logo firmy">/,
            '',
          );
        } else if (key === 'podpis' && !value) {
          // Usuń blok podpisu, jeśli jest pusty
          htmlContent = htmlContent.replace(
            /<img src="{{podpis}}" alt="Podpis elektroniczny" class="signature-text" \/>/,
            '',
          );
        } else {
          htmlContent = htmlContent.replace(
            new RegExp(placeholder, 'g'),
            value || '',
          );
        }
      });

      // Usunięcie wszystkich niewypełnionych placeholderów
      htmlContent = htmlContent.replace(/{{[^{}]+}}/g, '');

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
      formDataToSend.append('type', 'Faktura VAT');
      formDataToSend.append(
        'products',
        JSON.stringify(formData.products || []),
      );

      const backendFields = {
        numer_faktury: formData.numer_faktury,
        nazwa_firmy_wystawcy: formData.nazwa_firmy_wystawcy,
        nip_wystawcy: formData.nip_wystawcy,
        adres_wystawcy: formData.adres_wystawcy,
        telefon_wystawcy: formData.telefon_wystawcy,
        email_wystawcy: formData.email_wystawcy,
        nazwa_firmy_klienta: formData.nazwa_firmy_klienta,
        nip_klienta: formData.nip_klienta,
        adres_firmy_klienta: formData.adres_firmy_klienta,
        telefon_klienta: formData.telefon_klienta,
        email_klienta: formData.email_klienta,
        data_wystawienia: formData.data_wystawienia,
        data_sprzedazy: formData.data_sprzedazy,
        termin_platnosci: formData.termin_platnosci,
        sposob_platnosci: formData.sposob_platnosci,
        numer_konta_bankowego: formData.numer_konta_bankowego,
        wystawiajacy: formData.wystawiajacy,
        wartosc_netto_suma: formData.wartosc_netto_suma,
        wartosc_vat: formData.wartosc_vat_suma,
        wartosc_brutto_suma: formData.wartosc_brutto_suma,
        logo: formData.logo, // Dodano logo
        podpis: formData.podpis, // Dodano podpis
      };

      Object.entries(backendFields).forEach(([key, value]) => {
        formDataToSend.append(key, value || '');
      });

      formDataToSend.append(
        'data',
        JSON.stringify({ ...backendFields, products: formData.products }),
      );

      const response = await uploadDocument(formDataToSend);
      if (!response?.document?.id) {
        throw new Error('Nie udało się zapisać dokumentu');
      }

      const newDocument = {
        id: String(response.document.id),
        name: `Faktura ${formData.numer_faktury}`,
        type: 'Faktura VAT',
        template_name: 'Faktura VAT',
        template_id: '2',
        category: 'Faktury',
        created_at: new Date().toISOString(),
        url: response.document.url || uri,
        products: formData.products,
        ...backendFields,
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
        {i18n.t('sellerDetails') || 'Dane Wystawcy'}
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
        value={formData.nazwa_firmy_wystawcy}
        onChangeText={(text) => handleInputChange('nazwa_firmy_wystawcy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('nip') || 'NIP'}
        value={formData.nip_wystawcy}
        onChangeText={(text) => handleInputChange('nip_wystawcy', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="numeric"
      />
      <TextInput
        label={i18n.t('address') || 'Adres'}
        value={formData.adres_wystawcy}
        onChangeText={(text) => handleInputChange('adres_wystawcy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('phone') || 'Telefon'}
        value={formData.telefon_wystawcy}
        onChangeText={(text) => handleInputChange('telefon_wystawcy', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="phone-pad"
      />
      <TextInput
        label={i18n.t('email') || 'Email'}
        value={formData.email_wystawcy}
        onChangeText={(text) => handleInputChange('email_wystawcy', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="email-address"
      />

      <Text style={styles.sectionTitle}>
        {i18n.t('buyerDetails') || 'Dane Klienta'}
      </Text>
      <TextInput
        label={i18n.t('companyName') || 'Nazwa firmy'}
        value={formData.nazwa_firmy_klienta}
        onChangeText={(text) => handleInputChange('nazwa_firmy_klienta', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('nip') || 'NIP'}
        value={formData.nip_klienta}
        onChangeText={(text) => handleInputChange('nip_klienta', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="numeric"
      />
      <TextInput
        label={i18n.t('address') || 'Adres'}
        value={formData.adres_firmy_klienta}
        onChangeText={(text) => handleInputChange('adres_firmy_klienta', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('phone') || 'Telefon'}
        value={formData.telefon_klienta}
        onChangeText={(text) => handleInputChange('telefon_klienta', text)}
        style={styles.input}
        theme={paperTheme}
        keyboardType="phone-pad"
      />
      <TextInput
        label={i18n.t('email') || 'Email'}
        value={formData.email_klienta}
        onChangeText={(text) => handleInputChange('email_klienta', text)}
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
        Railway
        stationlabel={i18n.t('paymentMethod') || 'Sposób płatności'}
        value={formData.sposob_platnosci}
        onChangeText={(text) => handleInputChange('sposob_platnosci', text)}
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
        label={i18n.t('issuer') || 'Wystawiający'}
        value={formData.wystawiajacy}
        onChangeText={(text) => handleInputChange('wystawiajacy', text)}
        style={styles.input}
        theme={paperTheme}
      />

      <Text style={styles.sectionTitle}>
        {i18n.t('logoAndSignature') || 'Logo i Podpis'}
      </Text>
      <Button
        mode="outlined"
        onPress={() => pickImage('logo')}
        style={styles.button}
        labelStyle={{ color: paperTheme.colors.primary }}
      >
        {formData.logo
          ? i18n.t('changeLogo') || 'Zmień Logo'
          : i18n.t('uploadLogo') || 'Prześlij Logo'}
      </Button>
      <Button
        mode="outlined"
        onPress={() => pickImage('podpis')}
        style={styles.button}
        labelStyle={{ color: paperTheme.colors.primary }}
      >
        {formData.podpis
          ? i18n.t('changeSignature') || 'Zmień Podpis'
          : i18n.t('uploadSignature') || 'Prześlij Podpis'}
      </Button>

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
        label={i18n.t('unit') || 'Jednostka'}
        value={formData.jednostka}
        onChangeText={(text) => handleInputChange('jednostka', text)}
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
          key={product.nazwa || `product-${index}`}
          style={styles.productItem}
        >
          <Text>
            {product.nazwa} | {product.jednostka} | {product.ilosc} |{' '}
            {product.cena_netto} | {product.stawka_vat}% |{' '}
            {product.wartosc_netto} | {product.kwota_vat} |{' '}
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
        label={i18n.t('totalNetValue') || 'Wartość netto suma'}
        value={formData.wartosc_netto_suma}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('wartosc_netto_suma', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('totalVATValue') || 'Wartość VAT suma'}
        value={formData.wartosc_vat_suma}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('wartosc_vat_suma', text)}
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
// git
