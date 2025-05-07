import React, { useEffect } from 'react';
import { StyleSheet, View, Text, BackHandler } from 'react-native';
import { Button } from 'react-native-paper';

export default function OfertaHandlowaScreen({ navigation, route }) {
  const category = route.params?.category;
  const template = route.params?.template;

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Home');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  if (!category || !template) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Błąd</Text>
        <Text style={styles.subtitle}>Brak kategorii lub szablonu</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Home')}
          style={styles.cancelButton}
        >
          Wróć
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oferta Handlowa</Text>
      <Text style={styles.subtitle}>Category: {category.name}</Text>
      <Text style={styles.subtitle}>Template: {template.name}</Text>
      <Button
        mode="contained"
        onPress={() =>
          navigation.navigate('GenerateScreen', { category, template })
        }
        style={styles.button}
        labelStyle={styles.buttonText}
      >
        Generuj Dokument
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Home')}
        style={styles.cancelButton}
        labelStyle={styles.buttonText}
      >
        Anuluj
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001426FF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
    backgroundColor: '#001426FF',
  },
  cancelButton: {
    marginVertical: 5,
    borderColor: '#001426FF',
  },
  buttonText: {
    color: '#FFFFFF',
  },
});
