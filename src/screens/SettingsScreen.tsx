/** Pantalla de perfil del vehículo y configuración del motor de IA. */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Car, Fuel, AlertTriangle, ShieldCheck, Cpu, Edit2, Phone, Shield,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useVehicleProfile } from '../hooks/useVehicleProfile';
import { PerfilVehiculo } from '../services/storage';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { useModoMotoContext } from '../context/ModoMotoContext';

const FUEL_OPTIONS = ['Gasolina', 'Diesel', 'Gas'];

export default function SettingsScreen() {
  const { phase, activate, deactivate, contacto, saveContacto } = useModoMotoContext();
  const [editandoContacto, setEditandoContacto] = useState(false);
  const [contactoTemp, setContactoTemp] = useState('');
  const [editando, setEditando] = useState(false);
  const [perfilTemp, setPerfilTemp] = useState<PerfilVehiculo | null>(null);
  const [aiModel, setAiModel] = useState('Ollama (cargando...)');

  const { perfil, updateProfile, loading } = useVehicleProfile();

  useEffect(() => {
    if (perfil) setPerfilTemp(perfil);
  }, [perfil]);

  useEffect(() => {
    fetch(`${API_BASE_URL}${API_ENDPOINTS.config}`)
      .then(res => res.json())
      .then(data => setAiModel(`Ollama · ${data.model}`))
      .catch(() => setAiModel('Ollama · local'));
  }, []);

  const guardarCambios = async () => {
    if (!perfilTemp) return;
    await updateProfile(perfilTemp);
    setEditando(false);
    Alert.alert('Guardado', 'Perfil del vehículo actualizado.');
  };

  const cancelarEdicion = () => {
    if (perfil) setPerfilTemp(perfil);
    setEditando(false);
  };

  if (loading || !perfilTemp) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <View style={s.loadingContainer}>
          <Text style={s.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Mi vehículo</Text>
        <Text style={s.headerSub}>Personaliza el diagnóstico</Text>
      </View>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Hero card vehículo — oscuro */}
        <View style={s.vehicleHero}>
          {/* Decoración */}
          <View style={s.heroDecor} pointerEvents="none">
            <Car color="rgba(255,255,255,0.06)" size={180} strokeWidth={1.4} />
          </View>

          <View style={s.heroTopRow}>
            <Text style={s.heroBadge}>Vehículo activo</Text>
            {!editando ? (
              <TouchableOpacity onPress={() => setEditando(true)} activeOpacity={0.7}>
                <Edit2 color="rgba(255,255,255,0.7)" size={16} strokeWidth={2} />
              </TouchableOpacity>
            ) : (
              <View style={s.heroActions}>
                <TouchableOpacity onPress={cancelarEdicion}>
                  <Text style={s.heroCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.heroSaveBtn} onPress={guardarCambios} activeOpacity={0.8}>
                  <Text style={s.heroSaveText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={s.heroVehicleName}>
            {perfilTemp.marca || 'Sin marca'} {perfilTemp.modelo || ''}
          </Text>
          <Text style={s.heroVehicleSub}>
            {perfilTemp.anio} · {perfilTemp.combustible}
          </Text>
        </View>

        {/* Datos del vehículo */}
        <View style={s.sectionLabel}>
          <Text style={s.sectionLabelText}>DATOS DEL VEHÍCULO</Text>
        </View>
        <View style={s.card}>
          {[
            { label: 'Marca', key: 'marca' as const, placeholder: 'Ej: Toyota' },
            { label: 'Modelo', key: 'modelo' as const, placeholder: 'Ej: Corolla' },
            { label: 'Año', key: 'anio' as const, placeholder: 'Ej: 2019' },
          ].map((item, i, arr) => (
            <View key={i} style={[s.row, i < arr.length - 1 && s.rowBorder]}>
              <Text style={s.rowLabel}>{item.label}</Text>
              {editando ? (
                <TextInput
                  style={s.rowInput}
                  value={perfilTemp[item.key]}
                  onChangeText={(v) => setPerfilTemp({ ...perfilTemp, [item.key]: v })}
                  placeholder={item.placeholder}
                  placeholderTextColor={colors.tertiaryText}
                  selectionColor={colors.brand}
                />
              ) : (
                <Text style={s.rowValue}>{perfilTemp[item.key] || 'Sin definir'}</Text>
              )}
            </View>
          ))}

          {/* Combustible */}
          <View style={s.fuelSection}>
            <View style={s.fuelLabelRow}>
              <Fuel color={colors.tertiaryText} size={14} />
              <Text style={s.rowLabel}>Combustible</Text>
            </View>
            {editando ? (
              <View style={s.fuelOptions}>
                {FUEL_OPTIONS.map((fuel) => (
                  <TouchableOpacity
                    key={fuel}
                    style={[s.fuelOption, perfilTemp.combustible === fuel && s.fuelOptionActive]}
                    onPress={() => setPerfilTemp({ ...perfilTemp, combustible: fuel })}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.fuelOptionText, perfilTemp.combustible === fuel && s.fuelOptionTextActive]}>
                      {fuel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={s.fuelPill}>
                <Fuel color={colors.brandDeep} size={12} strokeWidth={2.2} />
                <Text style={s.fuelText}>{perfilTemp.combustible}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Aplicación */}
        <View style={s.sectionLabel}>
          <Text style={s.sectionLabelText}>APLICACIÓN</Text>
        </View>
        <View style={s.card}>
          {[
            { label: 'Motor de IA', value: aiModel, Icon: Cpu },
            { label: 'Almacenamiento', value: 'Solo en tu dispositivo', Icon: ShieldCheck },
          ].map((item, i, arr) => {
            const Icon = item.Icon;
            return (
              <View key={i} style={[s.aboutRow, i < arr.length - 1 && s.rowBorder]}>
                <View style={s.aboutLabelRow}>
                  <View style={s.aboutIconWrap}>
                    <Icon color={colors.brand} size={14} strokeWidth={2} />
                  </View>
                  <Text style={s.rowLabel}>{item.label}</Text>
                </View>
                <Text style={s.aboutValue}>{item.value}</Text>
              </View>
            );
          })}
        </View>

        {/* Modo Moto */}
        <View style={s.sectionLabel}>
          <Text style={s.sectionLabelText}>MODO MOTO</Text>
        </View>

        {/* Tarjeta de activación */}
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
          <View style={[s.row, s.rowBorder]}>
            <View style={s.aboutLabelRow}>
              <View style={s.aboutIconWrap}>
                <Phone color={colors.motoPurple} size={14} strokeWidth={2} />
              </View>
              <Text style={s.rowLabel}>Contacto de emergencia</Text>
            </View>
            {!editandoContacto ? (
              <TouchableOpacity onPress={() => { setContactoTemp(contacto); setEditandoContacto(true); }}>
                <Text style={s.contactoValue}>{contacto || 'Sin definir'}</Text>
              </TouchableOpacity>
            ) : (
              <TextInput
                style={s.contactoInput}
                value={contactoTemp}
                onChangeText={setContactoTemp}
                placeholder="+5491112345678"
                placeholderTextColor={colors.tertiaryText}
                keyboardType="phone-pad"
                selectionColor={colors.motoPurple}
                onBlur={() => { saveContacto(contactoTemp); setEditandoContacto(false); }}
                autoFocus
              />
            )}
          </View>
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
              MecánicaYA es una herramienta orientativa. No reemplaza la revisión de un mecánico certificado.
            </Text>
          </View>
        </View>

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBackground },
  flex: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.primaryText, letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: colors.tertiaryText, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },

  // Hero oscuro
  vehicleHero: {
    backgroundColor: colors.navy,
    borderRadius: 20,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 4,
  },
  heroDecor: {
    position: 'absolute',
    right: -20,
    top: -30,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroBadge: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  heroCancelText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  heroSaveBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  heroSaveText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  heroVehicleName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  heroVehicleSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  sectionLabel: { paddingHorizontal: 4, marginTop: 6 },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.tertiaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.surface2 },
  rowLabel: { fontSize: 13.5, color: colors.secondaryText, fontWeight: '600' },
  rowValue: { fontSize: 14, color: colors.primaryText, fontWeight: '700' },
  rowInput: {
    fontSize: 14,
    color: colors.primaryText,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.brand,
    paddingVertical: 4,
    fontWeight: '600',
  },

  fuelSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  fuelLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fuelOptions: { flexDirection: 'row', gap: 8 },
  fuelOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderColor,
    alignItems: 'center',
  },
  fuelOptionActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  fuelOptionText: { fontSize: 13, fontWeight: '500', color: colors.secondaryText },
  fuelOptionTextActive: { color: colors.brand, fontWeight: '700' },
  fuelPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
  },
  fuelText: { fontSize: 13, color: colors.brandDeep, fontWeight: '700' },

  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  aboutLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aboutIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutValue: { fontSize: 12.5, color: colors.primaryText, fontWeight: '600' },

  disclaimer: {
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FBE5A0',
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: 4,
  },
  disclaimerContent: { flex: 1 },
  disclaimerTitle: { fontSize: 12.5, fontWeight: '800', color: '#78350F', marginBottom: 4 },
  disclaimerText: { fontSize: 11.5, color: '#92400E', lineHeight: 18 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: colors.primaryText },

  // Modo Moto
  motoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.borderColor,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  motoCardActive: {
    backgroundColor: colors.motoPurple,
    borderColor: colors.motoPurple,
  },
  motoCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  motoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.purpleSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motoIconWrapActive: { backgroundColor: 'rgba(255,255,255,0.18)' },
  motoTextWrap: { flex: 1 },
  motoTitle: { fontSize: 15, fontWeight: '700', color: colors.primaryText },
  motoTitleActive: { color: '#fff' },
  motoSub: { fontSize: 12, color: colors.tertiaryText, marginTop: 2 },
  motoSubActive: { color: 'rgba(255,255,255,0.75)' },
  motoToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  motoToggleActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  motoToggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.tertiaryText,
  },
  motoToggleDotActive: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
  contactoValue: { fontSize: 13, fontWeight: '600', color: colors.motoPurple },
  contactoInput: {
    fontSize: 13,
    color: colors.primaryText,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.motoPurple,
    paddingVertical: 4,
    fontWeight: '600',
  },
  motoHintRow: { paddingHorizontal: 16, paddingBottom: 14 },
  motoHint: { fontSize: 11.5, color: colors.tertiaryText, lineHeight: 17 },

});
