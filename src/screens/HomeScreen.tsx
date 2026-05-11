import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { 
  LucideWrench, 
  LucideHistory 
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// --- TUS IMPORTS DE TEMA Y ESTILOS ---
import { colors, spacing } from '../theme/colors';
import { styles } from '../styles/HomeStyles';

// --- TUS COMPONENTES MODULARES ---
import { MotoModeToggle } from '../components/MotoModeToggle';
import { VoiceCard } from '../components/VoiceCard';
import { SymptomsChips } from '../components/SymptomsChips';
import { BottomTabs } from '../components/BottomTabs';

const SYMPTOMS_DATA = [
  'Ruido al frenar',
  'Motor recalentado',
  'Vibracion',
  'Bateria baja',
  'Humo del escape',
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [symptoms, setSymptoms] = useState('');
  const [isMotoMode, setIsMotoMode] = useState(false);
  const navigation = useNavigation<any>();

  return (
    /* Contenedor principal: 
       - Usamos insets.top para que el Header no choque con el reloj/notch.
       - No usamos insets.bottom aquí porque el BottomTabs ya lo maneja internamente.
    */
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background || '#FFFFFF', 
      paddingTop: insets.top 
    }}>
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 20 }]} 
        showsVerticalScrollIndicator={false}
      >
        
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
          <LucideWrench color="#FFF" size={20} style={{ marginRight: spacing.sm }} />
          <Text style={styles.mainButtonText}>Diagnosticar vehiculo</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Barra de navegación inferior:
          Al estar fuera del ScrollView, se queda fija abajo.
      */}
      <BottomTabs />
      
    </View>
  );
}