/**
 * dateFormatter.ts - Utilidades de formateo de fechas.
 * Principio: no repetirse - lógica de formateo en un solo lugar.
 * Se puede reutilizar en HistoryScreen, LoadingScreen, etc.
 */

/**
 * Formatea una fecha ISO a texto legible con tiempo relativo.
 * Ej: "Hoy, 14:30", "Ayer, 10:15", "Hace 3 días, 08:00"
 *
 * @param fechaISO - Fecha en formato ISO string
 * @returns Texto formateado legible
 */
export function formatearFechaRelativa(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  const hoy = new Date();
  
  // Diferencia en días
  const diff = Math.floor(
    (hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Formato de hora: 14:30
  const hora = fecha.toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (diff === 0) return `Hoy, ${hora}`;
  if (diff === 1) return `Ayer, ${hora}`;
  if (diff < 7) return `Hace ${diff} días, ${hora}`;
  
  // Fecha completa para más de 7 días
  return `${fecha.toLocaleDateString('es')}, ${hora}`;
}

/**
 * Retorna solo la fecha en formato corto.
 * Ej: "03/05/2026"
 */
export function formatearFechaCorta(fechaISO: string): string {
  return new Date(fechaISO).toLocaleDateString('es');
}

/**
 * Retorna solo la hora en formato HH:MM.
 * Ej: "14:30"
 */
export function formatearHora(fechaISO: string): string {
  return new Date(fechaISO).toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
