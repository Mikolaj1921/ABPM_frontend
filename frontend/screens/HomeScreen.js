import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Text, List } from 'react-native-paper';

const documentCategories = [
  {
    id: '1',
    name: 'Dokumenty Handlowe i Ofertowe',
    navigator: 'Handlowe',
    templates: [
      { name: 'Oferta Handlowa', screen: 'OfertaHandlowa' },
      { name: 'Umowa Sprzedaży', screen: 'UmowaSprzedazy' },
      { name: 'Zapytanie Ofertowe', screen: 'ZapytanieOfertowe' },
    ],
  },
  {
    id: '2',
    name: 'Dokumenty Finansowe',
    navigator: 'Finansowe',
    templates: [
      { name: 'Faktura VAT', screen: 'FakturaVAT' },
      { name: 'Nota Księgowa', screen: 'NotaKsiegowa' },
      { name: 'Wezwanie do Zapłaty', screen: 'WezwanieDoZaplaty' },
    ],
  },
  {
    id: '3',
    name: 'Dokumenty Kadrowe i Administracyjne',
    navigator: 'Kadrowe',
    templates: [
      { name: 'Umowa o Pracę', screen: 'UmowaOPrace' },
      {
        name: 'Zaświadczenie o Zatrudnieniu',
        screen: 'ZaswiadczenieOZatrudnieniu',
      },
      { name: 'Wniosek Urlopowy', screen: 'WniosekUrlopowy' },
    ],
  },
];

const HomeScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState(null);

  const handleAccordionPress = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleAction = (action, category, template) => {
    navigation.navigate('Documents', {
      screen: category.navigator,
      params: {
        screen: template.screen,
        params: { category, document: template.name },
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Document Categories</Text>

      {documentCategories.map((category) => (
        <List.Accordion
          key={category.id}
          title={category.name}
          titleStyle={styles.cardTitle}
          expanded={expanded === category.id}
          onPress={() => handleAccordionPress(category.id)}
          style={styles.card}
        >
          {category.templates.map((template) => (
            <Card key={template.name} style={styles.templateCard}>
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
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    fontSize: 24,
    FONTWEIGHT: 'bold',
    color: '#001426FF',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 8,
  },
  cardTitle: {
    color: '#001426FF',
    fontWeight: 'bold',
  },
  templateCard: {
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  templateTitle: {
    color: '#424242',
    fontSize: 16,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
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
