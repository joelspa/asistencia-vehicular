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
import { useColors } from '../context/ThemeContext';
import FilterPill from '../components/FilterPill';
import { EntradaHistorial, obtenerHistorial } from '../services/storage';
import { UrgencyLevel, getUrgencyConfig } from '../constants/urgency';
import { formatearFechaRelativa } from '../utils/dateFormatter';

type FilterType = 'todo' | UrgencyLevel;

type HistoryNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Historial'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const URGENCY_ICONS: Record<UrgencyLevel, typeof AlertCircle> = {
  critica: AlertCircle,
  moderada: AlertTriangle,
  leve: Info,
};

const FILTER_OPTIONS: Array<{ label: string; value: FilterType }> = [
  { label: 'Todo', value: 'todo' },
  { label: 'Crítica', value: 'critica' },
  { label: 'Moderada', value: 'moderada' },
  { label: 'Leve', value: 'leve' },
];

function countByUrgency(entries: EntradaHistorial[]): Record<UrgencyLevel, number> {
  return {
    critica:  entries.filter((e) => e.diagnostico.urgency_level === 'critica').length,
    moderada: entries.filter((e) => e.diagnostico.urgency_level === 'moderada').length,
    leve:     entries.filter((e) => e.diagnostico.urgency_level === 'leve').length,
  };
}

function filterEntries(entries: EntradaHistorial[], filter: FilterType): EntradaHistorial[] {
  if (filter === 'todo') return entries;
  return entries.filter((e) => e.diagnostico.urgency_level === filter);
}

function formatCausaLabel(count: number): string {
  return `${count} causa${count !== 1 ? 's' : ''} identificada${count !== 1 ? 's' : ''}`;
}

