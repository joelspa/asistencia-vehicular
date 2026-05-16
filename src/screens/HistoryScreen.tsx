/**
 * @file HistoryScreen.tsx
 * @description Pantalla de historial de diagnósticos. Permite al usuario consultar,
 * filtrar y navegar al detalle de cada diagnóstico realizado previamente.
 */

import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  AlertCircle, AlertTriangle, ChevronRight, FolderOpen, Info, Sparkles,
} from 'lucide-react-native';

import { RootStackParamList, TabParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import FilterPill from '../components/FilterPill';
import { EntradaHistorial, obtenerHistorial } from '../services/storage';
import { UrgencyLevel, urgencyConfigs } from '../constants/urgency';
import { formatearFechaRelativa } from '../utils/dateFormatter';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterType = 'todo' | UrgencyLevel;

/**
 * Tipo compuesto que permite navegar tanto a pantallas de la pila (Resultado)
 * como a pestañas del navegador inferior (Inicio), sin necesidad de casts inseguros.
 */
type HistoryNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Historial'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface UrgencyStatConfig {
  label: string;
  level: UrgencyLevel;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const URGENCY_ICONS: Record<UrgencyLevel, typeof AlertCircle> = {
  critica: AlertCircle,
  moderada: AlertTriangle,
  leve: Info,
};

const URGENCY_BAR_COLORS: Record<UrgencyLevel, string> = {
  critica: colors.critRed,
  moderada: colors.warnOrange,
  leve: colors.safeGreen,
};

const STAT_CONFIGS: UrgencyStatConfig[] = [
  { label: 'Crítica', level: 'critica', color: colors.critRed },
  { label: 'Moderada', level: 'moderada', color: colors.warnOrange },
  { label: 'Leve', level: 'leve', color: colors.safeGreen },
];

const FILTER_OPTIONS: Array<{ label: string; value: FilterType }> = [
  { label: 'Todo', value: 'todo' },
  { label: 'Crítica', value: 'critica' },
  { label: 'Moderada', value: 'moderada' },
  { label: 'Leve', value: 'leve' },
];

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Cuenta las entradas del historial agrupadas por nivel de urgencia.
 * @param entries - Lista completa de entradas del historial.
 */
function countByUrgency(entries: EntradaHistorial[]): Record<UrgencyLevel, number> {
  return {
    critica: entries.filter((e) => e.diagnostico.urgency_level === 'critica').length,
    moderada: entries.filter((e) => e.diagnostico.urgency_level === 'moderada').length,
    leve: entries.filter((e) => e.diagnostico.urgency_level === 'leve').length,
  };
}

/**
 * Filtra las entradas del historial según el filtro activo.
 * Retorna todas las entradas si el filtro es 'todo'.
 * @param entries - Lista completa de entradas.
 * @param filter - Nivel de urgencia activo como filtro.
 */
function filterEntries(entries: EntradaHistorial[], filter: FilterType): EntradaHistorial[] {
  if (filter === 'todo') return entries;
  return entries.filter((e) => e.diagnostico.urgency_level === filter);
}

/**
 * Retorna el color de la barra lateral de la card según el nivel de urgencia.
 * @param level - Nivel de urgencia del diagnóstico.
 */
function getUrgencyBarColor(level: UrgencyLevel): string {
  return URGENCY_BAR_COLORS[level] ?? colors.warnOrange;
}

/**
 * Genera la etiqueta de causas identificadas en singular o plural.
 * @param count - Número de causas.
 */
function formatCausaLabel(count: number): string {
  return `${count} causa${count !== 1 ? 's' : ''} identificada${count !== 1 ? 's' : ''}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatsRowProps {
  counts: Record<UrgencyLevel, number>;
}

/** Fila de tarjetas con el resumen de diagnósticos por nivel de urgencia. */
function StatsRow({ counts }: StatsRowProps) {
  return (
    <View style={s.statsRow}>
      {STAT_CONFIGS.map(({ label, level, color }) => (
        <View key={level} style={[s.statCard, { borderTopColor: color }]}>
          <Text style={s.statCount}>{counts[level]}</Text>
          <Text style={s.statLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

interface FilterBarProps {
  activeFilter: FilterType;
  onChange: (filter: FilterType) => void;
}

/** Barra de filtros por nivel de urgencia. */
function FilterBar({ activeFilter, onChange }: FilterBarProps) {
  return (
    <View style={s.filters}>
      {FILTER_OPTIONS.map(({ label, value }) => (
        <FilterPill
          key={value}
          label={label}
          active={activeFilter === value}
          dotColor={value !== 'todo' ? urgencyConfigs[value as UrgencyLevel].badgeColor : undefined}
          onPress={() => onChange(value)}
        />
      ))}
    </View>
  );
}

interface EmptyStateProps {
  activeFilter: FilterType;
  onNavigateToDiagnosis: () => void;
}

/** Estado vacío adaptativo: cambia el mensaje según si hay filtro activo o no. */
function EmptyState({ activeFilter, onNavigateToDiagnosis }: EmptyStateProps) {
  const isFiltered = activeFilter !== 'todo';
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <FolderOpen color={colors.tertiaryText} size={32} strokeWidth={1.5} />
      </View>
      <Text style={s.emptyTitle}>
        {isFiltered ? `Sin diagnósticos ${activeFilter}s` : 'Sin consultas aún'}
      </Text>
      <Text style={s.emptyText}>
        {isFiltered
          ? 'No hay resultados para este filtro.'
          : 'Haz tu primer diagnóstico y aparecerá aquí.'}
      </Text>
      {!isFiltered && (
        <TouchableOpacity style={s.emptyBtn} onPress={onNavigateToDiagnosis} activeOpacity={0.85}>
          <Sparkles color="#fff" size={14} strokeWidth={2} />
          <Text style={s.emptyBtnText}>Hacer diagnóstico</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface DiagnosticCardProps {
  entry: EntradaHistorial;
  onPress: () => void;
}

/** Tarjeta individual de diagnóstico con nivel de urgencia, síntomas y acceso al detalle. */
function DiagnosticCard({ entry, onPress }: DiagnosticCardProps) {
  const level = entry.diagnostico.urgency_level as UrgencyLevel;
  const config = urgencyConfigs[level] ?? urgencyConfigs.moderada;
  const IconComp = URGENCY_ICONS[level] ?? AlertTriangle;
  const barColor = getUrgencyBarColor(level);
  const causaLabel = formatCausaLabel(entry.diagnostico.causas.length);
  const title = entry.diagnostico.urgency_label || `Falla ${level}`;

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[s.colorBar, { backgroundColor: barColor }]} />

      <View style={s.cardHeader}>
        <View style={[s.badge, { backgroundColor: config.surfaceColor }]}>
          <IconComp color={config.badgeColor} size={13} />
          <Text style={[s.badgeText, { color: config.badgeColor }]}>{config.label}</Text>
        </View>
        <Text style={s.cardDate}>{formatearFechaRelativa(entry.fecha)}</Text>
      </View>

      <Text style={s.cardTitle} numberOfLines={1}>{title}</Text>
      <Text style={s.cardSymptoms} numberOfLines={2}>{entry.sintomas}</Text>

      <View style={s.cardFooter}>
        <Text style={s.causasCount}>{causaLabel}</Text>
        <View style={s.detailRow}>
          <Text style={s.detailBtn}>Ver diagnóstico</Text>
          <ChevronRight color={colors.brand} size={13} strokeWidth={2.4} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const navigation = useNavigation<HistoryNavigation>();
  const [activeFilter, setActiveFilter] = useState<FilterType>('todo');
  const [historial, setHistorial] = useState<EntradaHistorial[]>([]);

  useFocusEffect(
    useCallback(() => {
      obtenerHistorial().then(setHistorial);
    }, [])
  );

  const visibleEntries = filterEntries(historial, activeFilter);
  const urgencyCounts = countByUrgency(historial);

  const navigateToDiagnosis = () => navigation.navigate('Inicio');
  const openDetail = (entry: EntradaHistorial) =>
    navigation.navigate('Resultado', { diagnostico: entry.diagnostico });

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Mi historial</Text>
        <Text style={s.subtitle}>{historial.length} consultas guardadas</Text>
      </View>

      {historial.length > 0 && <StatsRow counts={urgencyCounts} />}

      <FilterBar activeFilter={activeFilter} onChange={setActiveFilter} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleEntries.length === 0 ? (
          <EmptyState activeFilter={activeFilter} onNavigateToDiagnosis={navigateToDiagnosis} />
        ) : (
          visibleEntries.map((entry) => (
            <DiagnosticCard key={entry.id} entry={entry} onPress={() => openDetail(entry)} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Layout
  screen: { flex: 1, backgroundColor: colors.appBackground },
  scroll: { flex: 1, paddingHorizontal: 16 },
  scrollContent: { paddingTop: 4, paddingBottom: 32, gap: 12 },

  // Header
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: colors.primaryText, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: colors.tertiaryText, marginTop: 2 },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 12,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  statCount: { fontSize: 22, fontWeight: '800', color: colors.primaryText, lineHeight: 24 },
  statLabel: { fontSize: 11, color: colors.tertiaryText, fontWeight: '600', marginTop: 4 },

  // Filters
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 14,
    paddingBottom: 12,
  },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 10 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.secondaryText, textAlign: 'center' },
  emptyText: { fontSize: 13.5, color: colors.tertiaryText, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: colors.brand,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Diagnostic card
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 14,
    paddingLeft: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
    overflow: 'hidden',
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    borderRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  cardDate: { fontSize: 11, color: colors.tertiaryText, fontWeight: '600' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.primaryText, marginBottom: 4 },
  cardSymptoms: { fontSize: 12.5, color: colors.tertiaryText, lineHeight: 18, marginBottom: 12 },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  causasCount: { fontSize: 11.5, fontWeight: '600', color: colors.tertiaryText },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailBtn: { fontSize: 12, fontWeight: '700', color: colors.brand },
});
