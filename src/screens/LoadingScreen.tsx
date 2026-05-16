/** Pantalla intermedia: animación de análisis mientras se obtiene el diagnóstico del backend. */
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, Cpu, Lock } from 'lucide-react-native';

import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { useDiagnosisFetch } from '../hooks/useDiagnosisFetch';

type LoadingRoute = RouteProp<RootStackParamList, 'Carga'>;

export default function LoadingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<LoadingRoute>();
  const { sintomas, perfilVehiculo } = route.params;
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const pulseAnim = useRef(new Animated.Value(0.85)).current;

  const { fetchDiagnosis } = useDiagnosisFetch();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.85, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(2), 800);
    const t2 = setTimeout(() => setProgress(65), 1200);
    const t3 = setTimeout(async () => {
      const data = await fetchDiagnosis(sintomas, perfilVehiculo);
      if (data) {
        setStep(3);
        setProgress(100);
        setTimeout(
          () => navigation.replace('Resultado', { diagnostico: data, sintomas, perfilVehiculo }),
          600
        );
      }
    }, 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const steps = [
    {
      state: 'done' as const,
      title: 'Síntomas recibidos',
      detail: sintomas,
    },
    {
      state: (step >= 2 ? (step > 2 ? 'done' : 'active') : 'pending') as 'done' | 'active' | 'pending',
      title: 'Consultando base de datos',
      detail: 'Comparando con casos similares…',
    },
    {
      state: (step >= 3 ? 'done' : 'pending') as 'done' | 'active' | 'pending',
      title: 'Generando diagnóstico',
      detail: '',
    },
  ];

  return (
    <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Analizando</Text>
      </View>

      <View style={s.content}>
        {/* Pulse animado */}
        <Animated.View style={[s.pulseWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={s.ring3} />
          <View style={s.ring2} />
          <View style={s.ring1} />
          <View style={s.center}>
            <Cpu color="#fff" size={28} strokeWidth={2} />
          </View>
        </Animated.View>

        <Text style={s.title}>La IA está trabajando</Text>
        <Text style={s.sub}>Esto toma unos segundos…</Text>

        {/* Pasos */}
        <View style={s.stepsWrap}>
          <View style={s.connector} />
          <View style={s.connectorFill} />

          {steps.map((p, i) => (
            <View key={i} style={s.step}>
              <View style={[
                s.dot,
                p.state === 'done' && s.dotDone,
                p.state === 'active' && s.dotActive,
                p.state === 'pending' && s.dotPending,
              ]}>
                {p.state === 'done' && <Check color={colors.safeGreen} size={16} strokeWidth={3} />}
                {p.state === 'active' && <View style={s.dotInner} />}
                {p.state === 'pending' && (
                  <Text style={s.dotNum}>{i + 1}</Text>
                )}
              </View>
              <View style={s.stepContent}>
                <Text style={[s.stepTitle, p.state === 'pending' && s.stepDim]}>
                  {p.title}
                </Text>
                {p.detail ? (
                  <Text style={s.stepDetail} numberOfLines={1}>{p.detail}</Text>
                ) : null}
                {p.state === 'active' && (
                  <View style={s.progressBar}>
                    <View style={[s.progressFill, { width: `${progress}%` }]} />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Privacidad */}
        <View style={s.privacy}>
          <Lock color={colors.tertiaryText} size={13} />
          <Text style={s.privacyText}>Tu información no sale del dispositivo</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const BRAND = colors.brand;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBackground },
  header: { height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '600', color: colors.primaryText },
  content: { flex: 1, alignItems: 'center', paddingTop: 36, paddingHorizontal: 28 },

  // Pulse
  pulseWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ring3: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(37,99,235,0.06)',
  },
  ring2: {
    position: 'absolute',
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: 'rgba(37,99,235,0.10)',
  },
  ring1: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(37,99,235,0.16)',
  },
  center: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },

  title: { fontSize: 22, fontWeight: '800', color: colors.primaryText, letterSpacing: -0.4 },
  sub: { fontSize: 13.5, color: colors.tertiaryText, marginTop: 4, marginBottom: 28 },

  // Steps
  stepsWrap: { width: '100%', position: 'relative' },
  connector: {
    position: 'absolute',
    left: 17,
    top: 26,
    bottom: 40,
    width: 2,
    backgroundColor: colors.borderColor,
    borderRadius: 2,
  },
  connectorFill: {
    position: 'absolute',
    left: 17,
    top: 26,
    height: 90,
    width: 2,
    backgroundColor: BRAND,
    borderRadius: 2,
  },
  step: { flexDirection: 'row', gap: 14, marginBottom: 20, position: 'relative' },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    flexShrink: 0,
  },
  dotDone: { backgroundColor: colors.safeSoft },
  dotActive: { backgroundColor: colors.brandSoft },
  dotPending: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1.5,
    borderColor: colors.borderColor,
  },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND },
  dotNum: { fontSize: 11, fontWeight: '700', color: colors.tertiaryText },
  stepContent: { flex: 1, paddingTop: 4 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: colors.primaryText, marginBottom: 2 },
  stepDim: { color: colors.tertiaryText },
  stepDetail: { fontSize: 12, color: colors.tertiaryText },
  progressBar: {
    height: 4,
    backgroundColor: colors.surface2,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: BRAND, borderRadius: 2 },

  // Privacy
  privacy: {
    marginTop: 'auto',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.8,
  },
  privacyText: { fontSize: 12, fontWeight: '600', color: colors.tertiaryText },
});
