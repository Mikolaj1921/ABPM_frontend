import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Text,
  Modal,
} from 'react-native';
import {
  Card,
  Button,
  List,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../contexts/LanguageContext';
import { AuthContext } from '../contexts/AuthContext';
import { fetchDocuments, fetchTemplates } from '../api';
import OfertaHandlowaScreen from './documentScreens/handloweiOfertowe/OfertaHandlowaScreen';

const documentCategories = [
  {
    id: '1',
    nameKey: 'handloweiOfertowe',
    category: 'Handlowe',
  },
  {
    id: '2',
    nameKey: 'finansowe',
    category: 'Faktury',
  },
  {
    id: '3',
    nameKey: 'kadrowe',
    category: 'Kadrowe',
  },
];

const HomeScreen = ({ navigation, route }) => {
  const [expanded, setExpanded] = useState(null);
  const [templates, setTemplates] = useState({});
  // eslint-disable-next-line
  const [documents, setDocuments] = useState({});
  // eslint-disable-next-line
  const [searchQueries, setSearchQueries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const paperTheme = usePaperTheme();
  const { i18n } = useContext(LanguageContext);
  const { isLoggedIn, user, retryFetchUser } = useContext(AuthContext);

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

      const responses = await Promise.all(
        documentCategories.map(async (category) => {
          const [docData, templateData] = await Promise.all([
            fetchDocuments(category.category),
            fetchTemplates(category.category),
          ]);
          return {
            category: category.category,
            documents: docData || [],
            templates: templateData || [],
          };
        }),
      );

      const templatesData = responses.reduce(
        (acc, { category, templates: categoryTemplates }) => {
          acc[category] = categoryTemplates;
          return acc;
        },
        {},
      );

      const documentsData = responses.reduce(
        (acc, { category, documents: categoryDocuments }) => {
          acc[category] = categoryDocuments;
          return acc;
        },
        {},
      );

      setTemplates(templatesData);
      setDocuments(documentsData);
    } catch (fetchError) {
      console.error('Błąd podczas pobierania danych:', fetchError);
      setError('Błąd podczas ładowania danych');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user, retryFetchUser, navigation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (route.params?.newDocument) {
      const category = route.params.newDocument.category || 'Handlowe';
      setDocuments((prev) => ({
        ...prev,
        [category]: [route.params.newDocument, ...(prev[category] || [])],
      }));
    }
    if (route.params?.refetch) {
      fetchData();
    }
  }, [route.params?.newDocument, route.params?.refetch, fetchData]);

  const handleAccordionPress = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  // eslint-disable-next-line
  const handleSearchChange = (category, query) => {
    setSearchQueries((prev) => ({ ...prev, [category]: query }));
  };

  const handleEdit = (category, template, document = null) => {
    setSelectedCategory(category);
    setSelectedTemplate(template);
    setSelectedDocument(document);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCategory(null);
    setSelectedTemplate(null);
    setSelectedDocument(null);
  };

  const handleSaveDocument = (newDocument) => {
    setDocuments((prev) => ({
      ...prev,
      [newDocument.category || 'Handlowe']: [
        newDocument,
        ...(prev[newDocument.category || 'Handlowe'] || []),
      ],
    }));
    handleCloseModal();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text>Ładowanie danych...</Text>
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
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          Wróć do logowania
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        {selectedCategory && selectedTemplate && (
          <OfertaHandlowaScreen
            route={{
              params: {
                category: selectedCategory,
                template: selectedTemplate,
                document: selectedDocument,
              },
            }}
            navigation={{ navigate: handleCloseModal }}
            onSave={handleSaveDocument}
          />
        )}
      </Modal>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { backgroundColor: paperTheme.colors.background },
        ]}
        style={[
          styles.scrollView,
          { backgroundColor: paperTheme.colors.background },
        ]}
      >
        <View style={styles.headerContainer}>
          <Text style={[styles.header, { color: paperTheme.colors.text }]}>
            {i18n.t('documentCategories')}
          </Text>
        </View>

        {documentCategories.map((category) => {
          return (
            <List.Accordion
              key={category.id}
              title={i18n.t(category.nameKey)}
              titleStyle={[styles.cardTitle, { color: paperTheme.colors.text }]}
              expanded={expanded === category.id}
              onPress={() => handleAccordionPress(category.id)}
              style={[
                styles.card,
                { backgroundColor: paperTheme.colors.surface },
              ]}
              theme={{ colors: { background: paperTheme.colors.surface } }}
            >
              {(templates[category.category] || []).map((template) => (
                <Card
                  key={template.id}
                  style={[
                    styles.templateCard,
                    { backgroundColor: paperTheme.colors.surface },
                  ]}
                >
                  <Card.Title
                    title={template.name}
                    titleStyle={[
                      styles.templateTitle,
                      { color: paperTheme.colors.text },
                    ]}
                  />
                  <Card.Actions style={styles.cardActions}>
                    <Button
                      onPress={() => handleEdit(category, template)}
                      style={[
                        styles.button,
                        { borderColor: paperTheme.colors.primary },
                      ]}
                      mode="outlined"
                      labelStyle={[
                        styles.buttonText,
                        { color: paperTheme.colors.primary },
                      ]}
                    >
                      {i18n.t('edit')}
                    </Button>
                  </Card.Actions>
                </Card>
              ))}
            </List.Accordion>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 50,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  card: {
    marginBottom: 5,
    elevation: 2,
    borderRadius: 8,
    marginVertical: 5,
    shadowOpacity: 0, // Wyłączamy cień na iOS
    shadowColor: 'transparent', // Zapewniamy brak cienia na iOS
    shadowOffset: { width: 0, height: 0 }, // Brak przesunięcia cienia
    shadowRadius: 0, // Brak rozmycia cienia
    borderWidth: 1,
    borderColor: '#CCC',
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  templateCard: {
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  templateTitle: {
    fontSize: 16,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 3,
    paddingBottom: 10,
  },
  button: {
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: 14,
  },

  error: {
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default HomeScreen;
