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
  Clipboard,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import {
  Card,
  Searchbar,
  Button,
  List,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { fetchDocuments, deleteDocument } from '../api';

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
  Kadrowy: 'Kadrowe',
};

// Standalone component for List.Accordion left icon
const AccordionIcon = ({ icon }) => (
  <FontAwesome
    name={icon}
    size={20}
    color="#001426FF"
    style={{
      justifyContent: 'center',
      alignSelf: 'center',
      marginLeft: 10,
    }}
  />
);

// Standalone component for Searchbar icon
const SearchIcon = () => (
  <FontAwesome name="search" size={20} color="#001426FF" />
);

// Standalone component for Button sort icon
const SortIcon = () => (
  <FontAwesome name="sort" size={16} style={{ marginRight: 8 }} />
);

// Standalone component for Card.Title left icon
const LeftIcon = () => (
  <FontAwesome name="check-circle" size={24} color="#001426FF" />
);

// Standalone component for Card.Title right menu icon
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

// Standalone component for Card.Title right menu
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
}) => {
  // Funkcja do udostępniania linku do dokumentu
  const handleShare = async (document) => {
    try {
      const url = document.url || document.file_path;
      if (!url) {
        Alert.alert('Błąd', i18n.t('noDocumentUrl') || 'Brak URL do dokumentu');
        return;
      }

      // Tworzymy link do udostępnienia
      const shareUrl = `${i18n.t('shareMessage') || 'Sprawdź ten dokument'}: ${url}`;
      const encodedUrl = encodeURIComponent(shareUrl);
      const canOpen = await Linking.canOpenURL('https://');

      if (canOpen) {
        // Używamy Linking do otwarcia natywnego interfejsu udostępniania
        // Przykładowo WhatsApp, można dodać inne platformy
        await Linking.openURL(`https://t.me/share/url?url=${encodedUrl}`);
      } else {
        Alert.alert(
          'Błąd',
          i18n.t('sharingNotAvailable') ||
            'Udostępnianie nie jest dostępne na tym urządzeniu',
        );
      }
    } catch (err) {
      console.error('Błąd podczas udostępniania dokumentu:', err);
      Alert.alert(
        'Błąd',
        i18n.t('sharingError') ||
          `Nie udało się udostępnić dokumentu: ${err.message}`,
      );
    }
  };

  // Funkcja do kopiowania linku
  const handleCopyLink = (document) => {
    const url = document.url || document.file_path;
    if (!url) {
      Alert.alert('Błąd', i18n.t('noDocumentUrl') || 'Brak URL do dokumentu');
      return;
    }

    Clipboard.setString(url);
    Alert.alert(
      'Sukces',
      i18n.t('linkCopied') || 'Link do dokumentu został skopiowany do schowka',
    );
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
                handleCopyLink(item);
              }}
            >
              <FontAwesome name="link" size={20} color="#001426FF" />
              <Text style={styles.menuItemText}>{i18n.t('shareLink')}</Text>
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

// Standalone component for DocumentCard
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
}) => (
  <Card
    style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
    key={item.id}
  >
    <Card.Title
      title={item.name}
      subtitle={`${new Date(item.created_at || Date.now()).toLocaleDateString()} | Szablon: ${
        item.template_name || 'Brak'
      }`}
      titleStyle={styles.cardTitle}
      subtitleStyle={styles.cardSubtitle}
      left={LeftIcon}
      leftStyle={{ marginRight: 2.5 }} // Small margin for left icon
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
        />
      )}
    />
  </Card>
);

