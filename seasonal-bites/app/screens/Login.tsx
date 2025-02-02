// app/screens/Login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the navigation parameter types.
type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Menu: undefined;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Type your navigation object.
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', response);
      navigation.navigate('Menu');
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seasonal Bites</Text>
      <Text style={styles.subtitle}>Fresh Flavors, Every Season</Text>
      
      <View style={styles.formContainer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]}
          onPress={signIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#f5f5f5'
  },
  formContainer: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
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
      marginBottom: 40,
  },
  input: {
      height: 50,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 15,
      marginBottom: 20,
      fontSize: 16,
  },
  button: {
      backgroundColor: '#2d936c',
      borderRadius: 8,
      padding: 15,
      alignItems: 'center',
  },
  disabledButton: {
      backgroundColor: '#a0c1b6',
  },
  buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
  },
  errorText: {
      color: 'red',
      marginBottom: 15,
      textAlign: 'center',
  },
});

export default Login;
