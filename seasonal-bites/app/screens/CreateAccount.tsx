// app/screens/CreateAccount.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { insertUniqueUser } from "../database/UserDatabase";

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

type CreateAccountScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateAccount'>;

const CreateAccount: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<CreateAccountScreenNavigationProp>();

  // Validate password: 8+ characters, uppercase, lowercase, number, and special character.
  const validPassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar
    );
  };

  const signUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validPassword(password)) {
      setError(
        'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.'
      );
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      console.log("Verification email sent to:", user.email);

      const success = await insertUniqueUser(email || "Email Missing", user.uid || "Missing UID", "");
      if (success) {
        console.log(`Successfully inserted '${email}' into database.`);
      } else {
        console.log(`Duplicate user '${email}' - not inserted.`);
      }

      Alert.alert(
        "Verify Your Email",
        "A verification email has been sent to your inbox. Please verify your email before logging in."
      );
      navigation.navigate('Login');
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Seasonal Bites today!</Text>

      <View style={styles.formContainer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={signUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#2d936c', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 20 },
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
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#2d936c', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#a0c1b6' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  footerText: { color: '#2d936c', fontSize: 14, textAlign: 'center', marginTop: 15 },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
});

export default CreateAccount;
