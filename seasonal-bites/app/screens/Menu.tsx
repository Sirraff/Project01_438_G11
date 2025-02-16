import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../utils/navigation';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../FirebaseConfig';
import { getUserByBaseId, updateUserLastLogin } from "../database/UserDatabase";
import { collection, doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type MenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Menu'>;

const Menu: React.FC = () => {
    const navigation = useNavigation<MenuScreenNavigationProp>();
    const [isCheckingLocation, setIsCheckingLocation] = useState(true);
    const [userData, setUserData] = useState<{ name_user: string; location: string; last_login: number; base_id: string } | null>(null);
    const [removedProduce, setRemovedProduce] = useState<string[]>([]);
    const [newProduce, setNewProduce] = useState<string[]>([]);
    const [removedFavorites, setRemovedFavorites] = useState<string[]>([]);
    const [newFavoriteMatches, setNewFavoriteMatches] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    // Fetch produce data for a given month
    const getProduceForMonth = async (state: string, month: number) => {
        try {
            const monthRef = doc(collection(FIRESTORE_DB, "States"), state, month.toString());
            const docSnapshot = await getDoc(monthRef);
            return docSnapshot.exists() ? docSnapshot.data().produce || [] : [];
        } catch (error) {
            console.error("❌ Error fetching produce from Firestore:", error);
            return [];
        }
    };

    // Process produce changes based on the user’s location
    const processProduceChanges = async (lastMonth: number, currentMonth: number, userId: string) => {
        try {
            const cachedUserData = await AsyncStorage.getItem("cachedUser");
            if (!cachedUserData) {
                console.warn("⚠️ No cached user data found.");
                return;
            }

            const parsedUser = JSON.parse(cachedUserData);
            const userLocation = parsedUser.location || "California"; // Fallback if location is missing
            console.log(`📍 Fetching produce data for location: ${userLocation}`);

            const [lastMonthProduce, currentMonthProduce] = await Promise.all([
                getProduceForMonth(userLocation, lastMonth),
                getProduceForMonth(userLocation, currentMonth)
            ]);

            setRemovedProduce(lastMonthProduce.filter((id: string) => !currentMonthProduce.includes(id)));
            setNewProduce(currentMonthProduce.filter((id: string) => !lastMonthProduce.includes(id)));

            setModalVisible(true);
        } catch (error) {
            console.error("❌ Error processing produce changes:", error);
        }
    };

    // Validate and update user data
    const checkUserData = async () => {
        try {
            const cachedUserData = await AsyncStorage.getItem("cachedUser");

            if (cachedUserData) {
                const parsedUser = JSON.parse(cachedUserData);
                setUserData(parsedUser);

                const lastLogin = new Date(parsedUser.last_login);
                const currentDate = new Date();

                if (lastLogin.getMonth() + 1 !== currentDate.getMonth() + 1 || lastLogin.getFullYear() !== currentDate.getFullYear()) {
                    await updateUserLastLogin(parsedUser.base_id, currentDate);
                    await processProduceChanges(lastLogin.getMonth() + 1, currentDate.getMonth() + 1, parsedUser.base_id);

                    const updatedUserData = { ...parsedUser, last_login: currentDate.getTime() };
                    await AsyncStorage.setItem("cachedUser", JSON.stringify(updatedUserData));
                    setUserData(updatedUserData);
                }

                if (!parsedUser.location) {
                    navigation.replace("LocationSettings");
                    return;
                }

                setIsCheckingLocation(false);
                return;
            }

            console.log("🔍 Fetching user data from database...");
            const currentUser = FIREBASE_AUTH.currentUser;

            if (!currentUser) {
                navigation.replace("Login");
                return;
            }

            const userRecord = await getUserByBaseId(currentUser.uid);

            if (userRecord) {
                const formattedUserRecord = { ...userRecord, last_login: userRecord.last_login.getTime() };
                setUserData(formattedUserRecord);
                await AsyncStorage.setItem("cachedUser", JSON.stringify(formattedUserRecord));

                if (!userRecord.location) {
                    navigation.replace("LocationSettings");
                    return;
                }
            } else {
                navigation.replace("Login");
                return;
            }
        } catch (error) {
            console.error("❌ Error checking user data:", error);
        }
        setIsCheckingLocation(false);
    };

    useEffect(() => {
        checkUserData();
    }, []);

    if (isCheckingLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2d936c" />
                <Text style={styles.loadingText}>Checking your data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Seasonal Bites</Text>
            <Text style={styles.subtitle}>Discover what’s fresh and in season!</Text>

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.navButton} 
                    onPress={() => navigation.navigate('Search', { userData })}
                >
                    <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.navButton} 
                    onPress={() => navigation.navigate('Favorites', { userData })}
                >
                    <Text style={styles.buttonText}>Favorites</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.navButton} 
                    onPress={() => navigation.navigate('Settings', { userData })}
                >
                    <Text style={styles.buttonText}>Settings</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 25, 
        backgroundColor: '#f5f5f5' 
    },
    title: { 
        fontSize: 42,  // Increased size
        fontWeight: 'bold', 
        color: '#2d936c', 
        textAlign: 'center', 
        marginBottom: 30, 
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonContainer: { 
        width: '100%', 
        alignItems: 'center', 
        marginTop: 20, 
    },
    navButton: { 
        width: '85%',  // Make buttons larger
        backgroundColor: '#2d936c', 
        paddingVertical: 16,  // More padding
        paddingHorizontal: 40, 
        marginVertical: 8, 
        alignItems: 'center', 
        borderRadius: 10, 
        elevation: 5, // Slight shadow effect for depth
    },
    buttonText: { 
        color: 'white', 
        fontSize: 20, // Larger text
        fontWeight: 'bold', 
        textTransform: 'uppercase', // Makes it more readable
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#f5f5f5' 
    },
    loadingText: { 
        marginTop: 12, 
        fontSize: 18,  // Bigger text
        color: '#333', 
        fontWeight: 'bold' 
    },
    modalContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.6)', // Darker for better contrast
    },
    modalContent: { 
        backgroundColor: 'white', 
        padding: 25, 
        borderRadius: 12, 
        width: '85%', 
        alignItems: 'center',
    },
    modalTitle: { 
        fontSize: 24, // More visible
        fontWeight: 'bold', 
        marginBottom: 15, 
        textAlign: 'center' 
    },
    sectionTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginTop: 15, 
        marginBottom: 8, 
        color: '#333', 
        textAlign: 'left', 
        alignSelf: 'flex-start',
    },
    closeButton: { 
        backgroundColor: '#2d936c', 
        paddingVertical: 12, 
        paddingHorizontal: 30, 
        marginTop: 15, 
        borderRadius: 8, 
        elevation: 3, 
    },
});


export default Menu;
