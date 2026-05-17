import { Platform } from 'react-native';

const BACKEND_PORT = 3001;

// Importación segura de expo-constants: puede no estar instalado en entornos
// fuera de Expo, y la estructura del objeto cambió entre SDK 46 y SDK 50+.
type AnyConstants = Record<string, any>;
let ExpoConstants: AnyConstants = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('expo-constants');
  ExpoConstants = (mod?.default ?? mod) as AnyConstants;
} catch (_) {
  // Sin expo-constants: cae al fallback de IP
}

/**
 * Extrae la IP de la máquina de desarrollo a partir de las distintas rutas
 * donde expo-constants la expone según la versión del SDK:
 *
 * SDK < 46  → manifest.debuggerHost
 * SDK 46-49 → manifest.hostUri
 * SDK 50+   → expoConfig.hostUri  (inyectado por Expo CLI en runtime)
 *
 * Todas vienen con formato "192.168.x.x:PORT".
 */
function resolveDevBaseUrl(): string {
  const hostUri: string | undefined =
    ExpoConstants.expoConfig?.hostUri ||       // SDK 50+ (Expo CLI lo inyecta)
    ExpoConstants.manifest?.debuggerHost ||    // SDK < 46 (legacy)
    ExpoConstants.manifest?.hostUri;           // SDK 46-49

  if (hostUri) {
    return `http://${hostUri.split(':')[0]}:${BACKEND_PORT}`;
  }

  // Fallback para emuladores: 10.0.2.2 es el loopback del host en Android.
  return Platform.OS === 'android'
    ? `http://10.0.2.2:${BACKEND_PORT}`
    : `http://localhost:${BACKEND_PORT}`;
}

/**
 * Siempre llamar esta función en el momento de la request (no cachear en un
 * const de módulo) para garantizar que la IP esté disponible cuando Constants
 * ya terminó de inicializarse.
 */
export const getApiBaseUrl = (): string =>
  __DEV__ ? resolveDevBaseUrl() : 'https://api.tu-app-vehicular.com';

// Alias para compatibilidad con imports existentes.
// ADVERTENCIA: se evalúa una sola vez al cargar el módulo.
// Preferir getApiBaseUrl() en llamadas de red para evitar IPs cacheadas.
export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  diagnosticar: '/diagnosticar',
  talleres: '/talleres',
  config: '/config',
} as const;

export const API_CONFIG = {
  requestTimeout: 90000,
  retryAttempts: 2,
  retryDelay: 1000,
} as const;
