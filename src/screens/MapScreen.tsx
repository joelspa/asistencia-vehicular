/** Mapa Leaflet con talleres cercanos, filtros por categoría y panel inferior arrastrable. */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Dimensions,
  TouchableOpacity, Linking, ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, runOnJS,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Navigation, MapPin, ChevronUp } from 'lucide-react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { TabParamList } from '../types/navigation';
import { mockTalleres } from '../data/mockData';
import { generateLeafletMapHtml } from '../constants/html';
import { getApiBaseUrl } from '../constants/api';
import { CategoryKey, getCategoryConfig, getCategoryKey } from '../utils/categoryClassifier';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_COLLAPSED = 220;
const SHEET_EXPANDED = SCREEN_HEIGHT * 0.65;
const SHEET_COLLAPSED_OFFSET = SHEET_EXPANDED - SHEET_COLLAPSED;
const SPRING_CONFIG = { damping: 22, stiffness: 220, mass: 0.8 };

interface TallerDisplay {
  id: string;
  nombre: string;
  distancia: string;
  especialidad: string;
  latitud: number;
  longitud: number;
}

export default function MapScreen() {
  const { colors, isDark } = useTheme();
  const CATEGORY_CONFIG = useMemo(() => getCategoryConfig(isDark), [isDark]);
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const route = useRoute<RouteProp<TabParamList, 'Mapa'>>();
  const especialidadesParam = route.params?.especialidades;

  type TallerParaMapa = { nombre: string; latitud: number; longitud: number; especialidad?: string };

  const [talleres, setTalleres] = useState<TallerDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapHtml, setMapHtml] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [rawTalleres, setRawTalleres] = useState<TallerParaMapa[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CategoryKey | null>(null);

  const translateY = useSharedValue(SHEET_COLLAPSED_OFFSET);
  const startY = useSharedValue(SHEET_COLLAPSED_OFFSET);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => { scrollY.value = e.contentOffset.y; },
  });

  const applySheetSnap = (goExpand: boolean) => setSheetExpanded(goExpand);

  const handleGesture = Gesture.Pan()
    .onStart(() => { startY.value = translateY.value; })
    .onUpdate((e) => {
      translateY.value = Math.max(0, Math.min(SHEET_COLLAPSED_OFFSET, startY.value + e.translationY));
    })
    .onEnd((e) => {
      const goExpand = e.velocityY < -500 || translateY.value < SHEET_COLLAPSED_OFFSET / 2;
      translateY.value = withSpring(goExpand ? 0 : SHEET_COLLAPSED_OFFSET, SPRING_CONFIG);
      runOnJS(applySheetSnap)(goExpand);
    });

  const scrollCollapseGesture = Gesture.Pan()
    .onStart(() => { startY.value = translateY.value; })
    .onUpdate((e) => {
      if (e.translationY > 0 && scrollY.value <= 0)
        translateY.value = Math.min(SHEET_COLLAPSED_OFFSET, startY.value + e.translationY);
    })
    .onEnd((e) => {
      if (translateY.value > SHEET_COLLAPSED_OFFSET * 0.25 || e.velocityY > 600) {
        translateY.value = withSpring(SHEET_COLLAPSED_OFFSET, SPRING_CONFIG);
        runOnJS(applySheetSnap)(false);
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
        runOnJS(applySheetSnap)(true);
      }
    });

  const bodyGesture = Gesture.Simultaneous(scrollCollapseGesture, Gesture.Native());

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const expandSheet = () => {
    setSheetExpanded(true);
    translateY.value = withSpring(0, SPRING_CONFIG);
  };

  const collapseSheet = () => {
    setSheetExpanded(false);
    translateY.value = withSpring(SHEET_COLLAPSED_OFFSET, SPRING_CONFIG);
  };

  const handleFilter = (cat: CategoryKey | null) => {
    setActiveFilter(cat);
    webViewRef.current?.injectJavaScript(
      `if (window.filterMarkers) window.filterMarkers('${cat ?? 'all'}'); true;`
    );
  };

  const availableCategories = useMemo<CategoryKey[]>(() => {
    const seen = new Set<CategoryKey>();
    talleres.forEach(t => seen.add(getCategoryKey(t.especialidad)));
    return [...seen];
  }, [talleres]);

  // Primera categoría del diagnóstico que tenga talleres reales; null = mostrar todos
  const autoFilterCat = useMemo<CategoryKey | null>(() => {
    if (!especialidadesParam?.length || !availableCategories.length) return null;
    const available = new Set(availableCategories);
    return especialidadesParam.map(getCategoryKey).find(cat => available.has(cat)) ?? null;
  }, [especialidadesParam, availableCategories]);

  useEffect(() => {
    if (autoFilterCat) setActiveFilter(autoFilterCat);
  }, [autoFilterCat]);

  const filteredTalleres = useMemo(() =>
    activeFilter ? talleres.filter(t => getCategoryKey(t.especialidad) === activeFilter) : talleres,
    [talleres, activeFilter]
  );

  const abrirRuta = (taller: TallerDisplay) => {
    const origin = userCoords ? `${userCoords.lat},${userCoords.lng}` : '';
    const dest = `${taller.latitud},${taller.longitud}`;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`);
  };

  useEffect(() => { inicializarMapa(); }, []);

  useEffect(() => {
    if (!mapCenter) return;
    setMapHtml(generateLeafletMapHtml(mapCenter.lat, mapCenter.lng, insets.top + 8, rawTalleres, isDark));
  }, [isDark, mapCenter, rawTalleres]);

  async function inicializarMapa() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = -17.7863, lng = -63.1812;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
      setUserCoords({ lat, lng });

      let talleresParaMapa: TallerParaMapa[] = [];
      try {
        const res = await fetch(`${getApiBaseUrl()}/talleres?lat=${lat}&lng=${lng}`);
        const data = await res.json();
        if (data.talleres?.length) {
          talleresParaMapa = data.talleres;
          setTalleres(data.talleres.slice(0, 15).map((t: any) => ({
            id: String(t.id), nombre: t.nombre,
            distancia: t.distancia || `${t.distanciaKm} km`,
            especialidad: t.especialidad || 'General',
            latitud: t.latitud, longitud: t.longitud,
          })));
        } else throw new Error();
      } catch {
        talleresParaMapa = mockTalleres.map(t => ({
          nombre: t.nombre, latitud: t.coordenadas.lat, longitud: t.coordenadas.lng,
          especialidad: t.especialidad,
        }));
        setTalleres(mockTalleres.map(t => ({
          id: t.id, nombre: t.nombre, distancia: t.distancia,
          especialidad: t.especialidad, latitud: t.coordenadas.lat, longitud: t.coordenadas.lng,
        })));
      }
      setRawTalleres(talleresParaMapa);
      setMapCenter({ lat, lng });
    } catch (e) {
      console.error('Error al inicializar mapa:', e);
    } finally {
      setLoading(false);
    }
  }

  const s = useMemo(() => StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.appBackground },
    mapArea: { flex: 1 },
    webview: { flex: 1 },
    mapPlaceholder: {
      flex: 1, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.surface2,
    },
    loadingText: { marginTop: 12, fontSize: 14, color: colors.secondaryText },

    sheet: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: SHEET_EXPANDED,
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      elevation: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 20,
    },
    handleArea: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
    dragHandle: { width: 40, height: 4, backgroundColor: colors.borderColor, borderRadius: 2 },

    // Filtros
    filterScroll: { maxHeight: 44 },
    filterContent: {
      paddingHorizontal: 16, paddingBottom: 8, gap: 8, flexDirection: 'row', alignItems: 'center',
    },
    filterChip: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
      borderWidth: 1.5, borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    filterChipText: { fontSize: 12, fontWeight: '600', color: colors.secondaryText },

    sheetHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, marginBottom: 8,
    },
    sheetTitle: { fontSize: 15, fontWeight: '800', color: colors.primaryText },
    sheetSub: { fontSize: 11.5, color: colors.tertiaryText, marginTop: 2 },
    expandToggle: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center',
    },

    sheetScroll: { flex: 1, paddingHorizontal: 16 },
    tallerCard: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.surface2, gap: 12,
    },
    tallerIconWrap: {
      width: 36, height: 36, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    tallerInfo: { flex: 1 },
    tallerName: { fontSize: 14.5, fontWeight: '700', color: colors.primaryText, marginBottom: 5 },
    tallerMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    tallerDist: { fontSize: 12, color: colors.tertiaryText, fontWeight: '500' },
    tallerBadge: {
      backgroundColor: colors.surface2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100,
    },
    tallerBadgeText: { fontSize: 11, color: colors.secondaryText, fontWeight: '600' },
    routeBtn: {
      backgroundColor: colors.navy, paddingHorizontal: 14, paddingVertical: 10,
      borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 5,
      elevation: 2, shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
    },
    routeBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    emptyFilter: { alignItems: 'center', paddingTop: 32, gap: 8 },
    emptyFilterText: { fontSize: 14, color: colors.tertiaryText, fontWeight: '500' },
  }), [colors, isDark]);

  return (
    <View style={s.screen}>
      <View style={s.mapArea}>
        {mapHtml ? (
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            style={s.webview}
            javaScriptEnabled
            domStorageEnabled
            scrollEnabled={false}
            onLoadEnd={() => {
              if (!especialidadesParam?.length) return;
              const available = new Set(talleres.map(t => getCategoryKey(t.especialidad)));
              const match = especialidadesParam.map(getCategoryKey).find(cat => available.has(cat));
              if (match) {
                webViewRef.current?.injectJavaScript(
                  `if (window.filterMarkers) window.filterMarkers('${match}'); true;`
                );
              }
            }}
            onMessage={(e) => {
              if (e.nativeEvent.data === 'collapse') collapseSheet();
            }}
          />
        ) : (
          <View style={s.mapPlaceholder}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={s.loadingText}>Cargando mapa...</Text>
          </View>
        )}
      </View>

      <Animated.View style={[s.sheet, animatedSheetStyle]}>
        {/* Handle */}
        <GestureDetector gesture={handleGesture}>
          <View style={s.handleArea}>
            <View style={s.dragHandle} />
          </View>
        </GestureDetector>

        {/* Filtros por categoría */}
        {availableCategories.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.filterScroll}
            contentContainerStyle={s.filterContent}
          >
            <TouchableOpacity
              style={[s.filterChip, !activeFilter && { backgroundColor: colors.brand, borderColor: colors.brand }]}
              onPress={() => handleFilter(null)}
              activeOpacity={0.8}
            >
              <Text style={[s.filterChipText, !activeFilter && { color: '#fff', fontWeight: '700' }]}>
                Todos
              </Text>
            </TouchableOpacity>
            {availableCategories.map(cat => {
              const cfg = CATEGORY_CONFIG[cat];
              const active = activeFilter === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[s.filterChip, active && { backgroundColor: cfg.color, borderColor: cfg.color }]}
                  onPress={() => handleFilter(active ? null : cat)}
                  activeOpacity={0.8}
                >
                  <cfg.Icon color={active ? '#fff' : cfg.color} size={12} strokeWidth={2.5} />
                  <Text style={[s.filterChipText, active && { color: '#fff', fontWeight: '700' }]}>
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Header */}
        <View style={s.sheetHeader}>
          <View>
            <Text style={s.sheetTitle}>
              {filteredTalleres.length} taller{filteredTalleres.length !== 1 ? 'es' : ''}
              {activeFilter ? ` · ${CATEGORY_CONFIG[activeFilter].label}` : ' cercanos'}
            </Text>
            <Text style={s.sheetSub}>Ordenados por distancia</Text>
          </View>
          <TouchableOpacity
            style={s.expandToggle}
            onPress={sheetExpanded ? collapseSheet : expandSheet}
            activeOpacity={0.7}
          >
            <ChevronUp
              color={colors.tertiaryText}
              size={18}
              style={{ transform: [{ rotate: sheetExpanded ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: 24 }} />
        ) : (
          <GestureDetector gesture={bodyGesture}>
            <Animated.ScrollView
              style={s.sheetScroll}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              scrollEventThrottle={16}
              onScroll={scrollHandler}
            >
              {filteredTalleres.length === 0 ? (
                <View style={s.emptyFilter}>
                  <Text style={s.emptyFilterText}>Sin talleres en esta categoría</Text>
                </View>
              ) : filteredTalleres.map((t) => {
                const cat = getCategoryKey(t.especialidad);
                const cfg = CATEGORY_CONFIG[cat];
                return (
                  <View key={t.id} style={s.tallerCard}>
                    <View style={[s.tallerIconWrap, { backgroundColor: `${cfg.color}${isDark ? '33' : '22'}` }]}>
                      <cfg.Icon color={cfg.color} size={16} strokeWidth={2.2} />
                    </View>
                    <View style={s.tallerInfo}>
                      <Text style={s.tallerName} numberOfLines={1}>{t.nombre}</Text>
                      <View style={s.tallerMeta}>
                        <MapPin color={colors.tertiaryText} size={11} />
                        <Text style={s.tallerDist}>{t.distancia}</Text>
                        <View style={s.tallerBadge}>
                          <Text style={s.tallerBadgeText}>{t.especialidad}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity style={s.routeBtn} onPress={() => abrirRuta(t)} activeOpacity={0.8}>
                      <Navigation color="#fff" size={13} strokeWidth={2.2} />
                      <Text style={s.routeBtnText}>Ir</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </Animated.ScrollView>
          </GestureDetector>
        )}
      </Animated.View>
    </View>
  );
}
