/**
 * Paleta de colores principal de la aplicación.
 * Úsenlos importando 'colors' desde este archivo en lugar de escribir el HEX directamente.
 */
export const colors = {
  // Fondos y Textos principales
  background: '#F8F9FA', // Para el fondo general de las pantallas
  surface: '#FFFFFF',    // Para el fondo de las tarjetas y modales
  textPrimary: '#1E293B', // Para títulos y textos principales
  textSecondary: '#64748B', // Para subtítulos y textos de apoyo

  // UI General
  navy: '#0F172A',       // Para botones principales y headers
  border: '#E2E8F0',     // Para líneas divisorias y bordes de inputs

  // 🟢🟠🔴 Niveles de Urgencia (Diagnóstico)
  safe: '#166534',       // Verde: Falla leve
  moderate: '#C2410C',   // Naranja: Falla moderada
  critical: '#B91C1C',   // Rojo: Falla crítica

  // 🟣 Modo Moto (Sensores y Alertas)
  motoActive: '#7C3AED', // Morado: Cuando el switch de Modo Moto está encendido
  motoAlertBackground: '#1A0505', // Fondo oscuro rojo: Exclusivo para AccidentAlertScreen
};

/**
 * Sistema de espaciado (márgenes y paddings).
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

/**
 * Sistema de bordes redondeados.
 */
export const borderRadius = {
  cardSm: 8,     // Para tarjetas pequeñas o chips
  cardLg: 16,    // Para tarjetas principales (ej. Resultados)
  input: 12,     // Para campos de texto
  pill: 9999,    // Para botones completamente redondeados
};