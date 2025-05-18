import React, { useContext } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { LanguageContext } from '../contexts/LanguageContext';

export default function HelpScreen() {
  const { i18n } = useContext(LanguageContext);
  const paperTheme = usePaperTheme();

  // Fallback in case i18n is not properly initialized
  if (!i18n || !i18n.t) {
    return (
      <View
        style={styles.container}
        accessibilityLabel={i18n.t('translation_error_label')}
        accessibilityRole="alert"
      >
        <Text style={[styles.error, { color: paperTheme.colors.error }]}>
          {i18n.t('translation_error')}
        </Text>
      </View>
    );
  }

  // FAQ data structured as an array for easier expansion
  const faqItems = [
    {
      question: i18n.t('generateDocumentQuestion'),
      answer: i18n.t('generateDocumentAnswer'),
    },
    {
      question: i18n.t('changePasswordQuestion'),
      answer: i18n.t('changePasswordAnswer'),
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
      accessibilityLabel={i18n.t('help_screen_label')}
      accessibilityRole="dialog"
    >
      <Text
        style={[styles.header, { color: paperTheme.colors.text }]}
        accessibilityRole="header"
        accessibilityLabel={i18n.t('help_support_label')}
      >
        {i18n.t('helpSupport')}
      </Text>
      <Text
        style={[styles.section, { color: paperTheme.colors.text }]}
        accessibilityRole="section"
        accessibilityLabel={i18n.t('faq_section_label')}
      >
        {i18n.t('faq')}
      </Text>
      {faqItems.map((item, index) => (
        <View key={`faq-${index}`}>
          <Text
            style={[styles.question, { color: paperTheme.colors.text }]}
            accessibilityLabel={`${i18n.t('faq_question_label')} ${index + 1}: ${item.question}`}
            accessibilityRole="text"
          >
            {item.question}
          </Text>
          <Text
            style={[styles.answer, { color: paperTheme.colors.text }]}
            accessibilityLabel={`${i18n.t('faq_answer_label')} ${index + 1}: ${item.answer}`}
            accessibilityRole="text"
          >
            {item.answer}
          </Text>
        </View>
      ))}
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
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
