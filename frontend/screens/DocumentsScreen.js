import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Card, IconButton, Searchbar, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const data = [
  { id: '1', title: 'Document 1', date: '2025-04-12', status: 'signed' },
  // Dodaj więcej dokumentów według potrzeb
];

// Zewnętrzny komponent LeftIcon
const LeftIcon = () => <IconButton icon="check-circle" color="green" />;

// Zewnętrzny komponent RightIcon, który przyjmuje onPress jako prop
const RightIcon = ({ onPress }) => (
  <IconButton icon="arrow-right" color="#001426FF" onPress={onPress} />
);

export default function DocumentsScreen() {
  const navigation = useNavigation();

  const category = { id: '1', name: 'Dokumenty Handlowe i Ofertowe' }; // Przykładowa kategoria

  // Przenosimy z rendera logikę do tej funkcji, aby przekazać props
  const renderCard = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.title}
        subtitle={item.date}
        left={LeftIcon} // Przekazujemy komponent jako referencję
        // eslint-disable-next-line react/no-unstable-nested-components
        right={() => (
          <RightIcon
            onPress={() => navigation.navigate('Preview', { category })}
          />
        )}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search documents" style={styles.searchbar} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderCard} // Używamy funkcji do renderowania elementów
      />
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Edit', { category })}
        style={styles.button}
      >
        Edit Category
      </Button>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Generate', { category })}
        style={styles.button}
      >
        Generate Document
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 50,
    paddingBottom: 20,
  },
  searchbar: {
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
    elevation: 4,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#001426FF',
  },
});
