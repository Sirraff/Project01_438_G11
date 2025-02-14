import React, { useState, useEffect, useRef, useCallback } from "react";
import { Animated, View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";

import { getProduce } from "../database/FruitDatabase";
import { getUserFavorites, updateUserFavorites } from "../database/UserDatabase";

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

// Get screen dimensions
const { width } = Dimensions.get("window");
const TILE_SIZE = width / 4 - 20; // Dynamically adjust tile size based on screen width

const Search: React.FC = () => {
  const [produce, setProduce] = useState<ProduceItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [userUID, setUserUID] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const slideAnim = useRef(new Animated.Value(100)).current;

  /**
   * Fetch produce data and user favorites
   */
  const fetchData = async () => {
    try {
      console.log("🔄 Fetching updated data from SQLite database...");
      const produceList = await getProduce();
      setProduce(produceList);
      console.log("📜 Fetched Produce Data:", produceList);

      // Fetch logged-in user's UID
      const auth = FIREBASE_AUTH;
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUserUID(currentUser.uid);

        // Fetch and parse user's favorites from the database
        const favoritesString = await getUserFavorites(currentUser.uid);
        if (favoritesString) {
          const favoritesArray = favoritesString.split(",").map((item) => item.trim());
          setUserFavorites(favoritesArray);
          console.log("✅ Loaded user favorites:", favoritesArray);
        } else {
          console.log("⚠️ No favorites found for this user.");
        }
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when component is focused and clear selection when leaving
  useFocusEffect(
    useCallback(() => {
      fetchData();

      // Cleanup function: Clears selected items when the user navigates away
      return () => {
        setSelectedDocs([]);
      };
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

  // Updates the user's favorites in the database and updates UI
  const updateFavorites = async () => {
    if (!userUID) {
      console.warn("⚠️ No user logged in, cannot update favorites.");
      return;
    }

    try {
      console.log(`🔄 Updating favorites for user ${userUID}...`);

      // Fetch current user's stored favorites
      const currentFavoritesString = await getUserFavorites(userUID);
      const currentFavoritesArray = currentFavoritesString ? currentFavoritesString.split(",").map((item) => item.trim()) : [];

      // Ensure no duplicates by merging and filtering unique values
      const updatedFavoritesArray = Array.from(new Set([...currentFavoritesArray, ...selectedDocs]));

      // Convert to comma-separated string
      const updatedFavoritesString = updatedFavoritesArray.join(", ");

      // Update the user's favorites in the database
      await updateUserFavorites(userUID, updatedFavoritesString);

      console.log("✅ Favorites updated successfully!", updatedFavoritesString);

      // Clear selected tiles after updating
      setSelectedDocs([]);

      // Update userFavorites so newly added items turn pink immediately
      setUserFavorites(updatedFavoritesArray);
    } catch (error) {
      console.error("❌ Error updating favorites:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : produce.length === 0 ? (
        <Text style={styles.emptyMessage}>No produce items found.</Text>
      ) : (
        <FlatList
          data={produce}
          keyExtractor={(item) => item.produce_doc}
          numColumns={Math.floor(width / TILE_SIZE)} // Adjust number of columns dynamically
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isFavorite = userFavorites.includes(item.produce_doc);
            const isSelected = selectedDocs.includes(item.produce_doc);

            return (
              <TouchableOpacity
                style={[
                  styles.tile,
                  isFavorite && styles.favoriteTile, // Light pink for favorites
                  isSelected && styles.selectedTile, // Darker green for selections
                ]}
                onPress={() => toggleSelection(item.produce_doc)}
              >
                {item.imageurl && <Image source={{ uri: item.imageurl }} style={styles.image} />}
                <Text
                  style={[
                    styles.tileText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {item.name_produce || "Unnamed Item"}
                </Text>
              </TouchableOpacity>
            );
          }}
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
    justifyContent: "center",
    paddingBottom: 20,
  },
  tile: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    margin: 5,
    borderRadius: 10,
    width: TILE_SIZE,
    alignItems: "center",
  },
  favoriteTile: {
    backgroundColor: "#ffccd5", // Light pink background for user favorites
  },
  selectedTile: {
    backgroundColor: "#2d936c", // Green background for selected tiles
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  image: {
    width: TILE_SIZE * 0.6,
    height: TILE_SIZE * 0.6,
    resizeMode: "contain",
  },
  tileText: {
    fontSize: 14,
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
