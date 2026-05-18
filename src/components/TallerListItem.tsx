/**
 * TallerListItem — fila del listado de talleres en el bottom sheet del mapa.
 * Muestra ícono de categoría, nombre, distancia, badge de especialidad y botón "Ir".
 */
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { CategoryEntry } from '../utils/categoryClassifier';
import { TallerDisplay } from '../hooks/useTalleresNearby';

interface Props {
    taller: TallerDisplay;
    category: CategoryEntry;
    onPressRoute: () => void;
}

export function TallerListItem({ taller, category, onPressRoute }: Props) {
    const { colors, isDark } = useTheme();

    const s = useMemo(() => StyleSheet.create({
        card: {
            flexDirection: 'row', alignItems: 'center',
            paddingVertical: 14, borderBottomWidth: 1,
            borderBottomColor: colors.surface2, gap: 12,
        },
        iconWrap: {
            width: 36, height: 36, borderRadius: 10,
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        },
        info: { flex: 1 },
        name: { fontSize: 14.5, fontWeight: '700', color: colors.primaryText, marginBottom: 5 },
        meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        dist: { fontSize: 12, color: colors.tertiaryText, fontWeight: '500' },
        badge: {
            backgroundColor: colors.surface2, paddingHorizontal: 8,
            paddingVertical: 3, borderRadius: 100,
        },
        badgeText: { fontSize: 11, color: colors.secondaryText, fontWeight: '600' },
        routeBtn: {
            backgroundColor: colors.navy, paddingHorizontal: 14, paddingVertical: 10,
            borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 5,
            elevation: 2, shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
        },
        routeBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    }), [colors]);

    const Icon = category.Icon;

    return (
        <View style={s.card}>
            <View style={[s.iconWrap, { backgroundColor: `${category.color}${isDark ? '33' : '22'}` }]}>
                <Icon color={category.color} size={16} strokeWidth={2.2} />
            </View>
            <View style={s.info}>
                <Text style={s.name} numberOfLines={1}>{taller.nombre}</Text>
                <View style={s.meta}>
                    <MapPin color={colors.tertiaryText} size={11} />
                    <Text style={s.dist}>{taller.distancia}</Text>
                    <View style={s.badge}>
                        <Text style={s.badgeText}>{taller.especialidad}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={s.routeBtn} onPress={onPressRoute} activeOpacity={0.8}>
                <Navigation color="#fff" size={13} strokeWidth={2.2} />
                <Text style={s.routeBtnText}>Ir</Text>
            </TouchableOpacity>
        </View>
    );
}
