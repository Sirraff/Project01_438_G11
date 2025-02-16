// app/screens/Login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Menu: undefined;
  Search: undefined;
  Settings: undefined;
  LocationSettings: undefined;
  Loading: undefined;
  Favorites: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<LoginScreenNavigationProp>();

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = response.user;

      if (!user.emailVerified) {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before logging in. Check your inbox (and spam folder) for the verification email."
        );
        setLoading(false);
        return;
      }
      
      console.log('Login successful:', response);
      navigation.navigate('Loading'); // Navigate to your main screen
    } catch (err: any) {
      console.error(err);
      setError(err.message);
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

        {/* Debug log added here */}
        <TouchableOpacity
          onPress={() => {
            console.log("Navigating to CreateAccount");
            navigation.navigate('CreateAccount');
          }}
        >
          <Text style={styles.footerText}>Don’t have an account? Sign up here.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
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
  title: { fontSize: 36, fontWeight: 'bold', color: '#2d936c', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 40 },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 20, fontSize: 16 },
  button: { backgroundColor: '#2d936c', borderRadius: 8, padding: 15, alignItems: 'center' },
  disabledButton: { backgroundColor: '#a0c1b6' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  errorText: { color: 'red', marginBottom: 15, textAlign: 'center' },
  footerText: { color: '#2d936c', fontSize: 14, textAlign: 'center', marginTop: 15 },
});

export default Login;
