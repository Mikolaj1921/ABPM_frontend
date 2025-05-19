import React, { useState, useContext } from 'react';
import {
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Modal,
} from 'react-native';
import { TextInput, Button, Text, Menu, Checkbox } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LanguageContext } from '../contexts/LanguageContext';
import API from '../api';

const RegisterScreen = ({ navigation }) => {
  const { i18n } = useContext(LanguageContext);
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
    rodo: false,
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const [rodoModalVisible, setRodoModalVisible] = useState(false);

  const phonePrefixes = [
    { code: '+48', country: i18n.t('country_poland') },
    { code: '+49', country: i18n.t('country_germany') },
    { code: '+44', country: i18n.t('country_uk') },
    { code: '+1', country: i18n.t('country_usa') },
    { code: '+380', country: i18n.t('country_ukraine') },
    { code: '+33', country: i18n.t('country_france') },
  ];

  const handleChange = (field, value) => {
    if (field === 'email' || field === 'phone_number') {
      // eslint-disable-next-line
      value = value.trim();
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone_number
    ) {
      Alert.alert(i18n.t('error_title'), i18n.t('error_all_fields_required'));
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert(i18n.t('error_title'), i18n.t('error_invalid_email'));
      return;
    }

    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(form.phone_number)) {
      Alert.alert(i18n.t('error_title'), i18n.t('error_invalid_phone'));
      return;
    }

    if (form.password.length < 6) {
      Alert.alert(i18n.t('error_title'), i18n.t('error_password_too_short'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert(i18n.t('error_title'), i18n.t('error_passwords_mismatch'));
      return;
    }
    if (!form.rodo) {
      Alert.alert(i18n.t('error_title'), i18n.t('error_rodo_required'));
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
        rodo: form.rodo,
      });

      Alert.alert(i18n.t('success_title'), i18n.t('success_account_created'));
      navigation.navigate('Login');
    } catch (err) {
      console.error(err);
      Alert.alert(
        i18n.t('error_title'),
        err.response?.data?.message || i18n.t('error_server'),
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      accessible
      accessibilityLabel={i18n.t('register_screen')}
      accessibilityRole="none"
    >
      <ScrollView
        contentContainerStyle={styles.form}
        accessible
        accessibilityRole="none"
      >
        <Text
          style={styles.title}
          accessible
          accessibilityLabel={i18n.t('create_account')}
          accessibilityRole="header"
        >
          {i18n.t('create_account')}
        </Text>

        <TextInput
          label={i18n.t('first_name')}
          value={form.firstName}
          onChangeText={(text) => handleChange('firstName', text)}
          mode="outlined"
          style={styles.input}
          accessible
          accessibilityLabel={i18n.t('first_name_input')}
          accessibilityRole="text"
          accessibilityHint={i18n.t('first_name_hint')}
        />

        <TextInput
          label={i18n.t('last_name')}
          value={form.lastName}
          onChangeText={(text) => handleChange('lastName', text)}
          mode="outlined"
          style={styles.input}
          accessible
          accessibilityLabel={i18n.t('last_name_input')}
          accessibilityRole="text"
          accessibilityHint={i18n.t('last_name_hint')}
        />

        <TextInput
          label={i18n.t('date_of_birth')}
          value={form.dob.toLocaleDateString()}
          mode="outlined"
          style={styles.input}
          onFocus={() => handleChange('showDatePicker', true)}
          accessible
          accessibilityLabel={i18n.t('date_of_birth_input')}
          accessibilityRole="button"
          accessibilityHint={i18n.t('date_of_birth_hint')}
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
            accessibilityLabel={i18n.t('date_picker')}
            accessibilityRole="spinbutton"
            accessibilityHint={i18n.t('date_picker_hint')}
          />
        )}

        <View
          style={styles.phoneRow}
          accessible
          accessibilityLabel={i18n.t('phone_number_section')}
          accessibilityRole="none"
        >
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                style={styles.prefixSelector}
                contentStyle={{ flexDirection: 'row', alignItems: 'center' }}
                labelStyle={{ color: '#888' }}
                accessible
                accessibilityLabel={`${i18n.t('phone_prefix_selector')} ${form.phone_prefix}`}
                accessibilityRole="button"
                accessibilityHint={i18n.t('phone_prefix_hint')}
              >
                {form.phone_prefix}
              </Button>
            }
            accessibilityRole="menu"
          >
            {phonePrefixes.map((item) => (
              <Menu.Item
                key={item.code}
                onPress={() => {
                  handleChange('phone_prefix', item.code);
                  setMenuVisible(false);
                }}
                title={`${item.country} ${item.code}`}
                accessible
                accessibilityLabel={`${i18n.t('phone_prefix_option')} ${item.country} ${item.code}`}
                accessibilityRole="menuitem"
                accessibilityHint={i18n.t('phone_prefix_option_hint')}
              />
            ))}
          </Menu>

          <TextInput
            label={i18n.t('phone_number')}
            value={form.phone_number}
            onChangeText={(text) => handleChange('phone_number', text)}
            mode="outlined"
            style={styles.phoneInput}
            keyboardType="phone-pad"
            accessible
            accessibilityLabel={i18n.t('phone_number_input')}
            accessibilityRole="text"
            accessibilityHint={i18n.t('phone_number_hint')}
          />
        </View>

        <TextInput
          label={i18n.t('email')}
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          accessible
          accessibilityLabel={i18n.t('email_input')}
          accessibilityRole="text"
          accessibilityHint={i18n.t('email_hint')}
        />

        <TextInput
          label={i18n.t('password')}
          value={form.password}
          onChangeText={(text) => handleChange('password', text)}
          mode="outlined"
          style={styles.input}
          secureTextEntry
          accessible
          accessibilityLabel={i18n.t('password_input')}
          accessibilityRole="text"
          accessibilityHint={i18n.t('password_hint')}
        />

        <TextInput
          label={i18n.t('confirm_password')}
          value={form.confirmPassword}
          onChangeText={(text) => handleChange('confirmPassword', text)}
          mode="outlined"
          style={styles.input}
          secureTextEntry
          accessible
          accessibilityLabel={i18n.t('confirm_password_input')}
          accessibilityRole="text"
          accessibilityHint={i18n.t('confirm_password_hint')}
        />

        <View
          style={styles.rodoContainer}
          accessible
          accessibilityLabel={i18n.t('rodo_section')}
          accessibilityRole="none"
        >
          <Checkbox
            status={form.rodo ? 'checked' : 'unchecked'}
            onPress={() => handleChange('rodo', !form.rodo)}
            accessible
            accessibilityLabel={i18n.t('rodo_checkbox')}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: form.rodo }}
            accessibilityHint={i18n.t('rodo_checkbox_hint')}
          />
          <Text
            style={styles.rodoText}
            accessible
            accessibilityLabel={i18n.t('rodo_consent_text')}
            accessibilityRole="text"
          >
            {i18n.t('rodo_consent_prefix')}{' '}
            <Text
              style={styles.rodoLink}
              onPress={() => setRodoModalVisible(true)}
              accessible
              accessibilityLabel={i18n.t('rodo_link')}
              accessibilityRole="link"
              accessibilityHint={i18n.t('rodo_link_hint')}
            >
              {i18n.t('rodo_terms')}
            </Text>
          </Text>
        </View>

        <Modal
          visible={rodoModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setRodoModalVisible(false)}
          accessibilityLabel={i18n.t('rodo_modal')}
          accessibilityRole="dialog"
        >
          <View style={styles.modalOverlay} accessible accessibilityRole="none">
            <View
              style={styles.modalContent}
              accessible
              accessibilityLabel={i18n.t('rodo_modal_content')}
              accessibilityRole="none"
            >
              <ScrollView accessible accessibilityRole="none">
                <Text
                  style={styles.modalTitle}
                  accessible
                  accessibilityLabel={i18n.t('rodo_modal_title')}
                  accessibilityRole="header"
                >
                  {i18n.t('rodo_modal_title')}
                </Text>
                <Text
                  style={styles.modalText}
                  accessible
                  accessibilityLabel={i18n.t('rodo_modal_text_1')}
                  accessibilityRole="text"
                >
                  {i18n.t('rodo_modal_text_1')}
                </Text>
                <Text
                  style={styles.modalText}
                  accessible
                  accessibilityLabel={i18n.t('rodo_modal_text_2')}
                  accessibilityRole="text"
                >
                  {i18n.t('rodo_modal_text_2')}
                </Text>
                <Text
                  style={styles.modalText}
                  accessible
                  accessibilityLabel={i18n.t('rodo_modal_text_3')}
                  accessibilityRole="text"
                >
                  {i18n.t('rodo_modal_text_3')}
                </Text>
              </ScrollView>
              <View
                style={styles.modalButtons}
                accessible
                accessibilityRole="none"
              >
                <Button
                  mode="outlined"
                  onPress={() => setRodoModalVisible(false)}
                  style={styles.modalButton}
                  accessible
                  accessibilityLabel={i18n.t('cancel_button')}
                  accessibilityRole="button"
                  accessibilityHint={i18n.t('cancel_button_hint')}
                >
                  {i18n.t('cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    handleChange('rodo', true);
                    setRodoModalVisible(false);
                  }}
                  style={styles.modalButton}
                  accessible
                  accessibilityLabel={i18n.t('agree_button')}
                  accessibilityRole="button"
                  accessibilityHint={i18n.t('agree_button_hint')}
                >
                  {i18n.t('agree')}
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        <Button
          mode="contained"
          onPress={handleRegister}
          rippleColor="#ffffff"
          style={styles.button}
          accessible
          accessibilityLabel={i18n.t('register_button')}
          accessibilityRole="button"
          accessibilityHint={i18n.t('register_button_hint')}
        >
          <Text style={{ color: '#FFFFFF' }} accessible={false}>
            {i18n.t('register')}
          </Text>
        </Button>

        <Button
          onPress={() => navigation.navigate('Login')}
          style={styles.link}
          accessible
          accessibilityLabel={i18n.t('login_link')}
          accessibilityRole="link"
          accessibilityHint={i18n.t('login_link_hint')}
        >
          <Text style={{ color: '#000000' }} accessible={false}>
            {i18n.t('login_prompt')}
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
  rodoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rodoText: {
    fontSize: 16,
    color: '#001426',
  },
  rodoLink: {
    color: '#001426',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#001426',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#001426',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default RegisterScreen;
