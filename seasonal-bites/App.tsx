import { NavigationContainer } from '@react-navigation/native';  // Correct import for NavigationContainer
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './app/screens/Login';
import CreateAccount from './app/screens/CreateAccount';
import Menu from './app/screens/Menu';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}  // Hides the header for the login screen
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccount}
          options={{ headerShown: false }}  // Hides the header for the create account screen
        />
        <Stack.Screen
          name="Menu"
          component={Menu}
          options={{ headerShown: false }}  // Hides the header for the menu screen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
