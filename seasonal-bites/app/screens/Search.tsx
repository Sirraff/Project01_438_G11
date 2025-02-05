import React, { useState, useEffect, useRef } from "react";
import { Animated, View, Button, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types"; // Import the type from App.tsx
import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig"; // Import Firestore instance
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { signOut } from 'firebase/auth';

/**
 * Defines an interface representative of items fetched from docs in Firestore
 * @param id is the name of the produce as a collection name
 * @param name is the name of the item as a string
 * @param description is a stored string that describes the item
 * @param imageurl is a url stored as a string pointing to an image 
 */
interface ProduceItem {
  id: string;
  name?: string;
  description?: string;
  imageurl?: string;
}

const Search: React.FC = () => {
  
  // Creates array produce of type ProduceItem from setProduce
  const [produce, setProduce] = useState<ProduceItem[]>([]);

    /**
   * Creates array selectedTiles of strings that tracks which tiles
   * are currently selected.
   */ 
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);

  // Necessary for navigation
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // used as animation reference
  const slideAnim = useRef(new Animated.Value(100)).current;

  /**
   * Here is where we query our Firestore database.
   * Currently, we directly call the full Produce collection
   * and converts the collection into a ProduceItem[] array.
   * This array then becomes the produce array above
   * */
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data from Firestore...");
        // query Produce collection
        const produceRef = collection(FIRESTORE_DB, "Produce");
        // gets docs from produce collection
        const snapshot = await getDocs(produceRef);

        if (snapshot.empty) {
          console.warn("No documents found in Firestore.");
        }
        // creates array from docs
        const produceList: ProduceItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched Data:", produceList);
        // sets produce array to the array of fetched docs
        setProduce(produceList);
      } catch (error) {
        console.error("Error fetching produce:", error);
      }
    };
    // calls the above
    fetchData();
  }, []);

  // Updates selectedTiles by adding/removing tile id's
  const toggleSelection = (id: string) => {
    setSelectedTiles((prevSelected) =>
      prevSelected.includes(id)
        // toggles off
        ? prevSelected.filter((tileId) => tileId !== id)
        // toggles on
        : [...prevSelected, id] 
    );
  };

  // button slide animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: selectedTiles.length > 0 ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedTiles]);

  // clears selected tile array
  // TODO: have this send info to local storage
  const clearSelection = () =>{
    setSelectedTiles([]);
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

  /**
   * This section handles the creation of the FlatList
   * and tiles in accordance to the information stored in
   * produce. In essence, this builds the UI programmatically
   */
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      {/* Render Firestore Data in FlatList */}
      <FlatList
        data={produce}
        keyExtractor={(item) => item.id}
        // change number of columns here
        numColumns={4}
        contentContainerStyle={styles.listContent} // Ensures proper scrolling
        renderItem={({ item }) => (
          // allows for highlighting tiles
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

            {/* Sliding Button */}
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
  selectionButton: {
    position: "absolute",
    bottom: 20,
    width: "80%",
    alignSelf: "center",
  },
});

export default Search;
