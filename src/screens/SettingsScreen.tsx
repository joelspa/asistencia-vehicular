import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius } from '../theme/colors';

type SensorSensitivity = 'Baja' | 'Media' | 'Alta';
type SelectorType = 'brand' | 'model' | 'year' | 'fuel' | null;

type SettingsData = {
  brand: string;
  model: string;
  year: string;
  fuel: string;
  emergencyContactName: string;
  emergencyPhone: string;
  sensitivity: SensorSensitivity;
};

type SelectionRowProps = {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  isLast?: boolean;
  showChip?: boolean;
};

type OptionModalProps = {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

const STORAGE_KEY = '@mechanicaya_settings';

const BRAND_OPTIONS = [
  'Toyota',
  'Suzuki',
  'Nissan',
  'Kia',
  'Hyundai',
  'Chevrolet',
  'Mazda',
  'Volkswagen',
  'Ford',
];

const MODEL_BY_BRAND: Record<string, string[]> = {
  Toyota: ['Corolla', 'Yaris', 'Hilux', 'RAV4'],
  Suzuki: ['Swift', 'Dzire', 'Vitara', 'S-Presso'],
  Nissan: ['Versa', 'Sentra', 'Frontier', 'Kicks'],
  Kia: ['Rio', 'Cerato', 'Sportage', 'Picanto'],
  Hyundai: ['Accent', 'Elantra', 'Tucson', 'Santa Fe'],
  Chevrolet: ['Onix', 'Tracker', 'Cruze', 'Spark'],
  Mazda: ['Mazda 2', 'Mazda 3', 'CX-3', 'CX-5'],
  Volkswagen: ['Gol', 'Polo', 'Jetta', 'T-Cross'],
  Ford: ['Fiesta', 'Focus', 'EcoSport', 'Ranger'],
};

const FUEL_OPTIONS = ['Gasolina', 'GNV', 'Eléctrico'];

const YEAR_OPTIONS = Array.from({ length: 31 }, (_, index) =>
  String(new Date().getFullYear() - index)
);

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, '');
}

function formatPhoneInput(text: string) {
  const onlyValidCharacters = text.replace(/[^\d+]/g, '');

  let cleanedText = onlyValidCharacters;

  if (!cleanedText.startsWith('+')) {
    cleanedText = `+${cleanedText.replace(/\+/g, '')}`;
  }

  cleanedText = `+${cleanedText.slice(1).replace(/\+/g, '')}`;

  if (cleanedText.length > 12) {
    cleanedText = cleanedText.slice(0, 12);
  }

  if (cleanedText.startsWith('+591') && cleanedText.length > 4) {
    return `${cleanedText.slice(0, 4)} ${cleanedText.slice(4)}`;
  }

  return cleanedText;
}

function isValidPhone(phone: string) {
  const cleanedPhone = normalizePhone(phone);

  return /^\+591\d{8}$/.test(cleanedPhone);
}

