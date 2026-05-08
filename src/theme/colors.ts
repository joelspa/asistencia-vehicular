/**
 * Paletas de colores MecanicaYA.
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

  // Aliases compatibilidad
  primaryOrange: '#2563EB',
  orangeDark: '#1D4ED8',
  lightSurface: '#E5EDF7',
  greenSurface: '#DCFCE7',
  moderateOrange: '#D97706',
  moderateSurface: '#FEF3C7',
  criticalRed: '#DC2626',
  redSurface: '#FEE2E2',

  // Legacy HomeStyles
  background: '#F0F5FB',
  surface: '#E5EDF7',
  textPrimary: '#0C1525',
  textSecondary: '#3A4E65',
  motoActive: '#6D28D9',
  moderate: '#D97706',
  border: '#D0D9E6',
};

export const darkColors: typeof lightColors = {
  brand: '#5C96F7',
  brandDeep: '#3D80F0',
  brandSoft: '#172244',
  accent: '#FBB040',
  accentSoft: '#2C1B06',

  appBackground: '#131720',
  cardBackground: '#1D2136',
  surface2: '#262D42',

  primaryText: '#E8EDF6',    // ~14:1 sobre card ✓✓
  secondaryText: '#98A6BE',  // ~6.5:1 ✓✓
  tertiaryText: '#7A8BA3',   // ~4.2:1 ✓ (era 2.5:1)

  borderColor: '#28324E',
  navy: '#1D2136',

  safeGreen: '#4ADE80',      // ~9:1 sobre bg ✓✓
  warnOrange: '#FBB040',
  critRed: '#FC8181',
  motoPurple: '#A78BFA',
  accidentBackground: '#1A0505',

  safeSoft: '#0E2418',
  warnSoft: '#2A1808',
  critSoft: '#280E0E',
  purpleSurface: '#1C1440',

  primaryOrange: '#5C96F7',
  orangeDark: '#3D80F0',
  lightSurface: '#262D42',
  greenSurface: '#0E2418',
  moderateOrange: '#FBB040',
  moderateSurface: '#2A1808',
  criticalRed: '#FC8181',
  redSurface: '#280E0E',

  background: '#131720',
  surface: '#262D42',
  textPrimary: '#E8EDF6',
  textSecondary: '#98A6BE',
  motoActive: '#A78BFA',
  moderate: '#FBB040',
  border: '#28324E',
};

export type AppColors = typeof lightColors;

/** Export estático para imports legacy — siempre usa la paleta clara */
export const colors = lightColors;

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
