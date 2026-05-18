/**
 * useModoMoto — detección de accidentes en Modo Moto.
 * Comportamiento controlado por `MODO_GYRO_HABILITADO` en `constants/sensors.ts`:
 *   - false (default): solo acelerómetro con umbral bajo (testing/QA).
 *   - true: doble condición acelerómetro + giroscopio (producción).
 */
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Vibration } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    MODO_GYRO_HABILITADO,
    IMPACT_THRESHOLD_G_SIMULACION,
    IMPACT_THRESHOLD_G_PRODUCCION,
    ROTATION_THRESHOLD_RAD,
    TRIGGER_WINDOW_MS,
    ACCEL_UPDATE_INTERVAL_MS_SIMULACION,
    SENSOR_UPDATE_INTERVAL_MS_PRODUCCION,
    COUNTDOWN_SECONDS,
} from '../constants/sensors';

const KEY_CONTACTO = 'moto:contacto';
const KEY_EVENTOS = 'moto:eventos';

export type MotoPhase = 'idle' | 'monitoring' | 'alert';

export function useModoMoto() {
    const [phase, setPhase] = useState<MotoPhase>('idle');
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [contacto, setContactoState] = useState('');

    const r = useRef({
        accelSub: null as ReturnType<typeof Accelerometer.addListener> | null,
        gyroSub: null as ReturnType<typeof Gyroscope.addListener> | null,
        impactTime: null as number | null,
        cumRotation: 0,
        lastGyroTime: null as number | null,
        locationSub: null as Location.LocationSubscription | null,
        lastLocation: null as Location.LocationObject | null,
        countdownTimer: null as ReturnType<typeof setInterval> | null,
        contacto: '',
        alerting: false,
    });

    useEffect(() => {
        AsyncStorage.getItem(KEY_CONTACTO)
            .then((v) => {
                if (v) { setContactoState(v); r.current.contacto = v; }
            })
            .catch((e) => {
                console.warn('[useModoMoto] No se pudo leer contacto de emergencia:', e);
            });
        return () => {
            stopAll();
            if (r.current.countdownTimer) clearInterval(r.current.countdownTimer);
        };
    }, []);

    const stopSensors = () => {
        r.current.accelSub?.remove();
        r.current.accelSub = null;
        r.current.gyroSub?.remove();
        r.current.gyroSub = null;
    };

    const stopLocationTracking = () => {
        r.current.locationSub?.remove();
        r.current.locationSub = null;
    };

    const stopAll = () => {
        stopSensors();
        stopLocationTracking();
    };

    const startLocationTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        r.current.locationSub = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
            (location) => { r.current.lastLocation = location; }
        );
    };

    const sendEmergency = async () => {
        try {
            const loc = r.current.lastLocation;
            let lat = loc?.coords.latitude ?? 0;
            let lng = loc?.coords.longitude ?? 0;

            if (!loc) {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const fresh = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                    lat = fresh.coords.latitude;
                    lng = fresh.coords.longitude;
                }
            }

            const timestamp = new Date().toLocaleString('es-AR');
            const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
            const texto = `[EMERGENCIA] ACCIDENTE DE MOTO DETECTADO\nNecesito ayuda urgente.\nUbicacion: ${mapUrl}\nHora: ${timestamp}`;

            // Defensa contra storage corrupto: no podemos crashear durante una emergencia.
            let eventos: Array<{ fecha: string; lat: number; lng: number }> = [];
            try {
                const stored = await AsyncStorage.getItem(KEY_EVENTOS);
                if (stored) eventos = JSON.parse(stored);
                if (!Array.isArray(eventos)) eventos = [];
            } catch {
                eventos = [];
            }
            eventos.push({ fecha: new Date().toISOString(), lat, lng });
            try {
                await AsyncStorage.setItem(KEY_EVENTOS, JSON.stringify(eventos));
            } catch {
                // Persistencia falla: no interrumpas el envío de WhatsApp.
            }

            const numero = r.current.contacto.replace(/\D/g, '');
            if (numero) {
                await Linking.openURL(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`);
            }
        } finally {
            Vibration.cancel();
            stopLocationTracking();
            r.current.alerting = false;
            setPhase('idle');
            setCountdown(COUNTDOWN_SECONDS);
        }
    };

    const triggerAlert = () => {
        if (r.current.alerting) return;
        r.current.alerting = true;

        Vibration.vibrate([0, 800, 300, 800, 300, 800], true);
        stopSensors();
        setPhase('alert');

        let remaining = COUNTDOWN_SECONDS;
        setCountdown(remaining);

        r.current.countdownTimer = setInterval(() => {
            remaining -= 1;
            setCountdown(remaining);
            if (remaining <= 0) {
                clearInterval(r.current.countdownTimer!);
                r.current.countdownTimer = null;
                sendEmergency();
            }
        }, 1000);
    };

    const startSensorsSimulacion = () => {
        Accelerometer.setUpdateInterval(ACCEL_UPDATE_INTERVAL_MS_SIMULACION);
        r.current.accelSub = Accelerometer.addListener(({ x, y, z }) => {
            if (r.current.alerting) return;
            const mag = Math.sqrt(x * x + y * y + z * z);
            const magG = Platform.OS === 'android' ? mag / 9.81 : mag;
            if (magG > IMPACT_THRESHOLD_G_SIMULACION) {
                triggerAlert();
            }
        });
    };

    const startSensorsProduccion = () => {
        Accelerometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS_PRODUCCION);
        r.current.accelSub = Accelerometer.addListener(({ x, y, z }) => {
            if (r.current.alerting) return;
            const mag = Math.sqrt(x * x + y * y + z * z);
            const magG = Platform.OS === 'android' ? mag / 9.81 : mag;
            if (magG > IMPACT_THRESHOLD_G_PRODUCCION && r.current.impactTime === null) {
                r.current.impactTime = Date.now();
                r.current.cumRotation = 0;
                r.current.lastGyroTime = null;
            }
        });

        Gyroscope.setUpdateInterval(SENSOR_UPDATE_INTERVAL_MS_PRODUCCION);
        r.current.gyroSub = Gyroscope.addListener(({ y, z }) => {
            if (r.current.alerting || r.current.impactTime === null) return;
            const now = Date.now();
            const elapsed = now - r.current.impactTime;
            if (elapsed > TRIGGER_WINDOW_MS) {
                r.current.impactTime = null;
                r.current.cumRotation = 0;
                r.current.lastGyroTime = null;
                return;
            }
            const dt = r.current.lastGyroTime ? (now - r.current.lastGyroTime) / 1000 : 0.08;
            r.current.lastGyroTime = now;
            r.current.cumRotation += (Math.abs(y) + Math.abs(z)) * dt;
            if (r.current.cumRotation >= ROTATION_THRESHOLD_RAD) {
                triggerAlert();
            }
        });
    };

    const startSensors = () => {
        r.current.alerting = false;
        r.current.impactTime = null;
        r.current.cumRotation = 0;
        r.current.lastGyroTime = null;

        if (MODO_GYRO_HABILITADO) {
            startSensorsProduccion();
        } else {
            startSensorsSimulacion();
        }
    };

    const activate = async () => {
        setPhase('monitoring');
        startSensors();
        // Esperamos a que la suscripción a Location esté lista. Si un impacto
        // ocurre antes, `lastLocation` queda en null y el WhatsApp sale sin coords.
        await startLocationTracking();
    };

    const deactivate = () => {
        stopAll();
        if (r.current.countdownTimer) { clearInterval(r.current.countdownTimer); r.current.countdownTimer = null; }
        r.current.alerting = false;
        r.current.lastLocation = null;
        setPhase('idle');
        setCountdown(COUNTDOWN_SECONDS);
    };

    const cancelAlert = () => {
        if (r.current.countdownTimer) { clearInterval(r.current.countdownTimer); r.current.countdownTimer = null; }
        Vibration.cancel();
        r.current.alerting = false;
        setPhase('monitoring');
        setCountdown(COUNTDOWN_SECONDS);
        startSensors();
    };

    const saveContacto = async (numero: string) => {
        setContactoState(numero);
        r.current.contacto = numero;
        await AsyncStorage.setItem(KEY_CONTACTO, numero);
    };

    return { phase, countdown, contacto, activate, deactivate, cancelAlert, saveContacto, simulateAccident: triggerAlert };
}
