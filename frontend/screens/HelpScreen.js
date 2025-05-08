import React, { useContext } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { LanguageContext } from '../contexts/LanguageContext';

export default function HelpScreen() {
  const { i18n } = useContext(LanguageContext);
  const paperTheme = usePaperTheme();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
    >
      <Text style={[styles.header, { color: paperTheme.colors.text }]}>
        {i18n.t('helpSupport')}
      </Text>
      <Text style={[styles.section, { color: paperTheme.colors.text }]}>
        FAQ:
      </Text>
      <Text style={[styles.question, { color: paperTheme.colors.text }]}>
        How do I generate a document?
      </Text>
      <Text style={[styles.answer, { color: paperTheme.colors.text }]}>
        Go to the Home screen, select a category, and click - Generate.
      </Text>
      <Text style={[styles.question, { color: paperTheme.colors.text }]}>
        How do I change my password?
      </Text>
      <Text style={[styles.answer, { color: paperTheme.colors.text }]}>
        Go to Account Management in Settings and select - Reset Password.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  answer: {
    fontSize: 16,
    marginBottom: 15,
  },
});
