/**
 * HeroUrgency — cabecera saturada del resultado de diagnóstico.
 * Muestra back, savedBadge, ícono según nivel, label/hint, y 3 mini-stats.
 */
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
    ArrowLeft, Check, ShieldAlert, Clock, CheckCircle,
} from 'lucide-react-native';

import { useColors } from '../context/ThemeContext';
import { UrgencyConfig, UrgencyLevel } from '../constants/urgency';

interface Props {
    level: UrgencyLevel;
    config: UrgencyConfig;
    paddingTop: number;
    confianza: number | undefined;
    causasCount: number;
    especialidadesCount: number;
    onBack: () => void;
}

export function HeroUrgency({
    level,
    config,
    paddingTop,
    confianza,
    causasCount,
    especialidadesCount,
    onBack,
}: Props) {
    const colors = useColors();

    const Icon = level === 'critica' ? ShieldAlert : level === 'moderada' ? Clock : CheckCircle;

    const s = useMemo(() => StyleSheet.create({
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
            width: 76, height: 76, borderRadius: 22,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
            backgroundColor: 'rgba(255,255,255,0.18)',
        },
        scoreMeta: { flex: 1 },
        levelBadge: {
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(255,255,255,0.22)',
            borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3,
            marginBottom: 8,
        },
        levelBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },
        heroTitle: { fontSize: 21, fontWeight: '800', color: '#fff', lineHeight: 24, letterSpacing: -0.3 },

        miniStats: { flexDirection: 'row', gap: 8 },
        miniStat: {
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.14)',
            borderRadius: 12, padding: 10,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
        },
        miniStatLabel: {
            fontSize: 9.5, color: 'rgba(255,255,255,0.8)', fontWeight: '600',
            letterSpacing: 0.3, textTransform: 'uppercase',
        },
        miniStatValue: { fontSize: 15, fontWeight: '800', color: '#fff', marginTop: 2 },

        heroCurve: {
            position: 'absolute', bottom: -1, left: 0, right: 0,
            height: 28, backgroundColor: colors.appBackground,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
        },
    }), [colors]);

    const stats = [
        { l: 'Confianza', v: `${confianza ?? '--'}%` },
        { l: 'Causas', v: `${causasCount}` },
        { l: 'Especialidades', v: `${especialidadesCount}` },
    ];

    return (
        <View style={[s.hero, { backgroundColor: config.backgroundColor, paddingTop }]}>
            <View style={s.heroTop}>
                <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={s.backBtn}>
                    <ArrowLeft color="rgba(255,255,255,0.9)" size={18} />
                    <Text style={s.backText}>Volver</Text>
                </TouchableOpacity>
                <View style={s.savedBadge}>
                    <Check color="#fff" size={12} strokeWidth={3} />
                    <Text style={s.savedText}>Guardado en historial</Text>
                </View>
            </View>

            <View style={s.scoreRow}>
                <View style={s.scoreBox}>
                    <Icon color="#fff" size={38} strokeWidth={1.8} />
                </View>
                <View style={s.scoreMeta}>
                    <View style={s.levelBadge}>
                        <Text style={s.levelBadgeText}>{config.label.toUpperCase()}</Text>
                    </View>
                    <Text style={s.heroTitle}>{config.hint}</Text>
                </View>
            </View>

            <View style={s.miniStats}>
                {stats.map((stat) => (
                    <View key={stat.l} style={s.miniStat}>
                        <Text style={s.miniStatLabel}>{stat.l}</Text>
                        <Text style={s.miniStatValue}>{stat.v}</Text>
                    </View>
                ))}
            </View>

            <View style={s.heroCurve} />
        </View>
    );
}
