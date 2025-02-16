// App.tsx (located in your project root)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LightTheme, CustomDarkTheme, useThemeToggle } from './app/utils/Themes';

import Login from './app/screens/Login';
import CreateAccount from './app/screens/CreateAccount';
import Menu from './app/screens/Menu';
import Search from "./app/screens/Search";
import Settings from "./app/screens/Settings";
import LocationSettings from "./app/screens/LocationSettings";
import Loading from "./app/screens/Loading";
import Favorites from "./app/screens/Favorites";

const Stack = createNativeStackNavigator();

export default function App() {
    const { isDarkMode } = useThemeToggle();    // Get theme state
    const theme = isDarkMode ? CustomDarkTheme : LightTheme;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#2d936c",
          },
            headerTintColor: "#ffffff",
          }}
      >
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
           name='Search'
           component={Search}
           options={{ headerShown: true }}
         />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="LocationSettings"
            component={LocationSettings}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="Loading"
            component={Loading}
            options={{ headerShown: false }}
          />
                    <Stack.Screen
            name="Favorites"
            component={Favorites}
            options={{ headerShown: true }}
          />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
