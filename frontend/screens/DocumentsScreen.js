import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Linking,
  Alert,
} from 'react-native';
import {
  Card,
  IconButton,
  Searchbar,
  Button,
  List,
  Menu,
  Divider,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';
import { fetchDocuments, deleteDocument } from '../api';

const documentCategories = [
  { id: '1', nameKey: 'handloweiOfertowe', category: 'Handlowe' },
  { id: '2', nameKey: 'finansowe', category: 'Faktury' },
  { id: '3', nameKey: 'kadrowe', category: 'Kadrowe' },
];

const validCategories = documentCategories.map((cat) => cat.category);

const typeToCategory = {
  'Oferta Handlowa': 'Handlowe',
  Faktura: 'Faktury',
  Kadrowy: 'Kadrowe',
};

const LeftIcon = () => <IconButton icon="check-circle" color="green" />;
const MenuIcon = ({ onPress }) => (
  <IconButton icon="dots-vertical" color="#001426FF" onPress={onPress} />
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
    // Pobieranie danych przy pierwszym uruchomieniu
    fetchData();

    // Dodanie listenera na focus ekranu, aby aktualizować dokumenty po dodaniu
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    // Usunięcie listenera przy odmontowaniu komponentu
    return unsubscribe;
  }, [fetchData, navigation]);

  useEffect(() => {
    // Obsługa parametrów z zagnieżdżonej nawigacji
    const params = route.params || {};
    console.log('Route params:', params);

    let newDocument = params.newDocument;
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

  const handleFilterChange = (category, filter) => {
    setFilters((prev) => ({
      ...prev,
      [category]: { ...prev[category], ...filter },
    }));
  };

  const handleSortChange = (category, sort) => {
    setSortBy((prev) => ({ ...prev, [category]: sort }));
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

  const handleDelete = async (document) => {
    const category =
      document.category || typeToCategory[document.type] || 'Handlowe';
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
      } else if (sort === 'date_desc') {
        return dateB - dateA;
      } else if (sort === 'name_asc') {
        return a.name.localeCompare(b.name);
      } else if (sort === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return filteredDocs;
  };

  const renderCard = (category) => (item) => (
    <Card style={styles.card} key={item.id}>
      <Card.Title
        title={item.name}
        subtitle={`${new Date(item.created_at || Date.now()).toLocaleDateString()} | Szablon: ${
          item.template_name || 'Brak'
        }`}
        left={LeftIcon}
        right={() => (
          <Menu
            visible={menuVisible[item.id] || false}
            onDismiss={() =>
              setMenuVisible((prev) => ({ ...prev, [item.id]: false }))
            }
            anchor={
              <MenuIcon
                onPress={() =>
                  setMenuVisible((prev) => ({ ...prev, [item.id]: true }))
                }
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible((prev) => ({ ...prev, [item.id]: false }));
                navigation.navigate('PreviewScreen', {
                  document: item,
                  category,
                });
              }}
              title={i18n.t('preview') || 'Podgląd'}
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible((prev) => ({ ...prev, [item.id]: false }));
                handleDownload(item);
              }}
              title={i18n.t('download') || 'Pobierz'}
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setMenuVisible((prev) => ({ ...prev, [item.id]: false }));
                handleDelete(item);
              }}
              title={i18n.t('delete') || 'Usuń'}
              titleStyle={{ color: 'red' }}
            />
          </Menu>
        )}
      />
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#001426FF" />
        <Text>Ładowanie dokumentów...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Button mode="contained" onPress={fetchData} style={styles.button}>
          Spróbuj ponownie
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
            titleStyle={styles.cardTitle}
            expanded={expanded === category.id}
            onPress={() => handleAccordionPress(category.id)}
            style={styles.card}
          >
            <Searchbar
              placeholder={i18n.t('searchDocuments') || 'Szukaj dokumentów'}
              onChangeText={(query) =>
                handleSearchChange(category.category, query)
              }
              value={searchQueries[category.category] || ''}
              style={styles.searchbar}
            />
            <View style={styles.filterContainer}>
              <Button
                mode="outlined"
                onPress={() =>
                  Alert.alert('Filtr', 'Wybierz typ dokumentu (TODO)', [
                    { text: 'OK' },
                  ])
                }
                style={styles.filterButton}
              >
                Filtr: Typ
              </Button>
              <Button
                mode="outlined"
                onPress={() =>
                  Alert.alert('Filtr', 'Wybierz datę od (TODO)', [
                    { text: 'OK' },
                  ])
                }
                style={styles.filterButton}
              >
                Data od
              </Button>
              <Button
                mode="outlined"
                onPress={() =>
                  Alert.alert('Filtr', 'Wybierz datę do (TODO)', [
                    { text: 'OK' },
                  ])
                }
                style={styles.filterButton}
              >
                Data do
              </Button>
              <Button
                mode="outlined"
                onPress={() =>
                  Alert.alert('Sortuj', 'Wybierz sortowanie', [
                    {
                      text: 'Data rosnąco',
                      onPress: () =>
                        handleSortChange(category.category, 'date_asc'),
                    },
                    {
                      text: 'Data malejąco',
                      onPress: () =>
                        handleSortChange(category.category, 'date_desc'),
                    },
                    {
                      text: 'Nazwa rosnąco',
                      onPress: () =>
                        handleSortChange(category.category, 'name_asc'),
                    },
                    {
                      text: 'Nazwa malejąco',
                      onPress: () =>
                        handleSortChange(category.category, 'name_desc'),
                    },
                    { text: 'Anuluj', style: 'cancel' },
                  ])
                }
                style={styles.filterButton}
              >
                Sortuj: {sortBy[category.category] || 'Data malejąco'}
              </Button>
            </View>
            {filteredDocuments.length === 0 ? (
              <Text style={styles.noData}>
                {i18n.t('noDocuments') || 'Brak dokumentów do wyświetlenia'}
              </Text>
            ) : (
              <View style={styles.list}>
                {filteredDocuments.map(renderCard(category))}
              </View>
            )}
          </List.Accordion>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 10,
    elevation: 4,
    borderRadius: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#001426FF',
  },
  searchbar: {
    marginBottom: 10,
    marginHorizontal: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    marginHorizontal: 10,
  },
  filterButton: {
    marginRight: 10,
    marginBottom: 10,
  },
  list: {
    marginBottom: 10,
  },
  button: {
    marginVertical: 10,
    backgroundColor: '#001426FF',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  noData: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
});
