import { useState, useCallback } from 'react';
import { DiagnosticoResponse } from '../types/apiTypes';
import { solicitarDiagnostico } from '../services/ai';
import { guardarDiagnostico } from '../services/storage';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';

export interface DiagnosisFetchState {
  loading: boolean;
  success: boolean;
  error: string | null;
  diagnostico: DiagnosticoResponse | null;
}

export function useDiagnosisFetch() {
  const [state, setState] = useState<DiagnosisFetchState>({
    loading: false,
    success: false,
    error: null,
    diagnostico: null,
  });

  const fetchDiagnosis = useCallback(
    async (sintomas: string, perfilVehiculo: string): Promise<DiagnosticoResponse | null> => {
      setState({ loading: true, success: false, error: null, diagnostico: null });

      try {
        const data = await solicitarDiagnostico(sintomas, perfilVehiculo);
        await guardarDiagnostico(sintomas, data);
        setState({ loading: false, success: true, error: null, diagnostico: data });
        return data;
      } catch (err) {
        const errorMsg = getUserFriendlyErrorMessage(err);
        setState({ loading: false, success: false, error: errorMsg, diagnostico: null });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ loading: false, success: false, error: null, diagnostico: null });
  }, []);

  return { ...state, fetchDiagnosis, reset };
}
