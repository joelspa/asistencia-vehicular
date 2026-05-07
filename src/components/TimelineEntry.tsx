/**
 * TimelineEntry.tsx - Componente de entrada de la linea de tiempo del historial.
 * Renderiza una tarjeta con indicador visual de urgencia, marca temporal,
 * descripcion del diagnostico y acciones disponibles.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

/** Tipos de entrada posibles en la linea de tiempo */
type TimelineType = 'critical' | 'moderate' | 'mild';

interface TimelineEntryProps {
  type: TimelineType;
  time: string;
  title: string;
  description: string;
  footer1: string;
  footer2: string;
  isLast?: boolean;
}

/** Configuracion visual para cada tipo de entrada de la linea de tiempo */
const configs: Record<TimelineType, { dot: string; ring: string; titleColor: string; opacity: number }> = {
  critical: { dot: '#B91C1C', ring: 'rgba(185,28,28,0.20)', titleColor: '#B91C1C', opacity: 1 },
  moderate: { dot: '#D97706', ring: 'rgba(217,119,6,0.20)', titleColor: '#D97706', opacity: 0.85 },
  mild:     { dot: '#15803D', ring: '',                       titleColor: '#15803D', opacity: 0.70 },
};

/**
 * Renderiza una entrada individual de la linea de tiempo del historial.
 * Incluye un indicador de color, marca temporal, titulo, descripcion y pie de tarjeta.
 */
export default function TimelineEntry({ type, time, title, description, footer1, footer2, isLast }: TimelineEntryProps) {
  const c = configs[type];
  const parts = time.split(',');
  const datePart = parts[0] || '';
  const timePart = parts[1] || '';

  return (
    <View style={[styles.container, { opacity: c.opacity, paddingBottom: isLast ? 0 : 4 }]}>
      {/* Linea vertical de conexion entre entradas */}
      {!isLast && <View style={styles.verticalLine} />}

      {/* Columna de marca temporal */}
      <View style={styles.timeCol}>
        <Text style={styles.timeText}>{datePart}</Text>
        <Text style={styles.timeText}>{timePart}</Text>
      </View>

      {/* Indicador de punto con color segun urgencia */}
      <View style={styles.dotCol}>
        {c.ring ? <View style={[styles.ring, { backgroundColor: c.ring }]} /> : null}
        <View style={[styles.dot, { backgroundColor: c.dot }]} />
      </View>

      {/* Tarjeta con contenido del diagnostico */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, { color: c.titleColor }]}>{title}</Text>
          {type === 'critical' && <Text style={styles.cardTime}>{timePart}</Text>}
        </View>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.footer1}>{footer1}</Text>
          <Text style={styles.footer2}>{footer2} {'\u2192'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8, position: 'relative' },
  verticalLine: { position: 'absolute', width: 1.5, backgroundColor: colors.borderColor, left: 54, top: 16, bottom: 0 },
  timeCol: { width: 44, alignItems: 'flex-end', paddingTop: 4 },
  timeText: { fontSize: 10, color: colors.tertiaryText },
  dotCol: { width: 20, alignItems: 'center', paddingTop: 4 },
  ring: { position: 'absolute', top: 2, width: 20, height: 20, borderRadius: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, zIndex: 10 },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 12, fontWeight: '600' },
  cardTime: { fontSize: 11, color: colors.tertiaryText },
  description: { fontSize: 13, color: colors.secondaryText, lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footer1: { fontSize: 11, color: colors.tertiaryText },
  footer2: { fontSize: 12, fontWeight: '600', color: colors.navy },
});
