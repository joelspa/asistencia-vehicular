import { Platform } from 'react-native';
import Constants from 'expo-constants';

const BACKEND_PORT = 3001;

/**
 * Detecta dinámicamente la IP de la máquina de desarrollo.
 * Expo inyecta el host en distintos lugares según la versión del SDK:
 *
 *   SDK 50+ / Expo Go  → Constants.expoGoConfig.debuggerHost  ← SDK 55 usa esto
 *   SDK 50+ injected   → Constants.expoConfig.hostUri
 *   SDK 46-49          → Constants.manifest.hostUri
 *   SDK < 46           → Constants.manifest.debuggerHost
 *
 * Todas las variantes tienen formato "192.168.x.x:PORT".
 * Se extrae solo la IP y se reemplaza el puerto por el del backend.
 */
/**
 * Forma de `Constants` que nos interesa, declarada localmente para no depender
 * de los tipos cambiantes de `expo-constants` entre SDKs.
 */
interface ExpoConstantsShape {
  expoGoConfig?: { debuggerHost?: string };
  expoConfig?: { hostUri?: string; extra?: { apiBaseUrl?: string } };
  manifest?: { hostUri?: string; debuggerHost?: string; extra?: { apiBaseUrl?: string } };
}

function resolveDevBaseUrl(): string {
  const c = Constants as unknown as ExpoConstantsShape;

  const hostUri: string | undefined =
    c.expoGoConfig?.debuggerHost ||  // SDK 50+ con Expo Go (SDK 55 usa esto)
    c.expoConfig?.hostUri ||         // SDK 50+ inyectado por Expo CLI
    c.manifest?.hostUri ||           // SDK 46-49
    c.manifest?.debuggerHost;        // SDK < 46

  if (hostUri) {
    return `http://${hostUri.split(':')[0]}:${BACKEND_PORT}`;
  }

  // Fallback: 10.0.2.2 = loopback del host en emulador Android
  return Platform.OS === 'android'
    ? `http://10.0.2.2:${BACKEND_PORT}`
    : `http://localhost:${BACKEND_PORT}`;
}

/**
 * URL del backend en producción. Se lee de `expo.extra.apiBaseUrl` en app.json
 * (o de `manifest.extra` en SDKs viejos). Si falta, se avisa por consola y se
 * cae a un placeholder que rompe el request — preferible al silencio.
 */
function resolveProdBaseUrl(): string {
  const c = Constants as unknown as ExpoConstantsShape;
  const url: string | undefined =
    c.expoConfig?.extra?.apiBaseUrl || c.manifest?.extra?.apiBaseUrl;

  if (url) return url;

  console.warn(
    '[api] apiBaseUrl no configurada. Definila en app.json → expo.extra.apiBaseUrl antes de un build de producción.'
  );
  return 'https://api.invalid';
}

export const getApiBaseUrl = (): string =>
  __DEV__ ? resolveDevBaseUrl() : resolveProdBaseUrl();

// Compatibilidad con imports existentes — se resuelve en runtime, no al importar.
export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  diagnosticar: '/diagnosticar',
  talleres:     '/talleres',
  config:       '/config',
} as const;

export const API_CONFIG = {
  requestTimeout: 90000,
  retryAttempts:  2,
  retryDelay:     1000,
} as const;
