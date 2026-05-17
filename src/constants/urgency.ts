/**
 * urgency.ts — niveles de urgencia.
 * Los colores se derivan del tema activo vía getUrgencyConfig(level, colors).
 */

import type { AppColors } from '../theme/colors';

export type UrgencyLevel = 'leve' | 'moderada' | 'critica';

export interface UrgencyConfig {
  level: 1 | 2 | 3;
  backgroundColor: string;
  badgeColor: string;
  surfaceColor: string;
  label: string;
  hint: string;
  icon: string;
}

const META: Record<UrgencyLevel, Pick<UrgencyConfig, 'level' | 'label' | 'hint' | 'icon'>> = {
  critica:  { level: 3, label: 'Falla Crítica',  hint: 'Detenga el vehículo de inmediato', icon: 'alert-triangle' },
  moderada: { level: 2, label: 'Falla Moderada', hint: 'Atienda antes de 48 horas',         icon: 'zap'            },
  leve:     { level: 1, label: 'Falla Leve',     hint: 'Puede continuar circulando',        icon: 'info'           },
};

function normalize(level: string | UrgencyLevel | undefined | null): UrgencyLevel {
  const v = (level ?? '').toString().toLowerCase();
  return v === 'critica' || v === 'moderada' || v === 'leve' ? v : 'moderada';
}

export function getUrgencyConfig(level: string | UrgencyLevel, colors: AppColors): UrgencyConfig {
  const lvl = normalize(level);
  const palette: Record<UrgencyLevel, { bg: string; surface: string }> = {
    critica:  { bg: colors.critRed,    surface: colors.critSoft },
    moderada: { bg: colors.warnOrange, surface: colors.warnSoft },
    leve:     { bg: colors.safeGreen,  surface: colors.safeSoft },
  };
  return {
    ...META[lvl],
    backgroundColor: palette[lvl].bg,
    badgeColor:      palette[lvl].bg,
    surfaceColor:    palette[lvl].surface,
  };
}

export function getUrgencyLevel(level: string | UrgencyLevel): 1 | 2 | 3 {
  return META[normalize(level)].level;
}
