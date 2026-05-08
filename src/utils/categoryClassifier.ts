import { Wrench, Zap, Disc, StopCircle, Paintbrush, Package, Truck } from 'lucide-react-native';

export type CategoryKey = 'general' | 'electr' | 'llanta' | 'freno' | 'pintura' | 'repuesto' | 'grua';

export const CATEGORY_CONFIG: Record<CategoryKey, { label: string; Icon: typeof Wrench; color: string }> = {
  general:  { label: 'Mecánica',  Icon: Wrench,      color: '#2563EB' },
  electr:   { label: 'Eléctrico', Icon: Zap,         color: '#D97706' },
  llanta:   { label: 'Llantas',   Icon: Disc,        color: '#15803D' },
  freno:    { label: 'Frenos',    Icon: StopCircle,  color: '#DC2626' },
  pintura:  { label: 'Pintura',   Icon: Paintbrush,  color: '#6D28D9' },
  repuesto: { label: 'Repuestos', Icon: Package,     color: '#EA580C' },
  grua:     { label: 'Grúa',      Icon: Truck,       color: '#0E7490' },
};

/** Mapea la especialidad de un taller a una clave de categoría.
 *  La función JS equivalente en constants/html.ts debe mantenerse en sincronía. */
export function getCategoryKey(especialidad: string): CategoryKey {
  const e = especialidad.toLowerCase();
  if (e.includes('electr'))                                                           return 'electr';
  if (e.includes('llanta') || e.includes('neum') || e.includes('rueda'))             return 'llanta';
  if (e.includes('freno'))                                                            return 'freno';
  if (e.includes('carrocer') || e.includes('pintur') || e.includes('chapa'))         return 'pintura';
  if (e.includes('repuesto') || e.includes('pieza') || e.includes('acceso') || e.includes('autopart')) return 'repuesto';
  if (e.includes('grua') || e.includes('rescate') || e.includes('asistencia'))       return 'grua';
  return 'general';
}
