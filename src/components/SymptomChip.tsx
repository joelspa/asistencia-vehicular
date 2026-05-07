/**
 * SymptomChip.tsx - Chip seleccionable de sintoma frecuente.
 * Se usa en la pantalla de inicio para que el usuario pueda seleccionar
 * rapidamente sintomas comunes sin necesidad de escribirlos.
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface SymptomChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

/**
 * Renderiza un chip con texto que alterna entre seleccionado y no seleccionado.
 * El estilo cambia visualmente para indicar el estado de seleccion.
 */
export default function SymptomChip({ label, selected, onPress }: SymptomChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  chipSelected: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  text: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  textSelected: {
    color: '#FFFFFF',
  },
});
