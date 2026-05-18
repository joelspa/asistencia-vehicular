/**
 * SegmentedControl — selector horizontal de opciones mutuamente excluyentes.
 * Usado en SettingsScreen para Combustible y Tema; reutilizable para cualquier
 * elección de 2-4 opciones donde se necesita ver todas a la vez.
 */
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '../context/ThemeContext';

type IconComp = React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

export interface SegmentedOption<V extends string> {
    value: V;
    label: string;
    Icon?: IconComp;
}

interface Props<V extends string> {
    /** Label visible arriba del control. Si se omite, no se renderiza header. */
    label?: string;
    /** Icono opcional para el label. */
    LabelIcon?: IconComp;
    options: SegmentedOption<V>[];
    value: V;
    onChange: (v: V) => void;
}

export function SegmentedControl<V extends string>({
    label,
    LabelIcon,
    options,
    value,
    onChange,
}: Props<V>) {
    const colors = useColors();

    const s = useMemo(() => StyleSheet.create({
        section:       { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
        labelRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
        labelText:     { fontSize: 13.5, color: colors.secondaryText, fontWeight: '600' },
        options:       { flexDirection: 'row', gap: 8 },
        option:        {
            flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5,
            borderColor: colors.borderColor, alignItems: 'center',
            flexDirection: 'row', justifyContent: 'center', gap: 6,
        },
        optionActive:  { borderColor: colors.brand, backgroundColor: colors.brandSoft },
        text:          { fontSize: 13, fontWeight: '500', color: colors.secondaryText },
        textActive:    { color: colors.brand, fontWeight: '700' },
    }), [colors]);

    return (
        <View style={s.section}>
            {label && (
                <View style={s.labelRow}>
                    {LabelIcon && <LabelIcon color={colors.tertiaryText} size={14} />}
                    <Text style={s.labelText}>{label}</Text>
                </View>
            )}
            <View style={s.options}>
                {options.map((opt) => {
                    const active = opt.value === value;
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            style={[s.option, active && s.optionActive]}
                            onPress={() => onChange(opt.value)}
                            activeOpacity={0.8}
                        >
                            {opt.Icon && (
                                <opt.Icon
                                    color={active ? colors.brand : colors.tertiaryText}
                                    size={16}
                                    strokeWidth={2}
                                />
                            )}
                            <Text style={[s.text, active && s.textActive]}>{opt.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
