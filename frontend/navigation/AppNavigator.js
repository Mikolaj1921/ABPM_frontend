import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LanguageContext } from '../contexts/LanguageContext';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AccountManagementScreen from '../screens/AccountManagementScreen';
import HelpScreen from '../screens/HelpScreen';
import DocumentNavigator from './DocumentNavigator';

const Tab = createBottomTabNavigator();
const SettingsStack = createStackNavigator();

const HomeIcon = ({ color, size }) => (
  <MaterialCommunityIcons name="home-outline" color={color} size={size} />
);

const DocumentsIcon = ({ color, size }) => (
  <MaterialCommunityIcons
    name="file-document-outline"
    color={color}
    size={size}
  />
);

const SettingsIcon = ({ color, size }) => (
  <MaterialCommunityIcons name="cog-outline" color={color} size={size} />
);

// Stack dla ustawień
const SettingsStackNavigator = () => {
  const { i18n } = useContext(LanguageContext);

  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen
        name="AccountManagement"
        component={AccountManagementScreen}
        options={{ title: i18n.t('accountManagement') }}
      />
      <SettingsStack.Screen
        name="Help"
        component={HelpScreen}
        options={{ title: i18n.t('helpSupport') }}
      />
    </SettingsStack.Navigator>
  );
};

const AppNavigator = () => {
  const { i18n } = useContext(LanguageContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#001426',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: i18n.t('home'),
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentNavigator}
        options={{
          tabBarLabel: i18n.t('documents'),
          tabBarIcon: DocumentsIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: i18n.t('settings'),
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
