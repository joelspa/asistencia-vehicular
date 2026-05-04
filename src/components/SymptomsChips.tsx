import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/HomeStyles';
// Props para el componente de Chips de síntomas
// data: lista de síntomas frecuentes a mostrar como chips
interface Props {
  data: string[];
  currentValue: string;
  onSelect: (val: string) => void;
}
// Componente de Chips para síntomas frecuentes
// Muestra una lista de síntomas comunes como chips seleccionables para que los usuarios puedan elegir rápidamente sin escribir.
// Al seleccionar un chip, se resalta y se actualiza el estado del síntoma seleccionado en HomeScreen.
// Ideal para usuarios que quieren una forma rápida de describir los problemas de su vehículo sin escribir mucho texto.
export const SymptomsChips = ({ data, currentValue, onSelect }: Props) => (
  <View style={styles.chipsContainer}>
    {data.map((item, index) => {
      const isActive = currentValue === item;
      return (
        <TouchableOpacity
          key={index}
          style={[styles.chip, isActive && styles.chipActive]}
          onPress={() => onSelect(item)}
        >
          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
            {item}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);