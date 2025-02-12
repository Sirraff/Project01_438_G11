import React, { useState, useEffect, useRef } from "react";
import { Animated, View, Button, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../utils/navigation"; // Import the type from App.tsx
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { signOut } from 'firebase/auth';

import { getProduce } from '../database/FruitDatabase';

/**
 * Defines an interface for items fetched from the database
 */
interface ProduceItem {
  id: string;
  name?: string;
  description?: string;
  imageurl?: string;
}

const Search: React.FC = () => {
  
  const [produce, setProduce] = useState<ProduceItem[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const slideAnim = useRef(new Animated.Value(100)).current;

  /**
   * Fetch produce data from the database
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data from SQLite database...");
        const produceList = await getProduce();
        console.log("Fetched Data:", produceList);
        setProduce(produceList);
      } catch (error) {
        console.error("Error fetching produce:", error);
      }
    };
    fetchData();
  }, []);

  // Toggles selection of tiles
  const toggleSelection = (id: string) => {
    setSelectedTiles((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((tileId) => tileId !== id)
        : [...prevSelected, id] 
    );
  };

  // Sliding animation for the clear button
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectedTiles.length > 0 ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedTiles]);

  // Clears selected tile array
  const clearSelection = () => {
    setSelectedTiles([]);
  };

  // Handles user logout with confirmation
  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: async () => {
            try {
              await signOut(FIREBASE_AUTH);
              navigation.navigate('Login');
            } catch (error) {
              console.error("Logout Error:", error);
            }
          }
        }
      ]
    );
  };

  // Set header logout button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="Logout" onPress={handleLogout} color="#2d936c" />
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      {/* Render SQLite Data in FlatList */}
      <FlatList
        data={produce}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tile,
              selectedTiles.includes(item.id) && styles.selectedTile,
            ]}
            onPress={() => toggleSelection(item.id)}
          >
            {item.imageurl && <Image source={{ uri: item.imageurl }} style={styles.image} />}
            <Text style={[
              styles.tileText,
              selectedTiles.includes(item.id) && styles.selectedText
            ]}>
              {item.name || "Unnamed Item"}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Sliding Button */}
      <Animated.View style={[styles.selectionButton, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.button} onPress={clearSelection}>
          <Text style={styles.buttonText}>Clear Selection ({selectedTiles.length})</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Stylesheets
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  listContent: {
    alignItems: "center",
  },
  tile: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    margin: 10,
    borderRadius: 10,
    width: 120,
    alignItems: "center",
  },
  selectedTile: {
    backgroundColor: "#2d936c",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  image: {
    width: 60,
    height: 60,
    marginBottom: 5,
    resizeMode: "contain",
  },
  tileText: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  selectedText: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectionButton: {
    position: "absolute",
    bottom: 20,
    width: "80%",
    alignSelf: "center",
  },
});

export default Search;
