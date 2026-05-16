/**
 * diagnosisFallback.ts - Lógica de selección de diagnóstico mock.
 * Responsabilidad única: elegir el DiagnosticoResponse de respaldo
 * basándose en palabras clave de los síntomas.
 *
 * Se extrae del hook useDiagnosisFetch porque es lógica de negocio pura,
 * no estado de UI, y debe ser testeable de forma aislada.
 */
import { DiagnosticoResponse } from '../types/apiTypes';
import { mockDiagnosticos } from '../data/mockData';

/**
 * Elige un diagnóstico mock según palabras clave en los síntomas.
 * Heurística simple para proporcionar resultados coherentes sin servidor.
 */
export function getFallbackDiagnosis(sintomas: string): DiagnosticoResponse {
  const lower = sintomas.toLowerCase();

  if (lower.includes('freno') || lower.includes('frenada')) {
    return {
      urgency_level: 'critica',
      urgency_label: 'Falla Crítica - Sistema de Frenos',
      razonamiento: mockDiagnosticos.critica.razonamiento,
      causas: mockDiagnosticos.critica.causas,
      especialidades_recomendadas: ['Mecanica general'],
    };
  }

  if (
    lower.includes('aceite') ||
    lower.includes('cadena') ||
    lower.includes('correa')
  ) {
    return {
      urgency_level: 'leve',
      urgency_label: 'Falla Leve - Mantenimiento',
      razonamiento: mockDiagnosticos.leve.razonamiento,
      causas: mockDiagnosticos.leve.causas,
      especialidades_recomendadas: ['Mecanica general'],
    };
  }

  return {
    urgency_level: 'moderada',
    urgency_label: mockDiagnosticos.moderada.urgency_label,
    razonamiento: mockDiagnosticos.moderada.razonamiento,
    causas: mockDiagnosticos.moderada.causas,
    especialidades_recomendadas: ['Mecanica general', 'Electromecanica'],
  };
}
