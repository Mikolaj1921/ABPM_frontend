import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function WniosekUrlopowyScreen({ navigation, route }) {
  const { category, document } = route.params;

  const [formData, setFormData] = useState({
    employeeName: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    console.log('Saving Wniosek Urlopowy:', { category, document, formData });
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Wniosek Urlopowy</Text>
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
        label="Leave Type"
        value={formData.leaveType}
        onChangeText={(text) => handleInputChange('leaveType', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Start Date (DD/MM/YYYY)"
        value={formData.startDate}
        onChangeText={(text) => handleInputChange('startDate', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="End Date (DD/MM/YYYY)"
        value={formData.endDate}
        onChangeText={(text) => handleInputChange('endDate', text)}
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: '#001426FF' } }}
      />
      <TextInput
        label="Reason"
        value={formData.reason}
        onChangeText={(text) => handleInputChange('reason', text)}
        mode="outlined"
        multiline
        numberOfLines={3}
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
        onPress={() => navigation.goBack()}
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
