import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import {
  Card,
  Button,
  List,
  useTheme as usePaperTheme,
  Avatar,
  ProgressBar,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { fetchDocuments, fetchTemplates } from '../api';
import OfertaHandlowaScreen from './documentScreens/handloweiOfertowe/OfertaHandlowaScreen';
import UmowaOPraceScreen from './documentScreens/kadroweiAdministracyjne/UmowaOPraceScreen';
import FakturaVATScreen from './documentScreens/finansowe/FakturaVATScreen';

const categoryIcons = {
  Handlowe: 'briefcase',
  Faktury: 'bank',
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const paperTheme = usePaperTheme();
  const { i18n } = useContext(LanguageContext);
  const { isLoggedIn, user, retryFetchUser } = useContext(AuthContext);
  const { colors } = useTheme();

  const tips = [
    {
      id: '1',
      text: i18n.t('tip_1'),
      icon: 'clock-o',
    },
    {
      id: '3',
      text: i18n.t('tip_3'),
      icon: 'check-circle',
    },
  ];

  const fetchData = useCallback(
    async (source = 'initial') => {
      try {
        //console.log(`Rozpoczęto pobieranie danych (${source})`);
        setLoading(true);
        setError('');
        setDocuments({});
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
            const validDocuments = (categoryDocuments || []).filter(
              (doc) => doc && doc.id,
            );
            acc[category] = validDocuments;
            return acc;
          },
          {},
        );

        setTemplates(templatesData);
        setDocuments(documentsData);
        /*console.log(
          'Pobrano dokumenty:',
          JSON.stringify(documentsData, null, 2),
        );*/
      } catch (fetchError) {
        console.error('Błąd podczas pobierania danych:', fetchError);
        setError(i18n.t('data_fetch_error'));
      } finally {
        setLoading(false);
      }
    },
    [isLoggedIn, user, retryFetchUser, navigation, i18n],
  );

  useFocusEffect(
    useCallback(() => {
      fetchData('navigation');
    }, [fetchData]),
  );

  useEffect(() => {
    const allDocs = Object.values(documents).flat();
    const uniqueDocs = [...new Set(allDocs.map((doc) => doc.id))].map((id) =>
      allDocs.find((doc) => doc.id === id),
    );
    const totalDocs = uniqueDocs.filter((doc) => doc && doc.id).length;
    /*console.log(
      'Aktualny stan dokumentów:',
      JSON.stringify(documents, null, 2),
    );*/ /*
    console.log(
      'Unikalne dokumenty:',
      uniqueDocs.map((doc) => ({ id: doc.id, name: doc.name })),
    );*/
    //console.log('Liczba dokumentów:', totalDocs);
  }, [documents]);

  const handleAccordionPress = (id) => {
    setExpanded(expanded === id ? null : id);
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

  const handleOpenTemplateModal = () => {
    setTemplateModalVisible(true);
  };

  const handleCloseTemplateModal = () => {
    setTemplateModalVisible(false);
  };

  const handleSelectTemplate = (category, template) => {
    setSelectedCategory(category);
    setSelectedTemplate(template);
    setSelectedDocument(null);
    setTemplateModalVisible(false);
    setModalVisible(true);
  };

  const handleViewAllDocuments = (category) => {
    navigation.navigate('DocumentList', { category: category.category });
  };

  const handleLogoPress = () => {
    //console.log('Kliknięto logo, wyświetlanie nazwy aplikacji');
    Alert.alert(i18n.t('app_title'), 'Automation of Bureaucratic Processes', [
      { text: i18n.t('ok'), style: 'default' },
    ]);
  };

  const allTemplates = documentCategories.flatMap((category) =>
    (templates[category.category] || []).map((template) => ({
      category,
      template,
    })),
  );

  const allDocs = Object.values(documents).flat();
  const uniqueDocs = [...new Set(allDocs.map((doc) => doc.id))].map((id) =>
    allDocs.find((doc) => doc.id === id),
  );
  const totalDocuments = uniqueDocs.filter((doc) => doc && doc.id).length;
  const totalTemplates = Object.values(templates)
    .flat()
    .filter((template) => template && template.id).length;
  const activeCategories = documentCategories.filter(
    (cat) =>
      (templates[cat.category]?.length || 0) > 0 ||
      (documents[cat.category]?.length || 0) > 0,
  ).length;

  if (loading) {
    return (
      <View
        style={[styles.center, { backgroundColor: colors.background }]}
        accessible
        accessibilityLabel={i18n.t('loading')}
        accessibilityRole="alert"
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {i18n.t('loading')}
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
        <Text
          style={[styles.error, { color: colors.error }]}
          accessibilityLabel={error}
        >
          {error}
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login')}
          style={[styles.button, { backgroundColor: colors.primary }]}
          labelStyle={[styles.buttonText, { color: colors.surface }]}
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
      style={[styles.container, { backgroundColor: colors.background }]}
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
              onSave={(newDocument) => {
                //console.log('Zapisano nowy dokument:', newDocument);
                setDocuments((prev) => {
                  const category = newDocument.category || 'Handlowe';
                  const existingDocs = prev[category] || [];
                  if (existingDocs.some((doc) => doc.id === newDocument.id)) {
                    console.warn(
                      'Dokument o ID',
                      newDocument.id,
                      'już istnieje, pomijanie.',
                    );
                    return prev;
                  }
                  const updatedDocs = {
                    ...prev,
                    [category]: [newDocument, ...existingDocs],
                  };
                  /*console.log(
                    'Zaktualizowany stan dokumentów:',
                    JSON.stringify(updatedDocs, null, 2),
                  );*/
                  return updatedDocs;
                });
                handleCloseModal();
                fetchData('document-save');
              }}
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
              onSave={(newDocument) => {
                //console.log('Zapisano nowy dokument:', newDocument);
                setDocuments((prev) => {
                  const category = newDocument.category || 'Handlowe';
                  const existingDocs = prev[category] || [];
                  if (existingDocs.some((doc) => doc.id === newDocument.id)) {
                    console.warn(
                      'Dokument o ID',
                      newDocument.id,
                      'już istnieje, pomijanie.',
                    );
                    return prev;
                  }
                  const updatedDocs = {
                    ...prev,
                    [category]: [newDocument, ...existingDocs],
                  };
                  /*console.log(
                    'Zaktualizowany stan dokumentów:',
                    JSON.stringify(updatedDocs, null, 2),
                  );*/
                  return updatedDocs;
                });
                handleCloseModal();
                fetchData('document-save');
              }}
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
              onSave={(newDocument) => {
                //console.log('Zapisano nowy dokument:', newDocument);
                setDocuments((prev) => {
                  const category = newDocument.category || 'Handlowe';
                  const existingDocs = prev[category] || [];
                  if (existingDocs.some((doc) => doc.id === newDocument.id)) {
                    console.warn(
                      'Dokument o ID',
                      newDocument.id,
                      'już istnieje, pomijanie.',
                    );
                    return prev;
                  }
                  const updatedDocs = {
                    ...prev,
                    [category]: [newDocument, ...existingDocs],
                  };
                  /*console.log(
                    'Zaktualizowany stan dokumentów:',
                    JSON.stringify(updatedDocs, null, 2),
                  );*/
                  return updatedDocs;
                });
                handleCloseModal();
                fetchData('document-save');
              }}
            />
          ))}
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={templateModalVisible}
        onRequestClose={handleCloseTemplateModal}
        accessibilityLabel={i18n.t('select_template_modal')}
        accessibilityHint={i18n.t('select_template_modal_hint')}
        accessibilityViewIsModal={true}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          ]}
          accessible
          accessibilityLabel={i18n.t('modal_background')}
          accessibilityRole="none"
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
            accessible
            accessibilityLabel={i18n.t('select_template_modal_content')}
            accessibilityRole="dialog"
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {i18n.t('select_template')}
            </Text>
            <FlatList
              data={allTemplates}
              keyExtractor={(item) => `${item.category.id}-${item.template.id}`}
              renderItem={({ item }) => {
                const iconName =
                  categoryIcons[item.category.category] || 'file';
                return (
                  <TouchableOpacity
                    style={[
                      styles.templateItem,
                      { borderBottomColor: colors.accent },
                    ]}
                    onPress={() =>
                      handleSelectTemplate(item.category, item.template)
                    }
                    accessible
                    accessibilityLabel={`${i18n.t('template')}: ${item.template.name}`}
                    accessibilityHint={i18n.t('select_template_hint')}
                    accessibilityRole="button"
                  >
                    <FontAwesome
                      name={iconName}
                      size={20}
                      color={colors.primary}
                      style={styles.templateIcon}
                      accessibilityLabel={i18n.t(
                        `${item.category.nameKey}_icon`,
                      )}
                      accessibilityRole="image"
                    />
                    <Text
                      style={[
                        styles.templateItemText,
                        { color: colors.primary },
                      ]}
                    >
                      {item.template.name} ({i18n.t(item.category.nameKey)})
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={styles.templateList}
              accessibilityLabel={i18n.t('template_list')}
              accessibilityRole="list"
            />
            <Button
              mode="outlined"
              onPress={handleCloseTemplateModal}
              style={[styles.modalButton, { borderColor: colors.primary }]}
              labelStyle={[styles.modalButtonText, { color: colors.primary }]}
              accessibilityLabel={i18n.t('cancel')}
              accessibilityHint={i18n.t('cancel_hint')}
              accessibilityRole="button"
            >
              {i18n.t('cancel')}
            </Button>
          </View>
        </View>
      </Modal>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer]}
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        accessibilityLabel={i18n.t('document_list')}
      >
        <View
          style={[styles.profileContainer, { backgroundColor: colors.surface }]}
          accessible
          accessibilityLabel={i18n.t('user_profile')}
          accessibilityRole="group"
        >
          <View
            style={styles.profileInfo}
            accessible
            accessibilityLabel={i18n.t('profile_info')}
          >
            <Avatar.Text
              size={44}
              label={user?.name?.charAt(0) || 'U'}
              style={[styles.avatar, { backgroundColor: colors.primary }]}
              accessibilityLabel={i18n.t('user_avatar', {
                name: user?.name || 'User',
              })}
              accessibilityRole="image"
            />
            <View style={styles.profileText}>
              <Text
                style={[styles.profileName, { color: colors.text }]}
                accessibilityLabel={i18n.t('profile_name', {
                  name: user?.name || 'User',
                })}
              >
                {user?.name || 'User'}
              </Text>
              <Text
                style={[styles.profileEmail, { color: colors.secondaryText }]}
                accessibilityLabel={i18n.t('profile_email', {
                  email: user?.email || '',
                })}
              >
                {user?.email || ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileLogo}
              onPress={handleLogoPress}
              accessible
              accessibilityLabel={i18n.t('app_logo')}
              accessibilityHint={i18n.t('view_app_name')}
              accessibilityRole="button"
            >
              <Image
                source={require('../assets/images/automation-of-beruaucratic-processes-logo.png')}
                style={styles.profileLogoImage}
                tintColor={colors.primary}
                accessibilityLabel={i18n.t('app_logo_image')}
                accessibilityRole="image"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={styles.tipsContainer}
          accessible
          accessibilityLabel={i18n.t('pro_tips_section')}
          accessibilityRole="group"
        >
          <Text
            style={[styles.tipsTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('pro_tips')}
            accessibilityRole="header"
          >
            {i18n.t('pro_tips')}
          </Text>
          <FlatList
            horizontal
            data={tips}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              return (
                <Card
                  style={[styles.tipCard, { backgroundColor: colors.primary }]}
                  accessible
                  accessibilityLabel={`${i18n.t('tip')}: ${item.text}`}
                  accessibilityRole="text"
                >
                  <Card.Content style={styles.tipContent}>
                    <FontAwesome
                      name={item.icon}
                      size={24}
                      color={colors.surface}
                      style={styles.tipIcon}
                      accessibilityLabel={i18n.t(`tip_${item.id}_icon`)}
                      accessibilityRole="image"
                    />
                    <Text style={[styles.tipText, { color: colors.surface }]}>
                      {item.text}
                    </Text>
                  </Card.Content>
                </Card>
              );
            }}
            showsHorizontalScrollIndicator={false}
            style={styles.tipsList}
            accessibilityLabel={i18n.t('tips_list')}
            accessibilityRole="list"
          />
        </View>
        <View style={styles.headerContainer}>
          <Text
            style={[styles.header, { color: colors.text }]}
            accessibilityRole="header"
            accessibilityLabel={i18n.t('documentCategories')}
          >
            {i18n.t('documentCategories')}
          </Text>
        </View>
        {documentCategories.map((category) => {
          const docCount = (documents[category.category] || []).length;
          const templateCount = (templates[category.category] || []).length;
          const progress = templateCount
            ? Math.min(docCount / templateCount, 1)
            : 0;

          return (
            <View
              key={category.id}
              style={styles.categoryContainer}
              accessible
              accessibilityLabel={i18n.t(`${category.nameKey}_category`)}
              accessibilityRole="group"
            >
              <List.Accordion
                title={
                  <View style={styles.titleContainer}>
                    <FontAwesome
                      name={categoryIcons[category.category] || 'folder'}
                      size={20}
                      color={colors.text}
                      style={styles.icon}
                      accessibilityLabel={i18n.t(`${category.nameKey}_icon`)}
                      accessibilityRole="image"
                    />
                    <View style={styles.titleWrapper}>
                      <Text
                        style={[styles.cardTitle, { color: colors.text }]}
                        accessibilityLabel={i18n.t(category.nameKey)}
                      >
                        {i18n.t(category.nameKey)}
                      </Text>
                      <Text
                        style={[
                          styles.templateCount,
                          { color: colors.secondaryText },
                        ]}
                        accessibilityLabel={i18n.t('templates_count', {
                          count: templateCount,
                        })}
                      >
                        {i18n.t('templates_count', { count: templateCount })}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.circleIndicator,
                        { backgroundColor: colors.primary },
                      ]}
                      accessible
                      accessibilityLabel={i18n.t('templates_count', {
                        count: templateCount,
                      })}
                      accessibilityRole="text"
                    >
                      <Text
                        style={[styles.circleText, { color: colors.surface }]}
                      >
                        {templateCount}
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
                    accessibilityLabel={
                      props.isExpanded
                        ? i18n.t('collapse_category')
                        : i18n.t('expand_category')
                    }
                    accessibilityRole="image"
                  />
                )}
                expanded={expanded === category.id}
                onPress={() => handleAccordionPress(category.id)}
                style={[styles.card, { backgroundColor: colors.surface }]}
                theme={{ colors: { background: colors.surface } }}
                accessibilityLabel={i18n.t(`${category.nameKey}_category`)}
                accessibilityHint={i18n.t('expand_category_hint')}
                accessibilityRole="button"
              >
                <ProgressBar
                  progress={progress}
                  color={colors.primary}
                  style={styles.progressBar}
                  accessibilityLabel={i18n.t('category_progress', {
                    count: docCount,
                    total: templateCount,
                  })}
                  accessibilityRole="progressbar"
                />
                {(templates[category.category] || []).map((template) => {
                  const isTemplateUsed = (
                    documents[category.category] || []
                  ).some((doc) => doc.templateId === template.id);
                  return (
                    <Card
                      key={template.id}
                      style={[
                        styles.templateCard,
                        { backgroundColor: colors.surface },
                      ]}
                      accessible
                      accessibilityLabel={`${i18n.t('template')}: ${template.name}`}
                      accessibilityRole="listitem"
                    >
                      <Card.Title
                        title={template.name}
                        titleStyle={[
                          styles.templateTitle,
                          { color: colors.text },
                        ]}
                        accessibilityLabel={template.name}
                      />
                      <Card.Content>
                        <View style={styles.templateInfo}>
                          <FontAwesome
                            name="file-pdf-o"
                            size={16}
                            color={colors.secondaryText}
                            accessibilityLabel={i18n.t('pdf_format')}
                            accessibilityRole="image"
                          />
                          <Text
                            style={[
                              styles.infoText,
                              { color: colors.secondaryText },
                            ]}
                          >
                            PDF
                          </Text>
                          <FontAwesome
                            name="pencil"
                            size={16}
                            color={colors.secondaryText}
                            style={styles.infoIcon}
                            accessibilityLabel={i18n.t('signature')}
                            accessibilityRole="image"
                          />
                          <Text
                            style={[
                              styles.infoText,
                              { color: colors.secondaryText },
                            ]}
                          >
                            {i18n.t('signature')}
                          </Text>
                          <FontAwesome
                            name="image"
                            size={16}
                            color={colors.secondaryText}
                            style={styles.infoIcon}
                            accessibilityLabel={i18n.t('logo')}
                            accessibilityRole="image"
                          />
                          <Text
                            style={[
                              styles.infoText,
                              { color: colors.secondaryText },
                            ]}
                          >
                            {i18n.t('logo')}
                          </Text>
                        </View>
                      </Card.Content>
                      <Card.Actions style={styles.cardActions}>
                        <Button
                          onPress={() => handleEdit(category, template)}
                          style={[
                            styles.button,
                            { borderColor: colors.primary },
                          ]}
                          mode="outlined"
                          labelStyle={[
                            styles.buttonText,
                            { color: colors.primary },
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
                  );
                })}
              </List.Accordion>
            </View>
          );
        })}
        <View
          style={[
            styles.statsCard,
            { backgroundColor: colors.surface, borderColor: colors.accent },
          ]}
          accessible
          accessibilityLabel={i18n.t('quick_stats')}
          accessibilityRole="group"
        >
          <Card.Title
            title={i18n.t('quick_stats')}
            titleStyle={[styles.statsTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('quick_stats')}
            accessibilityRole="header"
          />
          <Card.Content style={styles.statsContent}>
            <View
              style={[
                styles.statItem,
                { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
              accessible
              accessibilityLabel={`${i18n.t('documents_created')}: ${totalDocuments}`}
              accessibilityRole="text"
            >
              <FontAwesome
                name="file-text-o"
                size={32}
                color={colors.primary}
                accessibilityLabel={i18n.t('documents_icon')}
                accessibilityRole="image"
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
              accessible
              accessibilityLabel={`${i18n.t('templates_used')}: ${totalTemplates}`}
              accessibilityRole="text"
            >
              <FontAwesome
                name="copy"
                size={32}
                color={colors.primary}
                accessibilityLabel={i18n.t('templates_icon')}
                accessibilityRole="image"
              />
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {totalTemplates}
              </Text>
              <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                {i18n.t('templates_used')}
              </Text>
            </View>
            <View
              style={[
                styles.statItem,
                { backgroundColor: colors.accent, borderColor: colors.accent },
              ]}
              accessible
              accessibilityLabel={`${i18n.t('active_categories')}: ${activeCategories}`}
              accessibilityRole="text"
            >
              <FontAwesome
                name="folder-open"
                size={32}
                color={colors.primary}
                accessibilityLabel={i18n.t('categories_icon')}
                accessibilityRole="image"
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
        <View
          style={[
            styles.streamlineBox,
            { backgroundColor: colors.accent, borderColor: colors.primary },
          ]}
          accessible
          accessibilityLabel={i18n.t('hint_homescreen')}
          accessibilityRole="text"
        >
          <FontAwesome
            name="lightbulb-o"
            size={20}
            color={colors.primary}
            style={styles.streamlineIcon}
            accessibilityLabel={i18n.t('hint_icon')}
            accessibilityRole="image"
          />
          <Text style={[styles.streamlineText, { color: colors.text }]}>
            {i18n.t('hint_homescreen')}
          </Text>
        </View>
        <View
          style={[styles.footer, { backgroundColor: colors.primary }]}
          accessible
          accessibilityLabel={i18n.t('footer_label')}
          accessibilityRole="contentinfo"
        >
          <FontAwesome
            name="info-circle"
            size={20}
            color={colors.surface}
            style={styles.footerIcon}
            accessibilityLabel={i18n.t('footer_icon')}
            accessibilityRole="image"
          />
          <Text
            style={[styles.footerText, { color: colors.surface }]}
            accessibilityLabel={i18n.t('footer_label')}
          >
            © 2025 Automation of Bureaucratic Processes. Wersja 1.0.0
          </Text>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleOpenTemplateModal}
        accessible
        accessibilityLabel={i18n.t('create_new_document')}
        accessibilityHint={i18n.t('create_new_document_hint')}
        accessibilityRole="button"
      >
        <FontAwesome
          name="plus"
          size={24}
          color={colors.surface}
          accessibilityLabel={i18n.t('create_new_document_icon')}
          accessibilityRole="image"
        />
      </TouchableOpacity>
    </View>
  );
};

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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 0,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    marginRight: 12,
    width: 44,
    height: 44,
    fontSize: 8,
  },
  profileText: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
  },
  profileLogo: {
    marginLeft: 10,
  },
  profileLogoImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'Roboto',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
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
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 15,
  },
  statsContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
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
  tipsContainer: {
    marginVertical: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipsList: {
    paddingVertical: 5,
  },
  tipCard: {
    width: 200,
    marginRight: 10,
    borderRadius: 12,
    elevation: 3,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  tipIcon: {
    marginRight: 10,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 10,
  },
  card: {
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
  icon: {
    alignSelf: 'center',
    width: 24,
    height: 24,
    marginLeft: 5,
    marginRight: 15,
    overflow: 'visible',
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
  templateCard: {
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 12,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  templateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    flexWrap: 'wrap',
  },
  infoText: {
    fontSize: 12,
    marginLeft: 5,
    marginRight: 15,
  },
  infoIcon: {
    marginLeft: 10,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 3,
    paddingBottom: 10,
  },
  button: {
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  streamlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    marginHorizontal: 10,
    borderWidth: 1,
  },
  streamlineIcon: {
    marginRight: 10,
  },
  streamlineText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 10,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  templateList: {
    marginBottom: 10,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  templateIcon: {
    marginRight: 10,
  },
  templateItemText: {
    fontSize: 16,
  },
  modalButton: {
    borderWidth: 1,
    borderRadius: 8,
  },
  modalButtonText: {},
  progressBar: {
    marginHorizontal: 10,
    marginVertical: 5,
    height: 6,
    borderRadius: 3,
  },
});

export default HomeScreen;
