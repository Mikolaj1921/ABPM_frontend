import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DocumentsScreen from '../screens/DocumentsScreen';
import PreviewScreen from '../screens/documentScreens/PreviewScreen';

const Stack = createStackNavigator();

const DocumentNavigator = ({ route }) => {
  const { navigator } = route.params || {};
  // Mapowanie navigator na category dla DocumentsScreen
  const categoryMap = {
    Handlowe: 'Handlowe',
    Finansowe: 'Faktury',
    Kadrowe: 'Kadrowe',
  };
  const initialCategory = categoryMap[navigator] || 'Handlowe';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="DocumentsScreen"
        component={DocumentsScreen}
        initialParams={{ category: initialCategory }}
      />
      <Stack.Screen name="PreviewScreen" component={PreviewScreen} />
    </Stack.Navigator>
  );
};

export default DocumentNavigator;