function SelectionRow({
  label,
  value,
  placeholder,
  onPress,
  isLast = false,
  showChip = false,
}: SelectionRowProps) {
  const hasValue = value.trim().length > 0;

  return (
    <Pressable
      style={[styles.selectionRow, isLast && styles.selectionRowLast]}
      onPress={onPress}
    >
      <Text style={styles.selectionLabel}>{label}</Text>

      <View style={styles.selectionRight}>
        {showChip ? (
          <View style={[styles.valueChip, !hasValue && styles.valueChipEmpty]}>
            <Text
              style={[
                styles.valueChipText,
                !hasValue && styles.placeholderText,
              ]}
            >
              {hasValue ? value : placeholder}
            </Text>
          </View>
        ) : (
          <>
            <Text
              style={[
                styles.selectionValue,
                !hasValue && styles.placeholderText,
              ]}
            >
              {hasValue ? value : placeholder}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

function OptionModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: OptionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalTitle}>{title}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const isSelected = option === selectedValue;

              return (
                <Pressable
                  key={option}
                  style={styles.modalOption}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>

                  {isSelected ? <Text style={styles.checkIcon}>✓</Text> : null}
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Cerrar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function SettingsScreen() {
  const phoneInputRef = useRef<TextInput>(null);
  const contactNameInputRef = useRef<TextInput>(null);

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fuel, setFuel] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [sensitivity, setSensitivity] = useState<SensorSensitivity>('Media');

  const [activeSelector, setActiveSelector] = useState<SelectorType>(null);

  const modelOptions = useMemo(() => {
    return brand ? MODEL_BY_BRAND[brand] ?? [] : [];
  }, [brand]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);

      if (!savedSettings) return;

      const parsedSettings: SettingsData = JSON.parse(savedSettings);

      setBrand(parsedSettings.brand ?? '');
      setModel(parsedSettings.model ?? '');
      setYear(parsedSettings.year ?? '');
      setFuel(parsedSettings.fuel ?? '');
      setEmergencyContactName(parsedSettings.emergencyContactName ?? '');
      setEmergencyPhone(formatPhoneInput(parsedSettings.emergencyPhone ?? ''));
      setSensitivity(parsedSettings.sensitivity ?? 'Media');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las preferencias guardadas.');
    }
  };

  const saveSettings = async () => {
    if (!brand || !model || !year || !fuel) {
      Alert.alert(
        'Campos incompletos',
        'Selecciona Marca, Modelo, Año y Combustible.'
      );
      return;
    }

    if (!emergencyContactName.trim()) {
      Alert.alert(
        'Nombre requerido',
        'Ingresa el nombre del contacto de emergencia.'
      );
      return;
    }

    if (!emergencyPhone.trim()) {
      Alert.alert(
        'Número requerido',
        'Ingresa un número de WhatsApp con código de país.'
      );
      return;
    }

    if (!isValidPhone(emergencyPhone)) {
      Alert.alert(
        'Número inválido',
        'Ingresa un número válido de Bolivia. Ejemplo: +591 71234567'
      );
      return;
    }

    const settingsData: SettingsData = {
      brand,
      model,
      year,
      fuel,
      emergencyContactName: emergencyContactName.trim(),
      emergencyPhone: normalizePhone(emergencyPhone),
      sensitivity,
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settingsData));

      Alert.alert(
        'Configuración guardada',
        'Tus preferencias se guardaron correctamente.'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar las preferencias.');
    }
  };

  const testAlert = () => {
    if (!emergencyPhone.trim()) {
      Alert.alert(
        'Número requerido',
        'Primero registra un número de WhatsApp con código de país.'
      );
      return;
    }

    if (!isValidPhone(emergencyPhone)) {
      Alert.alert(
        'Número inválido',
        'Ingresa un número válido de Bolivia. Ejemplo: +591 71234567'
      );
      return;
    }

    Alert.alert(
      'Prueba exitosa',
      `El contacto ${
        emergencyContactName || 'de emergencia'
      } (${emergencyPhone}) está configurado correctamente.`
    );
  };

  const openModelSelector = () => {
    if (!brand) {
      Alert.alert('Marca requerida', 'Primero selecciona la marca del vehículo.');
      return;
    }

    setActiveSelector('model');
  };

  const handleBrandSelect = (selectedBrand: string) => {
    setBrand(selectedBrand);

    const validModels = MODEL_BY_BRAND[selectedBrand] ?? [];
    if (!validModels.includes(model)) {
      setModel('');
    }
  };

  const renderModal = () => {
    if (activeSelector === 'brand') {
      return (
        <OptionModal
          visible
          title="Selecciona la marca"
          options={BRAND_OPTIONS}
          selectedValue={brand}
          onSelect={handleBrandSelect}
          onClose={() => setActiveSelector(null)}
        />
      );
    }

    if (activeSelector === 'model') {
      return (
        <OptionModal
          visible
          title="Selecciona el modelo"
          options={modelOptions}
          selectedValue={model}
          onSelect={setModel}
          onClose={() => setActiveSelector(null)}
        />
      );
    }

    if (activeSelector === 'year') {
      return (
        <OptionModal
          visible
          title="Selecciona el año"
          options={YEAR_OPTIONS}
          selectedValue={year}
          onSelect={setYear}
          onClose={() => setActiveSelector(null)}
        />
      );
    }

    if (activeSelector === 'fuel') {
      return (
        <OptionModal
          visible
          title="Selecciona el combustible"
          options={FUEL_OPTIONS}
          selectedValue={fuel}
          onSelect={setFuel}
          onClose={() => setActiveSelector(null)}
        />
      );
    }

    return null;
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Configuración</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>MI VEHÍCULO</Text>

          <SelectionRow
            label="Marca"
            value={brand}
            placeholder="Seleccionar"
            onPress={() => setActiveSelector('brand')}
          />

          <SelectionRow
            label="Modelo"
            value={model}
            placeholder="Seleccionar"
            onPress={openModelSelector}
          />

          <SelectionRow
            label="Año"
            value={year}
            placeholder="Seleccionar"
            onPress={() => setActiveSelector('year')}
          />

          <SelectionRow
            label="Combustible"
            value={fuel}
            placeholder="Seleccionar"
            onPress={() => setActiveSelector('fuel')}
            isLast
            showChip
          />
        </View>

        <View style={[styles.card, styles.emergencyCard]}>
          <Text style={styles.sectionTitle}>CONTACTO DE EMERGENCIA</Text>

          <View style={styles.emergencyRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarIcon}>♙</Text>
            </View>

            <View style={styles.emergencyInfo}>
              <TextInput
                ref={contactNameInputRef}
                style={styles.contactNameInput}
                value={emergencyContactName}
                onChangeText={setEmergencyContactName}
                placeholder="Nombre del contacto"
                placeholderTextColor={colors.textSecondary}
              />

              <TextInput
                ref={phoneInputRef}
                style={styles.phoneInput}
                value={emergencyPhone}
                onChangeText={(text) => {
                  setEmergencyPhone(formatPhoneInput(text));
                }}
                placeholder="+591 7XXXXXXX"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                maxLength={13}
              />
            </View>

            <Pressable
              style={styles.editCircle}
              onPress={() => {
                if (!emergencyContactName.trim()) {
                  contactNameInputRef.current?.focus();
                  return;
                }

                phoneInputRef.current?.focus();
              }}
            >
              <Text style={styles.editText}>✎</Text>
            </Pressable>
          </View>

          <Pressable style={styles.testButton} onPress={testAlert}>
            <Text style={styles.testButtonText}>Probar alerta</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SENSIBILIDAD DEL SENSOR</Text>

          <View style={styles.sensitivityRow}>
            {(['Baja', 'Media', 'Alta'] as SensorSensitivity[]).map(
              (option, index) => {
                const isActive = sensitivity === option;

                return (
                  <Pressable
                    key={option}
                    style={[
                      styles.sensitivityButton,
                      isActive && styles.sensitivityButtonActive,
                      index < 2 && styles.sensitivityButtonSpacing,
                    ]}
                    onPress={() => setSensitivity(option)}
                  >
                    <Text
                      style={[
                        styles.sensitivityText,
                        isActive && styles.sensitivityTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          <Text style={styles.helperText}>
            Recomendado para caminos con baches frecuentes.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.appName}>MecanicaYA</Text>
          <Text style={styles.appDescription}>
            Desarrollada con React Native y Expo Go
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Datos vehiculares</Text>
            <Text style={styles.infoValue}>5,000+ registros reales</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Almacenamiento</Text>
            <Text style={styles.infoValue}>Solo en tu dispositivo</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Costo de servicios</Text>
            <Text style={styles.infoValueStrong}>Ninguno</Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Aviso:</Text>
          <Text style={styles.warningText}>
            MecanicaYA es orientativa. No reemplaza la revisión de un mecánico
            certificado ni los servicios de emergencia oficiales.
          </Text>
        </View>

        <Pressable style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Guardar configuración</Text>
        </Pressable>
      </ScrollView>

      {renderModal()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + spacing.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#EAE6E1',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  emergencyCard: {
    borderColor: colors.motoActive,
    borderWidth: 1.2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#B29384',
    marginBottom: spacing.sm,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7E1',
  },
  selectionRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  selectionLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  selectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionValue: {
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: 8,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: '#B9ADA5',
    marginTop: -2,
  },
  valueChip: {
    backgroundColor: '#EFEAE6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
  },
  valueChipEmpty: {
    backgroundColor: '#F4F1EE',
  },
  valueChipText: {
    fontSize: 14,
    color: '#8A6F63',
    fontWeight: '600',
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 2,
  },
  avatarIcon: {
    fontSize: 22,
    color: colors.motoActive,
  },
  emergencyInfo: {
    flex: 1,
  },
  contactNameInput: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingVertical: 0,
    marginBottom: 2,
  },
  phoneInput: {
    fontSize: 16,
    color: '#9E8D84',
    paddingVertical: 0,
  },
  editCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2EDE8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  editText: {
    fontSize: 16,
    color: '#7E6F68',
    fontWeight: '700',
  },
  testButton: {
    borderWidth: 1.4,
    borderColor: colors.motoActive,
    borderRadius: borderRadius.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  testButtonText: {
    color: colors.motoActive,
    fontWeight: '800',
    fontSize: 16,
  },
  sensitivityRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  sensitivityButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5DBD4',
    borderRadius: borderRadius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  sensitivityButtonSpacing: {
    marginRight: spacing.sm,
  },
  sensitivityButtonActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  sensitivityText: {
    fontSize: 14,
    color: '#7B6A61',
    fontWeight: '700',
  },
  sensitivityTextActive: {
    color: colors.surface,
  },
  helperText: {
    fontSize: 13,
    color: '#B29384',
    marginTop: spacing.sm + 2,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#EAE6E1',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  appName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D54B1A',
    marginBottom: 6,
  },
  appDescription: {
    fontSize: 14,
    color: '#A28E84',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md - 2,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  infoValueStrong: {
    fontSize: 15,
    color: '#173B2F',
    fontWeight: '800',
  },
  warningCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.2,
    borderColor: '#E76B39',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D54B1A',
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: 14,
    color: '#6C5A50',
    lineHeight: 24,
  },
  saveButton: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.cardLg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: 2,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalOptionTextSelected: {
    fontWeight: '800',
    color: colors.navy,
  },
  checkIcon: {
    fontSize: 18,
    color: colors.navy,
    fontWeight: '800',
  },
  modalCloseButton: {
    marginTop: spacing.md,
    backgroundColor: colors.navy,
    borderRadius: borderRadius.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
});