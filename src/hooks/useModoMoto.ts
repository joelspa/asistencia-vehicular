import { useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
// import { Accelerometer, Gyroscope } from 'expo-sensors'; // [GYRO] descomentar al habilitar giroscopio
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Umbral solo acelerómetro — modo simulación/demo
const IMPACT_THRESHOLD_G = 0.5;

// [GYRO] Umbrales para producción con doble condición (impacto + caída)
// const IMPACT_THRESHOLD_G = 2.5;          // G — sacudida fuerte
// const ROTATION_THRESHOLD_RAD = (45 * Math.PI) / 180; // 45° de rotación post-impacto
// const TRIGGER_WINDOW_MS = 3500;          // ventana máxima entre impacto y caída

const COUNTDOWN_SECONDS = 10;
const KEY_CONTACTO = 'moto:contacto';
const KEY_EVENTOS = 'moto:eventos';

export type MotoPhase = 'idle' | 'monitoring' | 'alert';

export function useModoMoto() {
    const [phase, setPhase] = useState<MotoPhase>('idle');
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [contacto, setContactoState] = useState('');

    const r = useRef({
        accelSub: null as ReturnType<typeof Accelerometer.addListener> | null,
        // [GYRO] gyroSub: null as ReturnType<typeof Gyroscope.addListener> | null,
        // [GYRO] impactTime: null as number | null,
        // [GYRO] cumRotation: 0,
        // [GYRO] lastGyroTime: null as number | null,
        locationSub: null as Location.LocationSubscription | null,
        lastLocation: null as Location.LocationObject | null,
        countdownTimer: null as ReturnType<typeof setInterval> | null,
        contacto: '',
        alerting: false,
    });

    useEffect(() => {
        AsyncStorage.getItem(KEY_CONTACTO).then((v) => {
            if (v) { setContactoState(v); r.current.contacto = v; }
        });
        return () => {
            stopAll();
            if (r.current.countdownTimer) clearInterval(r.current.countdownTimer);
        };
    }, []);

    const stopSensors = () => {
        r.current.accelSub?.remove();
        r.current.accelSub = null;
        // [GYRO] r.current.gyroSub?.remove();
        // [GYRO] r.current.gyroSub = null;
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
            const texto = `🆘 ACCIDENTE DE MOTO DETECTADO\nNecesito ayuda urgente.\n📍 ${mapUrl}\nHora: ${timestamp}`;

            const stored = await AsyncStorage.getItem(KEY_EVENTOS);
            const eventos = stored ? JSON.parse(stored) : [];
            eventos.push({ fecha: new Date().toISOString(), lat, lng });
            await AsyncStorage.setItem(KEY_EVENTOS, JSON.stringify(eventos));

            const numero = r.current.contacto.replace(/\D/g, '');
            if (numero) {
                await Linking.openURL(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`);
            }
        } finally {
            stopLocationTracking();
            r.current.alerting = false;
            setPhase('idle');
            setCountdown(COUNTDOWN_SECONDS);
        }
    };

    const triggerAlert = () => {
        if (r.current.alerting) return;
        r.current.alerting = true;

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

    const startSensors = () => {
        r.current.alerting = false;
        // [GYRO] r.current.impactTime = null;
        // [GYRO] r.current.cumRotation = 0;
        // [GYRO] r.current.lastGyroTime = null;

        // Modo simulación: dispara con solo acelerómetro > umbral
        Accelerometer.setUpdateInterval(50);
        r.current.accelSub = Accelerometer.addListener(({ x, y, z }) => {
            if (r.current.alerting) return;
            const mag = Math.sqrt(x * x + y * y + z * z);
            const magG = Platform.OS === 'android' ? mag / 9.81 : mag;

            if (magG > IMPACT_THRESHOLD_G) {
                triggerAlert();
            }
        });

        // [GYRO] Modo producción: requiere impacto + rotación dentro de TRIGGER_WINDOW_MS
        // Accelerometer.setUpdateInterval(80);
        // r.current.accelSub = Accelerometer.addListener(({ x, y, z }) => {
        //     if (r.current.alerting) return;
        //     const mag = Math.sqrt(x * x + y * y + z * z);
        //     const magG = Platform.OS === 'android' ? mag / 9.81 : mag;
        //     if (magG > IMPACT_THRESHOLD_G && r.current.impactTime === null) {
        //         r.current.impactTime = Date.now();
        //         r.current.cumRotation = 0;
        //         r.current.lastGyroTime = null;
        //     }
        // });
        //
        // Gyroscope.setUpdateInterval(80);
        // r.current.gyroSub = Gyroscope.addListener(({ y, z }) => {
        //     if (r.current.alerting || r.current.impactTime === null) return;
        //     const now = Date.now();
        //     const elapsed = now - r.current.impactTime;
        //     if (elapsed > TRIGGER_WINDOW_MS) {
        //         r.current.impactTime = null;
        //         r.current.cumRotation = 0;
        //         r.current.lastGyroTime = null;
        //         return;
        //     }
        //     const dt = r.current.lastGyroTime ? (now - r.current.lastGyroTime) / 1000 : 0.08;
        //     r.current.lastGyroTime = now;
        //     r.current.cumRotation += (Math.abs(y) + Math.abs(z)) * dt;
        //     if (r.current.cumRotation >= ROTATION_THRESHOLD_RAD) {
        //         triggerAlert();
        //     }
        // });
    };

    const activate = () => {
        setPhase('monitoring');
        startSensors();
        startLocationTracking();
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
