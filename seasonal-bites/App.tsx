// App.tsx (located in your project root)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './app/screens/Login';
import CreateAccount from './app/screens/CreateAccount';
import Menu from './app/screens/Menu';
import TileSelector from "./app/screens/Search";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateAccount}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Menu"
          component={Menu}
          // Enable the header for Menu so the logout button appears.
          options={{ headerShown: true }}
        />
         <Stack.Screen
           name='TileSelector'
           component={TileSelector}
           options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
