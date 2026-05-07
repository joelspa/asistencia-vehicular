/**
 * PatternAlert.tsx - Alerta visual de falla recurrente.
 * Se muestra en el resultado de diagnostico cuando se detecta
 * que el usuario ha consultado por el mismo problema multiples veces.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

/**
 * Renderiza una alerta de patron recurrente con borde lateral naranja.
 * Indica al usuario que debe atender el problema con mayor urgencia.
 */
export default function PatternAlert() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{'\u26A0'}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>Falla recurrente detectada</Text>
        <Text style={styles.description}>
          Has consultado 3 veces en 2 semanas por ruidos en frenos. Requiere revision formal urgente.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.moderateSurface,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryOrange,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  icon: { fontSize: 18, marginTop: 2, color: colors.primaryOrange },
  content: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: colors.primaryOrange, marginBottom: 3 },
  description: { fontSize: 13, color: colors.secondaryText, lineHeight: 20 },
});
