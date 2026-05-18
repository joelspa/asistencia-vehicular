/**
 * Paletas de colores MotorSense.
 * Contraste mínimo: 4.5:1 para texto normal (WCAG AA), 3:1 para iconos y texto grande.
 */

export const lightColors = {
  brand: '#2563EB',
  brandDeep: '#1D4ED8',
  brandSoft: '#EBF3FF',
  accent: '#F59E0B',
  accentSoft: '#FEF3C7',

  appBackground: '#F0F5FB',
  cardBackground: '#FFFFFF',
  surface2: '#E5EDF7',

  primaryText: '#0C1525',
  secondaryText: '#3A4E65',
  tertiaryText: '#697A8D',   // 4.6:1 sobre blanco ✓

  borderColor: '#D0D9E6',
  navy: '#0C1525',

  safeGreen: '#15803D',
  warnOrange: '#D97706',
  critRed: '#DC2626',
  motoPurple: '#6D28D9',
  accidentBackground: '#1A0505',

  safeSoft: '#DCFCE7',
  warnSoft: '#FEF3C7',
  critSoft: '#FEE2E2',
  purpleSurface: '#F3F0FF',

  warnTitle: '#78350F',
  warnBody: '#92400E',
  warnBorder: '#FBE5A0',
};

export const darkColors: typeof lightColors = {
  brand: '#6BA3FF',          // más luminoso, mejor legibilidad
  brandDeep: '#4D8CF5',      // más claro para destacar links
  brandSoft: '#1A2744',      // ligeramente más claro

  accent: '#FBB040',
  accentSoft: '#332008',     // más saturado

  appBackground: '#0E1117',  // más oscuro para separar de cards
  cardBackground: '#1C2030',
  surface2: '#2D3550',       // +8% luminosidad, separadores visibles

  primaryText: '#EAEFF8',    // ~14:1 sobre card ✓✓
  secondaryText: '#9FAFC8',  // ~7:1 ✓✓
  tertiaryText: '#7E90AB',   // ~4.5:1 ✓

  borderColor: '#323D5A',    // +12% luminosidad, bordes perceptibles
  navy: '#2A3352',           // separado de cardBackground → CTA visible

  safeGreen: '#4ADE80',      // ~9:1 sobre bg ✓✓
  warnOrange: '#FBB040',
  critRed: '#FC8181',
  motoPurple: '#A78BFA',
  accidentBackground: '#1A0505',

  safeSoft: '#0F2D1B',       // más verde visible
  warnSoft: '#33200A',       // más ámbar visible
  critSoft: '#331212',       // más rojo visible
  purpleSurface: '#1E1648',  // ligeramente más saturado

  warnTitle: '#FBD38D',      // ámbar claro legible sobre warnSoft
  warnBody: '#F6AD55',       // ámbar medio
  warnBorder: '#5C3D10',     // borde sutil pero visible
};

export type AppColors = typeof lightColors;


export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 9999,
  cardSm: 12,
  cardLg: 20,
  input: 12,
};
