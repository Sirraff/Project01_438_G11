import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../utils/navigation";
import { getThemeStyles, useThemeToggle } from "../utils/Themes";

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, "Settings">;

const Settings: React.FC = () => {
    const navigation = useNavigation<SettingsScreenNavigationProp>();
    const { isDarkMode, toggleTheme } = useThemeToggle();
    const styles = getThemeStyles(isDarkMode);

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

            {/* Placeholder */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <Text style={styles.text}>Enable Notifications</Text>
                <Switch/>
            </View>
        </View>
    );
};

export default Settings;
