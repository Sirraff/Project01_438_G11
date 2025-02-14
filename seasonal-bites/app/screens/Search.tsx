import React, { useState, useEffect, useRef, useCallback } from "react";
import { Animated, View, Button, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { useNavigation, useFocusEffect, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../utils/navigation";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { signOut } from "firebase/auth";

import { getProduce } from "../database/FruitDatabase";

/**
 * Defines an interface for items fetched from the database
 */
interface ProduceItem {
  id: number; 
  name_produce?: string;
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
  const fetchData = async () => {
    try {
      console.log("🔄 Fetching updated data from SQLite database...");
      const produceList = await getProduce();
      console.log("📜 Fetched Data:", produceList);
      setProduce(produceList);
    } catch (error) {
      console.error("❌ Error fetching produce:", error);
    }
  };

  // Refresh data when component is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Toggles selection of tiles
  const toggleSelection = (id: number) => {
    setSelectedTiles((prevSelected) =>
      prevSelected.includes(id.toString())
        ? prevSelected.filter((tileId) => tileId !== id.toString())
        : [...prevSelected, id.toString()]
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
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await signOut(FIREBASE_AUTH);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Login" }],
              })
            );
          } catch (error) {
            console.error("❌ Logout Error:", error);
          }
        },
      },
    ]);
  };

  // Set header logout button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title="Logout" onPress={handleLogout} color="#2d936c" />,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      {/* Show message if no items found */}
      {produce.length === 0 ? (
        <Text style={styles.emptyMessage}>No produce items found.</Text>
      ) : (
        <FlatList
          data={produce}
          keyExtractor={(item) => item.id.toString()}
          numColumns={4}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tile, selectedTiles.includes(item.id.toString()) && styles.selectedTile]}
              onPress={() => toggleSelection(item.id)}
            >
              {item.imageurl && <Image source={{ uri: item.imageurl }} style={styles.image} />}
              <Text style={[styles.tileText, selectedTiles.includes(item.id.toString()) && styles.selectedText]}>
                {item.name_produce || "Unnamed Item"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Sliding Clear Selection Button */}
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
  emptyMessage: {
    fontSize: 18,
    color: "#888",
    marginTop: 20,
  },
});

export default Search;