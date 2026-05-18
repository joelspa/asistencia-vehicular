/**
 * ai.ts - Servicio de comunicación con el servidor de diagnóstico.
 * PRINCIPIO: Responsabilidad unica - solo comunica con la API.
 * 
 * La lógica de respaldo y reintento se maneja en los hooks (useDiagnosisFetch).
 * La configuración de URLs y rutas está en constants/api.ts.
 */

import { DiagnosticoResponse } from '../types/apiTypes';
import { getApiBaseUrl, API_ENDPOINTS } from '../constants/api';
import { fetchWithTimeout } from './http';
import { ERROR_MESSAGES } from '../utils/errorMessages';

/**
 * Envía los síntomas y perfil del vehículo al servidor para obtener un diagnóstico.
 * El servidor consulta a Ollama (IA local) y retorna un objeto DiagnosticoResponse
 * con nivel de urgencia, causas probables y razonamiento.
 *
 * @param sintomas - Descripción textual de los síntomas del vehículo
 * @param perfilVehiculo - Información del vehículo (marca, modelo, año)
 * @returns Objeto con el diagnóstico completo generado por la IA
 * @throws Error si el servidor no está disponible o responde con error
 */
export const solicitarDiagnostico = async (
  sintomas: string,
  perfilVehiculo: string
): Promise<DiagnosticoResponse> => {
  try {
    const url = `${getApiBaseUrl()}${API_ENDPOINTS.diagnosticar}`;

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sintomas, perfilVehiculo }),
    });

    if (!response.ok) {
      throw new Error(`Servidor respondió con estado ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error de conexión:', error);
    throw new Error(ERROR_MESSAGES.SERVER_UNAVAILABLE);
  }
};
