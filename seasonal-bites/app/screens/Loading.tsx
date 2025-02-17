import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../utils/navigation";
import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB, FIREBASE_AUTH } from "../../FirebaseConfig";
import * as FileSystem from "expo-file-system";

import { insertUniqueProduce, getProduce } from "../database/FruitDatabase";
import { getUserByBaseId, insertUser } from "../database/UserDatabase";

interface ProduceItem {
    id: string;
    name?: string;
    description?: string;
    imageurl?: string;
}

const Loading: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(true);
    const [produceList, setProduceList] = useState<ProduceItem[]>([]);
    const [databaseStatus, setDatabaseStatus] = useState<string>("Checking database...");
    const [redirectToLocationSettings, setRedirectToLocationSettings] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("🔄 Fetching current Firebase user...");
                const auth = FIREBASE_AUTH;
                const currentUser = auth.currentUser;

                if (!currentUser) {
                    console.warn("⚠️ No user is currently logged in.");
                    return;
                }

                const userUID = currentUser.uid; // Firebase user's unique ID
                const userEmail = currentUser.email || "Unknown User"; // Fallback for email
                console.log(`👤 Logged in as: ${userEmail} (UID: ${userUID})`);

                // 🔍 Check if the user exists in the local database
                const localUser = await getUserByBaseId(userUID);

                if (!localUser) {
                    console.log("🆕 User not found in local database. Inserting...");
                    const inserted = await insertUser(userEmail, userUID, "", new Date(), "");
                    if (inserted) {
                        console.log("✅ User successfully added to local database.");
                        setRedirectToLocationSettings(true);
                    }
                } else {
                    console.log("✔️ User already exists in local database.");
                    // Check if location is missing
                    if (!localUser.location || localUser.location.trim() === "") {
                        console.warn("⚠️ User has no stored location. Redirecting...");
                        setRedirectToLocationSettings(true);
                    }
                }

                console.log("🔄 Fetching data from Firestore...");
                const produceRef = collection(FIRESTORE_DB, "Produce");
                const snapshot = await getDocs(produceRef);

                const fetchedProduce: ProduceItem[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setProduceList(fetchedProduce);
                console.log(`✅ Retrieved ${fetchedProduce.length} items from Firestore.`);

                await downloadImages(fetchedProduce);
                await logDatabaseContent();

                setLoading(false);
            } catch (error) {
                console.error("❌ Error fetching Firestore data:", error);
            }
        };

        fetchData();
    }, []);

    // Download images and insert into DB with detailed logging
    const downloadImages = async (produceItems: ProduceItem[]) => {
        console.log("📥 Starting image download and database insert...");

        await Promise.all(
            produceItems.map(async (item) => {
                if (item.imageurl) {
                    try {
                        const localUri = `${FileSystem.documentDirectory}${item.id}.png`;
                        const fileInfo = await FileSystem.getInfoAsync(localUri);

                        if (!fileInfo.exists) {
                            await FileSystem.downloadAsync(item.imageurl, localUri);
                        }

                        const success = await insertUniqueProduce(
                            item.id || "ID Missing",
                            item.name || "Unnamed",
                            item.description || "",
                            localUri
                        );

                    } catch (error) {
                        console.error(`❌ Error processing '${item.name}':`, error);
                    }
                } else {
                    console.warn(`⚠️ Missing imageUrl for '${item.name}', skipping insertion.`);
                }
            })
        );

        console.log("✅ Image downloads and database insertions complete.");
    };

    // Fetch and log database content
    const logDatabaseContent = async () => {
        try {
            const allProduce = await getProduce();
            console.log(`📜 Retrieved ${allProduce.length} items from SQLite.`);

            if (allProduce.length === 0) {
                console.warn("⚠️ No data found in SQLite.");
            }

            allProduce.forEach((item: any, index: number) => {
                console.log(`${index + 1}. ${item.produce_doc} - ${item.name_produce} - ${item.description} - ${item.imageurl}`);
            });

            setDatabaseStatus(`Database contains ${allProduce.length} items.`);
        } catch (error) {
            console.error("❌ Error fetching database contents:", error);
        }
    };

    // Redirect when loading is finished
    useEffect(() => {
        if (!loading) {
            if (redirectToLocationSettings) {
                navigation.replace("LocationSettings"); // Redirect to location settings if missing
            } else {
                navigation.replace("Menu"); // Otherwise, go to the menu
            }
        }
    }, [loading, redirectToLocationSettings, navigation]);
    

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator size="large" color="#2d936c" /> : <Text>{databaseStatus}</Text>}
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});

export default Loading;
