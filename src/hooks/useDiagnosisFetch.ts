/**
 * useDiagnosisFetch.ts - Hook para obtener diagnóstico del API.
 * Principio: Centralizar lógica de llamadas API y respaldo con mockData.
 * Permite reintentos automáticos y manejo de errores consistente.
 * 
 * Responsabilidades:
 * - Llamar al API con tiempo máximo de espera
 * - Implementar respaldo con datos mock
 * - Guardar resultado en AsyncStorage
 * - Reportar estados (cargando, éxito, error)
 */

import { useState, useCallback } from 'react';
import { DiagnosticoResponse } from '../types/apiTypes';
import { solicitarDiagnostico } from '../services/ai';
import { guardarDiagnostico } from '../services/storage';
import { mockDiagnosticos } from '../data/mockData';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';

export interface DiagnosisFetchState {
    loading: boolean;
    success: boolean;
    error: string | null;
    diagnostico: DiagnosticoResponse | null;
}

/**
 * Hook para obtener un diagnóstico del API con manejo de errores y respaldo.
 */
export function useDiagnosisFetch() {
    const [state, setState] = useState<DiagnosisFetchState>({
        loading: false,
        success: false,
        error: null,
        diagnostico: null,
    });

    /**
     * Obtiene un diagnóstico: intenta el API real y cae a datos mock si falla.
     * Guarda automáticamente en el historial local.
     */
    const fetchDiagnosis = useCallback(
        async (
            sintomas: string,
            perfilVehiculo: string
        ): Promise<DiagnosticoResponse | null> => {
            setState({
                loading: true,
                success: false,
                error: null,
                diagnostico: null,
            });

            try {
                // Intenta obtener diagnóstico del API real
                const data = await solicitarDiagnostico(sintomas, perfilVehiculo);

                // Guarda en historial local
                await guardarDiagnostico(sintomas, data);

                setState({
                    loading: false,
                    success: true,
                    error: null,
                    diagnostico: data,
                });

                return data;
            } catch (err) {
                // Respaldo con datos mock
                const mockData = getFallbackDiagnosis(sintomas);

                try {
                    await guardarDiagnostico(sintomas, mockData);
                } catch (storageErr) {
                    console.error('Error guardando diagnóstico:', storageErr);
                }

                const errorMsg = getUserFriendlyErrorMessage(err);
                setState({
                    loading: false,
                    success: false,
                    error: errorMsg,
                    diagnostico: mockData,
                });

                // Retorna el mock incluso con error para mejorar la experiencia de usuario.
                return mockData;
            }
        },
        []
    );

    /**
     * Elige un diagnóstico mock según las palabras clave en los síntomas.
     * Heurística simple para proporcionar resultados coherentes.
     */
    function getFallbackDiagnosis(sintomas: string): DiagnosticoResponse {
        const lower = sintomas.toLowerCase();

        if (lower.includes('freno') || lower.includes('frenada')) {
            return {
                urgency_level: 'critica',
                urgency_label: 'Falla Crítica - Sistema de Frenos',
                razonamiento: mockDiagnosticos.critica?.razonamiento || '',
                causas: mockDiagnosticos.critica?.causas || [],
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
                razonamiento: mockDiagnosticos.leve?.razonamiento || '',
                causas: mockDiagnosticos.leve?.causas || [],
                especialidades_recomendadas: ['Mecanica general'],
            };
        }

        // Por defecto, moderada
        return {
            urgency_level: 'moderada',
            urgency_label: mockDiagnosticos.moderada?.urgency_label || '',
            razonamiento: mockDiagnosticos.moderada?.razonamiento || '',
            causas: mockDiagnosticos.moderada?.causas || [],
            especialidades_recomendadas: ['Mecanica general', 'Electromecanica'],
        };
    }

    const reset = useCallback(() => {
        setState({
            loading: false,
            success: false,
            error: null,
            diagnostico: null,
        });
    }, []);

    return {
        ...state,
        fetchDiagnosis,
        reset,
    };
}
