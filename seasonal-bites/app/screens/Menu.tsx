// app/screens/Menu.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define your navigation parameter types.
type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Menu: undefined;
};

const Menu: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error signing out:', error);
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
        <TouchableOpacity
          style={styles.button}
          onPress={() => {}}
        >
          <Text style={styles.buttonText}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {}}
        >
          <Text style={styles.buttonText}>Favorites</Text>
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
