import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { collection, doc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import { getAuth } from "firebase/auth"; // Import authentication

interface FullUser {
    id: number;
    name_user: string;
    base_id: string;
    favorites: string;
}

const Favorites = () => {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const auth = getAuth(); // Get Firebase authentication instance

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.log("No authenticated user found.");
                    setLoading(false);
                    return;
                }

                const userId = user.uid; // Get the authenticated user's ID
                console.log("Fetching favorites for user:", userId);

                // Reference to the document in the 'favorites' collection
                const userFavoritesRef = doc(FIRESTORE_DB, "favorites", userId); // Correct way
                const docSnap = await getDoc(userFavoritesRef);

                if (docSnap.exists()) {
                    setFavorites(docSnap.data().favorites_list || []); // Assuming 'favorites' is stored as an array
                } else {
                    console.log("No favorites found for this user.");
                }

            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : favorites.length > 0 ? (
                favorites.map((item, index) => <Text key={index}>{item}</Text>)
            ) : (
                <Text>No favorites found.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default Favorites;
