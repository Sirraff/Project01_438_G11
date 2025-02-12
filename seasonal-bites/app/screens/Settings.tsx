import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../utils/navigation";

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, "Settings">;

const Settings: React.FC = () => {
    const navigation = useNavigation<SettingsScreenNavigationProp>();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("LocationSettings")}
            >
                <Text style={styles.buttonText}>Set Location</Text>
            </TouchableOpacity>
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
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#2d936c",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 40,
        marginVertical: 5,
        width: "80%",
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default Settings;
