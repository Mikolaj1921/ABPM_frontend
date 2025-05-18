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

// Utility function for delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function UmowaOPraceScreen({ route, navigation }) {
  const { category, document } = route.params || {};
  const { user } = useContext(AuthContext);
  const { i18n } = useContext(LanguageContext);
  const paperTheme = usePaperTheme();
  const { colors } = useTheme();

  const [formData, setFormData] = useState({
    nazwa_firmy: '',
    adres_firmy: '',
    nip: '',
    regon: '',
    przedstawiciel_imie_nazwisko: '',
    przedstawiciel_stanowisko: '',
    imie_nazwisko_pracownika: '',
    adres_pracownika: '',
    pesel_pracownika: '',
    stanowisko: '',
    wymiar_pracy: 'pełny etat',
    miejsce_pracy: '',
    wynagrodzenie: '',
    termin_platnosci: '10',
    czas_trwania_umowy: 'nieokreślony',
    data_rozpoczecia: new Date().toISOString().split('T')[0],
    data: new Date().toISOString().split('T')[0],
    miejsce_zawarcia: '',
    obowiazki: [],
    oferty: [],
    logo: '',
    podpis: '',
  });
  const [error, setError] = useState('');
  const [templateHtml, setTemplateHtml] = useState('');
  const [newObowiazek, setNewObowiazek] = useState('');
  const [newOferta, setNewOferta] = useState('');
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
            nazwa_firmy: user.firstName || prev.nazwa_firmy,
            nip: prev.nip || '',
            adres_firmy: prev.adres_firmy || '',
          }));
        }

        if (document) {
          setFormData((prev) => ({
            ...prev,
            nazwa_firmy: document.nazwa_firmy || prev.nazwa_firmy,
            adres_firmy: document.adres_firmy || prev.adres_firmy,
            nip: document.nip || prev.nip,
            regon: document.regon || prev.regon,
            przedstawiciel_imie_nazwisko:
              document.przedstawiciel_imie_nazwisko ||
              prev.przedstawiciel_imie_nazwisko,
            przedstawiciel_stanowisko:
              document.przedstawiciel_stanowisko ||
              prev.przedstawiciel_stanowisko,
            imie_nazwisko_pracownika:
              document.imie_nazwisko_pracownika ||
              prev.imie_nazwisko_pracownika,
            adres_pracownika:
              document.adres_pracownika || prev.adres_pracownika,
            pesel_pracownika:
              document.pesel_pracownika || prev.pesel_pracownika,
            stanowisko: document.stanowisko || prev.stanowisko,
            wymiar_pracy: document.wymiar_pracy || prev.wymiar_pracy,
            miejsce_pracy: document.miejsce_pracy || prev.miejsce_pracy,
            wynagrodzenie: document.wynagrodzenie || prev.wynagrodzenie,
            termin_platnosci:
              document.termin_platnosci || prev.termin_platnosci,
            czas_trwania_umowy:
              document.czas_trwania_umowy || prev.czas_trwania_umowy,
            data_rozpoczecia:
              document.data_rozpoczecia || prev.data_rozpoczecia,
            data: document.data || prev.data,
            miejsce_zawarcia:
              document.miejsce_zawarcia || prev.miejsce_zawarcia,
            obowiazki: Array.isArray(document.obowiazki)
              ? document.obowiazki
              : prev.obowiazki,
            oferty: Array.isArray(document.oferty)
              ? document.oferty
              : prev.oferty,
            logo: document.logo || prev.logo,
            podpis: document.podpis || prev.podpis,
          }));
          console.log('Loaded document obowiazki:', document.obowiazki);
          console.log('Loaded document oferty:', document.oferty);
        }

        const selectedTemplate = await fetchTemplateById(3);
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

  const addObowiazek = () => {
    if (formData.obowiazki.length >= 3) {
      setSnackbarMessage(i18n.t('max_obowiazki_limit'));
      setSnackbarVisible(true);
      return;
    }
    if (newObowiazek.trim()) {
      setFormData((prev) => ({
        ...prev,
        obowiazki: [...prev.obowiazki, newObowiazek.trim()],
      }));
      setNewObowiazek('');
      setError('');
    } else {
      setError(i18n.t('fillObowiazek'));
      setSnackbarMessage(i18n.t('fillObowiazek'));
      setSnackbarVisible(true);
    }
  };

  const removeObowiazek = (index) => {
    setFormData((prev) => ({
      ...prev,
      obowiazki: prev.obowiazki.filter((_, i) => i !== index),
    }));
  };

  const addOferta = () => {
    if (formData.oferty.length >= 3) {
      setSnackbarMessage(i18n.t('max_oferty_limit'));
      setSnackbarVisible(true);
      return;
    }
    if (newOferta.trim()) {
      setFormData((prev) => ({
        ...prev,
        oferty: [...prev.oferty, newOferta.trim()],
      }));
      setNewOferta('');
      setError('');
    } else {
      setError(i18n.t('fillOferta'));
      setSnackbarMessage(i18n.t('fillOferta'));
      setSnackbarVisible(true);
    }
  };

  const removeOferta = (index) => {
    setFormData((prev) => ({
      ...prev,
      oferty: prev.oferty.filter((_, i) => i !== index),
    }));
  };

  const saveDocument = async () => {
    const maxRetries = 3;
    let attempt = 1;

    while (attempt <= maxRetries) {
      try {
        if (
          !formData.nazwa_firmy ||
          !formData.nip ||
          !formData.imie_nazwisko_pracownika ||
          !formData.pesel_pracownika ||
          !formData.stanowisko ||
          !formData.wynagrodzenie
        ) {
          setError(i18n.t('fillAllFields'));
          setSnackbarMessage(i18n.t('fillAllFields'));
          setSnackbarVisible(true);
          return;
        }

        await AsyncStorage.setItem(
          'userData',
          JSON.stringify({
            nazwa_firmy: formData.nazwa_firmy,
            nip: formData.nip,
            adres_firmy: formData.adres_firmy,
            regon: formData.regon,
            przedstawiciel_imie_nazwisko: formData.przedstawiciel_imie_nazwisko,
            przedstawiciel_stanowisko: formData.przedstawiciel_stanowisko,
            logo: formData.logo,
            podpis: formData.podpis,
          }),
        );

        if (!templateHtml) {
          throw new Error(i18n.t('template_not_loaded'));
        }

        let htmlContent = templateHtml;
        const obowiazkiHtml =
          formData.obowiazki.length > 0
            ? formData.obowiazki
                .map((obowiazek) => `<li>${obowiazek}</li>`)
                .join('')
            : '<li>Brak obowiązków</li>';
        const ofertyHtml =
          formData.oferty.length > 0
            ? formData.oferty.map((oferta) => `<li>${oferta}</li>`).join('')
            : '<li>Brak dodatkowych postanowień</li>';

        htmlContent = htmlContent
          .replace('{{obowiazek_1}}', formData.obowiazki[0] || 'Brak')
          .replace('{{obowiazek_2}}', formData.obowiazki[1] || 'Brak')
          .replace('{{obowiazek_3}}', formData.obowiazki[2] || 'Brak')
          .replace('{{oferta_1}}', formData.oferty[0] || 'Brak')
          .replace('{{oferta_2}}', formData.oferty[1] || 'Brak')
          .replace('{{oferta_3}}', formData.oferty[2] || 'Brak');

        const templateFields = {
          nazwa_firmy: formData.nazwa_firmy,
          adres_firmy: formData.adres_firmy,
          nip: formData.nip,
          regon: formData.regon,
          przedstawiciel_imie_nazwisko: formData.przedstawiciel_imie_nazwisko,
          przedstawiciel_stanowisko: formData.przedstawiciel_stanowisko,
          imie_nazwisko_pracownika: formData.imie_nazwisko_pracownika,
          adres_pracownika: formData.adres_pracownika,
          pesel_pracownika: formData.pesel_pracownika,
          stanowisko: formData.stanowisko,
          wymiar_pracy: formData.wymiar_pracy,
          miejsce_pracy: formData.miejsce_pracy,
          wynagrodzenie: formData.wynagrodzenie,
          termin_platnosci: formData.termin_platnosci,
          czas_trwania_umowy: formData.czas_trwania_umowy,
          data_rozpoczecia: formData.data_rozpoczecia,
          data: formData.data,
          miejsce_zawarcia: formData.miejsce_zawarcia,
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
        const fileName = `umowa_o_prace_${Date.now()}`;
        const formDataToSend = new FormData();

        formDataToSend.append('file', {
          uri,
          type: 'application/pdf',
          name: `${fileName}.pdf`,
        });
        formDataToSend.append('templateId', '3');
        formDataToSend.append(
          'title',
          `Umowa o Pracę ${formData.imie_nazwisko_pracownika || document?.imie_nazwisko_pracownika || 'Pracownik'}`,
        );
        formDataToSend.append('type', 'Umowa o Pracę');

        Object.entries(templateFields).forEach(([key, value]) => {
          formDataToSend.append(key, value || document?.[key] || '');
        });

        const obowiazkiToSend =
          Array.isArray(formData.obowiazki) && formData.obowiazki.length > 0
            ? formData.obowiazki
            : Array.isArray(document?.obowiazki)
              ? document.obowiazki
              : [];
        const ofertyToSend =
          Array.isArray(formData.oferty) && formData.oferty.length > 0
            ? formData.oferty
            : Array.isArray(document?.oferty)
              ? document.oferty
              : [];

        formDataToSend.append('obowiazki', JSON.stringify(obowiazkiToSend));
        formDataToSend.append('oferty', JSON.stringify(ofertyToSend));

        console.log(`Attempt ${attempt}: Uploading document...`);
        const response = await uploadDocument(formDataToSend);
        if (!response?.document?.id) {
          throw new Error(i18n.t('document_save_error'));
        }

        const newDocument = {
          id: String(response.document.id),
          name: `Umowa o Pracę ${formData.imie_nazwisko_pracownika || document?.imie_nazwisko_pracownika || 'Pracownik'}`,
          type: 'Umowa o Pracę',
          template_name: 'Umowa o Pracę',
          created_at: new Date().toISOString(),
          url: response.document.url || uri,
          logo: formData.logo || document?.logo || '',
          podpis: formData.podpis || document?.podpis || '',
          obowiazki: obowiazkiToSend,
          oferty: ofertyToSend,
          category: 'Kadrowe',
          ...Object.fromEntries(
            Object.entries(templateFields).map(([key, value]) => [
              key,
              value || document?.[key] || '',
            ]),
          ),
        };

        console.log('New document obowiazki:', newDocument.obowiazki);
        console.log('New document oferty:', newDocument.oferty);

        setSnackbarMessage(i18n.t('documentSaved'));
        setSnackbarVisible(true);
        navigation.navigate('Documents', {
          newDocument,
          category: 'Kadrowe',
        });
        return; // Success, exit the retry loop
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
    }
  };

  const handleSavePress = () => {
    console.log('Save button pressed');
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
            title={document ? i18n.t('editDocument') : i18n.t('createContract')}
            titleStyle={[styles.header, { color: colors.text }]}
            accessibilityLabel={
              document ? i18n.t('editDocument') : i18n.t('createContract')
            }
            accessibilityRole="header"
          />
        </Card>

        {/* Employer Details */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={i18n.t('employerData')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('employerData')}
            accessibilityRole="header"
          />
          <Card.Content>
            <TextInput
              label={i18n.t('companyName')}
              value={formData.nazwa_firmy}
              onChangeText={(text) => handleInputChange('nazwa_firmy', text)}
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
              accessibilityHint={i18n.t('companyName_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('companyAddress')}
              value={formData.adres_firmy}
              onChangeText={(text) => handleInputChange('adres_firmy', text)}
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
              accessibilityLabel={i18n.t('companyAddress')}
              accessibilityHint={i18n.t('companyAddress_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('nip')}
              value={formData.nip}
              onChangeText={(text) => handleInputChange('nip', text)}
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
              accessibilityHint={i18n.t('nip_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('regon')}
              value={formData.regon}
              onChangeText={(text) => handleInputChange('regon', text)}
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
              accessibilityLabel={i18n.t('regon')}
              accessibilityHint={i18n.t('regon_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('representativeName')}
              value={formData.przedstawiciel_imie_nazwisko}
              onChangeText={(text) =>
                handleInputChange('przedstawiciel_imie_nazwisko', text)
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
              accessibilityLabel={i18n.t('representativeName')}
              accessibilityHint={i18n.t('representativeName_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('representativePosition')}
              value={formData.przedstawiciel_stanowisko}
              onChangeText={(text) =>
                handleInputChange('przedstawiciel_stanowisko', text)
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
              accessibilityLabel={i18n.t('representativePosition')}
              accessibilityHint={i18n.t('representativePosition_hint')}
              accessibilityRole="edit"
            />
          </Card.Content>
        </Card>

        {/* Employee Details */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={i18n.t('employeeData')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('employeeData')}
            accessibilityRole="header"
          />
          <Card.Content>
            <TextInput
              label={i18n.t('employeeName')}
              value={formData.imie_nazwisko_pracownika}
              onChangeText={(text) =>
                handleInputChange('imie_nazwisko_pracownika', text)
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
              accessibilityLabel={i18n.t('employeeName')}
              accessibilityHint={i18n.t('employeeName_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('employeeAddress')}
              value={formData.adres_pracownika}
              onChangeText={(text) =>
                handleInputChange('adres_pracownika', text)
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
              accessibilityLabel={i18n.t('employeeAddress')}
              accessibilityHint={i18n.t('employeeAddress_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('pesel')}
              value={formData.pesel_pracownika}
              onChangeText={(text) =>
                handleInputChange('pesel_pracownika', text)
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
              keyboardType="numeric"
              accessibilityLabel={i18n.t('pesel')}
              accessibilityHint={i18n.t('pesel_hint')}
              accessibilityRole="edit"
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

        {/* Contract Details */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={i18n.t('contractDetails')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('contractDetails')}
            accessibilityRole="header"
          />
          <Card.Content>
            <TextInput
              label={i18n.t('position')}
              value={formData.stanowisko}
              onChangeText={(text) => handleInputChange('stanowisko', text)}
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
              accessibilityLabel={i18n.t('position')}
              accessibilityHint={i18n.t('position_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('workHours')}
              value={formData.wymiar_pracy}
              onChangeText={(text) => handleInputChange('wymiar_pracy', text)}
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
              accessibilityLabel={i18n.t('workHours')}
              accessibilityHint={i18n.t('workHours_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('workplace')}
              value={formData.miejsce_pracy}
              onChangeText={(text) => handleInputChange('miejsce_pracy', text)}
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
              accessibilityLabel={i18n.t('workplace')}
              accessibilityHint={i18n.t('workplace_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('salary')}
              value={formData.wynagrodzenie}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange('wynagrodzenie', text)}
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
              accessibilityLabel={i18n.t('salary')}
              accessibilityHint={i18n.t('salary_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('paymentTerm')}
              value={formData.termin_platnosci}
              keyboardType="numeric"
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
              accessibilityLabel={i18n.t('paymentTerm')}
              accessibilityHint={i18n.t('paymentTerm_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('contractDuration')}
              value={formData.czas_trwania_umowy}
              onChangeText={(text) =>
                handleInputChange('czas_trwania_umowy', text)
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
              accessibilityLabel={i18n.t('contractDuration')}
              accessibilityHint={i18n.t('contractDuration_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('startDate')}
              value={formData.data_rozpoczecia}
              onChangeText={(text) =>
                handleInputChange('data_rozpoczecia', text)
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
              accessibilityLabel={i18n.t('startDate')}
              accessibilityHint={i18n.t('startDate_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('contractDate')}
              value={formData.data}
              onChangeText={(text) => handleInputChange('data', text)}
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
              accessibilityLabel={i18n.t('contractDate')}
              accessibilityHint={i18n.t('contractDate_hint')}
              accessibilityRole="edit"
            />
            <TextInput
              label={i18n.t('placeOfSigning')}
              value={formData.miejsce_zawarcia}
              onChangeText={(text) =>
                handleInputChange('miejsce_zawarcia', text)
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
              accessibilityLabel={i18n.t('placeOfSigning')}
              accessibilityHint={i18n.t('placeOfSigning_hint')}
              accessibilityRole="edit"
            />
          </Card.Content>
        </Card>

        {/* Employee Duties */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={i18n.t('employeeDuties')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('employeeDuties')}
            accessibilityRole="header"
          />
          <Card.Content>
            <TextInput
              label={i18n.t('newDuty')}
              value={newObowiazek}
              onChangeText={setNewObowiazek}
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
              accessibilityLabel={i18n.t('newDuty')}
              accessibilityHint={i18n.t('newDuty_hint')}
              accessibilityRole="edit"
            />
            <Button
              mode="outlined"
              onPress={addObowiazek}
              style={[styles.button, { borderColor: colors.primary }]}
              labelStyle={[styles.buttonText, { color: colors.primary }]}
              icon={() => (
                <FontAwesome name="plus" size={16} color={colors.primary} />
              )}
              accessibilityLabel={i18n.t('addDuty')}
              accessibilityHint={i18n.t('addDuty_hint')}
              accessibilityRole="button"
            >
              {i18n.t('addDuty')}
            </Button>
            {formData.obowiazki.map((obowiazek, index) => (
              <Card
                key={`obowiazek-${index}`}
                style={[styles.itemCard, { backgroundColor: colors.accent }]}
                accessible={false}
              >
                <Card.Content style={styles.itemContent}>
                  <Text
                    style={[styles.itemText, { color: colors.text }]}
                    accessibilityLabel={obowiazek}
                    accessibilityRole="text"
                  >
                    {obowiazek}
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => removeObowiazek(index)}
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

        {/* Other Provisions */}
        <Card
          style={[styles.card, { backgroundColor: colors.surface }]}
          accessible={false}
        >
          <Card.Title
            title={i18n.t('otherProvisions')}
            titleStyle={[styles.sectionTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('otherProvisions')}
            accessibilityRole="header"
          />
          <Card.Content>
            <TextInput
              label={i18n.t('newProvision')}
              value={newOferta}
              onChangeText={setNewOferta}
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
              accessibilityLabel={i18n.t('newProvision')}
              accessibilityHint={i18n.t('newProvision_hint')}
              accessibilityRole="edit"
            />
            <Button
              mode="outlined"
              onPress={addOferta}
              style={[styles.button, { borderColor: colors.primary }]}
              labelStyle={[styles.buttonText, { color: colors.primary }]}
              icon={() => (
                <FontAwesome name="plus" size={16} color={colors.primary} />
              )}
              accessibilityLabel={i18n.t('addProvision')}
              accessibilityHint={i18n.t('addProvision_hint')}
              accessibilityRole="button"
            >
              {i18n.t('addProvision')}
            </Button>
            {formData.oferty.map((oferta, index) => (
              <Card
                key={`oferta-${index}`}
                style={[styles.itemCard, { backgroundColor: colors.accent }]}
                accessible={false}
              >
                <Card.Content style={styles.itemContent}>
                  <Text
                    style={[styles.itemText, { color: colors.text }]}
                    accessibilityLabel={oferta}
                    accessibilityRole="text"
                  >
                    {oferta}
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => removeOferta(index)}
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
        onPress={() => navigation.navigate('Documents')}
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
  itemCard: {
    marginVertical: 6,
    borderRadius: 10,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  itemText: {
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
