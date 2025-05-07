import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Text, List } from 'react-native-paper';
import axios from 'axios';

const documentCategories = [
  {
    id: '1',
    name: 'Dokumenty Handlowe i Ofertowe',
    navigator: 'Handlowe',
    category: 'Dokumenty Handlowe i Ofertowe',
  },
  {
    id: '2',
    name: 'Dokumenty Finansowe',
    navigator: 'Finansowe',
    category: 'Faktury',
  },
  {
    id: '3',
    name: 'Dokumenty Kadrowe i Administracyjne',
    navigator: 'Kadrowe',
    category: 'Kadrowe',
  },
];

const HomeScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState(null);
  const [templates, setTemplates] = useState({});

  useEffect(() => {
    const fetchTemplates = async () => {
      for (const category of documentCategories) {
        try {
          const response = await axios.get(
            'http://192.168.1.105:5000/api/templates',
            {
              params: { category: category.category },
            },
          );
          setTemplates((prev) => ({
            ...prev,
            [category.category]: response.data,
          }));
        } catch (error) {
          //console.error(
          //`Błąd podczas pobierania szablonów dla ${category.category}:`,
          //error,
          //);
        }
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
        screen:
          action === 'Edit'
            ? 'EditScreen'
            : action === 'Preview'
              ? 'PreviewScreen'
              : 'GenerateScreen',
        params: { category, template },
      },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      <Text style={styles.header}>Document Categories</Text>

      {documentCategories.map((category) => (
        <List.Accordion
          key={category.id}
          title={category.name}
          titleStyle={styles.cardTitle}
          expanded={expanded === category.id}
          onPress={() => handleAccordionPress(category.id)}
          style={styles.card}
          theme={{ colors: { background: '#FFFFFF' } }}
        >
          {(templates[category.category] || []).map((template) => (
            <Card key={template.id} style={styles.templateCard}>
              <Card.Title
                title={template.name}
                titleStyle={styles.templateTitle}
              />
              <Card.Actions style={styles.cardActions}>
                <Button
                  onPress={() => handleAction('Edit', category, template)}
                  style={styles.button}
                  mode="outlined"
                  labelStyle={styles.buttonText}
                >
                  Edit
                </Button>
                <Button
                  onPress={() => handleAction('Preview', category, template)}
                  style={styles.button}
                  mode="outlined"
                  labelStyle={styles.buttonText}
                >
                  Preview
                </Button>
                <Button
                  onPress={() => handleAction('Generate', category, template)}
                  style={styles.button}
                  mode="contained"
                  labelStyle={styles.buttonText}
                >
                  Generate
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 20,
    paddingBottom: 80,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001426FF',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 5,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 8,
    marginVertical: 5,
  },
  cardTitle: {
    color: '#001426FF',
    fontWeight: 'bold',
  },
  templateCard: {
    marginVertical: 10,
    marginHorizontal: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  templateTitle: {
    color: '#424242',
    fontSize: 16,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 3,
    paddingBottom: 10,
  },
  button: {
    marginHorizontal: 4,
    borderColor: '#001426FF',
  },
  buttonText: {
    color: '#001426FF',
  },
});

export default HomeScreen;
