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
const TILE_SIZE = width / 4 - 20; // Adjust tile size dynamically

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<ProduceItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [userUID, setUserUID] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const slideAnim = useRef(new Animated.Value(100)).current;

  /**
   * Fetch user's favorite produce
   */
  const fetchFavorites = async () => {
    try {
      console.log("🔄 Fetching favorite produce from SQLite database...");
      const auth = FIREBASE_AUTH;
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log("⚠️ No authenticated user.");
        setLoading(false);
        return;
      }

      setUserUID(currentUser.uid);

      // Fetch user favorites from the database
      const favoritesString = await getUserFavorites(currentUser.uid);
      if (!favoritesString) {
        console.log("⚠️ No favorites found for this user.");
        setFavorites([]);
        setLoading(false);
        return;
      }

      const favoritesArray = favoritesString.split(",").map((item) => item.trim());
      setUserFavorites(favoritesArray);

      // Fetch full produce data and filter by user's favorites
      const produceList = await getProduce();
      const filteredFavorites = produceList.filter((item) => favoritesArray.includes(item.produce_doc));
      setFavorites(filteredFavorites);

      console.log("✅ Loaded favorite produce:", filteredFavorites);
    } catch (error) {
      console.error("❌ Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when component is focused and clear selection when leaving
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();

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

  // Sliding animation for the remove favorites button
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectedDocs.length > 0 ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedDocs]);

  // Removes selected items from the user's favorites
  const removeFavorites = async () => {
    if (!userUID) {
      console.warn("⚠️ No user logged in, cannot remove favorites.");
      return;
    }

    try {
      console.log(`🔄 Removing selected favorites for user ${userUID}...`);

      // Remove selected items from user's favorites
      const updatedFavoritesArray = userFavorites.filter((doc) => !selectedDocs.includes(doc));

      // Convert to comma-separated string
      const updatedFavoritesString = updatedFavoritesArray.join(", ");

      // Update the user's favorites in the database
      await updateUserFavorites(userUID, updatedFavoritesString);

      console.log("✅ Favorites updated after removal!", updatedFavoritesString);

      // Update UI
      setUserFavorites(updatedFavoritesArray);
      setFavorites(favorites.filter((item) => !selectedDocs.includes(item.produce_doc)));
      setSelectedDocs([]);
    } catch (error) {
      console.error("❌ Error removing favorites:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favorite Produce</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : favorites.length === 0 ? (
        <Text style={styles.emptyMessage}>You have no favorite produce items.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.produce_doc}
          numColumns={Math.floor(width / TILE_SIZE)} // Adjust number of columns dynamically
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = selectedDocs.includes(item.produce_doc);

            return (
              <TouchableOpacity
                style={[
                  styles.tile,
                  isSelected && styles.selectedTile, // Green background for selected tiles
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

      {/* Sliding Remove Favorites Button */}
      <Animated.View style={[styles.selectionButton, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.button} onPress={removeFavorites}>
          <Text style={styles.buttonText}>Remove Favorites ({selectedDocs.length})</Text>
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
    backgroundColor: "#ffccd5", // Light pink background for user favorites
    padding: 10,
    margin: 5,
    borderRadius: 10,
    width: TILE_SIZE,
    alignItems: "center",
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
    backgroundColor: "#ff4444",
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

export default Favorites;
