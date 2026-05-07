/**
 * Tipos de datos internos previos al API.
 * Nota: NivelUrgencia, CausaProbable y DiagnosticoMock son tipos heredados del diseño inicial.
 * El flujo actual usa DiagnosticoResponse (apiTypes.ts) y Overpass para talleres.
 * Estos tipos siguen aquí porque mockData.ts los referencia.
 */

/** @deprecated El flujo actual usa urgency_level: 'leve' | 'moderada' | 'critica' */
export type NivelUrgencia = 'Verde' | 'Naranja' | 'Rojo';

/** @deprecated Reemplazado por { causa: string; probabilidad: number } en DiagnosticoResponse */
export interface CausaProbable {
  descripcion: string;
  probabilidad: number;
}

export interface Taller {
  id: string;
  nombre: string;
  especialidad: string;
  distancia: string;
  telefono: string;
}

/** @deprecated Reemplazado por DiagnosticoResponse en apiTypes.ts */
export interface DiagnosticoMock {
  id: string;
  sintomaIngresado: string;
  nivelUrgencia: NivelUrgencia;
  clasificacion: string;
  indicaciones: string;
  causas: CausaProbable[];
  tallerRecomendado: Taller;
}
