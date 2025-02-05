import React, { useState, useEffect } from "react";
import { View, Button, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types"; // Import the type from App.tsx
import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig"; // Import Firestore instance
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { signOut } from 'firebase/auth';

// Define an interface for Firestore items
interface ProduceItem {
  id: string;
  name?: string;
  description?: string;
  imageurl?: string;
}

const Search: React.FC = () => {
  const [produce, setProduce] = useState<ProduceItem[]>([]); // Firestore data
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]); // Multi-select state
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data from Firestore...");
        const produceRef = collection(FIRESTORE_DB, "Produce");
        const snapshot = await getDocs(produceRef);

        if (snapshot.empty) {
          console.warn("No documents found in Firestore.");
        }

        const produceList: ProduceItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched Data:", produceList);
        setProduce(produceList);
      } catch (error) {
        console.error("Error fetching produce:", error);
      }
    };

    fetchData();
  }, []);

  // Toggle selection of tiles
  const toggleSelection = (id: string) => {
    setSelectedTiles((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((tileId) => tileId !== id) // Remove if already selected
        : [...prevSelected, id] // Add if not selected
    );
  };

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);   // Signs out from Firebase auth
      navigation.navigate('Login');   // Redirects to Login screen
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Set the header's logout button. We can prob modularize it but meh...
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

      {/* Render Firestore Data in FlatList */}
      <FlatList
        data={produce}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.listContent} // Ensures proper scrolling
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tile,
              selectedTiles.includes(item.id) && styles.selectedTile,
            ]}
            onPress={() => toggleSelection(item.id)}
          >
            {/* Display Image if Available */}
            {item.imageurl && <Image source={{ uri: item.imageurl }} style={styles.image} />}

            <Text style={[
              styles.tileText,
              selectedTiles.includes(item.id) && styles.selectedText
            ]}
            >
              {item.name || "Unnamed Item"}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Navigation Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Menu")}>
        <Text style={styles.buttonText}>Return to Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

// Stylesheets
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures scrollability
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
});

export default Search;
