import React, { useContext, useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Snackbar } from 'react-native-paper';
import { LanguageContext } from '../contexts/LanguageContext';

export default function AccountManagementScreen() {
  const { i18n } = useContext(LanguageContext);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleChangePassword = () => {
    setSnackbarVisible(true);
  };

  const handleDeleteAccount = () => {
    setSnackbarVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{i18n.t('accountManagement')}</Text>
      <Button
        mode="outlined"
        onPress={handleChangePassword}
        style={styles.button}
      >
        {i18n.t('resetPassword')}
      </Button>
      <Button
        mode="contained"
        onPress={handleDeleteAccount}
        style={[styles.button, styles.deleteButton]}
      >
        {i18n.t('deleteAccount') || 'Delete Account'}{' '}
        {/* Tłumaczenie do dodania */}
      </Button>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}
      >
        {i18n.t('underDev')}
      </Snackbar>
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
  button: {
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
  },
});
