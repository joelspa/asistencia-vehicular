/**
 * useTalleresNearby — obtiene la ubicación del usuario y la lista de talleres
 * cercanos desde el backend, con fallback a mockTalleres si falla.
 *
 * Encapsula:
 *   - permiso y obtención de coordenadas (expo-location)
 *   - fetch al backend `/talleres?lat=&lng=`
 *   - fallback a mock data si el backend responde vacío o falla
 *   - normalización al formato de display
 */
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { getApiBaseUrl, API_ENDPOINTS } from '../constants/api';
import { mockTalleres } from '../data/mockData';
import { TallerBackend, TalleresResponse } from '../types/apiTypes';
import { fetchWithTimeout } from '../services/http';

const FALLBACK_COORDS = { lat: -17.7863, lng: -63.1812 }; // Santa Cruz, Bolivia
const MAX_TALLERES_MAPA = 15;

export interface TallerDisplay {
    id: string;
    nombre: string;
    distancia: string;
    especialidad: string;
    latitud: number;
    longitud: number;
}

export interface TallerParaMapa {
    nombre: string;
    latitud: number;
    longitud: number;
    especialidad?: string;
}

interface UseTalleresNearbyState {
    loading: boolean;
    userCoords: { lat: number; lng: number } | null;
    mapCenter: { lat: number; lng: number } | null;
    talleres: TallerDisplay[];
    rawTalleres: TallerParaMapa[];
}

function toDisplay(t: TallerBackend): TallerDisplay {
    return {
        id: String(t.id),
        nombre: t.nombre,
        distancia: t.distancia || `${t.distanciaKm ?? 0} km`,
        especialidad: t.especialidad || 'General',
        latitud: t.latitud,
        longitud: t.longitud,
    };
}

function toRaw(t: TallerBackend): TallerParaMapa {
    return {
        nombre: t.nombre,
        latitud: t.latitud,
        longitud: t.longitud,
        especialidad: t.especialidad,
    };
}

export function useTalleresNearby() {
    const [state, setState] = useState<UseTalleresNearbyState>({
        loading: true,
        userCoords: null,
        mapCenter: null,
        talleres: [],
        rawTalleres: [],
    });

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                let lat = FALLBACK_COORDS.lat;
                let lng = FALLBACK_COORDS.lng;
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    lat = loc.coords.latitude;
                    lng = loc.coords.longitude;
                }

                let rawTalleres: TallerParaMapa[];
                let talleres: TallerDisplay[];

                try {
                    const res = await fetchWithTimeout(
                        `${getApiBaseUrl()}${API_ENDPOINTS.talleres}?lat=${lat}&lng=${lng}`
                    );
                    const data: TalleresResponse = await res.json();
                    if (!data.talleres?.length) throw new Error('empty');
                    rawTalleres = data.talleres.map(toRaw);
                    talleres = data.talleres.slice(0, MAX_TALLERES_MAPA).map(toDisplay);
                } catch {
                    rawTalleres = mockTalleres.map((t) => ({
                        nombre: t.nombre,
                        latitud: t.coordenadas.lat,
                        longitud: t.coordenadas.lng,
                        especialidad: t.especialidad,
                    }));
                    talleres = mockTalleres.map((t) => ({
                        id: t.id,
                        nombre: t.nombre,
                        distancia: t.distancia,
                        especialidad: t.especialidad,
                        latitud: t.coordenadas.lat,
                        longitud: t.coordenadas.lng,
                    }));
                }

                if (cancelled) return;
                setState({
                    loading: false,
                    userCoords: { lat, lng },
                    mapCenter: { lat, lng },
                    talleres,
                    rawTalleres,
                });
            } catch (e) {
                console.error('[useTalleresNearby] error al inicializar:', e);
                if (!cancelled) setState((s) => ({ ...s, loading: false }));
            }
        }

        run();
        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}
