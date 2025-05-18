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
  ProgressBar,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
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
    icon: 'shopping-cart',
  },
  {
    id: '2',
    nameKey: 'finansowe',
    category: 'Faktury',
    icon: 'bank',
  },
  { id: '3', nameKey: 'kadrowe', category: 'Kadrowe', icon: 'users' },
];

const validCategories = documentCategories.map((cat) => cat.category);

const typeToCategory = {
  'Oferta Handlowa': 'Handlowe',
  'Faktura VAT': 'Faktury',
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

const AccordionIcon = ({ icon, accessibilityLabel, color }) => (
  <FontAwesome
    name={icon}
    size={20}
    color={color}
    style={styles.icon}
    accessibilityLabel={accessibilityLabel}
  />
);
const SearchIcon = ({ color }) => (
  <FontAwesome
    name="search"
    size={20}
    color={color}
    accessibilityLabel="Ikona wyszukiwania"
  />
);
const SortIcon = ({ color }) => (
  <FontAwesome
    name="sort"
    size={16}
    style={{ marginRight: 8 }}
    color={color}
    accessibilityLabel="Ikona sortowania"
  />
);
const LeftIcon = ({ color }) => (
  <FontAwesome
    name="check-circle"
    size={24}
    color={color}
    accessibilityLabel="Ikona dokumentu"
  />
);
const MenuIcon = ({ onPress, accessibilityLabel, color }) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    accessibilityHint="Otwórz menu opcji dokumentu"
  >
    <FontAwesome
      name="ellipsis-v"
      size={24}
      color={color}
      style={{ marginRight: 10 }}
    />
  </TouchableOpacity>
);
const SortOption = ({ item, selectedCategory, handleSortChange, colors }) => (
  <TouchableOpacity
    style={[styles.modalItem, { borderBottomColor: colors.accent }]}
    onPress={() => handleSortChange(selectedCategory, item.value)}
    accessibilityLabel={item.label}
    accessibilityRole="button"
    accessibilityHint="Wybierz tę opcję sortowania"
  >
    <Text style={[styles.modalItemText, { color: colors.text }]}>
      {item.label}
    </Text>
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
  colors,
}) => {
  const handleShare = async (document) => {
    try {
      const url = document.url || document.file_path;
      if (!url) {
        Alert.alert(i18n.t('noDocumentUrl'));
        return;
      }
      const shareUrl = `${i18n.t('shareMessage')}: ${url}`;
      const encodedUrl = encodeURIComponent(shareUrl);
      const canOpen = await Linking.canOpenURL('https://');
      if (canOpen) {
        await Linking.openURL(`>;</`);
      } else {
        Alert.alert(i18n.t('sharingNotAvailable'));
      }
    } catch (err) {
      console.error('Błąd podczas udostępniania:', err);
      Alert.alert(i18n.t('sharingError', { message: err.message }));
    }
  };

  return (
    <>
      <MenuIcon
        onPress={() => setMenuVisible((prev) => ({ ...prev, [item.id]: true }))}
        accessibilityLabel={i18n.t('openDocumentMenu', { name: item.name })}
        color={colors.primary}
      />
      <Modal
        animationType="fade"
        transparent
        visible={menuVisible[item.id] || false}
        onRequestClose={() => handleMenuClose(item.id)}
        accessibilityLabel={i18n.t('documentMenuModal', { name: item.name })}
        accessibilityHint={i18n.t('documentMenuModalHint')}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => handleMenuClose(item.id)}
          activeOpacity={1}
          accessibilityLabel={i18n.t('closeModal')}
          accessibilityRole="button"
          accessibilityHint={i18n.t('closeModalHint')}
        >
          <Animated.View
            style={[
              styles.modalContent,
              { opacity: menuFadeAnim, backgroundColor: colors.surface },
            ]}
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
              accessibilityLabel={i18n.t('previewDocument', {
                name: item.name,
              })}
              accessibilityRole="button"
              accessibilityHint={i18n.t('previewDocumentHint')}
            >
              <FontAwesome name="eye" size={20} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {i18n.t('preview')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleMenuClose(item.id);
                handleDownload(item);
              }}
              accessibilityLabel={i18n.t('downloadDocument', {
                name: item.name,
              })}
              accessibilityRole="button"
              accessibilityHint={i18n.t('downloadDocumentHint')}
            >
              <FontAwesome name="download" size={20} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {i18n.t('download')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleMenuClose(item.id);
                handleShare(item);
              }}
              accessibilityLabel={i18n.t('shareDocument', { name: item.name })}
              accessibilityRole="button"
              accessibilityHint={i18n.t('shareDocumentHint')}
            >
              <FontAwesome name="telegram" size={20} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {i18n.t('shareTelegram')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleMenuClose(item.id);
                handleAddLogo(item);
              }}
              accessibilityLabel={i18n.t('addLogoToDocument', {
                name: item.name,
              })}
              accessibilityRole="button"
              accessibilityHint={i18n.t('addLogoToDocumentHint')}
            >
              <FontAwesome name="image" size={20} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {i18n.t('addLogo')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleMenuClose(item.id);
                handleAddSignature(item);
              }}
              accessibilityLabel={i18n.t('addSignatureToDocument', {
                name: item.name,
              })}
              accessibilityRole="button"
              accessibilityHint={i18n.t('addSignatureToDocumentHint')}
            >
              <FontAwesome name="pencil" size={20} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                {i18n.t('addSignature')}
              </Text>
            </TouchableOpacity>
            <View
              style={[styles.menuDivider, { backgroundColor: colors.accent }]}
            />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleMenuClose(item.id);
                handleDelete(item, category);
              }}
              accessibilityLabel={i18n.t('deleteDocument', { name: item.name })}
              accessibilityRole="button"
              accessibilityHint={i18n.t('deleteDocumentHint')}
            >
              <FontAwesome name="trash" size={20} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>
                {i18n.t('delete')}
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
  colors,
  fadeAnim,
}) => {
  let subtitle = `${i18n.t('template')}: ${item.template_name || i18n.t('none')}`;
  if (item.type === 'Umowa o Pracę') {
    const obowiazkiCount = Array.isArray(item.obowiazki)
      ? item.obowiazki.length
      : 0;
    const ofertyCount = Array.isArray(item.oferty) ? item.oferty.length : 0;
    subtitle += ` | ${i18n.t('duties')}: ${obowiazkiCount} | ${i18n.t('provisions')}: ${ofertyCount}`;
  } else if (item.type === 'Oferta Handlowa' || item.type === 'Faktura VAT') {
    const productsCount = Array.isArray(item.products)
      ? item.products.length
      : 0;
    subtitle += ` | ${i18n.t('products')}: ${productsCount}`;
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.accent },
        ]}
        key={item.id}
        accessible
        accessibilityLabel={`${i18n.t('document')}: ${item.name}, ${i18n.t('created')}: ${new Date(item.created_at || Date.now()).toLocaleDateString()}`}
      >
        <Card.Title
          title={item.name}
          subtitle={subtitle}
          titleStyle={[styles.cardTitle, { color: colors.text }]}
          subtitleStyle={[styles.cardSubtitle, { color: colors.secondaryText }]}
          left={() => <LeftIcon color={colors.primary} />}
          leftStyle={{ marginRight: 10 }}
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
              colors={colors}
            />
          )}
        />
      </Card>
    </Animated.View>
  );
};

