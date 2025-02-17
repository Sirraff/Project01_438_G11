import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../utils/navigation";
import { getThemeStyles, useThemeToggle } from "../utils/Themes";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { updateUserLastLogin } from "../database/UserDatabase"; // Ensure correct path

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, "Settings">;

const Settings: React.FC = () => {
    const navigation = useNavigation<SettingsScreenNavigationProp>();
    const { isDarkMode, toggleTheme } = useThemeToggle();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const styles = getThemeStyles(isDarkMode);

    useEffect(() => {
        const loadNotificationsSetting = async () => {
            const savedSetting = await AsyncStorage.getItem("notificationsEnabled");
            if (savedSetting !== null) {
                setNotificationsEnabled(savedSetting === "true");
            }
        };
        loadNotificationsSetting();
    }, []);

    const toggleNotifications = async () => {
        const newSetting = !notificationsEnabled;
        setNotificationsEnabled(newSetting);
        await AsyncStorage.setItem("notificationsEnabled", newSetting.toString());
    };

    const handleUpdateLastLogin = async () => {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
            const base_id = user.uid; // Firebase UID as base_id
            const lastLoginDate = new Date();
            lastLoginDate.setMonth(3); // April (0-based index)
            lastLoginDate.setDate(1);  // Set to 1st of April
            await updateUserLastLogin(base_id, lastLoginDate);
        } else {
            console.error("❌ No authenticated user found.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("LocationSettings")}
            >
                <Text style={styles.buttonText}>Set Location</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <Text style={styles.text}>Dark Mode</Text>
                <Switch value={isDarkMode} onValueChange={toggleTheme} />
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <Text style={styles.text}>Enable Notifications</Text>
                <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleUpdateLastLogin}>
                <Text style={styles.buttonText}>Update Last Login</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Settings;
