import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LanguageContext } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AccountManagementScreen from '../screens/AccountManagementScreen';
import HelpScreen from '../screens/HelpScreen';
import DocumentNavigator from './DocumentNavigator';

const Tab = createBottomTabNavigator();
const SettingsStack = createStackNavigator();

// Custom animated tab icon component
const AnimatedTabIcon = ({
  name,
  color,
  size,

  accessibilityLabel,
  accessibilityHint,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      style={animatedStyle}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="tab"
    >
      <FontAwesome
        name={name}
        size={size}
        color={color}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
      />
    </Animated.View>
  );
};

// Tab icon components
const HomeIcon = ({ color, focused }) => {
  const { i18n } = useContext(LanguageContext);
  return (
    <AnimatedTabIcon
      name={focused ? 'home' : 'home'}
      color={color}
      size={24}
      focused={focused}
      accessibilityLabel={i18n.t('home_icon_label')}
      accessibilityHint={i18n.t('home_icon_hint')}
    />
  );
};

const DocumentsIcon = ({ color, focused }) => {
  const { i18n } = useContext(LanguageContext);
  return (
    <AnimatedTabIcon
      name={focused ? 'file' : 'file-o'}
      color={color}
      size={20}
      focused={focused}
      accessibilityLabel={i18n.t('documents_icon_label')}
      accessibilityHint={i18n.t('documents_icon_hint')}
    />
  );
};

const SettingsIcon = ({ color, focused }) => {
  const { i18n } = useContext(LanguageContext);
  return (
    <AnimatedTabIcon
      name={focused ? 'cog' : 'cog'}
      color={color}
      size={24}
      focused={focused}
      accessibilityLabel={i18n.t('settings_icon_label')}
      accessibilityHint={i18n.t('settings_icon_hint')}
    />
  );
};

// Custom header title with logo
const CustomHeaderTitle = ({ title }) => {
  const { colors } = useTheme();
  const { i18n } = useContext(LanguageContext);

  return (
    <View
      style={styles.headerTitleContainer}
      accessible
      accessibilityLabel={`${i18n.t('header_logo_label')}, ${title}`}
      accessibilityRole="header"
    >
      <Image
        source={require('../assets/images/automation-of-beruaucratic-processes-logo.png')}
        style={[styles.headerLogo, { tintColor: colors.primary }]}
        accessibilityLabel={i18n.t('header_logo_label')}
        accessibilityRole="image"
      />
      <Text
        style={[styles.headerTitleText, { color: colors.text }]}
        accessibilityLabel={title}
      >
        {title}
      </Text>
    </View>
  );
};

// Stack for settings
const SettingsStackNavigator = () => {
  const { i18n } = useContext(LanguageContext);
  const { colors } = useTheme();

  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 4,
          shadowOpacity: 0.1,
          shadowColor: '#B0BEC5',
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 5,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      }}
    >
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          headerShown: false,
        }}
      />
      <SettingsStack.Screen
        name="AccountManagement"
        component={AccountManagementScreen}
        options={{
          // eslint-disable-next-line
          headerTitle: () => (
            <CustomHeaderTitle title={i18n.t('accountManagement')} />
          ),
          accessibilityLabel: i18n.t('accountManagement_screen'),
        }}
      />
      <SettingsStack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          // eslint-disable-next-line
          headerTitle: () => (
            <CustomHeaderTitle title={i18n.t('helpSupport')} />
          ),
          accessibilityLabel: i18n.t('helpSupport_screen'),
        }}
      />
    </SettingsStack.Navigator>
  );
};

const AppNavigator = () => {
  const { i18n } = useContext(LanguageContext);
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          paddingBottom: 5,
          paddingTop: 5,
          borderWidth: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 5,
        },
      }}
      accessibilityLabel={i18n.t('tab_bar_label')}
      accessibilityRole="tablist"
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: i18n.t('home'),
          tabBarIcon: HomeIcon,
          tabBarAccessibilityLabel: i18n.t('home_tab'),
          tabBarAccessibilityHint: i18n.t('home_tab_hint'),
          accessibilityLabel: i18n.t('home_screen'),
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentNavigator}
        options={{
          tabBarLabel: i18n.t('documents'),
          tabBarIcon: DocumentsIcon,
          tabBarAccessibilityLabel: i18n.t('documents_tab'),
          tabBarAccessibilityHint: i18n.t('documents_tab_hint'),
          accessibilityLabel: i18n.t('documents_screen'),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: i18n.t('settings'),
          tabBarIcon: SettingsIcon,
          tabBarAccessibilityLabel: i18n.t('settings_tab'),
          tabBarAccessibilityHint: i18n.t('settings_tab_hint'),
          accessibilityLabel: i18n.t('settings_screen'),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 12,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppNavigator;