export default function DocumentsScreen({ navigation, route }) {
  const { isLoggedIn, user, retryFetchUser } = useContext(AuthContext);
  const { i18n } = useContext(LanguageContext);
  const { colors } = useTheme();
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
  const [cardAnimations, setCardAnimations] = useState({});

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
        setError(i18n.t('noToken'));
        navigation.navigate('Login');
        return;
      }
      if (!user) {
        const result = await retryFetchUser();
        if (!result.success) {
          setError(i18n.t('userFetchError'));
          navigation.navigate('Login');
          return;
        }
      }
      const docData = await fetchDocuments();
      const docDataWithCategory = docData.map((doc) => ({
        ...doc,
        category: typeToCategory[doc.type] || 'Handlowe',
        id: String(doc.id),
        products: Array.isArray(doc.products) ? doc.products : [],
        obowiazki: Array.isArray(doc.obowiazki) ? doc.obowiazki : [],
        oferty: Array.isArray(doc.oferty) ? doc.oferty : [],
      }));
      const documentsData = documentCategories.reduce((acc, category) => {
        acc[category.category] = docDataWithCategory.filter(
          (doc) => doc.category === category.category,
        );
        return acc;
      }, {});
      console.log('Załadowane dokumenty:', documentsData);
      setDocuments(documentsData);
      // Initialize card animations
      const animations = {};
      Object.values(documentsData).forEach((docs) => {
        docs.forEach((doc) => {
          animations[doc.id] = new Animated.Value(0);
        });
      });
      setCardAnimations(animations);
    } catch (fetchError) {
      console.error('Błąd podczas pobierania dokumentów:', fetchError);
      setError(i18n.t('fetchDocumentsError', { message: fetchError.message }));
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user, retryFetchUser, navigation, i18n]);

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

  useEffect(() => {
    if (expanded) {
      const category = documentCategories.find((cat) => cat.id === expanded);
      if (category) {
        (documents[category.category] || []).forEach((doc, index) => {
          if (cardAnimations[doc.id]) {
            Animated.timing(cardAnimations[doc.id], {
              toValue: 1,
              duration: 200,
              delay: index * 50,
              useNativeDriver: true,
            }).start();
          }
        });
      }
    }
  }, [expanded, documents, cardAnimations]);

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
        Alert.alert(i18n.t('noDocumentUrl'));
      }
    } catch (err) {
      console.error('Błąd podczas pobierania dokumentu:', err);
      Alert.alert(i18n.t('downloadError', { message: err.message }));
    }
  };

  const handleDelete = async (document, category) => {
    const documentId = String(document.id);
    Alert.alert(
      i18n.t('confirmDelete'),
      i18n.t('deleteDocumentConfirm', { name: document.name }),
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('delete'),
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
                i18n.t('success'),
                i18n.t('documentDeleted', { name: document.name }),
              );
            } catch (err) {
              console.error('Błąd podczas usuwania dokumentu:', err);
              Alert.alert(
                i18n.t('error'),
                i18n.t('deleteError', { message: err.message }),
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
      return i18n.t('noFileSelected');
    }
    if (file.size > MAX_FILE_SIZE) {
      return i18n.t('fileTooLarge', { maxSize: MAX_FILE_SIZE / (1024 * 1024) });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
      return i18n.t('invalidFileType');
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
          Alert.alert(i18n.t('error'), validationError);
          return;
        }
        const isOnline = await checkNetwork();
        if (!isOnline) {
          Alert.alert(i18n.t('noNetwork'), i18n.t('checkConnection'));
          return;
        }
        setIsUploading(true);
        await updateDocumentWithFile(selectedDocument, file.uri, 'logo');
        setLogoModalVisible(false);
      }
    } catch (err) {
      console.error('Błąd podczas wyboru logo:', err);
      Alert.alert(
        i18n.t('error'),
        i18n.t('logoPickError', { message: err.message }),
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
          Alert.alert(i18n.t('error'), validationError);
          return;
        }
        const isOnline = await checkNetwork();
        if (!isOnline) {
          Alert.alert(i18n.t('noNetwork'), i18n.t('checkConnection'));
          return;
        }
        setIsUploading(true);
        await updateDocumentWithFile(selectedDocument, file.uri, 'podpis');
        setSignatureModalVisible(false);
      }
    } catch (err) {
      console.error('Błąd podczas wyboru podpisu:', err);
      Alert.alert(
        i18n.t('error'),
        i18n.t('signaturePickError', { message: err.message }),
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
    for (let attempt = 1; attempt <= maxRetries; _attempt++) {
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
        throw new Error(i18n.t('missingParams'));
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
        throw new Error(i18n.t('imageUploadFailed'));
      }

      const fetchTemplateOperation = () =>
        fetchTemplateContent(document.template_id || 2);
      const { content: templateContent } = await retryOperation(
        fetchTemplateOperation,
      );
      if (!templateContent) {
        throw new Error(i18n.t('noTemplateContent'));
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
            : `<tr><td colspan="4">${i18n.t('noItems')}</td></tr>`;
        htmlContent = htmlContent.replace('{{products}}', productsHtml);
      } else if (document.type === 'Faktura VAT') {
        const productsHtml =
          Array.isArray(document.products) && document.products.length > 0
            ? document.products
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
            : `<tr><td colspan="5">${i18n.t('noItems')}</td></tr>`;
        htmlContent = htmlContent.replace('{{#each pozycje}}', productsHtml);
      } else if (document.type === 'Umowa o Pracę') {
        const obowiazkiHtml =
          Array.isArray(document.obowiazki) && document.obowiazki.length > 0
            ? document.obowiazki
                .map((obowiazek) => `<li>${obowiazek}</li>`)
                .join('')
            : `<li>${i18n.t('noDuties')}</li>`;
        const ofertyHtml =
          Array.isArray(document.oferty) && document.oferty.length > 0
            ? document.oferty.map((oferta) => `<li>${oferta}</li>`).join('')
            : `<li>${i18n.t('noProvisions')}</li>`;
        htmlContent = htmlContent
          .replace('{{obowiazek_1}}', document.obowiazki[0] || i18n.t('none'))
          .replace('{{obowiazek_2}}', document.obowiazki[1] || i18n.t('none'))
          .replace('{{obowiazek_3}}', document.obowiazki[2] || i18n.t('none'))
          .replace('{{oferta_1}}', document.oferty[0] || i18n.t('none'))
          .replace('{{oferta_2}}', document.oferty[1] || i18n.t('none'))
          .replace('{{oferta_3}}', document.oferty[2] || i18n.t('none'));
      }

      let wartosc_vat_suma = document.wartosc_vat_suma;
      if (
        document.type === 'Faktura VAT' &&
        !wartosc_vat_suma &&
        Array.isArray(document.products)
      ) {
        wartosc_vat_suma = document.products
          .reduce(
            (sum, product) => sum + (parseFloat(product.kwota_vat) || 0),
            0,
          )
          .toFixed(2);
      }

      const placeholderMapFakturaVAT = {
        firma_sprzedawcy: document.nazwa_firmy_wystawcy || '',
        nip_sprzedawcy: document.nip_wystawcy || '',
        adres_sprzedawcy: document.adres_wystawcy || '',
        telefon_sprzedawcy: document.telefon_wystawcy || '',
        email_sprzedawcy: document.email_wystawcy || '',
        firma_nabywcy: document.nazwa_firmy_klienta || '',
        nip_nabywcy: document.nip_klienta || '',
        adres_nabywcy: document.adres_firmy_klienta || '',
        telefon_nabywcy: document.telefon_klienta || '',
        email_nabywcy: document.email_klienta || '',
        numer_faktury: document.numer_faktury || '',
        data_wystawienia: document.data_wystawienia || '',
        data_sprzedazy: document.data_sprzedazy || '',
        termin_platnosci: document.termin_platnosci || '',
        sposob_platnosci: document.sposob_platnosci || '',
        numer_konta: document.numer_konta_bankowego || '',
        wystawiajacy: document.wystawiajacy || '',
        razem_netto: document.wartosc_netto_suma || '',
        razem_vat: wartosc_vat_suma || '',
        razem_brutto: document.wartosc_brutto_suma || '',
      };

      const placeholders = [
        'numer_oferty',
        'numer_faktury',
        'nazwa_firmy_wystawcy',
        'nip_wystawcy',
        'adres_wystawcy',
        'telefon_wystawcy',
        'email_wystawcy',
        'nazwa_firmy_klienta',
        'nip_klienta',
        'adres_firmy_klienta',
        'telefon_klienta',
        'email_klienta',
        'wartosc_netto_suma',
        'stawka_vat',
        'wartosc_vat',
        'wartosc_brutto_suma',
        'data_wystawienia',
        'data_sprzedazy',
        'termin_platnosci',
        'sposob_platnosci',
        'numer_konta_bankowego',
        'wystawiajacy',
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
        'czas_trwania_umowy',
        'data_rozpoczecia',
        'data',
        'miejsce_zawarcia',
        'razem_netto',
        'razem_vat',
        'razem_brutto',
        'firma_sprzedawcy',
        'nip_sprzedawcy',
        'adres_sprzedawcy',
        'telefon_sprzedawcy',
        'email_sprzedawcy',
        'firma_nabywcy',
        'nip_nabywcy',
        'adres_nabywcy',
        'telefon_nabywcy',
        'email_nabywcy',
        'numer_konta',
      ];

      if (document.type === 'Faktura VAT') {
        Object.entries(placeholderMapFakturaVAT).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          htmlContent = htmlContent.replace(
            new RegExp(placeholder, 'g'),
            value,
          );
        });
      }

      placeholders.forEach((key) => {
        if (document.type === 'Faktura VAT' && key === 'razem_vat') return;
        const placeholder = `{{${key}}}`;
        const value = document[key] || '';
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      });

      const logoValue = field === 'logo' ? fileUrl : document.logo || '';
      const podpisValue = field === 'podpis' ? fileUrl : document.podpis || '';

      if (!logoValue) {
        htmlContent = htmlContent.replace(
          /<img src="{{logo}}" alt="Logo firmy" \/>/,
          '',
        );
      } else {
        htmlContent = htmlContent.replace(/{{logo}}/g, logoValue);
      }

      if (!podpisValue) {
        htmlContent = htmlContent.replace(
          /<img src="{{podpis}}" alt="Podpis elektroniczny" class="signature-text" \/>/,
          '',
        );
      } else {
        htmlContent = htmlContent.replace(/{{podpis}}/g, podpisValue);
      }

      htmlContent = htmlContent.replace(/{{[^{}]+}}/g, '');

      const { uri: pdfUri } = await Print.printToFileAsync({
        html: htmlContent,
      });
      if (!pdfUri) {
        throw new Error(i18n.t('pdfGenerationFailed'));
      }

      const updateFormData = new FormData();
      updateFormData.append('file', {
        uri: pdfUri,
        type: 'application/pdf',
        name: `document_${document.id}.pdf`,
      });
      updateFormData.append('templateId', String(document.template_id || 2));
      updateFormData.append('title', document.name || '');
      updateFormData.append('type', document.type || 'Umowa o Pracę');
      updateFormData.append('logo', logoValue);
      updateFormData.append('podpis', podpisValue);

      if (document.type === 'Faktura VAT') {
        Object.entries(placeholderMapFakturaVAT).forEach(([key, value]) => {
          updateFormData.append(key, value);
        });
      } else {
        placeholders.forEach((key) => {
          updateFormData.append(key, document[key] || '');
        });
      }

      if (
        document.type === 'Oferta Handlowa' ||
        document.type === 'Faktura VAT'
      ) {
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

      updateFormData.append(
        'data',
        JSON.stringify({
          ...(document.type === 'Faktura VAT'
            ? placeholderMapFakturaVAT
            : document),
          products: document.products || [],
          obowiazki: document.obowiazki || [],
          oferty: document.oferty || [],
          logo: logoValue,
          podpis: podpisValue,
        }),
      );

      console.log('Update FormData:', Array.from(updateFormData.entries()));

      const updateOperation = () => updateDocument(document.id, updateFormData);
      const updatedDoc = await retryOperation(updateOperation);
      if (!updatedDoc?.document?.url) {
        throw new Error(i18n.t('documentUpdateFailed'));
      }

      setDocuments((prev) => ({
        ...prev,
        [document.category]: prev[document.category].map((doc) =>
          doc.id === document.id
            ? {
                ...doc,
                url: updatedDoc.document.url,
                logo: logoValue,
                podpis: podpisValue,
                products: document.products,
                obowiazki: document.obowiazki,
                oferty: document.oferty,
                wartosc_vat_suma:
                  document.type === 'Faktura VAT'
                    ? wartosc_vat_suma
                    : doc.wartosc_vat_suma,
              }
            : doc,
        ),
      }));

      Alert.alert(
        i18n.t('success'),
        i18n.t(field === 'logo' ? 'logoAdded' : 'signatureAdded', {
          name: document.name,
        }),
      );
    } catch (err) {
      console.error(`Błąd podczas aktualizacji dokumentu z ${field}:`, err);
      const message =
        err.response?.status === 413
          ? i18n.t('fileTooLarge', { maxSize: MAX_FILE_SIZE / (1024 * 1024) })
          : i18n.t('updateError', {
              field: field === 'logo' ? i18n.t('logo') : i18n.t('signature'),
              message: err.message,
            });
      Alert.alert(i18n.t('error'), message);
    } finally {
      setIsUploading(false);
    }
  };

  const applyFiltersAndSort = (category, docs) => {
    let filteredDocs = [...docs];
    const query = searchQueries[category] || '';
    const filter = filters[category] || {};
    const sort = sortBy[category] || 'date_desc';

    // Apply filters
    if (query) {
      filteredDocs = filteredDocs.filter((doc) =>
        doc.name?.toLowerCase().includes(query.toLowerCase()),
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

    // Apply sorting
    filteredDocs.sort((a, b) => {
      // Handle date sorting
      if (sort === 'date_asc' || sort === 'date_desc') {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        // Validate dates
        const isValidDateA = !isNaN(dateA.getTime());
        const isValidDateB = !isNaN(dateB.getTime());

        if (!isValidDateA && !isValidDateB) return 0;
        if (!isValidDateA) return sort === 'date_asc' ? 1 : -1;
        if (!isValidDateB) return sort === 'date_asc' ? -1 : 1;

        return sort === 'date_asc' ? dateA - dateB : dateB - dateA;
      }

      // Handle name sorting
      const nameA = a.name || '';
      const nameB = b.name || '';
      return sort === 'name_asc'
        ? nameA.localeCompare(nameB, 'pl', { sensitivity: 'base' })
        : nameB.localeCompare(nameA, 'pl', { sensitivity: 'base' });
    });

    console.log(
      `Sorted documents for ${category}:`,
      filteredDocs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        created_at: doc.created_at,
      })),
    );

    return filteredDocs;
  };

  const sortOptions = [
    { label: i18n.t('dateAsc'), value: 'date_asc' },
    { label: i18n.t('dateDesc'), value: 'date_desc' },
    { label: i18n.t('nameAsc'), value: 'name_asc' },
    { label: i18n.t('nameDesc'), value: 'name_desc' },
  ];

  const totalDocuments = Object.values(documents).flat().length;
  const activeCategories = documentCategories.filter(
    (cat) => (documents[cat.category] || []).length > 0,
  ).length;

  if (loading) {
    return (
      <View
        style={[styles.center, { backgroundColor: colors.background }]}
        accessible
        accessibilityLabel={i18n.t('loadingDocuments')}
        accessibilityRole="alert"
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {i18n.t('loadingDocuments')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.center, { backgroundColor: colors.background }]}
        accessible
        accessibilityLabel={error}
        accessibilityRole="alert"
      >
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchData}
          style={[styles.button, { backgroundColor: colors.primary }]}
          labelStyle={[styles.buttonText, { color: colors.surface }]}
          accessibilityLabel={i18n.t('retry')}
          accessibilityRole="button"
          accessibilityHint={i18n.t('retryHint')}
        >
          <FontAwesome
            name="refresh"
            size={16}
            color={colors.surface}
            style={{ marginRight: 8 }}
            accessibilityLabel={i18n.t('refreshIcon')}
          />
          {i18n.t('retry')}
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer]}
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        accessible
        accessibilityLabel={i18n.t('documentsScreen')}
      >
        <View
          style={[
            styles.statsCard,
            { backgroundColor: colors.surface, borderColor: colors.accent },
          ]}
          accessible
          accessibilityLabel={i18n.t('quick_stats')}
        >
          <Card.Title
            title={i18n.t('quick_stats')}
            titleStyle={[styles.statsTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('quick_stats')}
          />
          <Card.Content style={styles.statsContent}>
            <View
              style={[
                styles.statItem,
                { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
            >
              <FontAwesome
                name="file-text-o"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {totalDocuments}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                {i18n.t('documents_created')}
              </Text>
            </View>
            <View
              style={[
                styles.statItem,
                { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
            >
              <FontAwesome
                name="folder-open"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {activeCategories}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                {i18n.t('active_categories')}
              </Text>
            </View>
          </Card.Content>
        </View>
        <View style={styles.headerContainer}>
          <Text
            style={[styles.header, { color: colors.text }]}
            accessibilityRole="header"
            accessibilityLabel={i18n.t('managementDocuments')}
          >
            {i18n.t('managementDocuments')}
          </Text>
        </View>
        {documentCategories.map((category) => {
          const filteredDocuments = applyFiltersAndSort(
            category.category,
            documents[category.category] || [],
          );
          const docCount = filteredDocuments.length;
          const maxDocs = 10; // Arbitrary threshold for progress
          const progress = Math.min(docCount / maxDocs, 1);
          return (
            <View key={category.id} style={styles.categoryContainer}>
              <List.Accordion
                title={
                  <View style={styles.titleContainer}>
                    <AccordionIcon
                      icon={category.icon}
                      accessibilityLabel={i18n.t(`${category.nameKey}_icon`)}
                      color={colors.primary}
                    />
                    <View style={styles.titleWrapper}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {i18n.t(category.nameKey)}
                      </Text>
                      <Text
                        style={[
                          styles.templateCount,
                          { color: colors.secondaryText },
                        ]}
                      >
                        {i18n.t('documents_count')}
                        {docCount}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.circleIndicator,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text
                        style={[styles.circleText, { color: colors.surface }]}
                      >
                        {docCount}
                      </Text>
                    </View>
                  </View>
                }
                right={(props) => (
                  <FontAwesome
                    name={props.isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.text}
                    style={styles.accordionArrow}
                  />
                )}
                expanded={expanded === category.id}
                onPress={() => handleAccordionPress(category.id)}
                style={[
                  styles.accordion,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.accent,
                  },
                ]}
                theme={{ colors: { background: colors.surface } }}
                accessibilityLabel={i18n.t(`${category.nameKey}_category`)}
                accessibilityRole="button"
                accessibilityHint={i18n.t('expandCategoryHint')}
              >
                <ProgressBar
                  progress={progress}
                  color={colors.primary}
                  style={styles.progressBar}
                  accessibilityLabel={i18n.t('category_progress', {
                    count: docCount,
                    total: maxDocs,
                  })}
                />
                <View
                  style={[
                    styles.accordionContent,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Searchbar
                    placeholder={i18n.t('searchDocuments')}
                    onChangeText={(query) =>
                      handleSearchChange(category.category, query)
                    }
                    value={searchQueries[category.category] || ''}
                    style={[
                      styles.searchbar,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.accent,
                      },
                    ]}
                    inputStyle={[styles.searchbarInput, { color: colors.text }]}
                    placeholderTextColor={colors.secondaryText}
                    icon={() => <SearchIcon color={colors.primary} />}
                    accessibilityLabel={i18n.t('searchDocuments')}
                    accessibilityHint={i18n.t('searchDocumentsHint')}
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
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.accent,
                        },
                      ]}
                      labelStyle={[
                        styles.filterButtonText,
                        { color: colors.primary },
                      ]}
                      icon={() => <SortIcon color={colors.primary} />}
                      accessibilityLabel={i18n.t('sortButton', {
                        label:
                          sortOptions.find(
                            (opt) => opt.value === sortBy[category.category],
                          )?.label || i18n.t('dateDesc'),
                      })}
                      accessibilityRole="button"
                      accessibilityHint={i18n.t('sortButtonHint')}
                    >
                      {i18n.t('sort')}:{' '}
                      {sortOptions.find(
                        (opt) => opt.value === sortBy[category.category],
                      )?.label || i18n.t('dateDesc')}
                    </Button>
                  </View>
                  <Modal
                    animationType="fade"
                    transparent
                    visible={sortModalVisible}
                    onRequestClose={handleClose}
                    accessibilityLabel={i18n.t('sortModal')}
                    accessibilityHint={i18n.t('sortModalHint')}
                  >
                    <TouchableOpacity
                      style={styles.modalOverlay}
                      onPress={handleClose}
                      activeOpacity={1}
                      accessibilityLabel={i18n.t('closeModal')}
                      accessibilityRole="button"
                      accessibilityHint={i18n.t('closeModalHint')}
                    >
                      <Animated.View
                        style={[
                          styles.modalContent,
                          {
                            opacity: fadeAnim,
                            backgroundColor: colors.surface,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.modalTitle, { color: colors.text }]}
                          accessibilityRole="header"
                          accessibilityLabel={i18n.t('selectSort')}
                        >
                          {i18n.t('selectSort')}
                        </Text>
                        <FlatList
                          data={sortOptions}
                          renderItem={({ item }) => (
                            <SortOption
                              item={item}
                              selectedCategory={selectedCategory}
                              handleSortChange={handleSortChange}
                              colors={colors}
                            />
                          )}
                          keyExtractor={(item) => item.value}
                        />
                        <TouchableOpacity
                          style={[
                            styles.modalCloseButton,
                            { backgroundColor: colors.accent },
                          ]}
                          onPress={handleClose}
                          accessibilityLabel={i18n.t('close')}
                          accessibilityRole="button"
                          accessibilityHint={i18n.t('closeModalHint')}
                        >
                          <Text
                            style={[
                              styles.modalCloseButtonText,
                              { color: colors.text },
                            ]}
                          >
                            {i18n.t('close')}
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
                    accessibilityLabel={i18n.t('logoModal')}
                    accessibility
                    WILLIAM={i18n.t('logoModalHint')}
                  >
                    <TouchableOpacity
                      style={styles.modalOverlay}
                      onPress={handleClose}
                      activeOpacity={1}
                      accessibilityLabel={i18n.t('closeModal')}
                      accessibilityRole="button"
                      accessibilityHint={i18n.t('closeModalHint')}
                    >
                      <Animated.View
                        style={[
                          styles.modalContent,
                          {
                            opacity: fadeAnim,
                            backgroundColor: colors.surface,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.modalTitle, { color: colors.text }]}
                          accessibilityRole="header"
                          accessibilityLabel={i18n.t('selectLogo')}
                        >
                          {i18n.t('selectLogo')}
                        </Text>
                        <Button
                          mode="contained"
                          onPress={handlePickLogo}
                          style={[
                            styles.modalButton,
                            { backgroundColor: colors.primary },
                          ]}
                          labelStyle={[
                            styles.modalButtonText,
                            { color: colors.surface },
                          ]}
                          disabled={isUploading}
                          accessibilityLabel={
                            isUploading
                              ? i18n.t('uploading')
                              : i18n.t('pickImage')
                          }
                          accessibilityRole="button"
                          accessibilityHint={i18n.t('pickImageHint')}
                        >
                          {isUploading
                            ? i18n.t('uploading')
                            : i18n.t('pickImage')}
                        </Button>
                        <TouchableOpacity
                          style={[
                            styles.modalCloseButton,
                            { backgroundColor: colors.accent },
                          ]}
                          onPress={handleClose}
                          accessibilityLabel={i18n.t('cancel')}
                          accessibilityRole="button"
                          accessibilityHint={i18n.t('cancelHint')}
                        >
                          <Text
                            style={[
                              styles.modalCloseButtonText,
                              { color: colors.text },
                            ]}
                          >
                            {i18n.t('cancel')}
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
                    accessibilityLabel={i18n.t('signatureModal')}
                    accessibilityHint={i18n.t('signatureModalHint')}
                  >
                    <TouchableOpacity
                      style={styles.modalOverlay}
                      onPress={handleClose}
                      activeOpacity={1}
                      accessibilityLabel={i18n.t('closeModal')}
                      accessibilityRole="button"
                      accessibilityHint={i18n.t('closeModalHint')}
                    >
                      <Animated.View
                        style={[
                          styles.modalContent,
                          {
                            opacity: fadeAnim,
                            backgroundColor: colors.surface,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.modalTitle, { color: colors.text }]}
                          accessibilityRole="header"
                          accessibilityLabel={i18n.t('addSignature')}
                        >
                          {i18n.t('addSignature')}
                        </Text>
                        <Button
                          mode="contained"
                          onPress={handlePickSignature}
                          style={[
                            styles.modalButton,
                            { backgroundColor: colors.primary },
                          ]}
                          labelStyle={[
                            styles.modalButtonText,
                            { color: colors.surface },
                          ]}
                          disabled={isUploading}
                          accessibilityLabel={
                            isUploading
                              ? i18n.t('uploading')
                              : i18n.t('pickSignature')
                          }
                          accessibilityRole="button"
                          accessibilityHint={i18n.t('pickSignatureHint')}
                        >
                          {isUploading
                            ? i18n.t('uploading')
                            : i18n.t('pickSignature')}
                        </Button>
                        <TouchableOpacity
                          style={[
                            styles.modalCloseButton,
                            { backgroundColor: colors.accent },
                          ]}
                          onPress={handleClose}
                          accessibilityLabel={i18n.t('cancel')}
                          accessibilityRole="button"
                          accessibilityHint={i18n.t('cancelHint')}
                        >
                          <Text
                            style={[
                              styles.modalCloseButtonText,
                              { color: colors.text },
                            ]}
                          >
                            {i18n.t('cancel')}
                          </Text>
                        </TouchableOpacity>
                      </Animated.View>
                    </TouchableOpacity>
                  </Modal>
                  {filteredDocuments.length === 0 ? (
                    <Text
                      style={[styles.noData, { color: colors.secondaryText }]}
                      accessibilityLabel={i18n.t('noDocuments')}
                    >
                      {i18n.t('noDocuments')}
                    </Text>
                  ) : (
                    <View
                      style={styles.list}
                      accessible
                      accessibilityLabel={i18n.t('documentList')}
                    >
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
                          colors={colors}
                          fadeAnim={
                            cardAnimations[item.id] || new Animated.Value(1)
                          }
                        />
                      ))}
                    </View>
                  )}
                </View>
              </List.Accordion>
            </View>
          );
        })}
        <View
          style={[
            styles.streamlineBox,
            { backgroundColor: colors.accent, borderColor: colors.primary },
          ]}
        >
          <FontAwesome
            name="lightbulb-o"
            size={20}
            color={colors.primary}
            style={styles.streamlineIcon}
          />
          <Text style={[styles.streamlineText, { color: colors.text }]}>
            {i18n.t('hint_docscreen')}
          </Text>
        </View>
      </ScrollView>
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
  statDescription: {
    fontSize: 10,
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: 5,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  statsCard: {
    borderRadius: 15,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 0,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 15,
  },
  statsContent: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 10,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 10,
  },
  accordion: {
    elevation: 4,
    shadowOpacity: 0.1,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    width: '99%',
    alignItems: 'center',
    height: 70,
    paddingVertical: 0,
  },
  titleWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    overflow: 'visible',
  },
  templateCount: {
    fontSize: 12,
    marginTop: 2,
  },
  circleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  circleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  accordionArrow: {
    marginLeft: 2.5,
    marginTop: 20,
  },
  accordionContent: {
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  searchbar: {
    width: '100%',
    height: 50,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  searchbarInput: {
    flex: 1,
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
    borderWidth: 1.5,
    borderRadius: 8,
    elevation: 2,
  },
  filterButtonText: {
    fontFamily: 'Roboto',
    fontSize: 14,
  },
  list: {
    marginBottom: 15,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    borderWidth: 1,
    padding: 10,
  },
  cardSubtitle: {
    fontFamily: 'Roboto',
    fontSize: 12,
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
    marginLeft: 10,
  },
  menuDivider: {
    height: 1,
    marginVertical: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '50%',
  },
  modalTitle: {
    fontFamily: 'Roboto',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  icon: {
    alignSelf: 'center',
    width: 24,
    height: 24,
    marginLeft: 5,
    marginRight: 15,
    overflow: 'visible',
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
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  button: {
    width: '80%',
    borderRadius: 8,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  error: {
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  noData: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  loadingText: {
    fontFamily: 'Roboto',
    fontSize: 16,
    marginTop: 10,
  },
  streamlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginHorizontal: 0,
    borderWidth: 1,
  },
  streamlineIcon: {
    marginRight: 10,
  },
  progressBar: {
    marginHorizontal: 10,
    marginVertical: 5,
    height: 6,
    borderRadius: 3,
  },
});
