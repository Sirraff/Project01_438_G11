import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, "Search">;

// PNG for tiles
const amaranthImage = require("../../assets/testImages/amaranth_144x144.png");
const beetImage = require("../../assets/testImages/beet_144x144.png");
const arugulaImage = require("../../assets/testImages/arugula_144x144.png");
const asianPearImage = require("../../assets/testImages/asian_pear_144x144.png");
const bokImage = require("../../assets/testImages/bok_choy_144x144.png");
const brocImage = require("../../assets/testImages/broccoli_144x144.png");
const rabeImage = require("../../assets/testImages/broccoli_rabe_144x144.png");
const cabbageImage = require("../../assets/testImages/cabbage_144x144.png");

// Fields for tiles
interface Tile {
  id: string;
  label: string;
  image: any;
}

// Hardcoded tiles and fields
const tileOptions: Tile[] = [
  { id: "1", label: "Amaranth", image: amaranthImage },
  { id: "2", label: "Arugula", image: arugulaImage },
  { id: "3", label: "Asian Pears", image: asianPearImage },
  { id: "4", label: "Beets", image: beetImage },
  { id: "5", label: "Bok Choy", image: bokImage },
  { id: "6", label: "Broccoli", image: brocImage },
  { id: "7", label: "Broccoli Rabe", image: rabeImage },
  { id: "8", label: "Cabbage", image: cabbageImage },
];

// Tile and FlatList magic
const TileSelector: React.FC = () => {
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const navigation = useNavigation<SearchScreenNavigationProp>();

    return (
    <View style={styles.container}>
        <Text style={styles.header}>Search</Text>
      <FlatList
        data={tileOptions}                  // Gets data from tileOptions
        keyExtractor={(item) => item.id}    // Gets id from each 'Tile'
        numColumns={4}                      // Number of columns per row
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tile,
              selectedTile === item.id && styles.selectedTile,
            ]}
            onPress={() => setSelectedTile(item.id)}
          >
            <Image source={item.image} style={styles.image} />
            <Text style={[styles.tileText, selectedTile === item.id && styles.selectedText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
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

export default TileSelector;
