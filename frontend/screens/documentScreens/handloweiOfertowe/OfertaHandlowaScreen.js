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

export default function OfertaHandlowaScreen({ route, navigation }) {
  // eslint-disable-next-line
  const { template: templateParam, document } = route.params || {};
  const { user } = useContext(AuthContext);
  const { i18n } = useContext(LanguageContext);
  // eslint-disable-next-line
  const paperTheme = usePaperTheme();
  const { colors } = useTheme();
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
  // eslint-disable-next-line
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
            nazwa_firmy_wystawcy: user.first_name || prev.nazwa_firmy_wystawcy,
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
        }

        const selectedTemplate = await fetchTemplateById(1);
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
        [field]: result.assets[0].uri,
      }));
    }
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
      setError('');
    } else {
      setError(i18n.t('fillProductFields'));
      setSnackbarMessage(i18n.t('fillProductFields'));
      setSnackbarVisible(true);
    }
  };

  const removeProduct = (index) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
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
          nazwa_banku: formData.nazwa_banku,
          numer_konta_bankowego: formData.numer_konta_bankowego,
          swift_bic: formData.swift_bic,
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

      const templateFields = {
        nazwa_firmy_klienta: formData.nazwa_firmy_klienta,
        adres_firmy_klienta: formData.adres_firmy_klienta,
        nip_klienta: formData.nip_klienta,
        clientEmail: formData.clientEmail,
        data_wystawienia: formData.data_wystawienia,
        data_waznosci: formData.data_waznosci,
        numer_oferty: formData.numer_oferty,
        wartosc_netto_suma: formData.wartosc_netto_suma,
        stawka_vat: formData.stawka_vat,
        wartosc_vat: formData.wartosc_vat,
        wartosc_brutto_suma: formData.wartosc_brutto_suma,
        nazwa_firmy_wystawcy: formData.nazwa_firmy_wystawcy,
        nip_wystawcy: formData.nip_wystawcy,
        adres_wystawcy: formData.adres_wystawcy,
        nazwa_banku: formData.nazwa_banku,
        numer_konta_bankowego: formData.numer_konta_bankowego,
        swift_bic: formData.swift_bic,
        forma_platnosci: formData.forma_platnosci,
        logo: formData.logo || '',
        podpis: formData.podpis || '',
        products: formData.products || [],
      };

      Object.entries(templateFields).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        if (key === 'logo' && !value) {
          htmlContent = htmlContent.replace(
            /<img src="{{logo}}" alt="Logo firmy" \/>/,
            '',
          );
        } else if (key === 'podpis' && !value) {
          htmlContent = htmlContent.replace(
            /<img src="{{podpis}}" alt="Podpis elektroniczny" class="signature-text" \/>/,
            '',
          );
        } else if (key === 'products') {
          // Skip products as it's handled by productsHtml
        } else {
          htmlContent = htmlContent.replace(
            new RegExp(placeholder, 'g'),
            value || '',
          );
        }
      });

      htmlContent = htmlContent.replace(/{{[^{}]+}}/g, '');

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

      Object.entries(templateFields).forEach(([key, value]) => {
        if (key === 'products') {
          formDataToSend.append(
            'products',
            JSON.stringify(formData.products || []),
          );
        } else {
          formDataToSend.append(key, value || '');
        }
      });

      formDataToSend.append('data', JSON.stringify(templateFields));

      const response = await uploadDocument(formDataToSend);
      if (!response?.document?.id) {
        throw new Error(i18n.t('document_save_error'));
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
        ...templateFields,
      };

      setSnackbarMessage(i18n.t('documentSaved'));
      setSnackbarVisible(true);
      navigation.navigate('Documents', {
        newDocument,
        category: 'Handlowe',
      });
    } catch (err) {
      console.error('Error saving document:', err);
      setError(`${i18n.t('errorSaving')}: ${err.message}`);
      setSnackbarMessage(`${i18n.t('errorSaving')}: ${err.message}`);
      setSnackbarVisible(true);
    }
  };

  const handleSavePress = () => {
    saveDocument();
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      accessible={false}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        accessible={false}
      >
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={document ? i18n.t('editDocument') : i18n.t('createOffer')}
            titleStyle={[styles.header, { color: colors.text }]}
            accessibilityLabel={
              document ? i18n.t('editDocument') : i18n.t('createOffer')
            }
            accessibilityRole="header"
          />
        </Card>

        {/* Client Data */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={i18n.t('clientData')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('clientData')}
            accessibilityRole="header"
          />
          <Card.Content>
            <TextInput
              label={i18n.t('clientCompanyName')}
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
              accessibilityLabel={i18n.t('clientCompanyName')}
              accessibilityHint={i18n.t('clientCompanyName_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('clientAddress')}
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
              accessibilityLabel={i18n.t('clientAddress')}
              accessibilityHint={i18n.t('clientAddress_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('clientNip')}
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
              accessibilityLabel={i18n.t('clientNip')}
              accessibilityHint={i18n.t('clientNip_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('clientEmail')}
              value={formData.clientEmail}
              onChangeText={(text) => handleInputChange('clientEmail', text)}
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
              accessibilityLabel={i18n.t('clientEmail')}
              accessibilityHint={i18n.t('clientEmail_hint')}
              accessibilityRole="none"
            />
          </Card.Content>
        </Card>

        {/* Offer Data */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={i18n.t('offerData')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('offerData')}
            accessibilityRole="header"
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
              accessibilityHint={i18n.t('issueDate_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('validityDate')}
              value={formData.data_waznosci}
              onChangeText={(text) => handleInputChange('data_waznosci', text)}
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
              accessibilityLabel={i18n.t('validityDate')}
              accessibilityHint={i18n.t('validityDate_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('offerNumber')}
              value={formData.numer_oferty}
              onChangeText={(text) => handleInputChange('numer_oferty', text)}
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
              accessibilityLabel={i18n.t('offerNumber')}
              accessibilityHint={i18n.t('offerNumber_hint')}
              accessibilityRole="none"
            />
          </Card.Content>
        </Card>

        {/* Logo and Signature */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={i18n.t('logoAndSignature')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('logoAndSignature')}
            accessibilityRole="header"
          />
          <Card.Content>
            <Button
              mode="outlined"
              onPress={() => pickImage('logo')}
              style={[styles.button, { borderColor: colors.primary }]}
              labelStyle={[styles.buttonText, { color: colors.primary }]}
              // eslint-disable-next-line
              icon={() => (
                <FontAwesome name="image" size={16} color={colors.primary} />
              )}
              accessibilityLabel={
                formData.logo ? i18n.t('changeLogo') : i18n.t('uploadLogo')
              }
              accessibilityHint={
                formData.logo
                  ? i18n.t('changeLogo_hint')
                  : i18n.t('uploadLogo_hint')
              }
              accessibilityRole="button"
            >
              {formData.logo ? i18n.t('changeLogo') : i18n.t('uploadLogo')}
            </Button>
            <Button
              mode="outlined"
              onPress={() => pickImage('podpis')}
              style={[styles.button, { borderColor: colors.primary }]}
              labelStyle={[styles.buttonText, { color: colors.primary }]}
              // eslint-disable-next-line
              icon={() => (
                <FontAwesome name="pencil" size={16} color={colors.primary} />
              )}
              accessibilityLabel={
                formData.podpis
                  ? i18n.t('changeSignature')
                  : i18n.t('uploadSignature')
              }
              accessibilityHint={
                formData.podpis
                  ? i18n.t('changeSignature_hint')
                  : i18n.t('uploadSignature_hint')
              }
              accessibilityRole="button"
            >
              {formData.podpis
                ? i18n.t('changeSignature')
                : i18n.t('uploadSignature')}
            </Button>
          </Card.Content>
        </Card>

        {/* Offer Items */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={i18n.t('offerItems')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('offerItems')}
            accessibilityRole="header"
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
              accessibilityHint={i18n.t('serviceProductName_hint')}
              accessibilityRole="none"
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
              accessibilityHint={i18n.t('quantity_hint')}
              accessibilityRole="none"
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
              accessibilityHint={i18n.t('netPrice_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('netValue')}
              value={formData.wartosc_netto}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange('wartosc_netto', text)}
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
              accessibilityLabel={i18n.t('netValue')}
              accessibilityHint={i18n.t('netValue_hint')}
              accessibilityRole="none"
            />
            <Button
              mode="outlined"
              onPress={addProduct}
              style={[styles.button, { borderColor: colors.primary }]}
              labelStyle={[styles.buttonText, { color: colors.primary }]}
              // eslint-disable-next-line
              icon={() => (
                <FontAwesome name="plus" size={16} color={colors.primary} />
              )}
              accessibilityLabel={i18n.t('addProduct')}
              fram
              accessibilityHint={i18n.t('addProduct_hint')}
              accessibilityRole="button"
            >
              {i18n.t('addProduct')}
            </Button>
            {formData.products.map((product, index) => (
              <Card
                key={product.nazwa_uslugi_towaru || `product-${index}`}
                style={[styles.productCard, { backgroundColor: colors.accent }]}
                accessible={false}
              >
                <Card.Content style={styles.productContent}>
                  <Text
                    style={[styles.productText, { color: colors.text }]}
                    accessibilityLabel={`${product.nazwa_uslugi_towaru}, ilość ${product.ilosc}, cena netto ${product.cena_netto}, wartość netto ${product.wartosc_netto}`}
                    accessibilityRole="text"
                  >
                    {product.nazwa_uslugi_towaru} | {product.ilosc} |{' '}
                    {product.cena_netto} | {product.wartosc_netto}
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => removeProduct(index)}
                    style={[styles.removeButton, { borderColor: colors.error }]}
                    labelStyle={[styles.buttonText, { color: colors.error }]}
                    // eslint-disable-next-line
                    icon={() => (
                      <FontAwesome
                        name="trash"
                        size={16}
                        color={colors.error}
                      />
                    )}
                    accessibilityLabel={i18n.t('remove')}
                    accessibilityHint={i18n.t('remove_hint')}
                    accessibilityRole="button"
                  >
                    {i18n.t('remove')}
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </Card.Content>
        </Card>

        {/* Summary */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={i18n.t('summary')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('summary')}
            accessibilityRole="header"
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
              accessibilityHint={i18n.t('totalNetValue_hint')}
              accessibilityRole="none"
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
              accessibilityHint={i18n.t('vatRate_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('vatValue')}
              value={formData.wartosc_vat}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange('wartosc_vat', text)}
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
              accessibilityLabel={i18n.t('vatValue')}
              accessibilityHint={i18n.t('vatValue_hint')}
              accessibilityRole="none"
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
                  text: colors.text,
                  primary: colors.primary,
                },
              }}
              accessibilityLabel={i18n.t('totalGrossValue')}
              accessibilityHint={i18n.t('totalGrossValue_hint')}
              accessibilityRole="none"
            />
          </Card.Content>
        </Card>

        {/* Issuer Data */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={i18n.t('issuerData')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('issuerData')}
            accessibilityRole="header"
          />
          <Card.Content>
            <TextInput
              label={i18n.t('issuerCompanyName')}
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
              accessibilityLabel={i18n.t('issuerCompanyName')}
              accessibilityHint={i18n.t('issuerCompanyName_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('issuerNip')}
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
              accessibilityLabel={i18n.t('issuerNip')}
              accessibilityHint={i18n.t('issuerNip_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('issuerAddress')}
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
              accessibilityLabel={i18n.t('issuerAddress')}
              accessibilityHint={i18n.t('issuerAddress_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('bankName')}
              value={formData.nazwa_banku}
              onChangeText={(text) => handleInputChange('nazwa_banku', text)}
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
              accessibilityLabel={i18n.t('bankName')}
              accessibilityHint={i18n.t('bankName_hint')}
              accessibilityRole="none"
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
              accessibilityHint={i18n.t('bankAccountNumber_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('swiftBic')}
              value={formData.swift_bic}
              onChangeText={(text) => handleInputChange('swift_bic', text)}
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
              accessibilityLabel={i18n.t('swiftBic')}
              accessibilityHint={i18n.t('swiftBic_hint')}
              accessibilityRole="none"
            />
            <TextInput
              label={i18n.t('paymentMethod')}
              value={formData.forma_platnosci}
              onChangeText={(text) =>
                handleInputChange('forma_platnosci', text)
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
              accessibilityHint={i18n.t('paymentMethod_hint')}
              accessibilityRole="none"
            />
          </Card.Content>
        </Card>

        {/* Footer */}
        <View
          style={[styles.footer, { backgroundColor: colors.primary }]}
          accessible={false}
        >
          <FontAwesome
            name="info-circle"
            size={20}
            color={colors.surface}
            style={styles.footerIcon}
            accessible={false}
          />
          <Text
            style={[styles.footerText, { color: colors.surface }]}
            accessible={false}
          >
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
        accessibilityRole="button"
      >
        <FontAwesome
          name="save"
          size={24}
          color={colors.surface}
          accessible={false}
        />
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={[styles.fabCancel, { backgroundColor: colors.error }]}
        onPress={() => navigation.navigate('Home')}
        accessible
        accessibilityLabel={i18n.t('cancel')}
        accessibilityHint={i18n.t('cancel_hint')}
        accessibilityRole="button"
      >
        <FontAwesome
          name="times"
          size={24}
          color={colors.surface}
          accessible={false}
        />
      </TouchableOpacity>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
          accessibilityLabel: i18n.t('ok'),
          accessibilityHint: i18n.t('dismiss_snackbar_hint'),
          accessibilityRole: 'button',
        }}
        style={{ backgroundColor: colors.surface }}
        accessibilityLiveRegion="polite"
      >
        <Text
          style={{ color: colors.text }}
          accessibilityLabel={snackbarMessage}
          accessibilityRole="alert"
        >
          {snackbarMessage}
        </Text>
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
