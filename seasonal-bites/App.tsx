import { createStaticNavigation, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './app/screens/Login';
import CreateAccount from './app/screens/CreateAccount';
import Menu from './app/screens/Menu';
import TileSelector from "./app/screens/Search";

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Menu'>
        <Stack.Screen name='Login' component={Login} options={{headerShown: false}}/>
        <Stack.Screen name='CreateAccount' component={CreateAccount} options={{ headerShown: false }} />
        <Stack.Screen name='Menu' component={Menu} options={{ headerShown: false }} />
        <Stack.Screen name='TileSelector' component={TileSelector} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
