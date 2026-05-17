/**
 * SectionLabel.tsx - Etiqueta de seccion en mayusculas.
 * Se usa como titulo de secciones dentro de tarjetas y listas.
 * Renderiza texto en mayusculas con espaciado de letras.
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useColors } from '../context/ThemeContext';

interface SectionLabelProps {
  children: string;
  color?: string;
}

/**
 * Renderiza un texto de etiqueta de seccion estilizado en mayusculas.
 * Acepta un color personalizado opcional para variaciones tematicas.
 */
export default function SectionLabel({ children, color }: SectionLabelProps) {
  const colors = useColors();
  return (
    <Text style={[styles.label, { color: color ?? colors.tertiaryText }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
