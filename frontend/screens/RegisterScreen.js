import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { TextInput, Button, Text, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import API from '../api';

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: new Date(),
    showDatePicker: false,
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    phone_prefix: '+48',
  });

  const [menuVisible, setMenuVisible] = useState(false);

  const phonePrefixes = [
    { code: '+48', country: 'Poland' },
    { code: '+49', country: 'Germany' },
    { code: '+44', country: 'UK' },
    { code: '+1', country: 'USA' },
    { code: '+380', country: 'Ukraine' },
    { code: '+33', country: 'France' },
  ];

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    // Walidacja
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone_number
    ) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      Alert.alert('Error', 'Invalid email format');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await API.post('/auth/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number,
        phone_prefix: form.phone_prefix,
        date_of_birth: form.dob.toISOString().split('T')[0],
      });

      Alert.alert('Account created', 'You can now log in');
      navigation.navigate('Login');
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Registration failed',
        err.response?.data?.message || 'Server error',
      );
    }
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

        <View style={styles.phoneRow}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                style={styles.prefixSelector}
                contentStyle={{ flexDirection: 'row', alignItems: 'center' }}
                labelStyle={{ color: '#888' }} // Kolor szary
              >
                {form.phone_prefix}
              </Button>
            }
          >
            {phonePrefixes.map((item) => (
              <Menu.Item
                key={item.code}
                onPress={() => {
                  handleChange('phone_prefix', item.code);
                  setMenuVisible(false);
                }}
                title={`${item.country} (${item.code})`}
              />
            ))}
          </Menu>

          <TextInput
            label="Phone Number"
            value={form.phone_number}
            onChangeText={(text) => handleChange('phone_number', text)}
            mode="outlined"
            style={styles.phoneInput}
            keyboardType="phone-pad"
          />
        </View>

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

        <Button
          mode="contained"
          onPress={handleRegister}
          rippleColor="#ffffff"
          style={styles.button}
        >
          <Text style={{ color: '#FFFFFF' }}>Register</Text>
        </Button>

        <Button
          onPress={() => navigation.navigate('Login')}
          style={styles.link}
        >
          <Text style={{ color: '#000000' }}>
            Already have an account? Log In
          </Text>
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  prefixSelector: {
    marginTop: 5,
    marginRight: 10,
    textAlign: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#999',
    backgroundColor: '#fff',
    borderRadius: 5,
    height: 56,
  },

  phoneInput: {
    flex: 1,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#001426',
    marginTop: 10,
  },
  link: {
    marginTop: 15,

    backgroundColor: '#fff',
  },
});

export default RegisterScreen;
