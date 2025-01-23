import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';

const App = () => {
  const [produce, setProduce] = useState([]);

  // Just example data fetcher (replace with a real API later)
  useEffect(() => {
    const fetchProduce = async () => {
      // example...
      const seasonalData = [
        { id: '1', name: 'Strawberries', season: 'Spring' },
        { id: '2', name: 'Tomatoes', season: 'Summer' },
        { id: '3', name: 'Pumpkins', season: 'Fall' },
        { id: '4', name: 'Kale', season: 'Winter' },
      ];
      setProduce(seasonalData);
    };

    fetchProduce();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Seasonal Bites</Text>
      <FlatList
        data={produce}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.season}>Season: {item.season}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  season: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default App;
