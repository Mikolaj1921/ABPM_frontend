import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, BackHandler } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function ZaswiadczenieOZatrudnieniuScreen({
  navigation,
  route,
}) {
  const { category, document } = route.params;

  const [formData, setFormData] = useState({
    employeeName: '',
    position: '',
    employmentStartDate: '',
    salary: '',
    issueDate: '',
  });

  // Obsługa sprzętowego przycisku "Wróć"
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Home'); // Wracamy do HomeScreen
      return true; // Zwracamy true, aby potwierdzić obsłużenie zdarzenia
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove(); // Usuwamy listener przy odmontowaniu komponentu
  }, [navigation]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    console.log('Saving Zaświadczenie o Zatrudnieniu:', {
      category,
      document,
      formData,
    });
    navigation.navigate('Home');
  };

  const handleCancel = () => {
    navigation.navigate('Home');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Zaświadczenie o Zatrudnieniu</Text>
      <Text style={styles.subtitle}>Category: {category.name}</Text>

      <TextInput
        label="Employee Name"
        value={formData.employeeName}
        onChangeText={(text) => handleInputChange('employeeName', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Position"
        value={formData.position}
        onChangeText={(text) => handleInputChange('position', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Employment Start Date (DD/MM/YYYY)"
        value={formData.employmentStartDate}
        onChangeText={(text) => handleInputChange('employmentStartDate', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Salary"
        value={formData.salary}
        onChangeText={(text) => handleInputChange('salary', text)}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Issue Date (DD/MM/YYYY)"
        value={formData.issueDate}
        onChangeText={(text) => handleInputChange('issueDate', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        style={styles.saveButton}
        labelStyle={styles.buttonText}
      >
        Save
      </Button>
      <Button
        mode="outlined"
        onPress={handleCancel}
        style={styles.cancelButton}
        labelStyle={styles.buttonText}
      >
        Cancel
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001426FF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  saveButton: {
    marginVertical: 10,
    backgroundColor: '#001426FF',
  },
  cancelButton: {
    marginVertical: 5,
    borderColor: '#001426FF',
  },
  buttonText: {
    color: '#FFFFFF',
  },
});
