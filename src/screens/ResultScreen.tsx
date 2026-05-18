/** Pantalla de resultado: urgencia, causas probables, razonamiento y talleres sugeridos. */
import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft, ArrowRight, Info, ChevronDown, ChevronUp, RefreshCcw, MapPin, AlertTriangle, Check, MessageSquare,
  ShieldAlert, Clock, CheckCircle, Plus,
} from 'lucide-react-native';
import { RootStackParamList } from '../types/navigation';
import { useColors } from '../context/ThemeContext';
import SectionLabel from '../components/SectionLabel';
import CauseRow from '../components/CauseRow';
import { getUrgencyConfig, getUrgencyLevel } from '../constants/urgency';

type ResultRoute = RouteProp<RootStackParamList, 'Resultado'>;

export default function ResultScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ResultRoute>();
  const { diagnostico, sintomas, perfilVehiculo } = route.params;

  const level = getUrgencyLevel(diagnostico.urgency_level);
  const config = getUrgencyConfig(diagnostico.urgency_level, colors);
  const [expandedReasoning, setExpandedReasoning] = useState(false);
  const [reasoningOverflows, setReasoningOverflows] = useState(false);

  const heroBg = config.backgroundColor;

  // Color de barras por índice de causa
  const causeBarColor = (i: number) =>
    i === 0 ? colors.warnOrange : i === 1 ? colors.tertiaryText : colors.safeGreen;

  const s = useMemo(() => styles(colors), [colors]);

  return (
    <View style={s.screen}>
      {/* hero siempre tiene fondo saturado de urgencia → light-content seguro en ambos temas */}
      <StatusBar barStyle="light-content" backgroundColor={heroBg} />

      {/* Hero */}
      <View style={[s.hero, { backgroundColor: heroBg, paddingTop: insets.top + 14 }]}>
        {/* Fila superior */}
        <View style={s.heroTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={s.backBtn}>
            <ArrowLeft color="rgba(255,255,255,0.9)" size={18} />
            <Text style={s.backText}>Volver</Text>
          </TouchableOpacity>
          <View style={s.savedBadge}>
            <Check color="#fff" size={12} strokeWidth={3} />
            <Text style={s.savedText}>Guardado en historial</Text>
          </View>
        </View>

        {/* Score + título */}
        <View style={s.scoreRow}>
          <View style={[s.scoreBox, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
            {diagnostico.urgency_level === 'critica'
              ? <ShieldAlert color="#fff" size={38} strokeWidth={1.8} />
              : diagnostico.urgency_level === 'moderada'
              ? <Clock color="#fff" size={38} strokeWidth={1.8} />
              : <CheckCircle color="#fff" size={38} strokeWidth={1.8} />}
          </View>
          <View style={s.scoreMeta}>
            <View style={s.levelBadge}>
              <Text style={s.levelBadgeText}>{config.label.toUpperCase()}</Text>
            </View>
            <Text style={s.heroTitle}>{config.hint}</Text>
          </View>
        </View>

        {/* Mini stats */}
        <View style={s.miniStats}>
          {[
            { l: 'Confianza', v: `${diagnostico.causas[0]?.probabilidad ?? '--'}%` },
            { l: 'Causas', v: `${diagnostico.causas.length}` },
            { l: 'Especialidades', v: `${diagnostico.especialidades_recomendadas?.length ?? 0}` },
          ].map((stat) => (
            <View key={stat.l} style={s.miniStat}>
              <Text style={s.miniStatLabel}>{stat.l}</Text>
              <Text style={s.miniStatValue}>{stat.v}</Text>
            </View>
          ))}
        </View>

        <View style={s.heroCurve} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollPad, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Consulta realizada */}
        {(sintomas || perfilVehiculo) && (
          <View style={s.queryCard}>
            <View style={s.queryIconWrap}>
              <MessageSquare color={colors.brand} size={14} strokeWidth={2.2} />
            </View>
            <View style={s.queryContent}>
              <Text style={s.queryLabel}>LO QUE CONSULTASTE</Text>
              {perfilVehiculo === 'No especificado' ? (
                <TouchableOpacity
                  style={s.addVehicleCta}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Configuracion' })}
                  activeOpacity={0.7}
                >
                  <Plus color={colors.brandDeep} size={12} strokeWidth={2.6} />
                  <Text style={s.addVehicleText}>Agregar vehículo</Text>
                </TouchableOpacity>
              ) : perfilVehiculo ? (
                <Text style={s.queryVehicle}>{perfilVehiculo}</Text>
              ) : null}
              {sintomas ? <Text style={s.queryText}>{sintomas}</Text> : null}
            </View>
          </View>
        )}

        {/* Causas */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <SectionLabel>CAUSAS PROBABLES</SectionLabel>
            <Info color={colors.tertiaryText} size={14} />
          </View>
          <Text style={s.causeMeta}>Basado en registros de vehículos similares</Text>
          {diagnostico.causas.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={s.sep} />}
              <CauseRow title={c.causa} percentage={c.probabilidad} color={causeBarColor(i)} />
            </React.Fragment>
          ))}
        </View>

        {/* Razonamiento */}
        <View style={s.card}>
          <View style={s.reasonHeader}>
            <View style={s.reasonIconWrap}>
              <Info color={colors.brand} size={16} />
            </View>
            <Text style={s.reasonTitle}>Por qué este resultado</Text>
          </View>
          {/* Hidden text to measure real line count (numberOfLines truncates before onTextLayout) */}
          <Text
            style={[s.reasonText, s.hiddenMeasure]}
            onTextLayout={(e) => {
              if (!reasoningOverflows && e.nativeEvent.lines.length > 4) {
                setReasoningOverflows(true);
              }
            }}
          >
            {diagnostico.razonamiento}
          </Text>
          <Text
            style={s.reasonText}
            numberOfLines={expandedReasoning ? undefined : 4}
          >
            {diagnostico.razonamiento}
          </Text>
          {reasoningOverflows && (
            <TouchableOpacity
              onPress={() => setExpandedReasoning(!expandedReasoning)}
              style={s.expandBtn}
              activeOpacity={0.7}
            >
              <Text style={s.expandText}>
                {expandedReasoning ? 'Ver menos' : 'Ver más...'}
              </Text>
              {expandedReasoning
                ? <ChevronUp color={colors.brand} size={14} />
                : <ChevronDown color={colors.brand} size={14} />}
            </TouchableOpacity>
          )}
        </View>

        {/* Acción recomendada — banner ámbar */}
        <View style={s.actionBanner}>
          <View style={s.actionIcon}>
            <AlertTriangle color="#fff" size={20} strokeWidth={2.2} />
          </View>
          <View style={s.actionContent}>
            <Text style={s.actionTitle}>Acción recomendada</Text>
            <Text style={s.actionText}>
              {diagnostico.urgency_level === 'critica'
                ? 'Detenga el vehículo en lugar seguro. No continúe conduciendo. Contacte asistencia de inmediato.'
                : diagnostico.urgency_level === 'moderada'
                ? 'Conduce con suavidad y agenda una revisión profesional en las próximas 48 horas. Evita acelerar bruscamente.'
                : 'Puede seguir circulando. Agende una revisión preventiva cuando le sea conveniente.'}
            </Text>
          </View>
        </View>

        {/* Especialidades */}
        {diagnostico.especialidades_recomendadas && diagnostico.especialidades_recomendadas.length > 0 && (
          <View style={s.card}>
            <View style={s.cardTitleRow}>
              <SectionLabel>ESPECIALIDADES SUGERIDAS</SectionLabel>
              <TouchableOpacity
                onPress={() => navigation.navigate('MainTabs', { screen: 'Mapa', params: { especialidades: diagnostico.especialidades_recomendadas } })}
                activeOpacity={0.7}
                style={s.mapLinkRow}
              >
                <Text style={s.mapLink}>Ver mapa</Text>
                <ArrowRight color={colors.brand} size={12} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
            <View style={s.tagsWrap}>
              {diagnostico.especialidades_recomendadas.map((esp, i) => (
                <View key={i} style={s.tag}>
                  <MapPin color={colors.brandDeep} size={11} strokeWidth={2.2} />
                  <Text style={s.tagText}>{esp}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* CTA fija */}
      <View style={[s.cta, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={s.ctaMain}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Mapa', params: { especialidades: diagnostico.especialidades_recomendadas } })}
          activeOpacity={0.85}
        >
          <MapPin color="#fff" size={16} strokeWidth={2.2} />
          <Text style={s.ctaMainText}>Buscar taller cercano</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ctaSecondary} onPress={() => navigation.popToTop()} activeOpacity={0.8}>
          <RefreshCcw color={colors.primaryText} size={15} strokeWidth={2} />
          <Text style={s.ctaSecondaryText}>Nuevo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBackground },

  // Hero
  hero: { paddingHorizontal: 20, paddingBottom: 44, position: 'relative' },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  savedText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  scoreBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  scoreNum: { fontSize: 32, fontWeight: '800', color: '#fff', lineHeight: 34 },
  scoreOf: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5, marginTop: 2 },
  scoreMeta: { flex: 1 },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  levelBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 24,
    letterSpacing: -0.3,
  },

  miniStats: { flexDirection: 'row', gap: 8 },
  miniStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  miniStatLabel: { fontSize: 9.5, color: 'rgba(255,255,255,0.8)', fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  miniStatValue: { fontSize: 15, fontWeight: '800', color: '#fff', marginTop: 2 },

  heroCurve: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: colors.appBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // Content
  scroll: { flex: 1 },
  scrollPad: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  causeMeta: { fontSize: 11, fontStyle: 'italic', color: colors.tertiaryText, marginBottom: 14 },
  sep: { height: 1, backgroundColor: colors.surface2, marginVertical: 6 },

  reasonHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  reasonIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonTitle: { fontSize: 14.5, fontWeight: '800', color: colors.primaryText },
  reasonText: { fontSize: 13.5, color: colors.secondaryText, lineHeight: 22 },
  hiddenMeasure: { position: 'absolute', opacity: 0, zIndex: -1, alignSelf: 'stretch' },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandText: { fontSize: 12.5, fontWeight: '700', color: colors.brand },

  // Acción banner ámbar
  actionBanner: {
    backgroundColor: colors.accentSoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.warnBorder,
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.warnOrange,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: colors.warnOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: '800', color: colors.warnTitle, marginBottom: 4 },
  actionText: { fontSize: 12.5, color: colors.warnBody, lineHeight: 20 },

  // Tags
  mapLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapLink: { fontSize: 12, fontWeight: '700', color: colors.brand },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  tagText: { fontSize: 12, fontWeight: '700', color: colors.brandDeep },

  // CTA fija
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingBottom: 0,
    backgroundColor: colors.cardBackground + 'F5',
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
    flexDirection: 'row',
    gap: 8,
  },
  ctaMain: {
    flex: 1,
    backgroundColor: colors.navy,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaMainText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  ctaSecondary: {
    paddingHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  ctaSecondaryText: { fontSize: 13, fontWeight: '700', color: colors.primaryText },

  // Card de consulta
  queryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  queryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  queryContent: { flex: 1 },
  queryLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.tertiaryText,
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  queryVehicle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondaryText,
    marginBottom: 4,
  },
  addVehicleCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
    marginBottom: 6,
  },
  addVehicleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.brandDeep,
  },
  queryText: {
    fontSize: 13,
    color: colors.primaryText,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
