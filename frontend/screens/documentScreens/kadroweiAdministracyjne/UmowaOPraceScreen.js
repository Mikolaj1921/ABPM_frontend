import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../../contexts/AuthContext';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { fetchTemplateById, uploadDocument } from '../../../api';

export default function UmowaOPraceScreen({ route, navigation }) {
  // eslint-disable-next-line
  const { category, document } = route.params || {};
  const { user } = useContext(AuthContext);
  const { i18n } = useContext(LanguageContext);
  const paperTheme = useTheme();

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
          throw new Error('Nie znaleziono szablonu o ID 3 w odpowiedzi API');
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

  const addObowiazek = () => {
    if (newObowiazek.trim()) {
      setFormData((prev) => ({
        ...prev,
        obowiazki: [...prev.obowiazki, newObowiazek.trim()],
      }));
      setNewObowiazek('');
      setError('');
    } else {
      setError(i18n.t('fillObowiazek') || 'Wypełnij pole obowiązku');
    }
  };

  const removeObowiazek = (index) => {
    setFormData((prev) => ({
      ...prev,
      obowiazki: prev.obowiazki.filter((_, i) => i !== index),
    }));
  };

  const addOferta = () => {
    if (newOferta.trim()) {
      setFormData((prev) => ({
        ...prev,
        oferty: [...prev.oferty, newOferta.trim()],
      }));
      setNewOferta('');
      setError('');
    } else {
      setError(i18n.t('fillOferta') || 'Wypełnij pole oferty');
    }
  };

  const removeOferta = (index) => {
    setFormData((prev) => ({
      ...prev,
      oferty: prev.oferty.filter((_, i) => i !== index),
    }));
  };

  const saveDocument = async () => {
    try {
      if (
        !formData.nazwa_firmy ||
        !formData.nip ||
        !formData.imie_nazwisko_pracownika ||
        !formData.pesel_pracownika ||
        !formData.stanowisko ||
        !formData.wynagrodzenie
      ) {
        Alert.alert(
          i18n.t('error') || 'Błąd',
          i18n.t('fillAllFields') || 'Wypełnij wszystkie wymagane pola',
        );
        setError(i18n.t('fillAllFields') || 'Wypełnij wszystkie wymagane pola');
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
        throw new Error('Szablon nie został załadowany');
      }

      let htmlContent = templateHtml;
      // eslint-disable-next-line
      const obowiazkiHtml =
        formData.obowiazki.length > 0
          ? formData.obowiazki
              .map((obowiazek) => `<li>${obowiazek}</li>`)
              .join('')
          : '<li>Brak obowiązków</li>';
      // eslint-disable-next-line
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
          // Usuń element logo, jeśli jest pusty
          htmlContent = htmlContent.replace(
            /<img src="{{logo}}" alt="Logo firmy">/,
            '',
          );
        } else if (key === 'podpis' && !value) {
          // Usuń blok podpisu pracodawcy, jeśli jest pusty
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

      // Dodajemy wszystkie pola z formData lub document
      Object.entries(templateFields).forEach(([key, value]) => {
        formDataToSend.append(key, value || document?.[key] || '');
      });

      // Dodajemy obowiazki i oferty
      // eslint-disable-next-line
      const obowiazkiToSend =
        // eslint-disable-next-line
        Array.isArray(formData.obowiazki) && formData.obowiazki.length > 0
          ? formData.obowiazki
          : Array.isArray(document?.obowiazki)
            ? document.obowiazki
            : [];
      // eslint-disable-next-line
      const ofertyToSend =
        // eslint-disable-next-line
        Array.isArray(formData.oferty) && formData.oferty.length > 0
          ? formData.oferty
          : Array.isArray(document?.oferty)
            ? document.oferty
            : [];

      formDataToSend.append('obowiazki', JSON.stringify(obowiazkiToSend));
      formDataToSend.append('oferty', JSON.stringify(ofertyToSend));

      console.log('FormData fields:', Array.from(formDataToSend.entries()));

      const response = await uploadDocument(formDataToSend);
      if (!response?.document?.id) {
        throw new Error('Nie udało się zapisać dokumentu');
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
        ...Object.fromEntries(
          Object.entries(templateFields).map(([key, value]) => [
            key,
            value || document?.[key] || '',
          ]),
        ),
      };

      console.log('New document obowiazki:', newDocument.obowiazki);
      console.log('New document oferty:', newDocument.oferty);

      Alert.alert(
        i18n.t('success') || 'Sukces',
        i18n.t('documentSaved') || 'Dokument został zapisany.',
      );
      navigation.navigate('Documents', {
        newDocument,
        category: 'Kadrowe',
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
          : i18n.t('createContract') || 'Twórz Umowę o Pracę'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>
        {i18n.t('employerData') || 'Dane Pracodawcy'}
      </Text>
      <TextInput
        label={i18n.t('companyName') || 'Nazwa firmy'}
        value={formData.nazwa_firmy}
        onChangeText={(text) => handleInputChange('nazwa_firmy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('companyAddress') || 'Adres firmy'}
        value={formData.adres_firmy}
        onChangeText={(text) => handleInputChange('adres_firmy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('nip') || 'NIP'}
        value={formData.nip}
        onChangeText={(text) => handleInputChange('nip', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('regon') || 'REGON'}
        value={formData.regon}
        onChangeText={(text) => handleInputChange('regon', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={
          i18n.t('representativeName') || 'Imię i nazwisko przedstawiciela'
        }
        value={formData.przedstawiciel_imie_nazwisko}
        onChangeText={(text) =>
          handleInputChange('przedstawiciel_imie_nazwisko', text)
        }
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('representativePosition') || 'Stanowisko przedstawiciela'}
        value={formData.przedstawiciel_stanowisko}
        onChangeText={(text) =>
          handleInputChange('przedstawiciel_stanowisko', text)
        }
        style={styles.input}
        theme={paperTheme}
      />

      <Text style={styles.sectionTitle}>
        {i18n.t('employeeData') || 'Dane Pracownika'}
      </Text>
      <TextInput
        label={i18n.t('employeeName') || 'Imię i nazwisko pracownika'}
        value={formData.imie_nazwisko_pracownika}
        onChangeText={(text) =>
          handleInputChange('imie_nazwisko_pracownika', text)
        }
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('employeeAddress') || 'Adres pracownika'}
        value={formData.adres_pracownika}
        onChangeText={(text) => handleInputChange('adres_pracownika', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('pesel') || 'PESEL pracownika'}
        value={formData.pesel_pracownika}
        onChangeText={(text) => handleInputChange('pesel_pracownika', text)}
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
        {i18n.t('contractDetails') || 'Szczegóły Umowy'}
      </Text>
      <TextInput
        label={i18n.t('position') || 'Stanowisko'}
        value={formData.stanowisko}
        onChangeText={(text) => handleInputChange('stanowisko', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('workHours') || 'Wymiar czasu pracy'}
        value={formData.wymiar_pracy}
        onChangeText={(text) => handleInputChange('wymiar_pracy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('workplace') || 'Miejsce pracy'}
        value={formData.miejsce_pracy}
        onChangeText={(text) => handleInputChange('miejsce_pracy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('salary') || 'Wynagrodzenie (brutto PLN)'}
        value={formData.wynagrodzenie}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('wynagrodzenie', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('paymentTerm') || 'Termin płatności (dzień miesiąca)'}
        value={formData.termin_platnosci}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('termin_platnosci', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('contractDuration') || 'Czas trwania umowy'}
        value={formData.czas_trwania_umowy}
        onChangeText={(text) => handleInputChange('czas_trwania_umowy', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('startDate') || 'Data rozpoczęcia (YYYY-MM-DD)'}
        value={formData.data_rozpoczecia}
        onChangeText={(text) => handleInputChange('data_rozpoczecia', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('contractDate') || 'Data zawarcia (YYYY-MM-DD)'}
        value={formData.data}
        onChangeText={(text) => handleInputChange('data', text)}
        style={styles.input}
        theme={paperTheme}
      />
      <TextInput
        label={i18n.t('placeOfSigning') || 'Miejsce zawarcia'}
        value={formData.miejsce_zawarcia}
        onChangeText={(text) => handleInputChange('miejsce_zawarcia', text)}
        style={styles.input}
        theme={paperTheme}
      />

      <Text style={styles.sectionTitle}>
        {i18n.t('employeeDuties') || 'Obowiązki Pracownika'}
      </Text>
      <TextInput
        label={i18n.t('newDuty') || 'Nowy obowiązek'}
        value={newObowiazek}
        onChangeText={setNewObowiazek}
        style={styles.input}
        theme={paperTheme}
      />
      <Button
        mode="outlined"
        onPress={addObowiazek}
        style={styles.button}
        labelStyle={{ color: paperTheme.colors.primary }}
      >
        {i18n.t('addDuty') || 'Dodaj Obowiązek'}
      </Button>
      {formData.obowiazki.map((obowiazek, index) => (
        // eslint-disable-next-line
        <View key={`obowiazek-${index}`} style={styles.item}>
          <Text>{obowiazek}</Text>
          <Button
            mode="outlined"
            onPress={() => removeObowiazek(index)}
            style={styles.removeButton}
            labelStyle={{ color: paperTheme.colors.error }}
          >
            {i18n.t('remove') || 'Usuń'}
          </Button>
        </View>
      ))}

      <Text style={styles.sectionTitle}>
        {i18n.t('otherProvisions') || 'Inne Postanowienia'}
      </Text>
      <TextInput
        label={i18n.t('newProvision') || 'Nowe postanowienie'}
        value={newOferta}
        onChangeText={setNewOferta}
        style={styles.input}
        theme={paperTheme}
      />
      <Button
        mode="outlined"
        onPress={addOferta}
        style={styles.button}
        labelStyle={{ color: paperTheme.colors.primary }}
      >
        {i18n.t('addProvision') || 'Dodaj Postanowienie'}
      </Button>
      {formData.oferty.map((oferta, index) => (
        // eslint-disable-next-line
        <View key={`oferta-${index}`} style={styles.item}>
          <Text>{oferta}</Text>
          <Button
            mode="outlined"
            onPress={() => removeOferta(index)}
            style={styles.removeButton}
            labelStyle={{ color: paperTheme.colors.error }}
          >
            {i18n.t('remove') || 'Usuń'}
          </Button>
        </View>
      ))}

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
  item: {
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
