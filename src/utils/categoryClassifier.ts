import { Wrench, Zap, Circle, AlertCircle, Package, Truck, Gauge, Settings, Activity } from 'lucide-react-native';
import type React from 'react';

export type CategoryKey =
  | 'general'
  | 'electr'
  | 'llanta'
  | 'freno'
  | 'pintura'
  | 'repuesto'
  | 'grua'
  | 'moto'
  | 'transmision'
  | 'suspension';

type IconComp = React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

export interface CategoryEntry {
  label: string;
  color: string;
  Icon: IconComp;
}

const CATEGORY_BASE: Record<CategoryKey, { label: string; Icon: IconComp }> = {
  general:     { label: 'Mecánica',    Icon: Wrench      },
  electr:      { label: 'Eléctrico',   Icon: Zap         },
  llanta:      { label: 'Llantas',     Icon: Circle      },
  freno:       { label: 'Frenos',      Icon: AlertCircle },
  pintura:     { label: 'Carrocería',  Icon: Package     },
  repuesto:    { label: 'Repuestos',   Icon: Package     },
  grua:        { label: 'Grúa',        Icon: Truck       },
  moto:        { label: 'Motos',       Icon: Gauge       },
  transmision: { label: 'Transmisión', Icon: Settings    },
  suspension:  { label: 'Suspensión',  Icon: Activity    },
};

// Paleta light — contraste AA sobre cardBackground light (#FFFFFF)
const LIGHT_COLORS: Record<CategoryKey, string> = {
  general:     '#2563EB',
  electr:      '#D97706',
  llanta:      '#15803D',
  freno:       '#DC2626',
  pintura:     '#6D28D9',
  repuesto:    '#EA580C',
  grua:        '#0E7490',
  moto:        '#7C3AED',
  transmision: '#B45309',
  suspension:  '#0284C7',
};

// Paleta dark — variantes más luminosas, contraste AA sobre cardBackground dark (#1C2030)
const DARK_COLORS: Record<CategoryKey, string> = {
  general:     '#6BA3FF',
  electr:      '#FBB040',
  llanta:      '#4ADE80',
  freno:       '#FC8181',
  pintura:     '#C4B5FD',
  repuesto:    '#FB923C',
  grua:        '#22D3EE',
  moto:        '#A78BFA',
  transmision: '#FBBF24',
  suspension:  '#38BDF8',
};

export function getCategoryConfig(isDark: boolean): Record<CategoryKey, CategoryEntry> {
  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;
  const result = {} as Record<CategoryKey, CategoryEntry>;
  (Object.keys(CATEGORY_BASE) as CategoryKey[]).forEach((k) => {
    result[k] = { ...CATEGORY_BASE[k], color: palette[k] };
  });
  return result;
}

export function getCategoryKey(especialidad: string): CategoryKey {
  const e = (especialidad || '').toLowerCase();
  if (e.includes('moto') || e.includes('motocicleta')) return 'moto';
  if (e.includes('transmisi') || e.includes('caja de cambio') || e.includes('diferencial')) return 'transmision';
  if (e.includes('suspension') || e.includes('suspensión') || e.includes('amortiguador') || e.includes('direccion') || e.includes('dirección')) return 'suspension';
  if (e.includes('electr')) return 'electr';
  if (e.includes('llanta') || e.includes('neum') || e.includes('rueda')) return 'llanta';
  if (e.includes('freno')) return 'freno';
  if (e.includes('carrocer') || e.includes('pintur') || e.includes('chapa')) return 'pintura';
  if (e.includes('repuesto') || e.includes('pieza') || e.includes('acceso') || e.includes('autopart')) return 'repuesto';
  if (e.includes('grua') || e.includes('grúa') || e.includes('rescate') || e.includes('asistencia')) return 'grua';
  return 'general';
}
