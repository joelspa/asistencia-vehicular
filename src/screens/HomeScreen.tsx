// Pantalla Principal - HomeScreen.tsx
import React, { useState } from 'react';// React y hooks
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';  // Componentes de React Native
import { 
  LucideWrench, 
  LucideMap, 
  LucideHistory, 
  LucideSettings 
} from 'lucide-react-native';// Iconos de Lucide

import { colors, spacing } from '../theme/colors';// Colores y espaciados del tema
import { styles } from '../styles/HomeStyles';// Estilos específicos de HomeScreen

// Componentes modulares
import { MotoModeToggle } from '../components/MotoModeToggle';
import { VoiceCard } from '../components/VoiceCard';
import { SymptomsChips } from '../components/SymptomsChips';

// Datos de síntomas frecuentes para los chips
const SYMPTOMS_DATA = [
  'Ruido al frenar',
  'Motor recalentado',
  'Vibracion',
  'Bateria baja',
  'Humo del escape',
];

// Componente Principal de la Pantalla de Inicio
export default function HomeScreen() {
  const [symptoms, setSymptoms] = useState('');
  const [isMotoMode, setIsMotoMode] = useState(false);

  // Renderizado de la pantalla principal con header, inputs de voz y texto, chips de síntomas frecuentes, y un botón de diagnóstico.
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoSquare} />
            <Text style={styles.brandText}>MecanicaYA</Text>
          </View>
          <TouchableOpacity style={styles.historyCircle}>
            <LucideHistory color={colors.textPrimary} size={20} />
          </TouchableOpacity>
        </View>
        {/* Toggle de Modo Moto */}
        <MotoModeToggle 
          isActive={isMotoMode} 
          onToggle={() => setIsMotoMode(!isMotoMode)} 
        />
        {/* Instrucciones Principales */}
        <View style={styles.instructionContainer}>
          <Text style={styles.mainInstruction}>¿Qué falla tiene tu vehículo?</Text>
          <Text style={styles.subInstruction}>descríbelo por voz o texto</Text>
        </View>

        {/* Input de Voz */}
        <VoiceCard />

        <Text style={styles.dividerText}>o escribe</Text>

        {/* Input de Texto */}
        <View style={styles.textAreaWrapper}>
          <View style={styles.orangeAccent} />
          <TextInput
            style={styles.textArea}
            placeholder="Escribe lo que sientes en el vehiculo..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
            value={symptoms}
            onChangeText={setSymptoms}
          />
          <Text style={styles.charCounter}>{symptoms.length} / 500</Text>
        </View>
        
        {/* Chips de Síntomas Frecuentes */}
        <Text style={styles.sectionTitle}>SÍNTOMAS FRECUENTES</Text>
        <SymptomsChips 
          data={SYMPTOMS_DATA} 
          currentValue={symptoms} 
          onSelect={setSymptoms} 
        />
        {/* Botón Principal de Diagnóstico */}
        <TouchableOpacity style={styles.mainButton}>
          <LucideWrench color={colors.surface} size={20} style={{ marginRight: spacing.sm }} />
          <Text style={styles.mainButtonText}>Diagnosticar vehiculo</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <LucideWrench color={colors.textPrimary} size={24} />
        <LucideMap color={colors.textSecondary} size={24} />
        <LucideHistory color={colors.textSecondary} size={24} />
        <LucideSettings color={colors.textSecondary} size={24} />
      </View>
    </SafeAreaView>
  );
}