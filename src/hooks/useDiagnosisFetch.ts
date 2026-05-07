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
import { getFallbackDiagnosis } from '../utils/diagnosisFallback';
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
                // Respaldo: selecciona diagnóstico mock según síntomas
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
