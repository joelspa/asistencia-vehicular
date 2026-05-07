/**
 * urgency.ts - Configuración centralizada de niveles de urgencia.
 * Colores alineados con el sistema de diseño v2.
 */

export type UrgencyLevel = 'leve' | 'moderada' | 'critica';

export interface UrgencyConfig {
  level: 1 | 2 | 3;
  backgroundColor: string;
  badgeColor: string;
  label: string;
  hint: string;
  icon: string;
  surfaceColor: string;
}

export const urgencyConfigs: Record<UrgencyLevel, UrgencyConfig> = {
  critica: {
    level: 3,
    backgroundColor: '#DC2626',
    badgeColor: '#DC2626',
    label: 'Falla Crítica',
    hint: 'Detenga el vehículo de inmediato',
    icon: '⚠️',
    surfaceColor: '#FEE2E2',
  },
  moderada: {
    level: 2,
    backgroundColor: '#D97706',
    badgeColor: '#D97706',
    label: 'Falla Moderada',
    hint: 'Atienda antes de 48 horas',
    icon: '⚡',
    surfaceColor: '#FEF3C7',
  },
  leve: {
    level: 1,
    backgroundColor: '#15803D',
    badgeColor: '#15803D',
    label: 'Falla Leve',
    hint: 'Puede continuar circulando',
    icon: 'ℹ️',
    surfaceColor: '#DCFCE7',
  },
};

export function getUrgencyConfig(level: string | UrgencyLevel): UrgencyConfig {
  const normalized = (level?.toLowerCase() ?? 'moderada') as UrgencyLevel;
  return urgencyConfigs[normalized] ?? urgencyConfigs.moderada;
}

export function getUrgencyLevel(level: UrgencyLevel): 1 | 2 | 3 {
  return getUrgencyConfig(level).level;
}
