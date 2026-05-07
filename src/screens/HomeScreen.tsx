import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Activity, Battery, Droplet, Wrench, Flame, Gauge, Sparkles, Check, ArrowRight,
} from 'lucide-react-native';

import { RootStackParamList } from '../types/navigation';
import { colors, spacing, borderRadius } from '../theme/colors';
import { useVehicleProfile } from '../hooks/useVehicleProfile';
import { ERROR_MESSAGES } from '../utils/errorMessages';

const QUICK_SYMPTOMS = [
  { id: '1', label: 'No arranca', Icon: Activity },
  { id: '2', label: 'Batería muerta', Icon: Battery },
  { id: '3', label: 'Ruido extraño', Icon: Wrench },
  { id: '4', label: 'Pierde líquido', Icon: Droplet },
  { id: '5', label: 'Sobrecalienta', Icon: Flame },
  { id: '6', label: 'Frenos blandos', Icon: Gauge },
];

function getSaludo() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [text, setText] = useState('');
  const [inputError, setInputError] = useState('');
  const { perfilLabel } = useVehicleProfile();
  const { bottom } = useSafeAreaInsets();

  const handleChipPress = (symptom: string) => {
    setInputError('');
    setText((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return symptom;
      if (trimmed.includes(symptom)) return prev;
      return `${trimmed}, ${symptom}`;
    });
  };

  const handleDiagnosticar = () => {
    if (!text.trim()) {
      setInputError(ERROR_MESSAGES.NO_SYMPTOMS_PROVIDED);
      return;
    }
    setInputError('');
    navigation.navigate('Carga', {
      sintomas: text.trim(),
      perfilVehiculo: perfilLabel(),
    });
  };

  const hasInput = text.trim().length > 0;
  const perfilDisplay = perfilLabel();
  const vehicleLabel = perfilDisplay !== 'No especificado' ? perfilDisplay : null;

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.appBackground} />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        style={s.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.headerRow}>
          <View>
            <Text style={s.saludo}>{getSaludo()}</Text>
            <Text style={s.titulo}>¿Qué le pasa{'\n'}a tu vehículo?</Text>
          </View>
        </View>

        {vehicleLabel && (
          <View style={s.vehiclePill}>
            <Wrench color={colors.brand} size={14} strokeWidth={2} />
            <Text style={s.vehicleText}>{vehicleLabel}</Text>
          </View>
        )}

        <View style={s.chipsSection}>
          <View style={s.chipsSectionHeader}>
            <Text style={s.chipsLabel}>Elegí un síntoma</Text>
          </View>
          <View style={s.chipsGrid}>
            {QUICK_SYMPTOMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={s.chip}
                activeOpacity={0.7}
                onPress={() => handleChipPress(item.label)}
              >
                <View style={s.chipIcon}>
                  <item.Icon color={colors.brand} size={16} strokeWidth={2} />
                </View>
                <Text style={s.chipText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[s.inputCard, hasInput && s.inputCardActive, !!inputError && s.inputCardError]}>
          <TextInput
            style={s.textarea}
            placeholder="Ej: Vibra al acelerar y se escucha un chillido al frenar..."
            placeholderTextColor={colors.tertiaryText}
            value={text}
            onChangeText={(v) => { setText(v); if (inputError) setInputError(''); }}
            multiline
            numberOfLines={5}
            selectionColor={colors.brand}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
          {!hasInput && !inputError && (
            <Text style={s.inputHint}>
              Incluí ruidos, vibraciones, olores, cuándo ocurre y desde cuándo.
            </Text>
          )}
          {inputError ? (
            <Text style={s.inputError}>{inputError}</Text>
          ) : null}
          <View style={s.inputFooter}>
            <Text style={s.charCount}>{text.length} / 500</Text>
            {hasInput && (
              <View style={s.sufficientBadge}>
                <Check color={colors.safeGreen} size={12} strokeWidth={2.5} />
                <Text style={s.sufficientText}>Suficiente detalle</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[s.bottomArea, { paddingBottom: bottom || spacing.md }]}>
        <TouchableOpacity
          style={[s.ctaBtn, !hasInput && s.ctaBtnDisabled]}
          onPress={handleDiagnosticar}
          activeOpacity={0.85}
        >
          <Sparkles color={colors.accent} size={18} fill={colors.accent} />
          <Text style={s.ctaText}>Analizar con IA</Text>
          <ArrowRight color="#fff" size={18} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBackground },
  flex: { flex: 1 },
  scrollView: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: 16,
  },
  saludo: { fontSize: 13, color: colors.tertiaryText, fontWeight: '600' },
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryText,
    lineHeight: 30,
    letterSpacing: -0.5,
    marginTop: 4,
  },

  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: borderRadius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
    shadowColor: colors.primaryText,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  vehicleText: { fontSize: 13, fontWeight: '700', color: colors.primaryText },

  chipsSection: { marginBottom: spacing.lg },
  chipsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chipsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.tertiaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    width: '31%',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
    shadowColor: colors.primaryText,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  chipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.secondaryText,
    textAlign: 'center',
  },

  inputCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderColor,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.primaryText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputCardActive: {
    borderColor: colors.brand,
    shadowColor: colors.brand,
    shadowOpacity: 0.12,
  },
  inputCardError: {
    borderColor: colors.critRed,
    shadowColor: colors.critRed,
    shadowOpacity: 0.1,
  },
  textarea: {
    minHeight: 100,
    fontSize: 14,
    color: colors.primaryText,
    textAlignVertical: 'top',
    lineHeight: 22,
    fontWeight: '500',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
  },
  inputHint: {
    fontSize: 12,
    color: colors.tertiaryText,
    lineHeight: 18,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  inputError: {
    fontSize: 12,
    color: colors.critRed,
    lineHeight: 18,
    marginBottom: 8,
    fontWeight: '600',
  },
  charCount: { fontSize: 11, color: colors.tertiaryText },
  sufficientBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sufficientText: { fontSize: 11, fontWeight: '700', color: colors.safeGreen },

  bottomArea: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(244,246,249,0.97)',
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
  },
  ctaBtn: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.pill,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaBtnDisabled: { opacity: 0.45, shadowOpacity: 0, elevation: 0 },
  ctaText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
