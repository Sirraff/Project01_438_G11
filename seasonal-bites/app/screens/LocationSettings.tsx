import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { stateData } from "../utils/locationStorage";

// Allows users to input, save, and clear their state location
const LocationSettings: React.FC = () => {
    const [stateInput, setStateInput] = useState("");
    const [location, setLocation] = useState<{ name: string; abbreviation: string } | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadLocation = async () => {
            const savedState = await AsyncStorage.getItem("selectedState");
            if (savedState) {
                const foundState = Object.values(stateData).find(
                    (state) => state.abbreviation === savedState || state.name.toLowerCase() === savedState.toLowerCase()
                );
                if (foundState) {
                    setLocation(foundState);
                    setStateInput(savedState);
                }
            }
        };
        loadLocation();
    }, []);

    // Handles saving a valid state (name or abbreviation) and storing it in AsyncStorage
    const handleSaveLocation = async () => {
        const upperInput = stateInput.toUpperCase();
        const foundState = Object.values(stateData).find(
            (state) => state.abbreviation === upperInput || state.name.toLowerCase() === stateInput.toLowerCase()
        );

        if (foundState) {
            setLocation(foundState);
            await AsyncStorage.setItem("selectedState", foundState.abbreviation);
            setError("");
        } else {
            setError("Invalid state. Please enter a valid U.S. state name or abbreviation.");
        }
    };

    // Clears the saved state
    const handleClearLocation = async () => {
        await AsyncStorage.removeItem("selectedState");
        setStateInput("");
        setLocation(null);
        setError("");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Set Your Location</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Enter State (e.g., CA or California)"
                value={stateInput}
                onChangeText={(text) => {
                    setStateInput(text);
                    setError("");
                }}
            />

            <TouchableOpacity style={styles.button} onPress={handleSaveLocation}>
                <Text style={styles.buttonText}>Save Location</Text>
            </TouchableOpacity>

            {location && (
                <Text style={styles.locationText}>
                    Selected Location: {location.name} ({location.abbreviation})
                </Text>
            )}

            {location && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClearLocation}>
                    <Text style={styles.clearButtonText}>X</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2d936c",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
    },
    input: {
        height: 50,
        width: "80%",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#2d936c",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 40,
        alignItems: "center",
        marginVertical: 5,
    },
    clearButton: {
        backgroundColor: "#d9534f",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    clearButtonText: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    locationText: {
        fontSize: 18,
        color: "#333",
        marginTop: 20,
    },
});

export default LocationSettings;
