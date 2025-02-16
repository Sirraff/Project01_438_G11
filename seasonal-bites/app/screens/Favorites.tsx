// Favorites.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Animated,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Button,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { getProduce } from "../database/FruitDatabase";
import {
  getUserByName,
  getUserFavorites,
  updateUserFavorites,
  getUser,
} from "../database/UserDatabase";

interface ProduceItem {
  id: number;
  produce_doc: string;
  name_produce: string;
  description: string;
  imageurl: string;
}

interface LocalUser {
  user_id: number;
  name_user: string;
  base_id: string;
  favorites: string;
}

const { width } = Dimensions.get("window");
const TILE_SIZE = width / 4 - 20;

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<ProduceItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [localUserRecord, setLocalUserRecord] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const slideAnim = useRef(new Animated.Value(100)).current;

  /**
   * Fetches the user's favorites from the local DB by first retrieving the user record by email.
   */
  const fetchFavorites = async () => {
    try {
      console.log("🔄 Fetching favorite produce from SQLite database...");
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        console.log("⚠️ No authenticated user.");
        setLoading(false);
        return;
      }
      // Retrieve the local user record using the email
      const localUser = await getUserByName(currentUser.email);
      if (!localUser) {
        console.log("⚠️ No local user record found for", currentUser.email);
        setLoading(false);
        return;
      }
      setLocalUserRecord(localUser);
      console.log("Local user record:", localUser);
      const favoritesString = localUser.favorites;
      console.log("📖 Raw favorites string from database:", favoritesString);
      if (!favoritesString || favoritesString.trim() === "") {
        console.log("⚠️ No favorites found for this user.");
        setFavorites([]);
        setUserFavorites([]);
        setLoading(false);
        return;
      }
      const favoritesArray = favoritesString.split(",").map((item) => item.trim());
      setUserFavorites(favoritesArray);
      const produceList = await getProduce();
      const filteredFavorites = produceList.filter((item) =>
        favoritesArray.includes(item.produce_doc)
      );
      setFavorites(filteredFavorites);
      console.log("✅ Loaded favorite produce:", filteredFavorites);
    } catch (error) {
      console.error("❌ Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
      return () => {
        setSelectedDocs([]);
      };
    }, [])
  );

  const toggleSelection = (produce_doc: string) => {
    setSelectedDocs((prev) =>
      prev.includes(produce_doc)
        ? prev.filter((doc) => doc !== produce_doc)
        : [...prev, produce_doc]
    );
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectedDocs.length > 0 ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedDocs]);

  /**
   * Removes selected favorites. Uses the local user record's base_id.
   */
  const removeFavorites = async () => {
    if (!localUserRecord) {
      console.warn("⚠️ No local user record found, cannot remove favorites.");
      return;
    }
    try {
      console.log(`🔄 Removing selected favorites for user ${localUserRecord.base_id}...`);
      const updatedFavoritesArray = userFavorites.filter(
        (doc) => !selectedDocs.includes(doc)
      );
      const updatedFavoritesString = updatedFavoritesArray.join(",");
      await updateUserFavorites(localUserRecord.base_id, updatedFavoritesString);
      console.log("✅ Favorites updated after removal!", updatedFavoritesString);
      setUserFavorites(updatedFavoritesArray);
      setFavorites(favorites.filter((item) => !selectedDocs.includes(item.produce_doc)));
      setSelectedDocs([]);
      // Optionally refresh local user record:
      const updatedUser = await getUserByName(FIREBASE_AUTH.currentUser?.email || "");
      if (updatedUser) {
        setLocalUserRecord(updatedUser);
      }
    } catch (error) {
      console.error("❌ Error removing favorites:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favorite Produce</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2d936c" />
      ) : favorites.length === 0 ? (
        <Text style={styles.emptyMessage}>You have no favorite produce items.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.produce_doc}
          numColumns={Math.floor(width / TILE_SIZE)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = selectedDocs.includes(item.produce_doc);
            return (
              <TouchableOpacity
                style={[styles.tile, isSelected && styles.selectedTile]}
                onPress={() => toggleSelection(item.produce_doc)}
              >
                {item.imageurl && <Image source={{ uri: item.imageurl }} style={styles.image} />}
                <Text style={[styles.tileText, isSelected && styles.selectedText]}>
                  {item.name_produce ? item.name_produce.toString() : "Unnamed Item"}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <Animated.View style={[styles.selectionButton, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.button} onPress={removeFavorites}>
          <Text style={styles.buttonText}>
            Remove Favorites ({String(selectedDocs.length)})
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

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
    backgroundColor: "#ffccd5",
    padding: 10,
    margin: 5,
    borderRadius: 10,
    width: TILE_SIZE,
    alignItems: "center",
  },
  selectedTile: {
    backgroundColor: "#2d936c",
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
