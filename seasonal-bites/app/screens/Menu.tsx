// app/screens/Menu.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../utils/navigation';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signOut } from 'firebase/auth';

type MenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Menu'>;

const Menu: React.FC = () => {
    const navigation = useNavigation<MenuScreenNavigationProp>();

    // Function to handle user logout
    const handleLogout = async () => {
        try {
            await signOut(FIREBASE_AUTH);   // Signs out from Firebase auth
            navigation.navigate('Login');   // Redirects to Login screen
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    // Set the header's logout button. We can prob modularize it but meh...
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button title="Logout" onPress={handleLogout} color="#2d936c" />
            ),
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Seasonal Bites</Text>
            <Text style={styles.subtitle}>Discover what’s fresh and in season!</Text>

            <View style={styles.buttonContainer}>
                {/* Button to navigate to the search screen */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Search')}
                >
                    <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>

                {/* Placeholder button for Favorites screen */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Favorites')}
                >
                    <Text style={styles.buttonText}>Favorites</Text>
                </TouchableOpacity>

                {/* Button to navigate to the settings screen */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("Settings")}
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
      padding: 20,
      backgroundColor: '#f5f5f5',
  },
  title: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#2d936c',
      textAlign: 'center',
      marginBottom: 10,
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
  },
  button: {
      backgroundColor: '#2d936c',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 40,
      marginVertical: 5,
      width: '80%',
      alignItems: 'center',
  },
  buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
  },
});

export default Menu;