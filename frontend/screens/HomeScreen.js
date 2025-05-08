import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import {
  Card,
  Button,
  Text,
  List,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import axios from 'axios';
import { LanguageContext } from '../contexts/LanguageContext';

const documentCategories = [
  {
    id: '1',
    nameKey: 'handloweiOfertowe',
    navigator: 'Handlowe',
    category: 'Dokumenty Handlowe i Ofertowe',
  },
  {
    id: '2',
    nameKey: 'finansowe',
    navigator: 'Finansowe',
    category: 'Faktury',
  },
  {
    id: '3',
    nameKey: 'kadrowe',
    navigator: 'Kadrowe',
    category: 'Kadrowe',
  },
];

const HomeScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState(null);
  const [templates, setTemplates] = useState({});
  const paperTheme = usePaperTheme();
  const { i18n } = useContext(LanguageContext);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const responses = await Promise.all(
          documentCategories.map((category) =>
            axios
              .get('http://192.168.1.105:5000/api/templates', {
                params: { category: category.category },
              })
              .then((response) => ({
                category: category.category,
                data: response.data,
              })),
          ),
        );

        const templatesData = responses.reduce((acc, { category, data }) => {
          acc[category] = data;
          return acc;
        }, {});

        setTemplates(templatesData);
      } catch (error) {
        console.error('Błąd podczas pobierania szablonów:', error);
      }
    };
    fetchTemplates();
  }, []);

  const handleAccordionPress = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleAction = (action, category, template) => {
    navigation.navigate('Documents', {
      screen: category.navigator,
      params: {
        screen: (() => {
          if (action === 'Edit') return 'EditScreen';
          if (action === 'Preview') return 'PreviewScreen';
          return 'GenerateScreen';
        })(),
        params: { category, template },
      },
    });
  };

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
          {i18n.t('documentCategories')}
        </Text>
      </View>

      {documentCategories.map((category) => (
        <List.Accordion
          key={category.id}
          title={i18n.t(category.nameKey)}
          titleStyle={[styles.cardTitle, { color: paperTheme.colors.text }]}
          expanded={expanded === category.id}
          onPress={() => handleAccordionPress(category.id)}
          style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}
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
                  onPress={() => handleAction('Edit', category, template)}
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
                <Button
                  onPress={() => handleAction('Preview', category, template)}
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
                  {i18n.t('preview')}
                </Button>
                <Button
                  onPress={() => handleAction('Generate', category, template)}
                  style={styles.button}
                  mode="contained"
                  labelStyle={styles.buttonText}
                  theme={{ colors: { primary: paperTheme.colors.primary } }}
                >
                  {i18n.t('generate')}
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </List.Accordion>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 50,
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  templateCard: {
    marginVertical: 10,
    marginHorizontal: 0,
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
});
export default HomeScreen;
