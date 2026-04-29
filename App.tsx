import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';

// Importación exacta de los archivos que tienes en tu carpeta screens
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
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio">
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Carga" component={LoadingScreen} />
        <Stack.Screen name="Resultado" component={ResultScreen} />
        <Stack.Screen name="Mapa" component={MapScreen} />
        <Stack.Screen name="Historial" component={HistoryScreen} />
        <Stack.Screen name="Alerta" component={AccidentAlertScreen} />
        <Stack.Screen name="Configuracion" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}