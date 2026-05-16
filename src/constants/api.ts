import { Platform } from 'react-native';
import Constants from 'expo-constants';

const BACKEND_PORT = 3001;

// expoConfig.hostUri lo inyecta @expo/cli en desarrollo con formato "192.168.x.x:8081".
// La IP pertenece a la misma máquina que ejecuta Metro y el backend Express,
// por eso extraerla evita cambiar la IP manualmente cuando cambia la red.
function resolveDevBaseUrl(): string {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
        return `http://${hostUri.split(':')[0]}:${BACKEND_PORT}`;
    }
    // El emulador Android enruta el tráfico hacia la máquina host por 10.0.2.2.
    return Platform.OS === 'android'
        ? `http://10.0.2.2:${BACKEND_PORT}`
        : `http://localhost:${BACKEND_PORT}`;
}

export const getApiBaseUrl = (): string =>
    __DEV__ ? resolveDevBaseUrl() : 'https://api.tu-app-vehicular.com';

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
    diagnosticar: '/diagnosticar',
    talleres: '/talleres',
    config: '/config',
} as const;

export const API_CONFIG = {
    requestTimeout: 90000, // Ollama puede tardar 60-90s en la primera inferencia con el modelo en frío.
    retryAttempts: 2,
    retryDelay: 1000,
} as const;
