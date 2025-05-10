import React, { useContext, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
// eslint-disable-next-line
import WebView from 'react-native-webview';
import { LanguageContext } from '../../contexts/LanguageContext';

export default function PreviewScreen({ route, navigation }) {
  const { document } = route.params || {};
  const { i18n } = useContext(LanguageContext);
  const paperTheme = useTheme();
  const [loading, setLoading] = useState(true);

  // Używamy file_path, jeśli url nie istnieje
  const documentUrl = document?.url || document?.file_path;

  if (!document || !documentUrl) {
    return (
      <View style={styles.center}>
        <Text style={[styles.error, { color: paperTheme.colors.error }]}>
          {i18n.t('noDocument') || 'Brak dokumentu do wyświetlenia'}
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          {i18n.t('back') || 'Wróć'}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: paperTheme.colors.text }]}>
          {document.name || i18n.t('documentPreview') || 'Podgląd dokumentu'}
        </Text>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          labelStyle={{ color: paperTheme.colors.primary }}
        >
          {i18n.t('back') || 'Wróć'}
        </Button>
      </View>
      <WebView
        source={{ uri: documentUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setLoading(false);
        }}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
          <Text style={styles.loadingText}>
            {i18n.t('loading') || 'Ładowanie dokumentu...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    borderColor: '#001426FF',
  },
  webview: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#001426FF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#001426FF',
  },
});