// Standalone component for sort option
const SortOption = ({ item, selectedCategory, handleSortChange }) => (
  <TouchableOpacity
    style={styles.modalItem}
    onPress={() => handleSortChange(selectedCategory, item.value)}
  >
    <Text style={styles.modalItemText}>{item.label}</Text>
  </TouchableOpacity>
);

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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const paperTheme = usePaperTheme();

  const [fadeAnim] = useState(new Animated.Value(0)); // Animacja dla modalu sortowania
  const [menuFadeAnim] = useState(new Animated.Value(0)); // Animacja dla modalu opcji dokumentów

  useEffect(() => {
    if (sortModalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [sortModalVisible]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSortModalVisible(false);
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
        setError('Brak tokena lub użytkownik nie jest zalogowany');
        navigation.navigate('Login');
        return;
      }

      if (!user) {
        const result = await retryFetchUser();
        if (!result.success) {
          setError('Nie udało się pobrać danych użytkownika');
          navigation.navigate('Login');
          return;
        }
      }

      const docData = await fetchDocuments();
      console.log('Dane z fetchDocuments:', docData);

      const docDataWithCategory = docData.map((doc) => ({
        ...doc,
        category: typeToCategory[doc.type] || 'Handlowe',
        id: String(doc.id),
      }));

      const documentsData = documentCategories.reduce((acc, category) => {
        acc[category.category] =
          docDataWithCategory.filter(
            (doc) => doc.category === category.category,
          ) || [];
        return acc;
      }, {});

      console.log('Zgrupowane dokumenty:', documentsData);
      setDocuments(documentsData);
    } catch (fetchError) {
      console.error('Błąd podczas pobierania dokumentów:', fetchError);
      setError(
        `Błąd podczas ładowania dokumentów: ${fetchError.message || 'Nieznany błąd'}`,
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
    console.log('Route params:', params);

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
      console.log('Nowy dokument:', {
        newDoc: newDocument,
        assignedCategory: category,
      });
      setDocuments((prev) => {
        const updatedDocuments = {
          ...prev,
          [category]: [newDocWithCategory, ...(prev[category] || [])],
        };
        console.log('Zaktualizowany stan documents:', updatedDocuments);
        return updatedDocuments;
      });
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
        await Linking.openURL(url);
      } else {
        Alert.alert('Błąd', 'Brak URL do dokumentu');
      }
    } catch (err) {
      console.error('Błąd podczas pobierania dokumentu:', err);
      Alert.alert('Błąd', 'Nie udało się pobrać dokumentu');
    }
  };

  const handleDelete = async (document, category) => {
    const documentId = String(document.id);
    console.log('Usuwanie dokumentu:', {
      documentId,
      category,
      documentsKeys: Object.keys(documents),
      documentsInCategory: documents[category] || [],
    });

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
              setDocuments((prev) => {
                if (!prev[category]) {
                  console.warn(
                    `Kategoria ${category} nie istnieje w documents`,
                    prev,
                  );
                  return { ...prev };
                }
                const filteredDocs = prev[category].filter(
                  (doc) => String(doc.id) !== documentId,
                );
                console.log('Przefiltrowane dokumenty:', filteredDocs);
                const updatedDocs = {
                  ...prev,
                  [category]: filteredDocs,
                };
                console.log('Stan po usunięciu:', updatedDocs);
                return updatedDocs;
              });
              Alert.alert('Sukces', 'Dokument został usunięty');
            } catch (err) {
              console.error('Błąd podczas usuwania dokumentu:', err);
              Alert.alert(
                'Błąd',
                `Nie udało się usunąć dokumentu: ${err.message}`,
              );
            }
          },
        },
      ],
    );
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

      if (sort === 'date_asc') {
        return dateA - dateB;
      }
      if (sort === 'date_desc') {
        return dateB - dateA;
      }
      if (sort === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sort === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return filteredDocs;
  };

  const sortOptions = [
    { label: 'Data rosnąco', value: 'date_asc' },
    { label: 'Data malejąco', value: 'date_desc' },
    { label: 'Nazwa rosnąco', value: 'name_asc' },
    { label: 'Nazwa malejąco', value: 'name_desc' },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={styles.loadingText}>Ładowanie dokumentów...</Text>
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
          Spróbuj ponownie
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
          {i18n.t('managementDocuments')}
        </Text>
      </View>
      {documentCategories.map((category) => {
        const filteredDocuments = applyFiltersAndSort(
          category.category,
          documents[category.category] || [],
        );
        console.log(
          `Renderowanie kategorii ${category.category}:`,
          filteredDocuments,
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
                  <Text>Sortuj:</Text>{' '}
                  {sortBy[category.category] || 'Data malejąco'}
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
                    <Text style={styles.modalTitle}>Wybierz sortowanie</Text>
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
                      <Text style={styles.modalCloseButtonText}>Zamknij</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </TouchableOpacity>
              </Modal>
              {filteredDocuments.length === 0 ? (
                <Text style={styles.noData}>
                  {i18n.t('noDocuments') || 'Brak dokumentów do wyświetlenia'}
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
