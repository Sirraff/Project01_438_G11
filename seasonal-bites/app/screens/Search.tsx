// Search.tsx
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
  TextInput, Button,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { getProduce } from "../database/FruitDatabase";
import { getUserByBaseId, updateUserFavorites } from "../database/UserDatabase";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {RootStackParamList} from "../utils/navigation";

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

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

const Search: React.FC = () => {
  const [produce, setProduce] = useState<ProduceItem[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [localUserRecord, setLocalUserRecord] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const slideAnim = useRef(new Animated.Value(100)).current;
  const navigation = useNavigation<SearchScreenNavigationProp>();

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);   // Signs out from Firebase auth
      navigation.navigate('Login');   // Redirects to Login screen
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
          <Button title="Logout" onPress={handleLogout} color="#2d936c" />
      ),
    });
  }, [navigation]);

  const fetchData = async () => {
    try {
      console.log("🔄 Fetching updated produce data from SQLite database...");
      const produceList = await getProduce();
      setProduce(produceList);
      console.log("📜 Fetched Produce Data:", produceList);
      const currentUser = FIREBASE_AUTH.currentUser;
      if (currentUser) {
        const localUser = await getUserByBaseId(currentUser.uid);
        if (localUser) {
          setLocalUserRecord(localUser);
          const favoritesString = localUser.favorites;
          console.log("✅ Loaded user favorites:", favoritesString);
          if (favoritesString && favoritesString.trim() !== "") {
            const favoritesArray = favoritesString.split(",").map((item) => item.trim());
            setUserFavorites(favoritesArray);
            console.log("Parsed favorites array:", favoritesArray);
          }
        } else {
          console.log("⚠️ No local user record found for", currentUser.email);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
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

  const updateFavorites = async () => {
    if (!localUserRecord) {
      console.warn("⚠️ No local user record, cannot update favorites.");
      return;
    }
    try {
      console.log(`🔄 Updating favorites for user ${localUserRecord.base_id}...`);
      const currentFavoritesString =
        localUserRecord.favorites && localUserRecord.favorites.trim() !== ""
          ? localUserRecord.favorites
          : "";
      const currentFavoritesArray = currentFavoritesString
        ? currentFavoritesString.split(",").map((item) => item.trim())
        : [];
      console.log("Current favorites array:", currentFavoritesArray);
      const updatedFavoritesArray = Array.from(new Set([...currentFavoritesArray, ...selectedDocs]));
      console.log("Merged favorites array:", updatedFavoritesArray);
      const updatedFavoritesString = updatedFavoritesArray.join(",");
      console.log("Updated favorites string to store:", updatedFavoritesString);
      await updateUserFavorites(localUserRecord.base_id, updatedFavoritesString);
      console.log("✅ Favorites updated successfully!");
      setSelectedDocs([]);
      setUserFavorites(updatedFavoritesArray);
      // Optionally, refresh the local user record if needed:
      const updatedUser = await getUserByBaseId(FIREBASE_AUTH.currentUser?.uid || "");
      if (updatedUser) {
        setLocalUserRecord(updatedUser);
      }
    } catch (error) {
      console.error("❌ Error updating favorites:", error);
    }
  };

  // Filter produce list based on the search query (case-insensitive)
  const filteredProduce = produce.filter((item) =>
    item.name_produce.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search produce..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : filteredProduce.length === 0 ? (
        <Text style={styles.emptyMessage}>No produce items found.</Text>
      ) : (
        <FlatList
          data={filteredProduce}
          keyExtractor={(item) => item.produce_doc}
          numColumns={Math.floor(width / TILE_SIZE)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isFavorite = userFavorites.includes(item.produce_doc);
            const isSelected = selectedDocs.includes(item.produce_doc);
            return (
              <TouchableOpacity
                style={[
                  styles.tile,
                  isFavorite && styles.favoriteTile,
                  isSelected && styles.selectedTile,
                ]}
                onPress={() => toggleSelection(item.produce_doc)}
              >
                {item.imageurl && <Image source={{ uri: item.imageurl }} style={styles.image} />}
                <Text style={[styles.tileText, isSelected && styles.selectedText]}>
                  {item.name_produce || "Unnamed Item"}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <Animated.View style={[styles.selectionButton, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.button} onPress={updateFavorites}>
          <Text style={styles.buttonText}>
            {"Update Favorites (" + selectedDocs.length.toString() + ")"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10, color: "#333" },
  searchBar: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
  },
  listContent: { justifyContent: "center", paddingBottom: 20 },
  tile: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    margin: 5,
    borderRadius: 10,
    width: TILE_SIZE,
    alignItems: "center",
  },
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

export default Search;
