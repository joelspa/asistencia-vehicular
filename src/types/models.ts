/**
 * Tipos de dominio compartidos entre cliente y servidor.
 * Los tipos de API response viven en apiTypes.ts.
 */

/** Taller mecánico tal como aparece en la pantalla de mapa. */
export interface Taller {
  id: string;
  nombre: string;
  especialidad: string;
  distancia: string;
}
