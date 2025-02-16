import { DefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

// Define Light Theme
export const LightTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: "#f5f5f5",
        text: "#000",
        buttonBackground: "#2d936c",
        buttonText: "#ffffff",
        headerBackground: "#2d936c",
        headerText: "#ffffff",
    },
};

// Define Dark Theme
export const CustomDarkTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        background: "#252525",
        text: "#ffffff",
        buttonBackground: "#2d936c",
        buttonText: "#ffffff",
        headerBackground: "#2d936c",
        headerText: "#ffffff",
    },
};

// Function to toggle theme and save preference
export const useThemeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        const loadTheme = async () => {
            const storedTheme = await AsyncStorage.getItem("darkMode");
            setIsDarkMode(storedTheme === "true");
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        if (isDarkMode === null) return;
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        await AsyncStorage.setItem("darkMode", newTheme.toString());
    };

    return { isDarkMode, toggleTheme };
};

// Function to get theme styles dynamically
export const getThemeStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: isDarkMode ? CustomDarkTheme.colors.background : LightTheme.colors.background,
        },
        title: {
            fontSize: 24,
            fontWeight: "bold",
            color: isDarkMode ? CustomDarkTheme.colors.text : LightTheme.colors.text,
            marginBottom: 20,
        },
        text: {
            fontSize: 18,
            color: isDarkMode ? CustomDarkTheme.colors.text : LightTheme.colors.text,
        },
        button: {
            backgroundColor: isDarkMode ? CustomDarkTheme.colors.buttonBackground : LightTheme.colors.buttonBackground,
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 40,
            marginVertical: 5,
            width: "80%",
            alignItems: "center",
        },
        buttonText: {
            color: isDarkMode ? CustomDarkTheme.colors.buttonText : LightTheme.colors.buttonText,
            fontSize: 16,
            fontWeight: "600",
        },
    });
