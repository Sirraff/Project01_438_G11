import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { zipCodeData } from "../utils/locationStorage";

// Allows users to input, save, and clear their ZIP code location
const LocationSettings: React.FC = () => {
    const [zipCode, setZipCode] = useState("");
    const [location, setLocation] = useState<{ city: string; state: string } | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadLocation = async () => {
            const savedZip = await AsyncStorage.getItem("selectedZipCode");
            if (savedZip && zipCodeData[savedZip]) {
                setLocation(zipCodeData[savedZip]);
                setZipCode(savedZip);
            }
        };
        loadLocation();
    }, []);

    // Handles saving a valid ZIP code and storing it in AsyncStorage
    const handleSaveLocation = async () => {
        if (zipCodeData[zipCode]) {
            const selectedLocation = zipCodeData[zipCode];
            setLocation(selectedLocation);
            await AsyncStorage.setItem("selectedZipCode", zipCode);
            setError("");
        } else {
            setError("Invalid ZIP code. Please enter a valid ZIP code.");   // Show error
        }
    };

    // Clears the saved ZIP code
    const handleClearLocation = async () => {
        await AsyncStorage.removeItem("selectedZipCode");
        setZipCode("");
        setLocation(null);
        setError("");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Set Your Location</Text>
            <Text style={styles.subtitle}>Enter your ZIP code to customize results.</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Enter ZIP Code"
                keyboardType="numeric"
                value={zipCode}
                onChangeText={(text) => {
                    setZipCode(text);
                    setError("");
                }}
            />

            <TouchableOpacity style={styles.button} onPress={handleSaveLocation}>
                <Text style={styles.buttonText}>Save Location</Text>
            </TouchableOpacity>

            {location && (
                <Text style={styles.locationText}>
                    Selected Location: {location.city}, {location.state}
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