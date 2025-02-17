import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../utils/navigation';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../FirebaseConfig';
import { getUserByBaseId, updateUserLastLogin } from "../database/UserDatabase";
import { collection, doc, getDoc } from "firebase/firestore";

type MenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Menu'>;

const Menu: React.FC = () => {
    const navigation = useNavigation<MenuScreenNavigationProp>();
    const [isCheckingLocation, setIsCheckingLocation] = useState(true);
    const [userData, setUserData] = useState<{ name_user: string; location: string; last_login: number; base_id: string } | null>(null);
    const [removedProduce, setRemovedProduce] = useState<string[]>([]);
    const [newProduce, setNewProduce] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    // Fetch produce data for a given month
    const getProduceForMonth = async (state: string, month: number) => {
        try {
            const monthRef = doc(FIRESTORE_DB, "States", state, "Months", month.toString());
            const docSnapshot = await getDoc(monthRef);

            if (docSnapshot.exists()) {
                return docSnapshot.data().in_season || []; // ✅ Extract the 'in_season' array
            } else {
                console.warn(`⚠️ No produce data found for ${state}, month ${month}`);
                return [];
            }
        } catch (error) {
            console.error(`❌ Error fetching produce for ${state}, month ${month}:`, error);
            return [];
        }
    };


    // Process produce changes
    const processProduceChanges = async (lastMonth: number, currentMonth: number, userLocation: string) => {
        try {
            console.log(`📍 Fetching produce data for location: ${userLocation}`);
            const [lastMonthProduce, currentMonthProduce] = await Promise.all([
                getProduceForMonth(userLocation, lastMonth),
                getProduceForMonth(userLocation, currentMonth),
            ]);

            const removed = lastMonthProduce.filter((id: string) => !currentMonthProduce.includes(id));
            const added = currentMonthProduce.filter((id: string) => !lastMonthProduce.includes(id));

            setRemovedProduce(removed);
            setNewProduce(added);

            if (removed.length > 0 || added.length > 0) {
                setModalVisible(true);
            }
            console.log("Produce Fetched")
        } catch (error) {
            console.error("❌ Error processing produce changes:", error);
        }
    };

    // Fetch user data directly from the database (no caching)
    const fetchUserData = async () => {
        try {
            console.log("🔍 Fetching user data from local database...");
            const currentUser = FIREBASE_AUTH.currentUser;

            if (!currentUser) {
                navigation.replace("Login");
                return;
            }

            const userRecord = await getUserByBaseId(currentUser.uid);
            if (userRecord) {
                setUserData({
                    ...userRecord,
                    last_login: userRecord.last_login.getTime() // Convert Date to timestamp
                });

                const lastLogin = new Date(userRecord.last_login);
                const currentDate = new Date();

                const lastLoginMonth = lastLogin.getFullYear() * 12 + lastLogin.getMonth();
                const currentMonth = currentDate.getFullYear() * 12 + currentDate.getMonth();

                if (lastLoginMonth !== currentMonth) {
                    await updateUserLastLogin(userRecord.base_id, currentDate);
                    await processProduceChanges(lastLogin.getMonth() + 1, currentDate.getMonth() + 1, userRecord.location);
                }

                if (!userRecord.location) {
                    navigation.replace("LocationSettings");
                    return;
                }
            } else {
                navigation.replace("Login");
                return;
            }
        } catch (error) {
            console.error("❌ Error fetching user data:", error);
        } finally {
            setIsCheckingLocation(false);
        }
    };

    // Re-fetch user data whenever Menu screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [])
    );

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

            {/* Modal for Produce Changes */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🌿 Produce Update</Text>

                        {/* Show what was newly added this month */}
                        {newProduce.length > 0 && (
                            <View>
                                <Text style={styles.modalSubtitle}>Now in Season 🌱</Text>
                                <Text style={styles.modalText}>{newProduce.join(', ')}</Text>
                            </View>
                        )}

                        {/* Show what was available last time but isn’t now */}
                        {removedProduce.length > 0 && (
                            <View>
                                <Text style={styles.modalSubtitle}>No Longer in Season ❌</Text>
                                <Text style={styles.modalText}>{removedProduce.join(', ')}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('Search')}
                >
                    <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('Favorites')}
                >
                    <Text style={styles.buttonText}>Favorites</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Text style={styles.buttonText}>Settings</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25, backgroundColor: '#f5f5f5' },
    title: { fontSize: 42, fontWeight: 'bold', color: '#2d936c', textAlign: 'center', marginBottom: 30 },
    subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 20 },
    buttonContainer: { width: '100%', alignItems: 'center', marginTop: 20 },
    navButton: { width: '85%', backgroundColor: '#2d936c', paddingVertical: 16, paddingHorizontal: 40, marginVertical: 8, alignItems: 'center', borderRadius: 10, elevation: 5 },
    buttonText: { color: 'white', fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    loadingText: { marginTop: 12, fontSize: 18, color: '#333', fontWeight: 'bold' },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10
    },
    modalSubtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5
    },
    modalText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10
    },
    modalButton: {
        marginTop: 15,
        backgroundColor: '#2d936c',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8
    }
});


export default Menu;
