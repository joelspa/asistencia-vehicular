/** Pantalla de perfil del vehículo y configuración de la app. */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Car, Fuel, AlertTriangle, ShieldCheck, Cpu, Phone, Shield, ChevronRight,
} from 'lucide-react-native';
import { useColors } from '../context/ThemeContext';
import { useVehicleProfile } from '../hooks/useVehicleProfile';
import { PerfilVehiculo } from '../services/storage';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { useModoMotoContext } from '../context/ModoMotoContext';

const FUEL_OPTIONS = ['Gasolina', 'Diesel', 'Gas'];

type VehicleKey = 'marca' | 'modelo' | 'anio';

const isDefined = (v: string | undefined) => v && v !== 'Sin definir';

export default function SettingsScreen() {
  const colors = useColors();
  const { phase, activate, deactivate, contacto, saveContacto } = useModoMotoContext();
  const [editandoContacto, setEditandoContacto] = useState(false);
  const [contactoTemp, setContactoTemp] = useState('');
  const [editingField, setEditingField] = useState<VehicleKey | null>(null);
  const [perfilTemp, setPerfilTemp] = useState<PerfilVehiculo | null>(null);
  type AiStatus = 'loading' | 'connected' | 'disconnected';
  const [aiStatus, setAiStatus] = useState<AiStatus>('loading');
  const [aiModel, setAiModel] = useState('');

  const { perfil, updateProfile, loading } = useVehicleProfile();
  const perfilRef = useRef<PerfilVehiculo | null>(null);

  useEffect(() => {
    if (perfil) { setPerfilTemp(perfil); perfilRef.current = perfil; }
  }, [perfil]);

  useEffect(() => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.config}`)
      .then(res => res.json())
      .then(data => { setAiModel(data.model ?? 'phi3'); setAiStatus('connected'); })
      .catch(() => setAiStatus('disconnected'));
  }, []);

  const setField = useCallback((key: VehicleKey, value: string) => {
    setPerfilTemp((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      perfilRef.current = next;
      return next;
    });
  }, []);

  const saveProfile = useCallback(async () => {
    if (!perfilRef.current) return;
    await updateProfile(perfilRef.current);
  }, [updateProfile]);

  const handleFieldBlur = useCallback(() => {
    setEditingField(null);
    saveProfile();
  }, [saveProfile]);

  const handleFuelChange = (fuel: string) => {
    setPerfilTemp((prev) => {
      if (!prev) return prev;
      const next = { ...prev, combustible: fuel };
      perfilRef.current = next;
      return next;
    });
    setTimeout(() => saveProfile(), 0);
  };

  const s = useMemo(() => StyleSheet.create({
    screen:        { flex: 1, backgroundColor: colors.appBackground },
    flex:          { flex: 1 },
    header:        { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
    headerTitle:   { fontSize: 26, fontWeight: '800', color: colors.primaryText, letterSpacing: -0.4 },
    headerSub:     { fontSize: 13, color: colors.tertiaryText, marginTop: 2 },
    scroll:        { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },

    vehicleHero: {
      backgroundColor: colors.navy,
      borderRadius: 20, padding: 18,
      position: 'relative', overflow: 'hidden', marginBottom: 4, gap: 2,
    },
    heroDecor:       { position: 'absolute', right: -20, top: -30 },
    heroBadge:       { fontSize: 10.5, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
    heroVehicleName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
    heroVehicleSub:  { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    heroHint:        { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 10, fontStyle: 'italic' },

    sectionLabel:     { paddingHorizontal: 4, marginTop: 6 },
    sectionLabelText: { fontSize: 11, fontWeight: '800', color: colors.tertiaryText, textTransform: 'uppercase', letterSpacing: 0.8 },

    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
      elevation: 2, shadowOffset: { width: 0, height: 2 },
      overflow: 'hidden',
    },

    row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, minHeight: 52, paddingVertical: 4 },
    rowBorder:    { borderBottomWidth: 1, borderBottomColor: colors.surface2 },
    rowLabel:     { fontSize: 13.5, color: colors.secondaryText, fontWeight: '600' },
    rowValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    rowValue:     { fontSize: 14, color: colors.primaryText, fontWeight: '700' },
    rowHint:      { fontSize: 13.5, color: colors.tertiaryText, fontStyle: 'italic' },
    rowInput: {
      fontSize: 14, color: colors.primaryText, textAlign: 'right', flex: 1, marginLeft: 16,
      borderBottomWidth: 1.5, borderBottomColor: colors.brand, paddingVertical: 6, fontWeight: '600',
    },

    fuelSection:     { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
    fuelLabelRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
    fuelOptions:     { flexDirection: 'row', gap: 8 },
    fuelOption:      { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderColor, alignItems: 'center' },
    fuelOptionActive:{ borderColor: colors.brand, backgroundColor: colors.brandSoft },
    fuelOptionText:       { fontSize: 13, fontWeight: '500', color: colors.secondaryText },
    fuelOptionTextActive: { color: colors.brand, fontWeight: '700' },

    aboutRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    aboutLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    aboutIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
    aboutValue:    { fontSize: 12.5, color: colors.primaryText, fontWeight: '600' },

    disclaimer:        { backgroundColor: colors.accentSoft, borderRadius: 14, borderWidth: 1, borderColor: '#FBE5A0', padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 4 },
    disclaimerContent: { flex: 1 },
    disclaimerTitle:   { fontSize: 12.5, fontWeight: '800', color: '#78350F', marginBottom: 4 },
    disclaimerText:    { fontSize: 11.5, color: '#92400E', lineHeight: 18 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText:      { fontSize: 16, color: colors.primaryText },

    motoCard:         { backgroundColor: colors.cardBackground, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: colors.borderColor, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, shadowOffset: { width: 0, height: 2 } },
    motoCardActive:   { backgroundColor: colors.motoPurple, borderColor: colors.motoPurple },
    motoCardLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    motoIconWrap:     { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.purpleSurface, alignItems: 'center', justifyContent: 'center' },
    motoIconWrapActive: { backgroundColor: 'rgba(255,255,255,0.18)' },
    motoTextWrap:     { flex: 1 },
    motoTitle:        { fontSize: 15, fontWeight: '700', color: colors.primaryText },
    motoTitleActive:  { color: '#fff' },
    motoSub:          { fontSize: 12, color: colors.tertiaryText, marginTop: 2 },
    motoSubActive:    { color: 'rgba(255,255,255,0.75)' },
    motoToggle:       { width: 48, height: 28, borderRadius: 14, backgroundColor: colors.surface2, justifyContent: 'center', paddingHorizontal: 3 },
    motoToggleActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
    motoToggleDot:    { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.tertiaryText },
    motoToggleDotActive: { backgroundColor: '#fff', alignSelf: 'flex-end' },

    contactRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, minHeight: 56, paddingVertical: 4 },
    contactoValue: { fontSize: 13, fontWeight: '700', color: colors.motoPurple },
    contactoEmpty: { fontSize: 13, fontWeight: '600', color: colors.motoPurple, fontStyle: 'italic' },
    contactoInput: { fontSize: 13, color: colors.primaryText, textAlign: 'right', flex: 1, marginLeft: 16, borderBottomWidth: 1.5, borderBottomColor: colors.motoPurple, paddingVertical: 6, fontWeight: '600' },
    motoHintRow:   { paddingHorizontal: 16, paddingBottom: 14 },
    motoHint:      { fontSize: 11.5, color: colors.tertiaryText, lineHeight: 17 },
  }), [colors]);

  if (loading || !perfilTemp) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <View style={s.loadingContainer}>
          <Text style={s.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fields: { label: string; key: VehicleKey; placeholder: string; keyboardType?: 'default' | 'numeric' }[] = [
    { label: 'Marca',  key: 'marca',  placeholder: 'Ej: Honda' },
    { label: 'Modelo', key: 'modelo', placeholder: 'Ej: CBR 300' },
    { label: 'Año',    key: 'anio',   placeholder: 'Ej: 2022', keyboardType: 'numeric' },
  ];

  const vehicleName = [perfilTemp.marca, perfilTemp.modelo]
    .filter(isDefined)
    .join(' ') || 'Mi Vehículo';

  const vehicleSub = `${isDefined(perfilTemp.anio) ? perfilTemp.anio : '—'} · ${perfilTemp.combustible}`;

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Mi vehículo</Text>
        <Text style={s.headerSub}>Personaliza el diagnóstico</Text>
      </View>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero card vehículo */}
          <View style={s.vehicleHero}>
            <View style={s.heroDecor} pointerEvents="none">
              <Car color="rgba(255,255,255,0.06)" size={180} strokeWidth={1.4} />
            </View>
            <Text style={s.heroBadge}>Vehículo activo</Text>
            <Text style={s.heroVehicleName}>{vehicleName}</Text>
            <Text style={s.heroVehicleSub}>{vehicleSub}</Text>
            <Text style={s.heroHint}>Toca cualquier campo para editar</Text>
          </View>

          {/* Datos del vehículo */}
          <View style={s.sectionLabel}>
            <Text style={s.sectionLabelText}>DATOS DEL VEHÍCULO</Text>
          </View>
          <View style={s.card}>
            {fields.map((item, i) => (
              <TouchableOpacity
                key={item.key}
                style={[s.row, i < fields.length - 1 && s.rowBorder]}
                onPress={() => setEditingField(item.key)}
                activeOpacity={0.65}
              >
                <Text style={s.rowLabel}>{item.label}</Text>
                {editingField === item.key ? (
                  <TextInput
                    style={s.rowInput}
                    value={isDefined(perfilTemp[item.key]) ? perfilTemp[item.key] : ''}
                    onChangeText={(v) => setField(item.key, v)}
                    placeholder={item.placeholder}
                    placeholderTextColor={colors.tertiaryText}
                    selectionColor={colors.brand}
                    keyboardType={item.keyboardType ?? 'default'}
                    autoFocus
                    returnKeyType="done"
                    onBlur={handleFieldBlur}
                    onSubmitEditing={handleFieldBlur}
                  />
                ) : (
                  <View style={s.rowValueWrap}>
                    <Text style={isDefined(perfilTemp[item.key]) ? s.rowValue : s.rowHint}>
                      {isDefined(perfilTemp[item.key]) ? perfilTemp[item.key] : item.placeholder}
                    </Text>
                    {!isDefined(perfilTemp[item.key]) && (
                      <ChevronRight color={colors.tertiaryText} size={14} strokeWidth={2} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Combustible */}
            <View style={s.fuelSection}>
              <View style={s.fuelLabelRow}>
                <Fuel color={colors.tertiaryText} size={14} />
                <Text style={s.rowLabel}>Combustible</Text>
              </View>
              <View style={s.fuelOptions}>
                {FUEL_OPTIONS.map((fuel) => (
                  <TouchableOpacity
                    key={fuel}
                    style={[s.fuelOption, perfilTemp.combustible === fuel && s.fuelOptionActive]}
                    onPress={() => handleFuelChange(fuel)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.fuelOptionText, perfilTemp.combustible === fuel && s.fuelOptionTextActive]}>
                      {fuel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Aplicación */}
          <View style={s.sectionLabel}>
            <Text style={s.sectionLabelText}>APLICACIÓN</Text>
          </View>
          <View style={s.card}>
            {/* Motor de IA — 3 estados */}
            <View style={[s.aboutRow, s.rowBorder]}>
              <View style={s.aboutLabelRow}>
                <View style={s.aboutIconWrap}>
                  <Cpu color={colors.brand} size={14} strokeWidth={2} />
                </View>
                <Text style={s.rowLabel}>Motor de IA</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {aiStatus === 'loading' && (
                  <>
                    <ActivityIndicator size="small" color={colors.tertiaryText} />
                    <Text style={s.aboutValue}>Comprobando...</Text>
                  </>
                )}
                {aiStatus === 'connected' && (
                  <>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.safeGreen }} />
                    <Text style={[s.aboutValue, { color: colors.safeGreen }]}>Ollama · {aiModel}</Text>
                  </>
                )}
                {aiStatus === 'disconnected' && (
                  <>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.critRed }} />
                    <Text style={[s.aboutValue, { color: colors.critRed }]}>Sin conexión</Text>
                  </>
                )}
              </View>
            </View>
            {/* Almacenamiento */}
            <View style={s.aboutRow}>
              <View style={s.aboutLabelRow}>
                <View style={s.aboutIconWrap}>
                  <ShieldCheck color={colors.brand} size={14} strokeWidth={2} />
                </View>
                <Text style={s.rowLabel}>Almacenamiento</Text>
              </View>
              <Text style={s.aboutValue}>Solo en tu dispositivo</Text>
            </View>
          </View>

          {/* Modo Moto */}
          <View style={s.sectionLabel}>
            <Text style={s.sectionLabelText}>MODO MOTO</Text>
          </View>

          <TouchableOpacity
            style={[s.motoCard, phase === 'monitoring' && s.motoCardActive]}
            activeOpacity={0.88}
            onPress={phase === 'idle' ? activate : deactivate}
          >
            <View style={s.motoCardLeft}>
              <View style={[s.motoIconWrap, phase === 'monitoring' && s.motoIconWrapActive]}>
                <Shield color={phase === 'monitoring' ? '#fff' : colors.motoPurple} size={22} strokeWidth={2} />
              </View>
              <View style={s.motoTextWrap}>
                <Text style={[s.motoTitle, phase === 'monitoring' && s.motoTitleActive]}>
                  {phase === 'monitoring' ? 'Monitoreando...' : 'Activar Modo Moto'}
                </Text>
                <Text style={[s.motoSub, phase === 'monitoring' && s.motoSubActive]}>
                  {phase === 'monitoring'
                    ? 'Detectando impactos y caídas'
                    : 'Detección automática de accidentes'}
                </Text>
              </View>
            </View>
            <View style={[s.motoToggle, phase === 'monitoring' && s.motoToggleActive]}>
              <View style={[s.motoToggleDot, phase === 'monitoring' && s.motoToggleDotActive]} />
            </View>
          </TouchableOpacity>

          {/* Contacto de emergencia */}
          <View style={s.card}>
            <TouchableOpacity
              style={[s.contactRow, s.rowBorder]}
              onPress={() => { setContactoTemp(contacto); setEditandoContacto(true); }}
              activeOpacity={0.7}
            >
              <View style={s.aboutLabelRow}>
                <View style={[s.aboutIconWrap, { backgroundColor: colors.purpleSurface }]}>
                  <Phone color={colors.motoPurple} size={14} strokeWidth={2} />
                </View>
                <Text style={s.rowLabel}>Contacto de emergencia</Text>
              </View>
              {editandoContacto ? (
                <TextInput
                  style={s.contactoInput}
                  value={contactoTemp}
                  onChangeText={setContactoTemp}
                  placeholder="+591 70000000"
                  placeholderTextColor={colors.tertiaryText}
                  keyboardType="phone-pad"
                  selectionColor={colors.motoPurple}
                  autoFocus
                  returnKeyType="done"
                  onBlur={() => { saveContacto(contactoTemp); setEditandoContacto(false); }}
                  onSubmitEditing={() => { saveContacto(contactoTemp); setEditandoContacto(false); }}
                />
              ) : (
                <View style={s.rowValueWrap}>
                  <Text style={contacto ? s.contactoValue : s.contactoEmpty}>
                    {contacto || 'Agregar número'}
                  </Text>
                  {!contacto && <ChevronRight color={colors.motoPurple} size={14} strokeWidth={2} />}
                </View>
              )}
            </TouchableOpacity>
            <View style={s.motoHintRow}>
              <Text style={s.motoHint}>
                Número de WhatsApp al que se enviará la alerta. Incluir código de país.
              </Text>
            </View>
          </View>

          {/* Aviso */}
          <View style={s.disclaimer}>
            <AlertTriangle color={colors.warnOrange} size={18} strokeWidth={2.2} />
            <View style={s.disclaimerContent}>
              <Text style={s.disclaimerTitle}>Aviso importante</Text>
              <Text style={s.disclaimerText}>
                MotorSense es una herramienta orientativa. No reemplaza la revisión de un mecánico certificado.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
