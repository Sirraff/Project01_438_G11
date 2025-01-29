import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";

const amaranthImage = require("../..//assets/testImages/amaranth_144x144.png");
const beetImage = require("../../assets/testImages/beet_144x144.png");
const arugulaImage = require("../../assets/testImages/arugula_144x144.png");
const asianPearImage = require("../../assets/testImages/asian_pear_144x144.png");

interface Tile {
    id: string;
    label: string;
    image: any;
  }
  
  const tileOptions: Tile[] = [
    { id: "1", label: "Amaranth", image: amaranthImage },
    { id: "2", label: "Arugula", image: arugulaImage },
    { id: "3", label: "Asian Pears", image: asianPearImage },
    { id: "4", label: "Beets", image: beetImage },
  ];

const TileSelector: React.FC = () => {
  const [selectedTile, setSelectedTile] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <FlatList
        data={tileOptions}
        keyExtractor={(item) => item.id}
        numColumns={2} // Adjust for layout
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tile,
              selectedTile === item.id && styles.selectedTile,
            ]}
            onPress={() => setSelectedTile(item.id)}
          >
            <Image
              source={item.image}
              style={[
                styles.image,
                selectedTile === item.id && styles.selectedImage,
              ]}
            />
            <Text style={[styles.tileText, selectedTile === item.id && styles.selectedText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: "#3498db", // Highlight selected tile
  },
  image: {
    width: 40, // Adjust icon size
    height: 40,
    marginBottom: 5,
    resizeMode: "contain",
  },
  selectedImage: {
    tintColor: "#fff", // Change icon color when selected
  },
  tileText: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  selectedText: {
    color: "#fff",
  },
});

export default TileSelector;
