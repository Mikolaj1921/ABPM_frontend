import React, { useContext, useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import {
  Button,
  Text,
  Snackbar,
  Card,
  Avatar,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../contexts/LanguageContext';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import API from '../api';

export default function AccountManagementScreen({ navigation }) {
  const { i18n } = useContext(LanguageContext);
  const { user, retryFetchUser } = useContext(AuthContext);
  const { colors, isDarkMode, toggleTheme } = useTheme();
  // eslint-disable-next-line
  const paperTheme = usePaperTheme();
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token || !user) {
          setSnackbar({ visible: true, message: i18n.t('no_token_error') });
          navigation.navigate('Login');
          return;
        }
        const response = await API.get('/auth/me');
        setProfile({
          firstName: response.data.user.first_name,
          lastName: response.data.user.last_name,
          email: response.data.user.email,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setSnackbar({ visible: true, message: i18n.t('user_fetch_error') });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user, navigation, i18n]);

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      await API.put(
        '/auth/me',
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await retryFetchUser();
      setSnackbar({ visible: true, message: i18n.t('profile_updated') });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({ visible: true, message: i18n.t('profile_update_error') });
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({ visible: true, message: i18n.t('passwords_do_not_match') });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setSnackbar({ visible: true, message: i18n.t('password_too_short') });
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      await API.post(
        '/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSnackbar({ visible: true, message: i18n.t('password_changed') });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        visible: true,
        message:
          error.response?.data?.message || i18n.t('password_change_error'),
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion with confirmation
  const handleDeleteAccount = () => {
    Alert.alert(
      i18n.t('confirm_delete_account'),
      i18n.t('delete_account_warning'),
      [
        {
          text: i18n.t('cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem('token');
              await API.delete('/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
              });
              await AsyncStorage.removeItem('token');
              setSnackbar({
                visible: true,
                message: i18n.t('account_deleted'),
              });
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error deleting account:', error);
              setSnackbar({
                visible: true,
                message: i18n.t('account_delete_error'),
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (loading) {
    return (
      <View
        style={[styles.center, { backgroundColor: colors.background }]}
        accessibilityLabel={i18n.t('spinner_loading')}
        accessibilityHint={i18n.t('spinner_loading_hint')}
        accessibilityRole="alert"
      >
        <FontAwesome name="spinner" size={32} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {i18n.t('loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Section */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.profileContainer}>
              <Avatar.Text
                size={44}
                label={profile.firstName?.charAt(0) || 'U'}
                style={[styles.avatar, { backgroundColor: colors.primary }]}
                accessibilityHint={i18n.t('user_avatar_hint')}
                accessibilityRole="image"
              />
              <View style={styles.profileText}>
                <Text
                  style={[styles.profileName, { color: colors.text }]}
                  accessibilityLabel={i18n.t('profile_name_label')}
                  accessibilityRole="none"
                >
                  {`${profile.firstName} ${profile.lastName}` || 'User'}
                </Text>
                <Text
                  style={[styles.profileEmail, { color: colors.secondaryText }]}
                  accessibilityLabel={i18n.t('profile_email_label')}
                  accessibilityRole="none"
                >
                  {profile.email || ''}
                </Text>
              </View>
            </View>
            {isEditing ? (
              <>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: colors.accent, color: colors.text },
                  ]}
                  value={profile.firstName}
                  onChangeText={(text) =>
                    setProfile({ ...profile, firstName: text })
                  }
                  placeholder={i18n.t('first_name')}
                  placeholderTextColor={colors.secondaryText}
                  accessibilityLabel={i18n.t('first_name')}
                  accessibilityRole="none"
                />
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: colors.accent, color: colors.text },
                  ]}
                  value={profile.lastName}
                  onChangeText={(text) =>
                    setProfile({ ...profile, lastName: text })
                  }
                  placeholder={i18n.t('last_name')}
                  placeholderTextColor={colors.secondaryText}
                  accessibilityLabel={i18n.t('last_name')}
                  accessibilityRole="none"
                />
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: colors.accent, color: colors.text },
                  ]}
                  value={profile.email}
                  onChangeText={(text) =>
                    setProfile({ ...profile, email: text })
                  }
                  placeholder={i18n.t('email')}
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="email-address"
                  accessibilityLabel={i18n.t('email')}
                  accessibilityRole="none"
                />
                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    onPress={handleUpdateProfile}
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    labelStyle={[styles.buttonText, { color: colors.surface }]}
                    accessibilityLabel={i18n.t('save_profile')}
                    accessibilityRole="button"
                  >
                    {i18n.t('save')}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => setIsEditing(false)}
                    style={[styles.button, { borderColor: colors.primary }]}
                    labelStyle={[styles.buttonText, { color: colors.primary }]}
                    accessibilityLabel={i18n.t('cancel')}
                    accessibilityRole="button"
                  >
                    {i18n.t('cancel')}
                  </Button>
                </View>
              </>
            ) : (
              <Button
                mode="outlined"
                onPress={() => setIsEditing(true)}
                style={[styles.button, { borderColor: colors.primary }]}
                labelStyle={[styles.buttonText, { color: colors.primary }]}
                accessibilityLabel={i18n.t('edit_profile')}
                accessibilityRole="button"
              >
                {i18n.t('edit_profile')}
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Theme Settings Section */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={i18n.t('theme_settings')}
            titleStyle={[styles.cardTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('theme_settings')}
            accessibilityRole="header"
          />
          <Card.Content>
            <View style={styles.themeOption}>
              <Text
                style={[styles.optionText, { color: colors.text }]}
                accessibilityLabel={i18n.t('dark_mode_switch_label')}
                accessibilityRole="none"
              >
                {i18n.t('dark_mode_toggle')}
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{
                  false: colors.secondaryText,
                  true: colors.accent,
                }}
                thumbColor={isDarkMode ? colors.primary : colors.surface}
                accessibilityLabel={i18n.t('dark_mode_switch_label')}
                accessibilityHint={i18n.t('darkModeHint')}
                accessibilityRole="switch"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Password Change Section */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={i18n.t('change_password')}
            titleStyle={[styles.cardTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('change_password')}
            accessibilityRole="header"
          />
          <Card.Content>
            {isChangingPassword ? (
              <>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: colors.accent, color: colors.text },
                  ]}
                  value={passwordData.currentPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, currentPassword: text })
                  }
                  placeholder={i18n.t('current_password')}
                  placeholderTextColor={colors.secondaryText}
                  secureTextEntry
                  accessibilityLabel={i18n.t('current_password')}
                  accessibilityRole="none"
                />
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: colors.accent, color: colors.text },
                  ]}
                  value={passwordData.newPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, newPassword: text })
                  }
                  placeholder={i18n.t('new_password')}
                  placeholderTextColor={colors.secondaryText}
                  secureTextEntry
                  accessibilityLabel={i18n.t('new_password')}
                  accessibilityRole="none"
                />
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: colors.accent, color: colors.text },
                  ]}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, confirmPassword: text })
                  }
                  placeholder={i18n.t('confirm_password')}
                  placeholderTextColor={colors.secondaryText}
                  secureTextEntry
                  accessibilityLabel={i18n.t('confirm_password')}
                  accessibilityRole="none"
                />
                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    onPress={handleChangePassword}
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    labelStyle={[styles.buttonText, { color: colors.surface }]}
                    accessibilityLabel={i18n.t('save_password')}
                    accessibilityRole="button"
                  >
                    {i18n.t('save')}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => setIsChangingPassword(false)}
                    style={[styles.button, { borderColor: colors.primary }]}
                    labelStyle={[styles.buttonText, { color: colors.primary }]}
                    accessibilityLabel={i18n.t('cancel')}
                    accessibilityRole="button"
                  >
                    {i18n.t('cancel')}
                  </Button>
                </View>
              </>
            ) : (
              <Button
                mode="outlined"
                onPress={() => setIsChangingPassword(true)}
                style={[styles.button, { borderColor: colors.primary }]}
                labelStyle={[styles.buttonText, { color: colors.primary }]}
                accessibilityLabel={i18n.t('change_password')}
                accessibilityRole="button"
              >
                {i18n.t('change_password')}
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Title
            title={i18n.t('account_actions')}
            titleStyle={[styles.cardTitle, { color: colors.text }]}
            accessibilityLabel={i18n.t('account_actions')}
            accessibilityRole="header"
          />
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleDeleteAccount}
              style={[
                styles.button,
                styles.deleteButton,
                { backgroundColor: colors.error },
              ]}
              labelStyle={[styles.buttonText, { color: colors.surface }]}
              accessibilityLabel={i18n.t('delete_account')}
              accessibilityRole="button"
            >
              {i18n.t('delete_account')}
            </Button>
          </Card.Content>
        </Card>

        {/* Footer */}
        <View
          style={[styles.footer, { backgroundColor: colors.primary }]}
          accessibilityLabel={i18n.t('footer_label')}
          accessibilityHint={i18n.t('footer_hint')}
          accessibilityRole="none"
        >
          <FontAwesome
            name="info-circle"
            size={20}
            color={colors.surface}
            style={styles.footerIcon}
            accessibilityLabel={i18n.t('footer_icon_label')}
            accessibilityRole="image"
          />
          <Text style={[styles.footerText, { color: colors.surface }]}>
            © 2025 Automation of Bureaucratic Processes. Wersja 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Snackbar */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        action={{
          label: 'OK',
          onPress: () => setSnackbar({ ...snackbar, visible: false }),
        }}
        accessibilityLabel={i18n.t('snackbar_message_label')}
        accessibilityRole="alert"
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
    shadowOpacity: 0.1,
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderWidth: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    marginRight: 12,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  deleteButton: {
    marginTop: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    elevation: 3,
  },
  footerIcon: {
    marginRight: 10,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
