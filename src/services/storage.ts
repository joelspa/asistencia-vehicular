/**
 * storage.ts - Servicio de almacenamiento local con AsyncStorage.
 * Toda la informacion se persiste unicamente en el dispositivo del usuario,
 * priorizando la privacidad al no enviar datos a servidores externos.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiagnosticoResponse } from '../types/apiTypes';

/** Claves de almacenamiento en AsyncStorage */
const KEYS = {
  HISTORIAL: '@mecanicaya_historial',
  PERFIL_VEHICULO: '@mecanicaya_perfil_vehiculo',
} as const;

/**
 * Representa una entrada del historial de diagnosticos.
 * Incluye el diagnostico completo, los sintomas originales y la fecha.
 */
export interface EntradaHistorial {
  id: string;
  fecha: string;
  sintomas: string;
  diagnostico: DiagnosticoResponse;
}

/**
 * Representa el perfil del vehiculo del usuario.
 * Se usa para contextualizar los diagnosticos de la IA.
 */
export interface PerfilVehiculo {
  marca: string;
  modelo: string;
  anio: string;
  combustible: string;
}

/** Valor sentinela usado en cada campo del perfil cuando el usuario no completó. */
export const UNDEFINED_FIELD = 'Sin definir';

/** Label visible al usuario cuando el perfil entero está sin definir. */
export const UNDEFINED_VEHICLE_LABEL = 'No especificado';

/**
 * Perfil de vehiculo por defecto cuando no hay datos guardados.
 */
const PERFIL_DEFAULT: PerfilVehiculo = {
  marca: UNDEFINED_FIELD,
  modelo: UNDEFINED_FIELD,
  anio: UNDEFINED_FIELD,
  combustible: 'Gasolina',
};

/**
 * Guarda un diagnostico en el historial local del dispositivo.
 * Genera un ID unico basado en una marca temporal y agrega la entrada al inicio del arreglo.
 */
export async function guardarDiagnostico(
  sintomas: string,
  diagnostico: DiagnosticoResponse
): Promise<void> {
  try {
    const historial = await obtenerHistorial();
    const nuevaEntrada: EntradaHistorial = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      sintomas,
      diagnostico,
    };
    const actualizado = [nuevaEntrada, ...historial];
    await AsyncStorage.setItem(KEYS.HISTORIAL, JSON.stringify(actualizado));
  } catch (error) {
    console.error('Error al guardar diagnostico:', error);
  }
}

/**
 * Obtiene el historial completo de diagnosticos almacenados localmente.
 * Retorna un arreglo vacio si no hay datos o si ocurre un error.
 */
export async function obtenerHistorial(): Promise<EntradaHistorial[]> {
  try {
    const datos = await AsyncStorage.getItem(KEYS.HISTORIAL);
    if (!datos) return [];
    return JSON.parse(datos) as EntradaHistorial[];
  } catch (error) {
    console.error('Error al leer historial:', error);
    return [];
  }
}

/**
 * Guarda el perfil del vehiculo del usuario en almacenamiento local.
 */
export async function guardarPerfilVehiculo(perfil: PerfilVehiculo): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PERFIL_VEHICULO, JSON.stringify(perfil));
  } catch (error) {
    console.error('Error al guardar perfil:', error);
  }
}

/**
 * Obtiene el perfil del vehiculo guardado localmente.
 * Retorna valores por defecto si no hay perfil guardado.
 */
export async function obtenerPerfilVehiculo(): Promise<PerfilVehiculo> {
  try {
    const datos = await AsyncStorage.getItem(KEYS.PERFIL_VEHICULO);
    if (!datos) return PERFIL_DEFAULT;
    return JSON.parse(datos) as PerfilVehiculo;
  } catch (error) {
    console.error('Error al leer perfil:', error);
    return PERFIL_DEFAULT;
  }
}
