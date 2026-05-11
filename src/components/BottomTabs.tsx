import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LucideWrench, LucideMap, LucideHistory, LucideSettings } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Importante
import { colors } from '../theme/colors';

export const BottomTabs = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // Función para detectar cuál está activo
  // Nota: Asegúrate que los nombres 'HomeScreen', 'MapScreen', etc. coincidan con tu Navigation
  const getIconColor = (screenName: string) => 
    route.name === screenName ? colors.textPrimary : colors.textSecondary;

  return (
    <View style={[
      localStyles.tabBar, 
      { 
        // Aplicamos el área segura de abajo dinámicamente
        paddingBottom: insets.bottom > 0 ? insets.bottom : 15,
        height: 65 + (insets.bottom > 0 ? insets.bottom : 0)
      }
    ]}>
      <TouchableOpacity onPress={() => navigation.navigate('Inicio')}>
        <LucideWrench color={getIconColor('HomeScreen')} size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Mapa')}>
        <LucideMap color={getIconColor('MapScreen')} size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Historial')}>
        <LucideHistory color={getIconColor('HistoryScreen')} size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Configuracion')}>
        <LucideSettings color={getIconColor('SettingsScreen')} size={24} />
      </TouchableOpacity>
    </View>
  );
};

const localStyles = StyleSheet.create({
  tabBar: {
    top: 0,
    left: 0 ,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    // Quitamos el position absolute para que empuje el contenido en HomeScreen
  },
});