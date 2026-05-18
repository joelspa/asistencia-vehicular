/** Pantalla intermedia: análisis mientras se obtiene el diagnóstico. Muestra error si la IA no está disponible. */
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, Cpu, Lock, WifiOff, ArrowLeft } from 'lucide-react-native';

import { RootStackParamList } from '../types/navigation';
import { useColors } from '../context/ThemeContext';
import { useDiagnosisFetch } from '../hooks/useDiagnosisFetch';
import { withAlpha } from '../theme/utils';

type LoadingRoute = RouteProp<RootStackParamList, 'Carga'>;

const CONNECTOR_FILL_BY_STEP: Record<1 | 2 | 3, number> = { 1: 0, 2: 56, 3: 110 };

export default function LoadingScreen() {
  const colors = useColors();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<LoadingRoute>();
  const { sintomas, perfilVehiculo } = route.params;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const pulseAnim = useRef(new Animated.Value(0.85)).current;
  const connectorAnim = useRef(new Animated.Value(0)).current;

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
    Animated.timing(connectorAnim, {
      toValue: CONNECTOR_FILL_BY_STEP[step],
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [step, connectorAnim]);

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
      } else {
        setErrorMsg('No fue posible conectar con Ollama. Asegurate de que el servidor esté corriendo y que el modelo esté disponible.');
        setShowError(true);
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

  const s = useMemo(() => StyleSheet.create({
    screen:      { flex: 1, backgroundColor: colors.appBackground },
    header:      { height: 48, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 15, fontWeight: '600', color: colors.primaryText },
    content:     { flex: 1, alignItems: 'center', paddingTop: 36, paddingHorizontal: 28 },

    pulseWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    ring3: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: withAlpha(colors.brand, 0.08) },
    ring2: { position: 'absolute', width: 124, height: 124, borderRadius: 62, backgroundColor: withAlpha(colors.brand, 0.14) },
    ring1: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: withAlpha(colors.brand, 0.22) },
    center: {
      width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brand,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: colors.brand, shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
    },

    title: { fontSize: 22, fontWeight: '800', color: colors.primaryText, letterSpacing: -0.4 },
    sub:   { fontSize: 13.5, color: colors.tertiaryText, marginTop: 4, marginBottom: 28 },

    stepsWrap:    { width: '100%', position: 'relative' },
    connector:    { position: 'absolute', left: 17, top: 26, bottom: 40, width: 2, backgroundColor: colors.borderColor, borderRadius: 2 },
    connectorFill:{ position: 'absolute', left: 17, top: 26, width: 2, backgroundColor: colors.brand, borderRadius: 2 },
    step:         { flexDirection: 'row', gap: 14, marginBottom: 20, position: 'relative' },
    dot:          { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', zIndex: 10, flexShrink: 0 },
    dotDone:      { backgroundColor: colors.safeSoft },
    dotActive:    { backgroundColor: colors.brandSoft },
    dotPending:   { backgroundColor: colors.cardBackground, borderWidth: 1.5, borderColor: colors.borderColor },
    dotInner:     { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand },
    dotNum:       { fontSize: 11, fontWeight: '700', color: colors.tertiaryText },
    stepContent:  { flex: 1, paddingTop: 4 },
    stepTitle:    { fontSize: 14, fontWeight: '700', color: colors.primaryText, marginBottom: 2 },
    stepDim:      { color: colors.tertiaryText },
    stepDetail:   { fontSize: 12, color: colors.tertiaryText },
    progressBar:  { height: 4, backgroundColor: colors.surface2, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 2 },

    privacy:     { marginTop: 'auto', marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.8 },
    privacyText: { fontSize: 12, fontWeight: '600', color: colors.tertiaryText },

    // Error state
    errorWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    errorIconBox: {
      width: 80, height: 80, borderRadius: 24,
      backgroundColor: colors.critSoft,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 20,
    },
    errorTitle: { fontSize: 22, fontWeight: '800', color: colors.primaryText, textAlign: 'center', letterSpacing: -0.4, marginBottom: 10 },
    errorMsg:   { fontSize: 14, color: colors.tertiaryText, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    backBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: colors.cardBackground,
      borderWidth: 1.5, borderColor: colors.borderColor,
      borderRadius: 999, paddingVertical: 14, paddingHorizontal: 28,
    },
    backBtnText: { fontSize: 15, fontWeight: '700', color: colors.primaryText },
  }), [colors]);

  if (showError) {
    return (
      <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Sin conexión</Text>
        </View>
        <View style={s.errorWrap}>
          <View style={s.errorIconBox}>
            <WifiOff color={colors.critRed} size={36} strokeWidth={1.8} />
          </View>
          <Text style={s.errorTitle}>IA no disponible</Text>
          <Text style={s.errorMsg}>{errorMsg}</Text>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ArrowLeft color={colors.primaryText} size={18} strokeWidth={2} />
            <Text style={s.backBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Analizando</Text>
      </View>

      <View style={s.content}>
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

        <View style={s.stepsWrap}>
          <View style={s.connector} />
          <Animated.View style={[s.connectorFill, { height: connectorAnim }]} />
          {steps.map((p, i) => (
            <View key={i} style={s.step}>
              <View style={[s.dot, p.state === 'done' && s.dotDone, p.state === 'active' && s.dotActive, p.state === 'pending' && s.dotPending]}>
                {p.state === 'done'    && <Check color={colors.safeGreen} size={16} strokeWidth={3} />}
                {p.state === 'active'  && <View style={s.dotInner} />}
                {p.state === 'pending' && <Text style={s.dotNum}>{i + 1}</Text>}
              </View>
              <View style={s.stepContent}>
                <Text style={[s.stepTitle, p.state === 'pending' && s.stepDim]}>{p.title}</Text>
                {p.detail ? <Text style={s.stepDetail} numberOfLines={1}>{p.detail}</Text> : null}
                {p.state === 'active' && (
                  <View style={s.progressBar}>
                    <View style={[s.progressFill, { width: `${progress}%` }]} />
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={s.privacy}>
          <Lock color={colors.tertiaryText} size={13} />
          <Text style={s.privacyText}>Tu información no sale del dispositivo</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
