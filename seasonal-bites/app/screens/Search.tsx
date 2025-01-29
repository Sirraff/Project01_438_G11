import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

interface Tile {
  id: string;
  label: string;
}

const tileOptions: Tile[] = [
  { id: "1", label: "Amaranth" },
  { id: "2", label: "Arugula" },
  { id: "3", label: "Asian Pears" },
  { id: "4", label: "Beets" },
];

const TileSelector: React.FC = () => {
  const [selectedTile, setSelectedTile] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <FlatList
        data={tileOptions}
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
            <Text style={styles.tileText}>{item.label}</Text>
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
    backgroundColor: "#2d936c",
  },
  tileText: {
    fontSize: 16,
    color: "#333",
  },
});

export default TileSelector;
