import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideMic } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { styles } from '../styles/HomeStyles';
// Componente de tarjeta para entrada de voz
// Permite a los usuarios describir los síntomas de su vehículo por voz.
// Incluye un botón de micrófono, un visualizador de audio animado y texto de instrucciones.
// Ideal para usuarios que prefieren una entrada rápida y manos libres para describir los problemas de su vehículo. 
export const VoiceCard = () => (
  <View style={styles.voiceCard}>
    <TouchableOpacity style={styles.micCircle}>
      <LucideMic color={colors.surface} size={32} />
    </TouchableOpacity>
    <Text style={styles.voiceTitle}>Habla los síntomas</Text>
    <View style={styles.audioVisualizer}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={[styles.audioBar, { height: 10 + i * 3 }]} />
      ))}
    </View>
    <Text style={styles.voiceSubtitle}>Presiona y habla en español</Text>
  </View>
);