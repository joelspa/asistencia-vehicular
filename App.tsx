import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Tipado de navegación
import { RootStackParamList } from './src/types/navigation';

// Importación de pantallas
import HomeScreen from './src/screens/HomeScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ResultScreen from './src/screens/ResultScreen';
import MapScreen from './src/screens/MapScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AccidentAlertScreen from './src/screens/AccidentAlertScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    /**
     * SafeAreaProvider: Es el contenedor de nivel superior necesario 
     * para que useSafeAreaInsets() funcione en HomeScreen y MapScreen.
     */
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Inicio" 
          screenOptions={{ 
            headerShown: false,
            animation: 'fade' // Opcional: transiciones más suaves
          }}
        >
          <Stack.Screen name="Inicio" component={HomeScreen} />
          <Stack.Screen name="Carga" component={LoadingScreen} />
          <Stack.Screen name="Resultado" component={ResultScreen} />
          <Stack.Screen name="Mapa" component={MapScreen} />
          <Stack.Screen name="Historial" component={HistoryScreen} />
          <Stack.Screen name="Alerta" component={AccidentAlertScreen} />
          <Stack.Screen name="Configuracion" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}