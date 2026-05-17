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

export const CATEGORY_CONFIG: Record<CategoryKey, { label: string; color: string; Icon: IconComp }> = {
  general:     { label: 'Mecánica',    color: '#2563EB', Icon: Wrench      },
  electr:      { label: 'Eléctrico',   color: '#D97706', Icon: Zap         },
  llanta:      { label: 'Llantas',     color: '#15803D', Icon: Circle      },
  freno:       { label: 'Frenos',      color: '#DC2626', Icon: AlertCircle },
  pintura:     { label: 'Carrocería',  color: '#6D28D9', Icon: Package     },
  repuesto:    { label: 'Repuestos',   color: '#EA580C', Icon: Package     },
  grua:        { label: 'Grúa',        color: '#0E7490', Icon: Truck       },
  moto:        { label: 'Motos',       color: '#7C3AED', Icon: Gauge       },
  transmision: { label: 'Transmisión', color: '#B45309', Icon: Settings    },
  suspension:  { label: 'Suspensión',  color: '#0284C7', Icon: Activity    },
};

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
