export type NivelUrgencia = 'Verde' | 'Naranja' | 'Rojo';

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

export interface DiagnosticoMock {
  id: string;
  sintomaIngresado: string;
  nivelUrgencia: NivelUrgencia;
  clasificacion: string; // "Leve", "Moderada" o "Crítica" 
  indicaciones: string;
  causas: CausaProbable[];
  tallerRecomendado: Taller;
}