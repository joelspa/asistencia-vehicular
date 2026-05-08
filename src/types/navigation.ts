/**
 * navigation.ts - Definicion de tipos para la navegacion de la aplicacion.
 * Centraliza los parametros que recibe cada pantalla del navegador de pila y del navegador inferior.
 */
import { NavigatorScreenParams } from '@react-navigation/native';
import { DiagnosticoResponse } from './apiTypes';

/**
 * Parametros del navegador de pila principal.
 * MainTabs: Contenedor de pestanas, acepta params de tab anidado para navegacion directa.
 * Carga: Pantalla de analisis, recibe los sintomas y perfil del vehiculo.
 * Resultado: Pantalla de resultado, recibe el diagnostico completo.
 */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  Carga: { sintomas: string; perfilVehiculo: string };
  Resultado: { diagnostico: DiagnosticoResponse; sintomas?: string; perfilVehiculo?: string };
};

/**
 * Parametros del navegador inferior.
 * Mapa puede recibir coordenadas opcionales para centrar el mapa.
 */
export type TabParamList = {
  Inicio: undefined;
  Mapa: { lat?: number; lng?: number } | undefined;
  Historial: undefined;
  Configuracion: undefined;
};
