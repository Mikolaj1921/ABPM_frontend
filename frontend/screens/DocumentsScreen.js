import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Linking,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { FontAwesome } from '@expo/vector-icons';
import {
  Card,
  Searchbar,
  Button,
  List,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';
import {
  fetchDocuments,
  deleteDocument,
  updateDocument,
  uploadImage,
  fetchTemplateContent,
} from '../api';

const documentCategories = [
  {
    id: '1',
    nameKey: 'handloweiOfertowe',
    category: 'Handlowe',
    icon: 'file-text',
  },
  { id: '2', nameKey: 'finansowe', category: 'Faktury', icon: 'money' },
  { id: '3', nameKey: 'kadrowe', category: 'Kadrowe', icon: 'user' },
];

const validCategories = documentCategories.map((cat) => cat.category);

const typeToCategory = {
  'Oferta Handlowa': 'Handlowe',
  Faktura: 'Faktury',
  'Umowa o Pracę': 'Kadrowe',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
  'image/gif',
  'image/webp',
  'image/bmp',
];

const AccordionIcon = ({ icon }) => (
  <FontAwesome
    name={icon}
    size={20}
    color="#001426FF"
    style={{ justifyContent: 'center', alignSelf: 'center', marginLeft: 10 }}
  />
);
const SearchIcon = () => (
  <FontAwesome name="search" size={20} color="#001426FF" />
);
const SortIcon = () => (
  <FontAwesome name="sort" size={16} style={{ marginRight: 8 }} />
);
const LeftIcon = () => (
  <FontAwesome name="check-circle" size={24} color="#001426FF" />
);
const MenuIcon = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <FontAwesome
      name="ellipsis-v"
      size={24}
      color="#001426FF"
      style={{ marginRight: 10 }}
    />
  </TouchableOpacity>
);
const SortOption = ({ item, selectedCategory, handleSortChange }) => (
  <TouchableOpacity
    style={styles.modalItem}
    onPress={() => handleSortChange(selectedCategory, item.value)}
  >
    <Text style={styles.modalItemText}>{item.label}</Text>
  </TouchableOpacity>
);

