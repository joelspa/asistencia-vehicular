import React from 'react';
import { View, Text, Switch } from 'react-native';
import { LucideShieldCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { styles } from '../styles/HomeStyles';
// Componente de toggle para Modo Moto  
// Es el modo de protección para motociclistas, que activa un monitoreo especial de sensores críticos para motos, como inclinación y vibración. 
// Al activarlo, muestra un borde purpura y un mensaje de monitoreo activo.
// Ideal para usuarios de motos que quieren una capa extra de seguridad. 
export const MotoModeToggle = ({ isActive, onToggle }: { isActive: boolean, onToggle: () => void }) => (
  <View style={[styles.motoRow, isActive && styles.motoActiveBorder]}>
    <View>
      <Text style={styles.motoTitle}>Modo Moto</Text>
      <Text style={styles.subText}>Protección para motociclistas</Text>
      {isActive && (
        <View style={styles.monitoringContainer}>
          <LucideShieldCheck color={colors.motoActive} size={14} />
          <Text style={styles.monitoringText}> Monitoreando sensores...</Text>
        </View>
      )}
    </View>
    <Switch
      trackColor={{ false: colors.border, true: colors.motoActive }}
      thumbColor={colors.surface}
      onValueChange={onToggle}
      value={isActive}
    />
  </View>
);