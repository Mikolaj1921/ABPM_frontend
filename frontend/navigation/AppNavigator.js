import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DocumentNavigator from './DocumentNavigator';

const Tab = createBottomTabNavigator();

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
        component={DocumentNavigator}
        options={{
          tabBarIcon: DocumentsIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
