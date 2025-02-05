import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types"; // Import the type from App.tsx
import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig"; // Import Firestore instance


// Define an interface for Firestore items
interface ProduceItem {
  id: string;
  name?: string;
  description?: string;
  imageurl?: string;
}

const Search: React.FC = () => {
  const [produce, setProduce] = useState<ProduceItem[]>([]); // Firestore data
  const [selectedTile, setSelectedTile] = useState<string | null>(null); // Selected tile state
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      {/* Render Firestore Data in FlatList */}
      <FlatList
        data={produce} // Use Firestore data instead of tileOptions
        keyExtractor={(item) => item.id}
        numColumns={4}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tile,
              selectedTile === item.id && styles.selectedTile,
            ]}
            onPress={() => setSelectedTile(item.id)}
          >
            {/* Display Image if Available */}
            {item.imageurl && <Image source={{ uri: item.imageurl }} style={styles.image} />}
            
            <Text style={[styles.tileText, selectedTile === item.id && styles.selectedText]}>
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

// stylesheets

const styles = StyleSheet.create({
    header: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#333",
      },      
  container: {
    flex: 1,
    padding: 20,
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
