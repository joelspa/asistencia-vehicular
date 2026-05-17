/**
 * CauseRow.tsx - Fila de causa probable en el resultado de diagnostico.
 * Muestra el nombre de la causa, una barra de probabilidad proporcional
 * y el porcentaje numerico.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface CauseRowProps {
  title: string;
  percentage: number;
  color: string;
}

/**
 * Renderiza una fila con el nombre de la causa, barra visual y porcentaje.
 * El color de la barra se pasa como prop para diferenciar causas.
 */
export default function CauseRow({ title, percentage, color }: CauseRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.percentage}>{percentage}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  title: {
    flex: 1,
    fontSize: 13,
    color: colors.secondaryText,
    paddingRight: 8,
  },
  bar: {
    width: 80,
    height: 4,
    backgroundColor: colors.surface2,
    borderRadius: 10,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  percentage: {
    width: 36,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
  },
});
