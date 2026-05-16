/**
 * FilterPill.tsx - Boton de filtro en forma de pastilla.
 * Se usa en el historial para filtrar entradas por tipo de urgencia.
 * Muestra un punto de color opcional y cambia su apariencia cuando esta activo.
 */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface FilterPillProps {
  label: string;
  active?: boolean;
  dotColor?: string;
  onPress?: () => void;
}

/**
 * Renderiza un filtro en forma de pastilla con estado activo/inactivo.
 * Incluye un punto de color opcional para identificar visualmente la categoria.
 */
export default function FilterPill({ label, active, dotColor, onPress }: FilterPillProps) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {dotColor && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderColor,
    backgroundColor: 'transparent',
  },
  pillActive: {
    backgroundColor: colors.primaryText,
    borderColor: colors.primaryText,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  textActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
