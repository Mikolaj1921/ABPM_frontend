import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  Snackbar,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../../contexts/AuthContext';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { fetchTemplateById, uploadDocument } from '../../../api';

export default function FakturaVATScreen({ route, navigation }) {
  const { document } = route.params || {};
  const { user } = useContext(AuthContext);
  const { i18n } = useContext(LanguageContext);
  const paperTheme = usePaperTheme();
  const { colors } = useTheme();
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
    logo: '',
    podpis: '',
  });
  const [error, setError] = useState('');
  const [templateHtml, setTemplateHtml] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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
            logo: document.logo || '',
            podpis: document.podpis || '',
          }));
        }

        const selectedTemplate = await fetchTemplateById(2);
        if (selectedTemplate && selectedTemplate.content) {
          setTemplateHtml(selectedTemplate.content);
        } else {
          throw new Error(i18n.t('template_not_found'));
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(i18n.t('errorLoading'));
        setSnackbarMessage(i18n.t('errorLoading'));
        setSnackbarVisible(true);
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
      setSnackbarMessage(i18n.t('gallery_permission_error'));
      setSnackbarVisible(true);
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
      const cena_netto = parseFloat(formData.cena_netto) || 0;
      const stawka_vat = parseFloat(formData.stawka_vat) || 0;
      const wartosc_netto = (ilosc * cena_netto).toFixed(2);
      const wartosc_vat = ((ilosc * cena_netto * stawka_vat) / 100).toFixed(2);
      const wartosc_brutto = (
        parseFloat(wartosc_netto) + parseFloat(wartosc_vat)
      ).toFixed(2);

      const newProduct = {
        nazwa: formData.nazwa_uslugi_towaru,
        jednostka: formData.jednostka,
        ilosc: formData.ilosc,
        cena_netto: formData.cena_netto,
        stawka_vat: formData.stawka_vat,
        wartosc_netto,
        kwota_vat: wartosc_vat,
        wartosc_brutto,
      };
      setFormData((prev) => {
        const updatedProducts = [...prev.products, newProduct];
        const wartosc_netto_suma = updatedProducts
          .reduce((sum, p) => sum + parseFloat(p.wartosc_netto || 0), 0)
          .toFixed(2);
        const wartosc_vat_suma = updatedProducts
          .reduce((sum, p) => sum + parseFloat(p.kwota_vat || 0), 0)
          .toFixed(2);
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
          wartosc_netto_suma,
          wartosc_vat_suma,
          wartosc_brutto_suma,
        };
      });
      setError('');
    } else {
      setError(i18n.t('fillProductFields'));
      setSnackbarMessage(i18n.t('fillProductFields'));
      setSnackbarVisible(true);
    }
  };

  const removeProduct = (index) => {
    setFormData((prev) => {
      const updatedProducts = prev.products.filter((_, i) => i !== index);
      const wartosc_netto_suma = updatedProducts
        .reduce((sum, p) => sum + parseFloat(p.wartosc_netto || 0), 0)
        .toFixed(2);
      const wartosc_vat_suma = updatedProducts
        .reduce((sum, p) => sum + parseFloat(p.kwota_vat || 0), 0)
        .toFixed(2);
      const wartosc_brutto_suma = updatedProducts
        .reduce((sum, p) => sum + parseFloat(p.wartosc_brutto || 0), 0)
        .toFixed(2);
      return {
        ...prev,
        products: updatedProducts,
        wartosc_netto_suma,
        wartosc_vat_suma,
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
        setError(i18n.t('fillAllFields'));
        setSnackbarMessage(i18n.t('fillAllFields'));
        setSnackbarVisible(true);
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
          logo: formData.logo,
          podpis: formData.podpis,
        }),
      );

      if (!templateHtml) {
        throw new Error(i18n.t('template_not_loaded'));
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
          htmlContent = htmlContent.replace(
            /<img src="{{logo}}" alt="Logo firmy">/,
            '',
          );
        } else if (key === 'podpis' && !value) {
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
        logo: formData.logo,
        podpis: formData.podpis,
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
        throw new Error(i18n.t('document_save_error'));
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

      setSnackbarMessage(i18n.t('documentSaved'));
      setSnackbarVisible(true);
      navigation.navigate('Documents', {
        newDocument,
        category: 'Faktury',
      });
      return;
    } catch (err) {
      console.warn(
        `Attempt ${attempt} failed: ${err.message}. ${
          attempt < maxRetries
            ? `Retrying after ${2 ** attempt * 2000}ms...`
            : 'No more retries.'
        }`,
      );
      if (attempt === maxRetries) {
        console.error('All retry attempts failed:', err);
        setError(`${i18n.t('errorSaving')}: ${err.message}`);
        setSnackbarMessage(`${i18n.t('errorSaving')}: ${err.message}`);
        setSnackbarVisible(true);
        return;
      }
      await delay(2 ** attempt * 2000); // Exponential backoff: 2s, 4s, 8s
      attempt += 1;
    }
  };

  const handleSavePress = () => {
    saveDocument();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={[styles.scrollView, { backgroundColor: colors.background }]}
      >
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={document ? i18n.t('editInvoice') : i18n.t('createInvoice')}
            titleStyle={[styles.header, { color: colors.text }]}
          />
        </Card>

        {/* Seller Details */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={i18n.t('sellerDetails')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
          />
          <Card.Content>
            <TextInput
              label={i18n.t('invoiceNumber')}
              value={formData.numer_faktury}
              onChangeText={(text) => handleInputChange('numer_faktury', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('invoiceNumber')}
            />
            <TextInput
              label={i18n.t('companyName')}
              value={formData.nazwa_firmy_wystawcy}
              onChangeText={(text) =>
                handleInputChange('nazwa_firmy_wystawcy', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('companyName')}
            />
            <TextInput
              label={i18n.t('nip')}
              value={formData.nip_wystawcy}
              onChangeText={(text) => handleInputChange('nip_wystawcy', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              keyboardType="numeric"
              accessibilityLabel={i18n.t('nip')}
            />
            <TextInput
              label={i18n.t('address')}
              value={formData.adres_wystawcy}
              onChangeText={(text) => handleInputChange('adres_wystawcy', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('address')}
            />
            <TextInput
              label={i18n.t('phone')}
              value={formData.telefon_wystawcy}
              onChangeText={(text) =>
                handleInputChange('telefon_wystawcy', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              keyboardType="phone-pad"
              accessibilityLabel={i18n.t('phone')}
            />
            <TextInput
              label={i18n.t('email')}
              value={formData.email_wystawcy}
              onChangeText={(text) => handleInputChange('email_wystawcy', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              keyboardType="email-address"
              accessibilityLabel={i18n.t('email')}
            />
          </Card.Content>
        </Card>

        {/* Buyer Details */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={i18n.t('buyerDetails')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
          />
          <Card.Content>
            <TextInput
              label={i18n.t('companyName')}
              value={formData.nazwa_firmy_klienta}
              onChangeText={(text) =>
                handleInputChange('nazwa_firmy_klienta', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('companyName')}
            />
            <TextInput
              label={i18n.t('nip')}
              value={formData.nip_klienta}
              onChangeText={(text) => handleInputChange('nip_klienta', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              keyboardType="numeric"
              accessibilityLabel={i18n.t('nip')}
            />
            <TextInput
              label={i18n.t('address')}
              value={formData.adres_firmy_klienta}
              onChangeText={(text) =>
                handleInputChange('adres_firmy_klienta', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('address')}
            />
            <TextInput
              label={i18n.t('phone')}
              value={formData.telefon_klienta}
              onChangeText={(text) =>
                handleInputChange('telefon_klienta', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              keyboardType="phone-pad"
              accessibilityLabel={i18n.t('phone')}
            />
            <TextInput
              label={i18n.t('email')}
              value={formData.email_klienta}
              onChangeText={(text) => handleInputChange('email_klienta', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              keyboardType="email-address"
              accessibilityLabel={i18n.t('email')}
            />
          </Card.Content>
        </Card>

        {/* Invoice Details */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={i18n.t('invoiceDetails')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
          />
          <Card.Content>
            <TextInput
              label={i18n.t('issueDate')}
              value={formData.data_wystawienia}
              onChangeText={(text) =>
                handleInputChange('data_wystawienia', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('issueDate')}
            />
            <TextInput
              label={i18n.t('saleDate')}
              value={formData.data_sprzedazy}
              onChangeText={(text) => handleInputChange('data_sprzedazy', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('saleDate')}
            />
            <TextInput
              label={i18n.t('paymentDueDate')}
              value={formData.termin_platnosci}
              onChangeText={(text) =>
                handleInputChange('termin_platnosci', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('paymentDueDate')}
            />
            <TextInput
              label={i18n.t('paymentMethod')}
              value={formData.sposob_platnosci}
              onChangeText={(text) =>
                handleInputChange('sposob_platnosci', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('paymentMethod')}
            />
            <TextInput
              label={i18n.t('bankAccountNumber')}
              value={formData.numer_konta_bankowego}
              onChangeText={(text) =>
                handleInputChange('numer_konta_bankowego', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('bankAccountNumber')}
            />
            <TextInput
              label={i18n.t('issuer')}
              value={formData.wystawiajacy}
              onChangeText={(text) => handleInputChange('wystawiajacy', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('issuer')}
            />
          </Card.Content>
        </Card>

        {/* Logo and Signature */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={i18n.t('logoAndSignature')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
          />
          <Card.Content>
            <Button
              mode="outlined"
              onPress={() => pickImage('logo')}
              style={[styles.button, { borderColor: colors.primary }]}
              labelStyle={[styles.buttonText, { color: colors.primary }]}
              icon={() => (
                <FontAwesome name="image" size={16} color={colors.primary} />
              )}
              accessibilityLabel={
                formData.logo ? i18n.t('changeLogo') : i18n.t('uploadLogo')
              }
            >
              {formData.logo ? i18n.t('changeLogo') : i18n.t('uploadLogo')}
            </Button>
            <Button
              mode="outlined"
              onPress={() => pickImage('podpis')}
              style={[styles.button, { borderColor: colors.primary }]}
              labelStyle={[styles.buttonText, { color: colors.primary }]}
              icon={() => (
                <FontAwesome name="pencil" size={16} color={colors.primary} />
              )}
              accessibilityLabel={
                formData.podpis
                  ? i18n.t('changeSignature')
                  : i18n.t('uploadSignature')
              }
            >
              {formData.podpis
                ? i18n.t('changeSignature')
                : i18n.t('uploadSignature')}
            </Button>
          </Card.Content>
        </Card>

        {/* Invoice Items */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={i18n.t('invoiceItems')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
          />
          <Card.Content>
            <TextInput
              label={i18n.t('serviceProductName')}
              value={formData.nazwa_uslugi_towaru}
              onChangeText={(text) =>
                handleInputChange('nazwa_uslugi_towaru', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('serviceProductName')}
            />
            <TextInput
              label={i18n.t('unit')}
              value={formData.jednostka}
              onChangeText={(text) => handleInputChange('jednostka', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('unit')}
            />
            <TextInput
              label={i18n.t('quantity')}
              value={formData.ilosc}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange('ilosc', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('quantity')}
            />
            <TextInput
              label={i18n.t('netPrice')}
              value={formData.cena_netto}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange('cena_netto', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('netPrice')}
            />
            <TextInput
              label={i18n.t('vatRate')}
              value={formData.stawka_vat}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange('stawka_vat', text)}
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('vatRate')}
            />
            <Button
              mode="outlined"
              onPress={addProduct}
              style={[styles.button, { borderColor: colors.primary }]}
              labelStyle={[styles.buttonText, { color: colors.primary }]}
              icon={() => (
                <FontAwesome name="plus" size={16} color={colors.primary} />
              )}
              accessibilityLabel={i18n.t('addProduct')}
            >
              {i18n.t('addProduct')}
            </Button>
            {formData.products.map((product, index) => (
              <Card
                key={product.nazwa || `product-${index}`}
                style={[styles.productCard, { backgroundColor: colors.accent }]}
              >
                <Card.Content style={styles.productContent}>
                  <Text style={[styles.productText, { color: colors.text }]}>
                    {product.nazwa} | {product.jednostka} | {product.ilosc} |{' '}
                    {product.cena_netto} | {product.stawka_vat}% |{' '}
                    {product.wartosc_netto} | {product.kwota_vat} |{' '}
                    {product.wartosc_brutto}
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => removeProduct(index)}
                    style={[styles.removeButton, { borderColor: colors.error }]}
                    labelStyle={[styles.buttonText, { color: colors.error }]}
                    icon={() => (
                      <FontAwesome
                        name="trash"
                        size={16}
                        color={colors.error}
                      />
                    )}
                    accessibilityLabel={i18n.t('remove')}
                  >
                    {i18n.t('remove')}
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </Card.Content>
        </Card>

        {/* Summary */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={i18n.t('summary')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
          />
          <Card.Content>
            <TextInput
              label={i18n.t('totalNetValue')}
              value={formData.wartosc_netto_suma}
              keyboardType="numeric"
              onChangeText={(text) =>
                handleInputChange('wartosc_netto_suma', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('totalNetValue')}
            />
            <TextInput
              label={i18n.t('totalVATValue')}
              value={formData.wartosc_vat_suma}
              keyboardType="numeric"
              onChangeText={(text) =>
                handleInputChange('wartosc_vat_suma', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('totalVATValue')}
            />
            <TextInput
              label={i18n.t('totalGrossValue')}
              value={formData.wartosc_brutto_suma}
              keyboardType="numeric"
              onChangeText={(text) =>
                handleInputChange('wartosc_brutto_suma', text)
              }
              style={[
                styles.input,
                { borderColor: colors.accent, backgroundColor: colors.surface },
              ]}
              theme={{
                colors: {
                  background: colors.surface,
                  textNIC: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('totalGrossValue')}
            />
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.primary }]}>
          <FontAwesome
            name="info-circle"
            size={20}
            color={colors.surface}
            style={styles.footerIcon}
          />
          <Text style={[styles.footerText, { color: colors.surface }]}>
            © 2025 Automation of Bureaucratic Processes. Wersja 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* FAB for Save */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleSavePress}
        accessible
        accessibilityLabel={i18n.t('save')}
        accessibilityHint={i18n.t('save_document_hint')}
      >
        <FontAwesome name="save" size={24} color={colors.surface} />
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={[styles.fabCancel, { backgroundColor: colors.error }]}
        onPress={() => navigation.navigate('Documents')}
        accessible
        accessibilityLabel={i18n.t('cancel')}
        accessibilityHint={i18n.t('cancel_hint')}
      >
        <FontAwesome name="times" size={24} color={colors.surface} />
      </TouchableOpacity>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}
        style={{ backgroundColor: colors.surface }}
      >
        <Text style={{ color: colors.text }}>{snackbarMessage}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 50,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  header: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  button: {
    marginVertical: 10,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productCard: {
    marginVertical: 6,
    borderRadius: 10,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  productText: {
    fontSize: 14,
    flex: 1,
  },
  removeButton: {
    marginLeft: 10,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    elevation: 3,
  },
  footerIcon: {
    marginRight: 10,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOpacity: 0.3,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  fabCancel: {
    position: 'absolute',
    bottom: 30,
    right: 100,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOpacity: 0.3,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
