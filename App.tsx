/**
 * App.tsx - Componente raiz de MotorSense.
 * Navegación: tab bar inferior con 4 pestanas + pila para pantallas modales.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList, TabParamList } from './src/types/navigation';

import { ModoMotoProvider } from './src/context/ModoMotoContext';
import { ThemeProvider, useColors } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ResultScreen from './src/screens/ResultScreen';
import MapScreen from './src/screens/MapScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { Sparkles, Clock, MapPin, Car } from 'lucide-react-native';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<string, typeof Sparkles> = {
  Inicio: Sparkles,
  Mapa: MapPin,
  Historial: Clock,
  Configuracion: Car,
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const colors = useColors();
  const IconComp = TAB_ICONS[name] ?? Sparkles;
  return (
    <View style={tabStyles.iconWrap}>
      <IconComp
        color={focused ? colors.brand : colors.tertiaryText}
        size={22}
        strokeWidth={focused ? 2.2 : 1.7}
      />
      {focused && <View style={[tabStyles.indicator, { backgroundColor: colors.brand }]} />}
    </View>
  );
}

function MainTabs() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarShowLabel: false,
        tabBarStyle: [
          tabStyles.tabBar,
          {
            height: 64 + insets.bottom,
            paddingBottom: insets.bottom,
            backgroundColor: colors.cardBackground,
            borderTopColor: colors.borderColor,
          },
        ],
        tabBarItemStyle: { paddingVertical: 0, height: '100%' },
        tabBarIconStyle: { flex: 1 },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Historial" component={HistoryScreen} />
      <Tab.Screen name="Configuracion" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <ModoMotoProvider>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="Carga" component={LoadingScreen} />
                <Stack.Screen name="Resultado" component={ResultScreen} />
              </Stack.Navigator>
            </ModoMotoProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    height: 64,
    borderTopWidth: 1,
    paddingHorizontal: 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },
});
