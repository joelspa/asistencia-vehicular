/**
 * WorkshopCard.tsx - Tarjeta de taller mecanico.
 * Muestra informacion resumida de un taller: nombre, especialidades (insignias),
 * distancia y un indicador visual si es el taller recomendado.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface WorkshopCardProps {
  recommended?: boolean;
  title: string;
  badges: string[];
  distance: string;
  onPress?: () => void;
}

/**
 * Renderiza una tarjeta de taller con insignias de especialidad y distancia.
 * Si el taller esta marcado como recomendado, muestra un borde destacado
 * y una insignia "Ideal".
 */
export default function WorkshopCard({ recommended, title, badges, distance, onPress }: WorkshopCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, recommended && styles.cardRecommended]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {recommended && (
          <View style={styles.idealBadge}>
            <Text style={styles.idealText}>Ideal</Text>
          </View>
        )}
      </View>
      <View style={styles.badges}>
        {badges.map((b) => (
          <View key={b} style={styles.badge}>
            <Text style={styles.badgeText}>{b}</Text>
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <Text style={styles.distance}>{distance}</Text>
        <Text style={styles.link}>Cómo llegar →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  cardRecommended: {
    borderColor: colors.navy,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
  },
  idealBadge: {
    backgroundColor: colors.navy,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  idealText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.borderColor,
    backgroundColor: colors.appBackground,
  },
  badgeText: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  distance: {
    fontSize: 12,
    color: colors.tertiaryText,
  },
  link: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.navy,
  },
});
