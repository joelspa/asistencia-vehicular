/**
 * sensors.ts — configuración de detección de impactos del Modo Moto.
 *
 * `MODO_GYRO_HABILITADO` controla la lógica de disparo de la alerta:
 *   - false (default, dev/QA): umbral bajo, solo acelerómetro. Se dispara
 *     fácilmente sacudiendo el celular — ideal para probar el flujo end-to-end.
 *   - true (producción): doble condición acelerómetro + giroscopio dentro de
 *     una ventana de tiempo. Mucho menos sensible, evita falsos positivos.
 *
 * Cambia esta flag a mano cuando hagas un build de producción.
 */
export const MODO_GYRO_HABILITADO = false;

// --- Umbrales modo simulación (solo acelerómetro) ---
export const IMPACT_THRESHOLD_G_SIMULACION = 0.5; // G — sacudida normal
export const ACCEL_UPDATE_INTERVAL_MS_SIMULACION = 50;

// --- Umbrales modo producción (impacto + caída) ---
export const IMPACT_THRESHOLD_G_PRODUCCION = 2.5; // G — golpe fuerte
export const ROTATION_THRESHOLD_RAD = (45 * Math.PI) / 180; // 45° de rotación post-impacto
export const TRIGGER_WINDOW_MS = 3500; // ventana entre impacto y caída
export const SENSOR_UPDATE_INTERVAL_MS_PRODUCCION = 80;

// --- Timing de la alerta ---
export const COUNTDOWN_SECONDS = 10;
