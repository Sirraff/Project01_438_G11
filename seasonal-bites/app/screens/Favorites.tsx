
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../FirebaseConfig';
import { collection, doc, getDoc } from "firebase/firestore";
import { getProduceByDoc } from "../database/FruitDatabase";
import { getUserFavorites, getUserLocation, updateUserFavorites } from "../database/UserDatabase";

interface ProduceItem {
  id: number;
  produce_doc: string;
  name_produce: string;
  description: string;
  imageurl: string;
}

const { width } = Dimensions.get("window");
const TILE_SIZE = width / 4 - 20;

const Favorites: React.FC = () => {
  const [favoriteProduce, setFavoriteProduce] = useState<ProduceItem[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);
  const [inSeasonProduce, setInSeasonProduce] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const slideAnim = useState(new Animated.Value(100))[0];

     // Fetch produce data for a given month
      const getProduceForMonth = async (state: string, month: number) => {
          try {
              const monthRef = doc(FIRESTORE_DB, "States", state, "Months", month.toString());
              const docSnapshot = await getDoc(monthRef);
  
              if (docSnapshot.exists()) {
                  return docSnapshot.data().in_season || []; // ✅ Extract the 'in_season' array
              } else {
                  console.warn(`⚠️ No produce data found for ${state}, month ${month}`);
                  return [];
              }
          } catch (error) {
              console.error(`❌ Error fetching produce for ${state}, month ${month}:`, error);
              return [];
          }
      };
  

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        console.warn("⚠️ No authenticated user found.");
        setLoading(false);
        return;
      }

      console.log(`🔄 Fetching favorites for user: ${currentUser.uid}`);
      const favoritesString = await getUserFavorites(currentUser.uid);

      if (!favoritesString || favoritesString.trim() === "") {
        console.log("⚠️ No favorites found.");
        setFavoriteProduce([]);
        setLoading(false);
        return;
      }

      const favoritesArray = favoritesString.split(",").map((id) => id.trim());
      console.log("✅ Parsed favorites:", favoritesArray);

      // Fetch produce details for each favorite
      const produceList: ProduceItem[] = [];
      for (const doc of favoritesArray) {
        const produceItem = await getProduceByDoc(doc);
        if (produceItem) {
          produceList.push(produceItem);
        }
      }

      console.log("📜 Fetched Favorite Produce:", produceList);
      setFavoriteProduce(produceList);

      // Fetch in-season produce
      const userState = await getUserLocation(currentUser.uid);
      if (!userState) {
        console.warn("⚠️ No state found for user, skipping season check.");
        setLoading(false);
        return;
      }

      const currentMonth = new Date().getMonth() + 1; // Get current month (1-based)
      console.log(`🌱 Fetching in-season produce for ${userState}, month ${currentMonth}`);
      const inSeasonList = await getProduceForMonth(userState, currentMonth);
      console.log("✅ In-season produce:", inSeasonList);

      setInSeasonProduce(inSeasonList);
    } catch (error) {
      console.error("❌ Error fetching favorite produce:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (produce_doc: string) => {
    setSelectedToRemove((prev) =>
      prev.includes(produce_doc) ? prev.filter((doc) => doc !== produce_doc) : [...prev, produce_doc]
    );
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectedToRemove.length > 0 ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedToRemove]);

  const removeSelectedFavorites = async () => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) {
      console.warn("⚠️ No authenticated user found.");
      return;
    }

    try {
      console.log(`🗑 Removing selected favorites for user ${currentUser.uid}`);

      const existingFavorites = await getUserFavorites(currentUser.uid);
      if (!existingFavorites) return;

      const existingFavoritesArray = existingFavorites.split(",").map((id) => id.trim());

      const updatedFavoritesArray = existingFavoritesArray.filter((doc) => !selectedToRemove.includes(doc));

      const updatedFavoritesString = updatedFavoritesArray.join(",");

      await updateUserFavorites(currentUser.uid, updatedFavoritesString);
      console.log("✅ Favorites updated successfully!");

      setSelectedToRemove([]);
      fetchFavorites();
    } catch (error) {
      console.error("❌ Error removing selected favorites:", error);
    }
  };

  // Separate in-season and out-of-season favorites
  const inSeasonFavorites = favoriteProduce.filter((item) => inSeasonProduce.includes(item.name_produce));
  const notInSeasonFavorites = favoriteProduce.filter((item) => !inSeasonProduce.includes(item.name_produce));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favorites</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : favoriteProduce.length === 0 ? (
        <Text style={styles.emptyMessage}>No favorite produce items found.</Text>
      ) : (
        <>
          {inSeasonFavorites.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>🌱 In Season</Text>
              <FlatList
                data={inSeasonFavorites}
                keyExtractor={(item) => item.produce_doc}
                numColumns={Math.floor(width / TILE_SIZE)}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.tile, styles.inSeasonTile, selectedToRemove.includes(item.produce_doc) && styles.selectedTile]}
                    onPress={() => toggleSelection(item.produce_doc)}
                  >
                    {item.imageurl && <Image source={{ uri: item.imageurl }} style={styles.image} />}
                    <Text style={styles.tileText}>{item.name_produce || "Unnamed Item"}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {notInSeasonFavorites.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>❌ Not in Season</Text>
              <FlatList
                data={notInSeasonFavorites}
                keyExtractor={(item) => item.produce_doc}
                numColumns={Math.floor(width / TILE_SIZE)}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.tile, styles.notInSeasonTile, selectedToRemove.includes(item.produce_doc) && styles.selectedTile]}
                    onPress={() => toggleSelection(item.produce_doc)}
                  >
                    {item.imageurl && <Image source={{ uri: item.imageurl }} style={styles.image} />}
                    <Text style={styles.tileText}>{item.name_produce || "Unnamed Item"}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </>
      )}

      <Animated.View style={[styles.selectionButton, { transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.button} onPress={removeSelectedFavorites}>
          <Text style={styles.buttonText}>
            {"Remove Selected (" + selectedToRemove.length.toString() + ")"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10, color: "#333" },
  listContent: { justifyContent: "center", paddingBottom: 20 },
  tile: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    margin: 5,
    borderRadius: 10,
    width: TILE_SIZE,
    alignItems: "center",
  },
  sectionHeader: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  inSeasonTile: { backgroundColor: "#c1e1c1" },
  notInSeasonTile: { backgroundColor: "#f7c6c7" },
  selectedTile: { backgroundColor: "#ff4d4d", borderWidth: 2, borderColor: "#ffffff" },
  image: { width: TILE_SIZE * 0.6, height: TILE_SIZE * 0.6, resizeMode: "contain" },
  tileText: { fontSize: 14, color: "#333", marginTop: 5 },
  selectedText: { color: "#fff" },
  button: { backgroundColor: "#d9534f", padding: 10, borderRadius: 5, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  selectionButton: { position: "absolute", bottom: 20, width: "80%", alignSelf: "center" },
  emptyMessage: { fontSize: 18, color: "#888", marginTop: 20 },
});

export default Favorites;