const CardMenu = ({
  item,
  menuVisible,
  setMenuVisible,
  handleMenuClose,
  navigation,
  i18n,
  handleDownload,
  handleDelete,
  category,
  menuFadeAnim,
  handleAddLogo,
  handleAddSignature,
}) => {
  const handleShare = async (document) => {
    try {
      const url = document.url || document.file_path;
      if (!url) {
        Alert.alert(i18n.t('noDocumentUrl') || 'Brak URL do dokumentu');
        return;
      }
      const shareUrl = `${i18n.t('shareMessage') || 'Sprawdź ten dokument'}: ${url}`;
      const encodedUrl = encodeURIComponent(shareUrl);
      const canOpen = await Linking.canOpenURL('https://');
      if (canOpen) {
        await Linking.openURL(`https://t.me/share/url?url=${encodedUrl}`);
      } else {
        Alert.alert(
          i18n.t('sharingNotAvailable') || 'Udostępnianie nie jest dostępne',
        );
      }
    } catch (err) {
      console.error('Błąd podczas udostępniania:', err);
      Alert.alert(
        i18n.t('sharingError') || `Nie udało się udostępnić: ${err.message}`,
      );
    }
  };

  return (
    <>
      <MenuIcon
        onPress={() => setMenuVisible((prev) => ({ ...prev, [item.id]: true }))}
      />
      <Modal
        animationType="fade"
        transparent
        visible={menuVisible[item.id] || false}
        onRequestClose={() => handleMenuClose(item.id)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => handleMenuClose(item.id)}
          activeOpacity={1}
        >
          <Animated.View
            style={[styles.modalContent, { opacity: menuFadeAnim }]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleMenuClose(item.id);
                navigation.navigate('PreviewScreen', {
                  document: item,
                  category,
                });
              }}
            >
              <FontAwesome name="eye" size={20} color="#001426FF" />
              <Text style={styles.menuItemText}>
                {i18n.t('preview') || 'Podgląd'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleMenuClose(item.id);
                handleDownload(item);
              }}
            >
              <FontAwesome name="download" size={20} color="#001426FF" />
              <Text style={styles.menuItemText}>
                {i18n.t('download') || 'Pobierz'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleMenuClose(item.id);
                handleShare(item);
              }}
            >
              <FontAwesome name="telegram" size={20} color="#001426FF" />
              <Text style={styles.menuItemText}>{i18n.t('shareTelegram')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleMenuClose(item.id);
                handleAddLogo(item);
              }}
            >
              <FontAwesome name="image" size={20} color="#001426FF" />
              <Text style={styles.menuItemText}>
                {i18n.t('addLogo') || 'Dodaj logo firmy'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleMenuClose(item.id);
                handleAddSignature(item);
              }}
            >
              <FontAwesome name="pencil" size={20} color="#001426FF" />
              <Text style={styles.menuItemText}>
                {i18n.t('addSignature') || 'Dodaj podpis elektroniczny'}
              </Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleMenuClose(item.id);
                handleDelete(item, category);
              }}
            >
              <FontAwesome name="trash" size={20} color="#FF4D4F" />
              <Text style={[styles.menuItemText, { color: '#FF4D4F' }]}>
                {i18n.t('delete') || 'Usuń'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const DocumentCard = ({
  category,
  item,
  menuVisible,
  setMenuVisible,
  handleMenuClose,
  navigation,
  i18n,
  handleDownload,
  handleDelete,
  paperTheme,
  menuFadeAnim,
  handleAddLogo,
  handleAddSignature,
}) => {
  let subtitle = `${new Date(item.created_at || Date.now()).toLocaleDateString()} | Szablon: ${item.template_name || 'Brak'}`;
  if (item.type === 'Umowa o Pracę') {
    const obowiazkiCount = Array.isArray(item.obowiazki)
      ? item.obowiazki.length
      : 0;
    const ofertyCount = Array.isArray(item.oferty) ? item.oferty.length : 0;
    subtitle += ` | Obowiązki: ${obowiazkiCount} | Postanowienia: ${ofertyCount}`;
  } else if (item.type === 'Oferta Handlowa') {
    const productsCount = Array.isArray(item.products)
      ? item.products.length
      : 0;
    subtitle += ` | Produkty: ${productsCount}`;
  }

  return (
    <Card
      style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
      key={item.id}
    >
      <Card.Title
        title={item.name}
        subtitle={subtitle}
        titleStyle={styles.cardTitle}
        subtitleStyle={styles.cardSubtitle}
        left={LeftIcon}
        leftStyle={{ marginRight: 2.5 }}
        right={() => (
          <CardMenu
            item={item}
            menuVisible={menuVisible}
            setMenuVisible={setMenuVisible}
            handleMenuClose={handleMenuClose}
            navigation={navigation}
            i18n={i18n}
            handleDownload={handleDownload}
            handleDelete={handleDelete}
            category={category}
            menuFadeAnim={menuFadeAnim}
            handleAddLogo={handleAddLogo}
            handleAddSignature={handleAddSignature}
          />
        )}
      />
    </Card>
  );
};

export default function DocumentsScreen({ navigation, route }) {
  const { isLoggedIn, user, retryFetchUser } = useContext(AuthContext);
  const { i18n } = useContext(LanguageContext);
  const [documents, setDocuments] = useState({});
  const [searchQueries, setSearchQueries] = useState({});
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [menuVisible, setMenuVisible] = useState({});
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [logoModalVisible, setLogoModalVisible] = useState(false);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const paperTheme = usePaperTheme();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [menuFadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (sortModalVisible || logoModalVisible || signatureModalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [sortModalVisible, logoModalVisible, signatureModalVisible]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSortModalVisible(false);
      setLogoModalVisible(false);
      setSignatureModalVisible(false);
      setSelectedDocument(null);
    });
  };

  useEffect(() => {
    if (Object.values(menuVisible).some((visible) => visible)) {
      Animated.timing(menuFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [menuVisible]);

  const handleMenuClose = (itemId) => {
    Animated.timing(menuFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible((prev) => ({ ...prev, [itemId]: false }));
    });
  };

  const initialCategory = route.params?.category || 'Handlowe';
  useEffect(() => {
    const categoryIndex = documentCategories.findIndex(
      (cat) => cat.category === initialCategory,
    );
    if (categoryIndex !== -1) {
      setExpanded(documentCategories[categoryIndex].id);
    }
  }, [initialCategory]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = await AsyncStorage.getItem('token');
      if (!token || !isLoggedIn) {
        setError(
          i18n.t('noToken') || 'Brak tokena lub użytkownik nie jest zalogowany',
        );
        navigation.navigate('Login');
        return;
      }
      if (!user) {
        const result = await retryFetchUser();
        if (!result.success) {
          setError(
            i18n.t('userFetchError') ||
              'Nie udało się pobrać danych użytkownika',
          );
          navigation.navigate('Login');
          return;
        }
      }
      const docData = await fetchDocuments();
      const docDataWithCategory = docData.map((doc) => {
        console.log('Document from API:', doc);
        return {
          ...doc,
          category: typeToCategory[doc.type] || 'Handlowe',
          id: String(doc.id),
          products: Array.isArray(doc.products) ? doc.products : [],
          obowiazki: Array.isArray(doc.obowiazki) ? doc.obowiazki : [],
          oferty: Array.isArray(doc.oferty) ? doc.oferty : [],
        };
      });
      const documentsData = documentCategories.reduce((acc, category) => {
        acc[category.category] = docDataWithCategory.filter(
          (doc) => doc.category === category.category,
        );
        return acc;
      }, {});
      console.log('Załadowane dokumenty:', documentsData);
      setDocuments(documentsData);
    } catch (fetchError) {
      console.error('Błąd podczas pobierania dokumentów:', fetchError);
      setError(
        i18n.t('fetchDocumentsError') ||
          `Błąd podczas ładowania dokumentów: ${fetchError.message}`,
      );
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user, retryFetchUser, navigation]);

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [fetchData, navigation]);

  useEffect(() => {
    const params = route.params || {};
    let { newDocument } = params;
    if (
      !newDocument &&
      params.screen === 'Handlowe' &&
      params.params?.newDocument
    ) {
      newDocument = params.params.newDocument;
    }
    if (newDocument) {
      const category = validCategories.includes(newDocument.category)
        ? newDocument.category
        : typeToCategory[newDocument.type] || 'Handlowe';
      const newDocWithCategory = {
        ...newDocument,
        category,
        id: String(newDocument.id),
      };
      setDocuments((prev) => ({
        ...prev,
        [category]: [newDocWithCategory, ...(prev[category] || [])],
      }));
      const categoryIndex = documentCategories.findIndex(
        (cat) => cat.category === category,
      );
      if (categoryIndex !== -1) {
        setExpanded(documentCategories[categoryIndex].id);
      }
    }
  }, [route.params]);

  const handleAccordionPress = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleSearchChange = (category, query) => {
    setSearchQueries((prev) => ({ ...prev, [category]: query }));
  };

  const handleSortChange = (category, sort) => {
    setSortBy((prev) => ({ ...prev, [category]: sort }));
    setSortModalVisible(false);
  };

  const handleDownload = async (document) => {
    try {
      const url = document.url || document.file_path;
      if (url) {
        await Linking.openURL(`${url}?t=${Date.now()}`);
      } else {
        Alert.alert(i18n.t('noDocumentUrl') || 'Brak URL do dokumentu');
      }
    } catch (err) {
      console.error('Błąd podczas pobierania dokumentu:', err);
      Alert.alert(i18n.t('downloadError') || 'Nie udało się pobrać dokumentu');
    }
  };

  const handleDelete = async (document, category) => {
    const documentId = String(document.id);
    Alert.alert(
      i18n.t('confirmDelete') || 'Potwierdź usunięcie',
      i18n.t('deleteDocumentConfirm') ||
        'Czy na pewno chcesz usunąć ten dokument?',
      [
        { text: i18n.t('cancel') || 'Anuluj', style: 'cancel' },
        {
          text: i18n.t('delete') || 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(documentId);
              setDocuments((prev) => ({
                ...prev,
                [category]: prev[category].filter(
                  (doc) => String(doc.id) !== documentId,
                ),
              }));
              Alert.alert(
                i18n.t('success') || 'Sukces',
                i18n.t('documentDeleted') || 'Dokument został usunięty',
              );
            } catch (err) {
              console.error('Błąd podczas usuwania dokumentu:', err);
              Alert.alert(
                i18n.t('error') || 'Błąd',
                i18n.t('deleteError') ||
                  `Nie udało się usunąć dokumentu: ${err.message}`,
              );
            }
          },
        },
      ],
    );
  };

  const handleAddLogo = (document) => {
    setSelectedDocument(document);
    setLogoModalVisible(true);
  };

  const handleAddSignature = (document) => {
    setSelectedDocument(document);
    setSignatureModalVisible(true);
  };

  const validateFile = (file) => {
    if (!file) {
      return i18n.t('noFileSelected') || 'Nie wybrano pliku';
    }
    if (file.size > MAX_FILE_SIZE) {
      return (
        i18n.t('fileTooLarge') ||
        `Plik jest za duży (maks. ${MAX_FILE_SIZE / (1024 * 1024)} MB)`
      );
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
      return (
        i18n.t('invalidFileType') ||
        'Niedozwolony typ pliku (dozwolone: PNG, JPEG, JPG, PDF, GIF, WebP, BMP)'
      );
    }
    return null;
  };

  const checkNetwork = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  };

  const handlePickLogo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_MIME_TYPES,
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        const file = result.assets[0];
        const validationError = validateFile(file);
        if (validationError) {
          Alert.alert(i18n.t('error') || 'Błąd', validationError);
          return;
        }
        const isOnline = await checkNetwork();
        if (!isOnline) {
          Alert.alert(
            i18n.t('noNetwork') || 'Brak połączenia z internetem',
            i18n.t('checkConnection') ||
              'Sprawdź połączenie i spróbuj ponownie',
          );
          return;
        }
        setIsUploading(true);
        await updateDocumentWithFile(selectedDocument, file.uri, 'logo');
        setLogoModalVisible(false);
      }
    } catch (err) {
      console.error('Błąd podczas wyboru logo:', err);
      Alert.alert(
        i18n.t('error') || 'Błąd',
        i18n.t('logoPickError') || `Nie udało się wybrać logo: ${err.message}`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickSignature = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_MIME_TYPES,
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        const file = result.assets[0];
        const validationError = validateFile(file);
        if (validationError) {
          Alert.alert(i18n.t('error') || 'Błąd', validationError);
          return;
        }
        const isOnline = await checkNetwork();
        if (!isOnline) {
          Alert.alert(
            i18n.t('noNetwork') || 'Brak połączenia z internetem',
            i18n.t('checkConnection') ||
              'Sprawdź połączenie i spróbuj ponownie',
          );
          return;
        }
        setIsUploading(true);
        await updateDocumentWithFile(selectedDocument, file.uri, 'podpis');
        setSignatureModalVisible(false);
      }
    } catch (err) {
      console.error('Błąd podczas wyboru podpisu:', err);
      Alert.alert(
        i18n.t('error') || 'Błąd',
        i18n.t('signaturePickError') ||
          `Nie udało się wybrać podpisu: ${err.message}`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const retryOperation = async (operation, maxRetries = 3) => {
    const isRecoverableError = (err) => {
      const status = err.response?.status;
      const message = err.message?.toLowerCase();
      return (
        message.includes('network error') ||
        message.includes('timeout') ||
        (status >= 500 && status <= 599) ||
        status === undefined
      );
    };

    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err) {
        lastError = err;
        if (!isRecoverableError(err)) {
          throw err;
        }
        console.warn(
          `Próba ${attempt} nieudana, ponawiam po ${Math.pow(2, attempt) * 1000}ms...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000),
        );
      }
    }
    throw lastError;
  };

  const updateDocumentWithFile = async (document, fileUri, field) => {
    try {
      if (!document || !fileUri || !field) {
        throw new Error(
          i18n.t('missingParams') ||
            'Brak wymaganych parametrów: dokument, plik lub pole',
        );
      }

      setIsUploading(true);

      const formData = new FormData();
      formData.append('image', {
        uri: fileUri,
        type: ALLOWED_MIME_TYPES.includes('image/jpeg')
          ? 'image/jpeg'
          : 'image/png',
        name: `${field}_${document.id}_${Date.now()}.png`,
      });
      formData.append('userId', user.id);
      formData.append('field', field);

      const uploadOperation = () => uploadImage(formData);
      const { url: fileUrl } = await retryOperation(uploadOperation);
      if (!fileUrl) {
        throw new Error(
          i18n.t('imageUploadFailed') ||
            'Nie udało się uzyskać URL wgranego obrazu',
        );
      }

      const fetchTemplateOperation = () =>
        fetchTemplateContent(document.template_id || 1);
      const { content: templateContent } = await retryOperation(
        fetchTemplateOperation,
      );
      if (!templateContent) {
        throw new Error(
          i18n.t('noTemplateContent') || 'Brak zawartości szablonu',
        );
      }

      let htmlContent = templateContent;

      if (document.type === 'Oferta Handlowa') {
        const productsHtml =
          Array.isArray(document.products) && document.products.length > 0
            ? document.products
                .map(
                  (product) => `
                <tr>
                  <td>${product.nazwa_uslugi_towaru || ''}</td>
                  <td>${product.ilosc || ''}</td>
                  <td>${product.cena_netto || ''}</td>
                  <td>${product.wartosc_netto || ''}</td>
                </tr>
              `,
                )
                .join('')
            : '<tr><td colspan="4">Brak pozycji</td></tr>';
        htmlContent = htmlContent.replace('{{products}}', productsHtml);
      } else if (document.type === 'Umowa o Pracę') {
        const obowiazkiHtml =
          Array.isArray(document.obowiazki) && document.obowiazki.length > 0
            ? document.obowiazki
                .map((obowiazek) => `<li>${obowiazek}</li>`)
                .join('')
            : '<li>Brak obowiązków</li>';
        const ofertyHtml =
          Array.isArray(document.oferty) && document.oferty.length > 0
            ? document.oferty.map((oferta) => `<li>${oferta}</li>`).join('')
            : '<li>Brak dodatkowych postanowień</li>';
        htmlContent = htmlContent
          .replace('{{obowiazek_1}}', document.obowiazki[0] || 'Brak')
          .replace('{{obowiazek_2}}', document.obowiazki[1] || 'Brak')
          .replace('{{obowiazek_3}}', document.obowiazki[2] || 'Brak')
          .replace('{{oferta_1}}', document.oferty[0] || 'Brak')
          .replace('{{oferta_2}}', document.oferty[1] || 'Brak')
          .replace('{{oferta_3}}', document.oferty[2] || 'Brak');
      }

      const placeholders = [
        'numer_oferty',
        'nazwa_firmy_wystawcy',
        'nip_wystawcy',
        'adres_wystawcy',
        'nazwa_firmy_klienta',
        'nip_klienta',
        'adres_firmy_klienta',
        'wartosc_netto_suma',
        'stawka_vat',
        'wartosc_vat',
        'wartosc_brutto_suma',
        'data_wystawienia',
        'numer_konta_bankowego',
        'nazwa_firmy',
        'adres_firmy',
        'nip',
        'regon',
        'przedstawiciel_imie_nazwisko',
        'przedstawiciel_stanowisko',
        'imie_nazwisko_pracownika',
        'adres_pracownika',
        'pesel_pracownika',
        'stanowisko',
        'wymiar_pracy',
        'miejsce_pracy',
        'wynagrodzenie',
        'termin_platnosci',
        'czas_trwania_umowy',
        'data_rozpoczecia',
        'data',
        'miejsce_zawarcia',
      ];

      placeholders.forEach((key) => {
        const placeholder = `{{${key}}}`;
        const value = document[key] || '';
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      });

      htmlContent = htmlContent.replace(
        '{{logo}}',
        field === 'logo' ? fileUrl : document.logo || '',
      );
      htmlContent = htmlContent.replace(
        '{{podpis}}',
        field === 'podpis' ? fileUrl : document.podpis || '',
      );

      const { uri: pdfUri } = await Print.printToFileAsync({
        html: htmlContent,
      });
      if (!pdfUri) {
        throw new Error(
          i18n.t('pdfGenerationFailed') ||
            'Nie udało się wygenerować pliku PDF',
        );
      }

      const updateFormData = new FormData();
      updateFormData.append('file', {
        uri: pdfUri,
        type: 'application/pdf',
        name: `document_${document.id}.pdf`,
      });
      updateFormData.append('templateId', String(document.template_id || 1));
      updateFormData.append('title', document.name || '');
      updateFormData.append('type', document.type || 'Umowa o Pracę');
      updateFormData.append(
        'logo',
        field === 'logo' ? fileUrl : document.logo || '',
      );
      updateFormData.append(
        'podpis',
        field === 'podpis' ? fileUrl : document.podpis || '',
      );

      placeholders.forEach((key) => {
        updateFormData.append(key, document[key] || '');
      });
      if (document.type === 'Oferta Handlowa') {
        updateFormData.append(
          'products',
          JSON.stringify(document.products || []),
        );
      } else if (document.type === 'Umowa o Pracę') {
        updateFormData.append(
          'obowiazki',
          JSON.stringify(document.obowiazki || []),
        );
        updateFormData.append('oferty', JSON.stringify(document.oferty || []));
      }

      console.log('Update FormData:', Array.from(updateFormData.entries()));

      const updateOperation = () => updateDocument(document.id, updateFormData);
      const updatedDoc = await retryOperation(updateOperation);
      if (!updatedDoc?.document?.url) {
        throw new Error(
          i18n.t('documentUpdateFailed') ||
            'Nie udało się uzyskać zaktualizowanego dokumentu',
        );
      }

      setDocuments((prev) => ({
        ...prev,
        [document.category]: prev[document.category].map((doc) =>
          doc.id === document.id
            ? {
                ...doc,
                url: updatedDoc.document.url,
                [field]: fileUrl,
                products: document.products,
                obowiazki: document.obowiazki,
                oferty: document.oferty,
              }
            : doc,
        ),
      }));

      Alert.alert(
        i18n.t('success') || 'Sukces',
        i18n.t(field === 'logo' ? 'logoAdded' : 'signatureAdded') ||
          `${field === 'logo' ? 'Logo' : 'Podpis'} został dodany do dokumentu`,
      );
    } catch (err) {
      console.error(`Błąd podczas aktualizacji dokumentu z ${field}:`, err);
      const message =
        err.response?.status === 413
          ? i18n.t('fileTooLarge') ||
            `Plik jest za duży (maks. ${MAX_FILE_SIZE / (1024 * 1024)} MB)`
          : i18n.t('updateError') ||
            `Nie udało się dodać ${field}: ${err.message}`;
      Alert.alert(i18n.t('error') || 'Błąd', message);
    } finally {
      setIsUploading(false);
    }
  };

  const applyFiltersAndSort = (category, docs) => {
    let filteredDocs = [...docs];
    const query = searchQueries[category] || '';
    const filter = filters[category] || {};
    const sort = sortBy[category] || 'date_desc';
    if (query) {
      filteredDocs = filteredDocs.filter((doc) =>
        doc.name.toLowerCase().includes(query.toLowerCase()),
      );
    }
    if (filter.type) {
      filteredDocs = filteredDocs.filter((doc) => doc.type === filter.type);
    }
    if (filter.dateFrom) {
      filteredDocs = filteredDocs.filter(
        (doc) => new Date(doc.created_at || 0) >= new Date(filter.dateFrom),
      );
    }
    if (filter.dateTo) {
      filteredDocs = filteredDocs.filter(
        (doc) => new Date(doc.created_at || 0) <= new Date(filter.dateTo),
      );
    }
    filteredDocs.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      if (sort === 'date_asc') return dateA - dateB;
      if (sort === 'date_desc') return dateB - dateA;
      if (sort === 'name_asc') return a.name.localeCompare(b.name);
      if (sort === 'name_desc') return b.name.localeCompare(a.name);
      return 0;
    });
    return filteredDocs;
  };

  const sortOptions = [
    { label: i18n.t('dateAsc') || 'Data rosnąco', value: 'date_asc' },
    { label: i18n.t('dateDesc') || 'Data malejąco', value: 'date_desc' },
    { label: i18n.t('nameAsc') || 'Nazwa rosnąco', value: 'name_asc' },
    { label: i18n.t('nameDesc') || 'Nazwa malejąco', value: 'name_desc' },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={styles.loadingText}>
          {i18n.t('loadingDocuments') || 'Ładowanie dokumentów...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[styles.error, { color: paperTheme.colors.error }]}>
          {error}
        </Text>
        <Button
          mode="contained"
          onPress={fetchData}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          <FontAwesome
            name="refresh"
            size={16}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          {i18n.t('retry') || 'Spróbuj ponownie'}
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
      style={[
        styles.scrollView,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: paperTheme.colors.text }]}>
          {i18n.t('managementDocuments') || 'Zarządzanie dokumentami'}
        </Text>
      </View>
      {documentCategories.map((category) => {
        const filteredDocuments = applyFiltersAndSort(
          category.category,
          documents[category.category] || [],
        );
        return (
          <List.Accordion
            key={category.id}
            title={i18n.t(category.nameKey)}
            titleStyle={styles.accordionTitle}
            expanded={expanded === category.id}
            onPress={() => handleAccordionPress(category.id)}
            style={styles.accordion}
            theme={{ colors: { primary: '#001426FF' } }}
            left={() => <AccordionIcon icon={category.icon} />}
          >
            <View
              style={[
                styles.accordionContent,
                { backgroundColor: paperTheme.colors.background },
              ]}
            >
              <Searchbar
                placeholder={i18n.t('searchDocuments') || 'Szukaj dokumentów'}
                onChangeText={(query) =>
                  handleSearchChange(category.category, query)
                }
                value={searchQueries[category.category] || ''}
                style={[
                  styles.searchbar,
                  { backgroundColor: paperTheme.colors.surface },
                ]}
                inputStyle={styles.searchbarInput}
                placeholderTextColor="#B0BEC5"
                iconColor="#001426FF"
                icon={SearchIcon}
              />
              <View style={styles.filterContainer}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSelectedCategory(category.category);
                    setSortModalVisible(true);
                  }}
                  style={[
                    styles.filterButton,
                    { backgroundColor: paperTheme.colors.surface },
                  ]}
                  labelStyle={styles.filterButtonText}
                  icon={SortIcon}
                >
                  {i18n.t('sort') || 'Sortuj'}:{' '}
                  {sortOptions.find(
                    (opt) => opt.value === sortBy[category.category],
                  )?.label ||
                    i18n.t('dateDesc') ||
                    'Data malejąco'}
                </Button>
              </View>
              <Modal
                animationType="fade"
                transparent
                visible={sortModalVisible}
                onRequestClose={handleClose}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  onPress={handleClose}
                  activeOpacity={1}
                >
                  <Animated.View
                    style={[styles.modalContent, { opacity: fadeAnim }]}
                  >
                    <Text style={styles.modalTitle}>
                      {i18n.t('selectSort') || 'Wybierz sortowanie'}
                    </Text>
                    <FlatList
                      data={sortOptions}
                      renderItem={({ item }) => (
                        <SortOption
                          item={item}
                          selectedCategory={selectedCategory}
                          handleSortChange={handleSortChange}
                        />
                      )}
                      keyExtractor={(item) => item.value}
                    />
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={handleClose}
                    >
                      <Text style={styles.modalCloseButtonText}>
                        {i18n.t('close') || 'Zamknij'}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </TouchableOpacity>
              </Modal>
              <Modal
                animationType="fade"
                transparent
                visible={logoModalVisible}
                onRequestClose={handleClose}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  onPress={handleClose}
                  activeOpacity={1}
                >
                  <Animated.View
                    style={[styles.modalContent, { opacity: fadeAnim }]}
                  >
                    <Text style={styles.modalTitle}>
                      {i18n.t('selectLogo') || 'Wybierz logo firmy'}
                    </Text>
                    <Button
                      mode="contained"
                      onPress={handlePickLogo}
                      style={styles.modalButton}
                      labelStyle={styles.modalButtonText}
                      disabled={isUploading}
                    >
                      {isUploading
                        ? i18n.t('uploading') || 'Wgrywanie...'
                        : i18n.t('pickImage') || 'Wybierz obraz z urządzenia'}
                    </Button>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={handleClose}
                    >
                      <Text style={styles.modalCloseButtonText}>
                        {i18n.t('cancel') || 'Anuluj'}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </TouchableOpacity>
              </Modal>
              <Modal
                animationType="fade"
                transparent
                visible={signatureModalVisible}
                onRequestClose={handleClose}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  onPress={handleClose}
                  activeOpacity={1}
                >
                  <Animated.View
                    style={[styles.modalContent, { opacity: fadeAnim }]}
                  >
                    <Text style={styles.modalTitle}>
                      {i18n.t('addSignature') || 'Dodaj podpis elektroniczny'}
                    </Text>
                    <Button
                      mode="contained"
                      onPress={handlePickSignature}
                      style={styles.modalButton}
                      labelStyle={styles.modalButtonText}
                      disabled={isUploading}
                    >
                      {isUploading
                        ? i18n.t('uploading') || 'Wgrywanie...'
                        : i18n.t('pickSignature') || 'Wybierz obraz podpisu'}
                    </Button>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={handleClose}
                    >
                      <Text style={styles.modalCloseButtonText}>
                        {i18n.t('cancel') || 'Anuluj'}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </TouchableOpacity>
              </Modal>
              {filteredDocuments.length === 0 ? (
                <Text style={styles.noData}>
                  {i18n.t('noDocuments') || 'Brak dokumentów'}
                </Text>
              ) : (
                <View style={styles.list}>
                  {filteredDocuments.map((item) => (
                    <DocumentCard
                      key={item.id}
                      category={category.category}
                      item={item}
                      menuVisible={menuVisible}
                      setMenuVisible={setMenuVisible}
                      handleMenuClose={handleMenuClose}
                      navigation={navigation}
                      i18n={i18n}
                      handleDownload={handleDownload}
                      handleDelete={handleDelete}
                      paperTheme={paperTheme}
                      menuFadeAnim={menuFadeAnim}
                      handleAddLogo={handleAddLogo}
                      handleAddSignature={handleAddSignature}
                    />
                  ))}
                </View>
              )}
            </View>
          </List.Accordion>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 50,
    paddingBottom: 70,
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    paddingLeft: 15,
    paddingRight: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  accordion: {
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 10,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#CCC',
    flexDirection: 'row',
  },
  accordionTitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001426FF',
    paddingVertical: 8,
  },
  accordionContent: {
    paddingLeft: 7.5,
    paddingRight: 7.5,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 10,
    width: '100%',
  },
  searchbar: {
    width: '100%',
    height: 60,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#CCC',
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  searchbarInput: {
    flex: 1,
    color: '#001426',
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    justifyContent: 'center',
  },
  filterButton: {
    marginRight: 10,
    marginBottom: 10,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  filterButtonText: {
    color: '#001426FF',
    fontFamily: 'Roboto',
    fontSize: 14,
  },
  list: {
    marginBottom: 15,
  },
  card: {
    marginBottom: 10,
    borderRadius: 8,
    elevation: 0,
    shadowOpacity: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 10,
  },
  cardTitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001426FF',
  },
  cardSubtitle: {
    fontFamily: 'Roboto',
    fontSize: 14,
    color: '#607D8B',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#001426FF',
    marginLeft: 10,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '50%',
  },
  modalTitle: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001426FF',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalItemText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#001426FF',
  },
  modalButton: {
    marginVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    color: '#001426FF',
  },
  button: {
    width: '80%',
    borderRadius: 8,
    backgroundColor: '#001426FF',
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  error: {
    color: '#FF4D4F',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  noData: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#607D8B',
    fontFamily: 'Roboto',
  },
  loadingText: {
    color: '#001426FF',
    fontFamily: 'Roboto',
    fontSize: 16,
    marginTop: 10,
  },
});
// aktualoczka bez update logo i podpisu dla VAT
