import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LanguageContext } from '../contexts/LanguageContext';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AccountManagementScreen from '../screens/AccountManagementScreen';
import HelpScreen from '../screens/HelpScreen';
import DocumentsScreen from '../screens/DocumentsScreen';

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
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          tabBarIcon: DocumentsIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
