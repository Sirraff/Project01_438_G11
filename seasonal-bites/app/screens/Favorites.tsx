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
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../FirebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getProduce } from "../database/FruitDatabase";
import {
  getUserByBaseId,
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
  id: number;
  name_user: string;
  base_id: string;
  favorites: string;
  last_login: Date;
  location: string;
}

const { width } = Dimensions.get("window");
const TILE_SIZE = width / 4 - 20;

/**
 * Helper function to query Firestore for in‑season produce names.
 * Expects that the document in the "States" collection for the given state
 * has a field for the given month (e.g., "February") that is an array.
 * Each element should be either a string like "Produce/asian_pears" or a DocumentReference.
 * If it's a DocumentReference, its id will be used.
 */
const getInSeasonProduceForState = async (
  state: string,
  month: string
): Promise<string[]> => {
  try {
    const stateDocRef = doc(FIRESTORE_DB, "States", state);
    const stateDocSnap = await getDoc(stateDocRef);
    if (stateDocSnap.exists()) {
      const data = stateDocSnap.data();
      console.log("Firestore document data for state", state, ":", data);
      const monthData = data[month];
      if (Array.isArray(monthData)) {
        const inSeason = monthData.map((ref: any) => {
          if (typeof ref === "string") {
            return ref.split("/").pop() || "";
          } else if (ref && typeof ref === "object" && ref.id) {
            return ref.id;
          } else {
            return "";
          }
        }).filter((name) => name !== "");
        console.log("Extracted in-season produce names for", month, ":", inSeason);
        return inSeason;
      } else {
        console.log("Month data for", month, "is not an array:", monthData);
      }
    } else {
      console.log(`No document found for state: ${state}`);
    }
  } catch (error) {
    console.error("Error fetching in-season produce from Firestore:", error);
  }
  return [];
};

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<ProduceItem[]>([]);
  const [inSeasonFavorites, setInSeasonFavorites] = useState<ProduceItem[]>([]);
  const [outOfSeasonFavorites, setOutOfSeasonFavorites] = useState<ProduceItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [localUserRecord, setLocalUserRecord] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const slideAnim = useRef(new Animated.Value(100)).current;

  // For this example, chosen state is hard-coded.
  const chosenState = "California";
  // Get current month name, e.g., "February"
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  /**
   * Fetches the user's favorites from the local DB by retrieving the user record by email.
   * Then loads full produce data from SQLite and separates favorites into in‑season and not in‑season.
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
      const localUser = await getUserByBaseId(currentUser.uid);
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
        setInSeasonFavorites([]);
        setOutOfSeasonFavorites([]);
        setLoading(false);
        return;
      }
      const favoritesArray = favoritesString.split(",").map((item) => item.trim());
      setUserFavorites(favoritesArray);
      // Fetch full produce data from local SQLite DB
      const produceList = await getProduce();
      const filteredFavorites = produceList.filter((item) =>
        favoritesArray.includes(item.produce_doc)
      );
      setFavorites(filteredFavorites);
      // Now, fetch the in-season produce names from Firestore for the chosen state and current month
      const inSeasonNames = await getInSeasonProduceForState(chosenState, currentMonth);
      console.log("In season produce names for", chosenState, currentMonth, ":", inSeasonNames);
      // Separate favorites into in-season and not in-season
      const inSeasonFavs = filteredFavorites.filter((item) =>
        inSeasonNames.includes(item.produce_doc)
      );
      const outOfSeasonFavs = filteredFavorites.filter((item) =>
        !inSeasonNames.includes(item.produce_doc)
      );
      setInSeasonFavorites(inSeasonFavs);
      setOutOfSeasonFavorites(outOfSeasonFavs);
      console.log("✅ Loaded favorite produce:", filteredFavorites);
      console.log("In Season Favorites:", inSeasonFavs);
      console.log("Not In Season Favorites:", outOfSeasonFavs);
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
   * Removes selected favorites by updating the local user's favorites.
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
      const updatedAllFavorites = favorites.filter(
        (item) => !selectedDocs.includes(item.produce_doc)
      );
      setFavorites(updatedAllFavorites);
      const inSeasonNames = await getInSeasonProduceForState(chosenState, currentMonth);
      setInSeasonFavorites(
        updatedAllFavorites.filter((item) => inSeasonNames.includes(item.produce_doc))
      );
      setOutOfSeasonFavorites(
        updatedAllFavorites.filter((item) => !inSeasonNames.includes(item.produce_doc))
      );
      setSelectedDocs([]);
      // Optionally refresh local user record:
      const updatedUser = await getUserByBaseId(FIREBASE_AUTH.currentUser?.email || "");
      if (updatedUser) {
        setLocalUserRecord(updatedUser);
      }
    } catch (error) {
      console.error("❌ Error removing favorites:", error);
    }
  };

  // Render a produce tile
  const renderTile = ({ item }: { item: ProduceItem }) => {
    const isSelected = selectedDocs.includes(item.produce_doc);
    return (
      <TouchableOpacity
        style={[styles.tile, isSelected && styles.selectedTile]}
        onPress={() => toggleSelection(item.produce_doc)}
      >
        {item.imageurl && <Image source={{ uri: item.imageurl }} style={styles.image} />}
        <Text style={[styles.tileText, isSelected && styles.selectedText]}>
          {item.name_produce || "Unnamed Item"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2d936c" />
      ) : favorites.length === 0 ? (
        <Text style={styles.emptyMessage}>You have no favorite produce items.</Text>
      ) : (
        <View style={{ flex: 1, width: "100%" }}>
          {inSeasonFavorites.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>In Season</Text>
              <FlatList
                data={inSeasonFavorites}
                keyExtractor={(item) => item.produce_doc}
                numColumns={Math.floor(width / TILE_SIZE)}
                renderItem={renderTile}
              />
            </View>
          )}
          {outOfSeasonFavorites.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Not In Season</Text>
              <FlatList
                data={outOfSeasonFavorites}
                keyExtractor={(item) => item.produce_doc}
                numColumns={Math.floor(width / TILE_SIZE)}
                renderItem={renderTile}
              />
            </View>
          )}
        </View>
      )}
      <Animated.View style={[styles.selectionButton, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.button} onPress={removeFavorites}>
          <Text style={styles.buttonText}>
            {"Remove Favorites (" + selectedDocs.length.toString() + ")"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10, color: "#333" },
  section: { marginBottom: 20 },
  sectionHeader: { fontSize: 20, fontWeight: "bold", marginVertical: 10, color: "#333" },
  listContent: { justifyContent: "center", paddingBottom: 20 },
  tile: { backgroundColor: "#f0f0f0", padding: 10, margin: 5, borderRadius: 10, width: TILE_SIZE, alignItems: "center" },
  favoriteTile: { backgroundColor: "#ffccd5" },
  selectedTile: { backgroundColor: "#2d936c", borderWidth: 2, borderColor: "#ffffff" },
  image: { width: TILE_SIZE * 0.6, height: TILE_SIZE * 0.6, resizeMode: "contain" },
  tileText: { fontSize: 14, color: "#333", marginTop: 5 },
  selectedText: { color: "#fff" },
  button: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 5, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  selectionButton: { position: "absolute", bottom: 20, width: "80%", alignSelf: "center" },
  emptyMessage: { fontSize: 18, color: "#888", marginTop: 20 },
});

export default Favorites;
