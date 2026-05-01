// src/services/ai.ts

// IMPORTANTE: Si usas el emulador de Android de Android Studio, usa 'http://10.0.2.2:3001'
// Si usas tu celular físico con Expo Go, debes poner la IP de tu computadora, ej: 'http://192.168.x.x:3001'
// src/services/ai.ts
import { Platform } from 'react-native';

// Esta función decide qué URL usar automáticamente
const getApiUrl = () => {
    // __DEV__ es una variable global de React Native que es true cuando estás programando
    // y false cuando compilas la app final (APK o AAB)
    if (__DEV__) {
        // Si estás en el emulador de Android Studio, usa la ruta mágica de Android
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:3001';
        }
        // Si estás en iOS o usando Expo Go en tu celular físico, usa tu IP de red.
        // (Asegúrate de poner tu IPv4 real aquí)
        return 'http://192.168.0.15:3001';
    }

    // Cuando subas tu servidor Node a producción (ej. Render, Railway, AWS), pones esa URL aquí
    return 'https://api.tu-app-vehicular.com';
};

const API_URL = getApiUrl();

export const solicitarDiagnostico = async (sintomas: string, perfilVehiculo: string) => {
    try {
        const response = await fetch(`${API_URL}/diagnosticar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sintomas, perfilVehiculo }),
        });

        if (!response.ok) {
            throw new Error('Servidor responde con error');
        }

        const data = await response.json();
        return data; // Retorna el JSON directo a la pantalla

    } catch (error) {
        console.error('Error de conexión:', error);
        // ✅ Manejo de error claro para el usuario
        throw new Error('El servidor de diagnóstico no está disponible en este momento. Por favor, revisa tu conexión o intenta de nuevo más tarde.');
    }
};