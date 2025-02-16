import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { updateUserLocation } from "../database/UserDatabase";
import { stateData } from "../utils/locationStorage";
import { RootStackParamList } from "../utils/navigation";

const LocationSettings: React.FC = () => {
    const [stateInput, setStateInput] = useState("");
    const [location, setLocation] = useState<{ name: string; abbreviation: string } | null>(null);
    const [error, setError] = useState("");

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        const loadLocation = async () => {
            const savedState = await AsyncStorage.getItem("selectedState");
            if (savedState) {
                const foundState = Object.values(stateData).find(
                    (state) =>
                        state.abbreviation.toLowerCase() === savedState.toLowerCase() ||
                        state.name.toLowerCase() === savedState.toLowerCase()
                );
                if (foundState) {
                    setLocation(foundState);
                    setStateInput(foundState.name); // ✅ Pre-fill input with state name
                }
            }
        };
        loadLocation();
    }, []);

    const handleSaveLocation = async () => {
        const normalizedInput = stateInput.trim().toLowerCase();
        const foundState = Object.values(stateData).find(
            (state) =>
                state.abbreviation.toLowerCase() === normalizedInput || 
                state.name.toLowerCase() === normalizedInput
        );

        if (foundState) {
            setLocation(foundState);
            await AsyncStorage.setItem("selectedState", foundState.abbreviation);
            setError("");

            // ✅ Step 1: Get the current Firebase user's UID
            const auth = FIREBASE_AUTH;
            const currentUser = auth.currentUser;
            if (!currentUser) {
                setError("No logged-in user found.");
                return;
            }

            const userUID = currentUser.uid;

            // ✅ Step 2: Update the location in SQLite
            const updateSuccess = await updateUserLocation(userUID, foundState.abbreviation);

            if (updateSuccess) {
                console.log(`✅ Updated location for user ${userUID} to ${foundState.abbreviation}`);
                // ✅ Step 3: Redirect only after successful update
                navigation.replace("Menu");  
            } else {
                setError("Failed to update location. Please try again.");
            }
        } else {
            setError("Invalid state. Please enter a valid U.S. state name or abbreviation.");
        }
    };

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
