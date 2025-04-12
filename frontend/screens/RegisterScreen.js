import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: new Date(),
    showDatePicker: false,
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = () => {
    // Add validation and API call logic later
    if (form.password !== form.confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    // eslint-disable-next-line no-console
    console.log('Registration data:', form);
    // navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          label="First Name"
          value={form.firstName}
          onChangeText={(text) => handleChange('firstName', text)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Last Name"
          value={form.lastName}
          onChangeText={(text) => handleChange('lastName', text)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Date of Birth"
          value={form.dob.toLocaleDateString()}
          mode="outlined"
          style={styles.input}
          onFocus={() => handleChange('showDatePicker', true)}
        />

        {form.showDatePicker && (
          <DateTimePicker
            value={form.dob}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              handleChange('showDatePicker', false);
              if (selectedDate) handleChange('dob', selectedDate);
            }}
          />
        )}

        <TextInput
          label="Email"
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Password"
          value={form.password}
          onChangeText={(text) => handleChange('password', text)}
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />

        <TextInput
          label="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(text) => handleChange('confirmPassword', text)}
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />

        <Button mode="contained" onPress={handleRegister} style={styles.button}>
          <Text>Register</Text>
        </Button>

        <Button
          onPress={() => navigation.navigate('Login')}
          style={styles.link}
        >
          <Text>Already have an account? Log In</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    marginTop: 50,
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#001426',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#001426',
    marginTop: 10,
  },
  link: {
    marginTop: 15,
  },
});

export default RegisterScreen;
