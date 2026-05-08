import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors } from '../theme/colors';

export default function PatternAlert() {
  return (
    <View style={styles.container}>
      <AlertTriangle color={colors.primaryOrange} size={18} style={{ marginTop: 2 }} />
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
  content: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: colors.primaryOrange, marginBottom: 3 },
  description: { fontSize: 13, color: colors.secondaryText, lineHeight: 20 },
});
