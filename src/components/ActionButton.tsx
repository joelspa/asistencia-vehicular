/**
 * ActionButton.tsx - Boton de accion principal reutilizable.
 * Soporta variantes visuales: 'primary' (oscuro) y 'safe' (verde).
 * Se usa como llamado a la accion en la pantalla de inicio y alerta.
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../theme/colors';

interface ActionButtonProps {
  children: string;
  onPress?: () => void;
  variant?: 'primary' | 'safe';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Renderiza un boton de accion con icono opcional y texto centrado.
 * El estilo cambia segun la variante: primary (fondo oscuro) o safe (fondo verde).
 */
export default function ActionButton({ children, onPress, variant = 'primary', icon, style }: ActionButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.safe,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon}
      <Text style={[styles.text, !isPrimary && styles.textSafe]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  primary: {
    height: 56,
    backgroundColor: colors.primaryText,
  },
  safe: {
    height: 60,
    backgroundColor: colors.safeGreen,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  textSafe: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