function StatsRow({ counts }: { counts: Record<UrgencyLevel, number> }) {
  const colors = useColors();
  const configs = [
    { label: 'Crítica',  level: 'critica'  as UrgencyLevel, color: colors.critRed    },
    { label: 'Moderada', level: 'moderada' as UrgencyLevel, color: colors.warnOrange },
    { label: 'Leve',     level: 'leve'     as UrgencyLevel, color: colors.safeGreen  },
  ];
  return (
    <View style={sl.statsRow}>
      {configs.map(({ label, level, color }) => (
        <View key={level} style={[sl.statCard, { backgroundColor: colors.cardBackground, borderTopColor: color }]}>
          <Text style={[sl.statCount, { color: colors.primaryText }]}>{counts[level]}</Text>
          <Text style={[sl.statLabel, { color: colors.tertiaryText }]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function FilterBar({ activeFilter, onChange }: { activeFilter: FilterType; onChange: (f: FilterType) => void }) {
  const colors = useColors();
  return (
    <View style={sl.filters}>
      {FILTER_OPTIONS.map(({ label, value }) => (
        <FilterPill
          key={value}
          label={label}
          active={activeFilter === value}
          dotColor={value !== 'todo' ? getUrgencyConfig(value, colors).badgeColor : undefined}
          onPress={() => onChange(value)}
        />
      ))}
    </View>
  );
}

function EmptyState({ activeFilter, onNavigateToDiagnosis }: {
  activeFilter: FilterType;
  onNavigateToDiagnosis: () => void;
}) {
  const colors = useColors();
  const isFiltered = activeFilter !== 'todo';
  return (
    <View style={sl.empty}>
      <View style={[sl.emptyIcon, { backgroundColor: colors.surface2 }]}>
        <FolderOpen color={colors.tertiaryText} size={32} strokeWidth={1.5} />
      </View>
      <Text style={[sl.emptyTitle, { color: colors.secondaryText }]}>
        {isFiltered ? `Sin diagnósticos ${activeFilter}s` : 'Sin consultas aún'}
      </Text>
      <Text style={[sl.emptyText, { color: colors.tertiaryText }]}>
        {isFiltered
          ? 'No hay resultados para este filtro.'
          : 'Haz tu primer diagnóstico y aparecerá aquí.'}
      </Text>
      {!isFiltered && (
        <TouchableOpacity
          style={[sl.emptyBtn, { backgroundColor: colors.brand }]}
          onPress={onNavigateToDiagnosis}
          activeOpacity={0.85}
        >
          <Sparkles color="#fff" size={14} strokeWidth={2} />
          <Text style={sl.emptyBtnText}>Hacer diagnóstico</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DiagnosticCard({ entry, onPress }: { entry: EntradaHistorial; onPress: () => void }) {
  const colors = useColors();
  const level = entry.diagnostico.urgency_level as UrgencyLevel;
  const config = getUrgencyConfig(level, colors);
  const IconComp = URGENCY_ICONS[level] ?? AlertTriangle;
  const barColorMap: Record<UrgencyLevel, string> = {
    critica: colors.critRed, moderada: colors.warnOrange, leve: colors.safeGreen,
  };
  const barColor = barColorMap[level] ?? colors.warnOrange;
  const causaLabel = formatCausaLabel(entry.diagnostico.causas.length);
  const title = entry.diagnostico.urgency_label || `Falla ${level}`;

  return (
    <TouchableOpacity
      style={[sl.card, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[sl.colorBar, { backgroundColor: barColor }]} />
      <View style={sl.cardHeader}>
        <View style={[sl.badge, { backgroundColor: config.surfaceColor }]}>
          <IconComp color={config.badgeColor} size={13} />
          <Text style={[sl.badgeText, { color: config.badgeColor }]}>{config.label}</Text>
        </View>
        <Text style={[sl.cardDate, { color: colors.tertiaryText }]}>
          {formatearFechaRelativa(entry.fecha)}
        </Text>
      </View>
      <Text style={[sl.cardTitle, { color: colors.primaryText }]} numberOfLines={1}>{title}</Text>
      <Text style={[sl.cardSymptoms, { color: colors.tertiaryText }]} numberOfLines={2}>
        {entry.sintomas}
      </Text>
      <View style={[sl.cardFooter, { borderTopColor: colors.surface2 }]}>
        <Text style={[sl.causasCount, { color: colors.tertiaryText }]}>{causaLabel}</Text>
        <View style={sl.detailRow}>
          <Text style={[sl.detailBtn, { color: colors.brand }]}>Ver diagnóstico</Text>
          <ChevronRight color={colors.brand} size={13} strokeWidth={2.4} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const navigation = useNavigation<HistoryNavigation>();
  const [activeFilter, setActiveFilter] = useState<FilterType>('todo');
  const [historial, setHistorial] = useState<EntradaHistorial[]>([]);

  useFocusEffect(
    useCallback(() => { obtenerHistorial().then(setHistorial); }, [])
  );

  const visibleEntries = filterEntries(historial, activeFilter);
  const urgencyCounts = countByUrgency(historial);

  const navigateToDiagnosis = () => navigation.navigate('Inicio');
  const openDetail = (entry: EntradaHistorial) =>
    navigation.navigate('Resultado', { diagnostico: entry.diagnostico });

  return (
    <SafeAreaView style={[sl.screen, { backgroundColor: colors.appBackground }]} edges={['top']}>
      <View style={sl.header}>
        <Text style={[sl.title, { color: colors.primaryText }]}>Mi historial</Text>
        <Text style={[sl.subtitle, { color: colors.tertiaryText }]}>
          {historial.length} consultas guardadas
        </Text>
      </View>

      {historial.length > 0 && <StatsRow counts={urgencyCounts} />}
      <FilterBar activeFilter={activeFilter} onChange={setActiveFilter} />

      <ScrollView
        style={sl.scroll}
        contentContainerStyle={sl.scrollContent}
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

const sl = StyleSheet.create({
  screen:       { flex: 1 },
  scroll:       { flex: 1, paddingHorizontal: 16 },
  scrollContent:{ paddingTop: 4, paddingBottom: 32, gap: 12 },
  header:       { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  title:        { fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  subtitle:     { fontSize: 13, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 14, marginBottom: 4 },
  statCard: {
    flex: 1, borderRadius: 14, padding: 12, borderTopWidth: 3,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    elevation: 1, shadowOffset: { width: 0, height: 1 },
  },
  statCount:  { fontSize: 22, fontWeight: '800', lineHeight: 24 },
  statLabel:  { fontSize: 11, fontWeight: '600', marginTop: 4 },

  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 14, paddingBottom: 12 },

  empty:     { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 10 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyTitle:   { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyText:    { fontSize: 13.5, textAlign: 'center', lineHeight: 20 },
  emptyBtn:     { marginTop: 8, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  card: {
    borderRadius: 16, padding: 14, paddingLeft: 18,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
    elevation: 2, shadowOffset: { width: 0, height: 2 },
    position: 'relative', overflow: 'hidden',
  },
  colorBar:   { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100 },
  badgeText:  { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  cardDate:     { fontSize: 11, fontWeight: '600' },
  cardTitle:    { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  cardSymptoms: { fontSize: 12.5, lineHeight: 18, marginBottom: 12 },
  cardFooter:   { borderTopWidth: 1, paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  causasCount:  { fontSize: 11.5, fontWeight: '600' },
  detailRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailBtn:    { fontSize: 12, fontWeight: '700' },
});
