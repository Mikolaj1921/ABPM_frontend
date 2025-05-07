import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  Dimensions,
  View,
  Button,
  ActivityIndicator,
} from 'react-native';
import HTML from 'react-native-render-html';
import axios from 'axios';

const PreviewScreen = ({ route, navigation }) => {
  const { template, formData } = route.params || {};
  const [templateContent, setTemplateContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pobieranie szablonu z API
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!template || !template.id) {
        setError('Brak danych szablonu.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          'http://192.168.1.105:5000/api/templates',
          { params: { id: template.id } },
        );
        const templates = response.data;
        const matchingTemplate = templates.find((t) => t.id === template.id);
        if (matchingTemplate && matchingTemplate.content) {
          setTemplateContent(matchingTemplate.content);
        } else {
          setError('Nie znaleziono szablonu o podanym ID.');
        }
      } catch (err) {
        setError(`Błąd podczas pobierania szablonu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [template]);

  // Sprawdzenie, czy dane istnieją
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#001426FF" />
        <Text style={styles.loadingText}>Ładowanie szablonu...</Text>
      </View>
    );
  }

  if (error || !templateContent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'Błąd: Brak szablonu do wyświetlenia podglądu.'}
        </Text>
        <Button
          title="Wróć"
          onPress={() => navigation.navigate('Home')}
          color="#001426FF"
        />
      </View>
    );
  }

  // Funkcja do podstawiania danych w szablonie
  const fillTemplate = (templateContent, data) => {
    let filledContent = templateContent;

    // Podstawianie pojedynczych pól
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'products') {
          const placeholder = `{{${key}}}`;
          filledContent = filledContent.replace(
            new RegExp(placeholder, 'g'),
            value || '-',
          );
        }
      }
    }

    // Obsługa listy produktów/usług
    if (data && Array.isArray(data.products) && data.products.length > 0) {
      let productHtml = data.products
        .map((product) => {
          return `
            <div class="product-item">
              <div>${product.nazwa_uslugi_towaru || '-'}</div>
              <div>${product.ilosc || '-'}</div>
              <div>${product.cena_netto || '-'}</div>
              <div>${product.wartosc_netto || '-'}</div>
            </div>`;
        })
        .join('');
      filledContent = filledContent.replace(
        '<div class="products"></div>',
        productHtml,
      );
    } else {
      // Jeśli 'products' jest undefined lub pusty, dodaj placeholder
      filledContent = filledContent.replace(
        '<div class="products"></div>',
        '<div class="no-products">Brak produktów</div>',
      );
    }

    return filledContent;
  };

  // Wypełniamy szablon danymi
  const filledContent = fillTemplate(templateContent, formData);

  // Szerokość ekranu do renderowania HTML
  const contentWidth = Dimensions.get('window').width - 40;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Podgląd Dokumentu: Oferta Handlowa</Text>
      <HTML
        source={{ html: filledContent }}
        contentWidth={contentWidth}
        baseStyle={{
          fontSize: 16,
          color: '#424242',
          lineHeight: 24,
          fontFamily: 'Arial, sans-serif',
        }}
        tagsStyles={{
          h1: {
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 20,
            color: '#001426FF',
            textAlign: 'center',
          },
          p: {
            marginBottom: 12,
            paddingHorizontal: 5,
          },
          strong: {
            fontWeight: 'bold',
          },
          table: {
            borderWidth: 1,
            borderColor: '#ccc',
            marginVertical: 15,
          },
          th: {
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            backgroundColor: '#e0e0e0',
            fontWeight: 'bold',
            textAlign: 'center',
          },
          td: {
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            textAlign: 'center',
          },
          div: {
            marginBottom: 10,
          },
        }}
      />
      <Button
        title="Wróć"
        onPress={() => navigation.goBack()}
        color="#001426FF"
        style={styles.backButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#001426FF',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#001426FF',
    marginTop: 10,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
  },
});

export default PreviewScreen;
