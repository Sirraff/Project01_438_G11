import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../utils/navigation";
import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../FirebaseConfig";
import * as FileSystem from 'expo-file-system';

import { insertUniqueProduce } from '../database/FruitDatabase';


interface ProduceItem {
    id: string;
    name?: string;
    description?: string;
    imageUrl?: string;
}

const Loading: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loading, setLoading] = useState(true);
    const [produceList, setProduceList] = useState<ProduceItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {

            console.log("Fetching data from Firestore...");
            const produceRef = collection(FIRESTORE_DB, "Produce");
            const snapshot = await getDocs(produceRef);

            const fetchedProduce: ProduceItem[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setProduceList(fetchedProduce);
            await downloadImages(fetchedProduce);

            setLoading(false);
        };

        fetchData();
    }, []);

    // Download images from Firebase Storage and save them locally
    const downloadImages = async (produceItems: ProduceItem[]) => {
        await Promise.all(
            produceItems.map(async (item) => {
                if (item.imageUrl) {
                    try {
                        const localUri = `${FileSystem.documentDirectory}${item.id}.png`;

                        // Check if the file already exists
                        const fileInfo = await FileSystem.getInfoAsync(localUri);
                        if (!fileInfo.exists) {
                            console.log(`Downloading image for ${item.id}`);
                            await FileSystem.downloadAsync(item.imageUrl, localUri);
                        }

                        const success = await insertUniqueProduce(item.name || "Unnamed", item.description || "", localUri);
                        if (success) {
                            console.log(`Inserted ${item.name} into database.`);
                        } else {
                            console.log(`Skipped ${item.name}, already exists in database.`);
                        }

                    } catch (error) {
                        console.error(`Error processing image for ${item.id}:`, error);
                    }
                }

            })
        );
    };


    // Redirect when loading is finished
    useEffect(() => {
        if (!loading) {
            navigation.replace("Menu");
        }
    }, [loading, navigation]);

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator size="large" color="#2d936c" /> : null}
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
