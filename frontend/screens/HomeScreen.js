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
import { FontAwesome } from '@expo/vector-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { AuthContext } from '../contexts/AuthContext';
import { fetchDocuments, fetchTemplates } from '../api';
import OfertaHandlowaScreen from './documentScreens/handloweiOfertowe/OfertaHandlowaScreen';
import UmowaOPraceScreen from './documentScreens/kadroweiAdministracyjne/UmowaOPraceScreen';
import FakturaVATScreen from './documentScreens/finansowe/FakturaVATScreen';

const categoryIcons = {
  Handlowe: 'briefcase',
  Faktury: 'dollar',
  Kadrowe: 'users',
};

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
    icon: 'file-invoice-dollar',
  },
  {
    id: '3',
    nameKey: 'kadrowe',
    category: 'Kadrowe',
    icon: 'users',
  },
];

const HomeScreen = ({ navigation, route }) => {
  const [expanded, setExpanded] = useState(null);
  const [templates, setTemplates] = useState({});
  const [documents, setDocuments] = useState({});
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
        setError(i18n.t('no_token_error'));
        navigation.navigate('Login');
        return;
      }

      if (!user) {
        const result = await retryFetchUser();
        if (!result.success) {
          setError(i18n.t('user_fetch_error'));
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
      setError(i18n.t('data_fetch_error'));
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user, retryFetchUser, navigation, i18n]);

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
      <View
        style={styles.center}
        accessible
        accessibilityLabel={i18n.t('loading')}
        accessibilityRole="alert"
      >
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={styles.loadingText}>{i18n.t('loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={styles.center}
        accessible
        accessibilityLabel={error}
        accessibilityRole="alert"
      >
        <Text
          style={[styles.error, { color: paperTheme.colors.error }]}
          accessibilityLabel={error}
        >
          {error}
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
          accessibilityLabel={i18n.t('back_to_login')}
          accessibilityHint={i18n.t('back_to_login_hint')}
          accessibilityRole="button"
        >
          {i18n.t('back_to_login')}
        </Button>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={i18n.t('home_screen')}
    >
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
        accessibilityLabel={i18n.t('edit_document_modal')}
        accessibilityHint={i18n.t('edit_document_modal_hint')}
      >
        {selectedCategory &&
          selectedTemplate &&
          (selectedCategory.category === 'Kadrowe' ? (
            <UmowaOPraceScreen
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
          ) : selectedCategory.category === 'Faktury' ? (
            <FakturaVATScreen
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
          ) : (
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
          ))}
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
        accessibilityLabel={i18n.t('document_list')}
      >
        <View style={styles.headerContainer}>
          <Text
            style={[styles.header, { color: paperTheme.colors.text }]}
            accessibilityRole="header"
            accessibilityLabel={i18n.t('documentCategories')}
          >
            {i18n.t('documentCategories')}
          </Text>
        </View>

        {documentCategories.map((category) => (
          <List.Accordion
            key={category.id}
            title={
              <View style={styles.titleContainer}>
                <FontAwesome
                  name={categoryIcons[category.category] || 'folder'}
                  size={24}
                  color={paperTheme.colors.text}
                  style={styles.icon}
                  accessibilityLabel={i18n.t(`${category.nameKey}_icon`)}
                />
                <Text
                  style={[styles.cardTitle, { color: paperTheme.colors.text }]}
                  ellipsizeMode="clip"
                >
                  {i18n.t(category.nameKey)}
                </Text>
              </View>
            }
            expanded={expanded === category.id}
            onPress={() => handleAccordionPress(category.id)}
            style={[
              styles.card,
              { backgroundColor: paperTheme.colors.surface },
            ]}
            theme={{ colors: { background: paperTheme.colors.surface } }}
            accessibilityLabel={i18n.t(`${category.nameKey}_category`)}
            accessibilityHint={i18n.t('expand_category_hint')}
            accessibilityRole="button"
          >
            {(templates[category.category] || []).map((template) => (
              <Card
                key={template.id}
                style={[
                  styles.templateCard,
                  { backgroundColor: paperTheme.colors.surface },
                ]}
                accessible
                accessibilityLabel={`${i18n.t('template')}: ${template.name}`}
              >
                <Card.Title
                  title={template.name}
                  titleStyle={[
                    styles.templateTitle,
                    { color: paperTheme.colors.text },
                  ]}
                  accessibilityLabel={template.name}
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
                    accessibilityLabel={i18n.t('edit_template', {
                      name: template.name,
                    })}
                    accessibilityHint={i18n.t('edit_template_hint')}
                    accessibilityRole="button"
                  >
                    {i18n.t('edit')}
                  </Button>
                </Card.Actions>
              </Card>
            ))}
          </List.Accordion>
        ))}
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
    shadowOpacity: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 5,
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: 8,
    marginRight: 10,
    overflow: 'visible',
  },
  cardTitle: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    overflow: 'visible',
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#424242',
  },
});

export default HomeScreen;
