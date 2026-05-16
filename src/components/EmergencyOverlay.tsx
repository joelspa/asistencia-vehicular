import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface Props {
    visible: boolean;
    countdown: number;
    onCancel: () => void;
}

export function EmergencyOverlay({ visible, countdown, onCancel }: Props) {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!visible) return;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.12, duration: 600, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [visible, pulse]);

    return (
        <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
            <View style={s.screen}>
                <View style={s.topSection}>
                    <Animated.View style={[s.pulseRing, { transform: [{ scale: pulse }] }]}>
                        <View style={s.iconCircle}>
                            <AlertTriangle color="#fff" size={44} strokeWidth={2} />
                        </View>
                    </Animated.View>

                    <Text style={s.title}>POSIBLE ACCIDENTE{'\n'}DETECTADO</Text>
                    <Text style={s.hint}>Si estás bien, cancela ahora.</Text>
                </View>

                <View style={s.countdownSection}>
                    <Text style={s.countdownLabel}>Enviando alerta en</Text>
                    <Text style={s.countdownNumber}>{countdown}</Text>
                    <Text style={s.countdownSuffix}>segundos</Text>
                </View>

                <TouchableOpacity style={s.cancelBtn} onPress={onCancel} activeOpacity={0.85}>
                    <Text style={s.cancelText}>ESTOY BIEN — CANCELAR</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.accidentBackground,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    topSection: { alignItems: 'center', gap: 20 },
    pulseRing: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(220,38,38,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.critRed,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 0.5,
        lineHeight: 36,
    },
    hint: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    countdownSection: { alignItems: 'center', gap: 4 },
    countdownLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.55)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    countdownNumber: {
        fontSize: 100,
        fontWeight: '900',
        color: colors.critRed,
        lineHeight: 110,
    },
    countdownSuffix: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.55)',
        fontWeight: '600',
    },
    cancelBtn: {
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
        paddingVertical: 18,
        paddingHorizontal: 40,
        width: '100%',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '900',
        color: colors.critRed,
        letterSpacing: 0.5,
    },
});
