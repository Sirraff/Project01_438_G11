import React, { useState, useEffect, useRef, useCallback } from "react";
import { Animated, View, Button, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { useNavigation, useFocusEffect, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../utils/navigation";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { signOut } from "firebase/auth";

import { getProduce } from "../database/FruitDatabase";
import {  getUserByBaseId, updateUserFavorites } from "../database/UserDatabase";

/**
 * Defines an interface for items fetched from the database
 */
interface ProduceItem {
  id: number;
  produce_doc: string;
  name_produce: string;
  description: string;
  imageurl: string;
}

const Search: React.FC = () => {
  const [produce, setProduce] = useState<ProduceItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]); // Store produce_doc instead of id
  const [userUID, setUserUID] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const slideAnim = useRef(new Animated.Value(100)).current;

  /**
   * Fetch produce data from the database
   */
  const fetchData = async () => {
    try {
      console.log("🔄 Fetching updated data from SQLite database...");
      const produceList = await getProduce();
      setProduce(produceList);
      console.log("📜 Fetched Data:", produceList);

      // Fetch logged-in user's UID
      const auth = FIREBASE_AUTH;
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUserUID(currentUser.uid);
      }
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

  // Toggles selection of produce_doc
  const toggleSelection = (produce_doc: string) => {
    setSelectedDocs((prevSelected) =>
      prevSelected.includes(produce_doc)
        ? prevSelected.filter((doc) => doc !== produce_doc) // Remove if already selected
        : [...prevSelected, produce_doc] // Add if not selected
    );
  };

  // Sliding animation for the update favorites button
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectedDocs.length > 0 ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedDocs]);

  // Updates the user's favorites in the database
  const updateFavorites = async () => {
    if (!userUID) {
      console.warn("⚠️ No user logged in, cannot update favorites.");
      return;
    }

    const favoritesString = selectedDocs.join(", "); // Convert array to a comma-separated string

    try {
      console.log(`🔄 Updating favorites for user ${userUID}...`);
      await updateUserFavorites(userUID, favoritesString);
      console.log("✅ Favorites updated successfully!");
    } catch (error) {
      console.error("❌ Error updating favorites:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      {/* Show message if no items found */}
      {produce.length === 0 ? (
        <Text style={styles.emptyMessage}>No produce items found.</Text>
      ) : (
        <FlatList
          data={produce}
          keyExtractor={(item) => item.produce_doc}
          numColumns={4}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tile,
                selectedDocs.includes(item.produce_doc) && styles.selectedTile,
              ]}
              onPress={() => toggleSelection(item.produce_doc)}
            >
              {item.imageurl && <Image source={{ uri: item.imageurl }} style={styles.image} />}
              <Text
                style={[
                  styles.tileText,
                  selectedDocs.includes(item.produce_doc) && styles.selectedText,
                ]}
              >
                {item.name_produce || "Unnamed Item"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Sliding Update Favorites Button */}
      <Animated.View style={[styles.selectionButton, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.button} onPress={updateFavorites}>
          <Text style={styles.buttonText}>Update Favorites ({selectedDocs.length})</Text>
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