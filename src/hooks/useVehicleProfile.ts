/**
 * useVehicleProfile.ts - Hook para manejar el perfil del vehículo.
 * Principio: Lógica de lectura/escritura del perfil en un único lugar.
 * 
 * Responsabilidades:
 * - Cargar perfil al montar el componente
 * - Guardar cambios de perfil
 * - Reportar estado de carga
 */

import { useEffect, useState, useCallback } from 'react';
import {
    obtenerPerfilVehiculo,
    guardarPerfilVehiculo,
    PerfilVehiculo,
    UNDEFINED_FIELD,
    UNDEFINED_VEHICLE_LABEL,
} from '../services/storage';

/**
 * Hook para manejar el perfil del vehículo del usuario.
 * Retorna el perfil actual y funciones para actualizarlo.
 */
export function useVehicleProfile() {
    const [perfil, setPerfil] = useState<PerfilVehiculo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carga el perfil al montar
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await obtenerPerfilVehiculo();
            setPerfil(data);
        } catch (err) {
            setError('Error cargando perfil del vehículo');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = useCallback(async (nuevosPerfil: PerfilVehiculo) => {
        try {
            setError(null);
            await guardarPerfilVehiculo(nuevosPerfil);
            setPerfil(nuevosPerfil);
            return true;
        } catch (err) {
            setError('Error guardando perfil');
            console.error('Error:', err);
            return false;
        }
    }, []);

    /**
     * Retorna una representación en string del perfil.
     * Ej: "Toyota Corolla 2019"
     */
    const perfilLabel = useCallback((): string => {
        if (!perfil || perfil.marca === UNDEFINED_FIELD) {
            return UNDEFINED_VEHICLE_LABEL;
        }
        return `${perfil.marca} ${perfil.modelo} ${perfil.anio}`.trim();
    }, [perfil]);

    return {
        perfil,
        loading,
        error,
        updateProfile,
        perfilLabel,
        reload: loadProfile,
    };
}
