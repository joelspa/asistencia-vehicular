/**
 * UrgencyBadge.tsx - Insignia de nivel de urgencia.
 * Muestra el nivel numerico (1-3) del diagnostico en una pastilla visual.
 * Nivel 1 es verde (leve), niveles 2-3 son translucidos sobre fondo de color.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UrgencyBadgeProps {
  level: 1 | 2 | 3;
}

/**
 * Renderiza una insignia con el nivel de urgencia del diagnostico.
 * El nivel 1 tiene fondo verde, los demas usan fondo translucido.
 */
export default function UrgencyBadge({ level }: UrgencyBadgeProps) {
  const isLevel1 = level === 1;
  return (
    <View style={[styles.badge, isLevel1 ? styles.green : styles.translucent]}>
      <Text style={styles.text}>Nivel {level} de 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  green: {
    backgroundColor: '#166534',
  },
  translucent: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
