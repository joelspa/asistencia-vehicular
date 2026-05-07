/** Mapa Leaflet con talleres cercanos y panel inferior arrastrable. */
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions,
  Animated, PanResponder, TouchableOpacity, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Navigation, MapPin, Settings, Wrench, ChevronUp } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { mockTalleres } from '../data/mockData';
import { generateLeafletMapHtml } from '../constants/html';
import { getApiBaseUrl } from '../constants/api';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_COLLAPSED = 220;
const SHEET_EXPANDED = SCREEN_HEIGHT * 0.65;

interface TallerDisplay {
  id: string;
  nombre: string;
  distancia: string;
  especialidad: string;
  latitud: number;
  longitud: number;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [talleres, setTalleres] = useState<TallerDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapHtml, setMapHtml] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const sheetHeight = useRef(new Animated.Value(SHEET_COLLAPSED)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) expandSheet();
        else if (gestureState.dy > 50) collapseSheet();
      },
    })
  ).current;

  const expandSheet = () => {
    setSheetExpanded(true);
    Animated.spring(sheetHeight, { toValue: SHEET_EXPANDED, useNativeDriver: false, friction: 8 }).start();
  };

  const collapseSheet = () => {
    setSheetExpanded(false);
    Animated.spring(sheetHeight, { toValue: SHEET_COLLAPSED, useNativeDriver: false, friction: 8 }).start();
  };

  const abrirRuta = (taller: TallerDisplay) => {
    const origin = userCoords ? `${userCoords.lat},${userCoords.lng}` : '';
    const dest = `${taller.latitud},${taller.longitud}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    Linking.openURL(url);
  };

  useEffect(() => { inicializarMapa(); }, []);

  async function inicializarMapa() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = -17.7863;
      let lng = -63.1812;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
      setUserCoords({ lat, lng });

      let talleresParaMapa: { nombre: string; latitud: number; longitud: number }[] = [];
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
        } else throw new Error('Sin talleres');
      } catch {
        talleresParaMapa = mockTalleres.map((t) => ({
          nombre: t.nombre, latitud: t.coordenadas.lat, longitud: t.coordenadas.lng,
        }));
        setTalleres(mockTalleres.map((t) => ({
          id: t.id, nombre: t.nombre, distancia: t.distancia,
          especialidad: t.especialidad.split(' ')[0],
          latitud: t.coordenadas.lat, longitud: t.coordenadas.lng,
        })));
      }
      setMapHtml(generateLeafletMapHtml(lat, lng, insets.top + 8, talleresParaMapa));
    } catch (error) {
      console.error('Error al inicializar mapa:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.screen}>
      <View style={s.mapArea}>
        {mapHtml ? (
          <WebView source={{ html: mapHtml }} style={s.webview} javaScriptEnabled domStorageEnabled scrollEnabled={false} />
        ) : (
          <View style={s.mapPlaceholder}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={s.loadingText}>Cargando mapa...</Text>
          </View>
        )}
      </View>

      {/* Bottom sheet */}
      <Animated.View style={[s.sheet, { height: sheetHeight }]}>
        {/* Handle */}
        <View {...panResponder.panHandlers} style={s.handleArea}>
          <View style={s.dragHandle} />
        </View>

        {/* Header */}
        <View style={s.sheetHeader}>
          <View>
            <Text style={s.sheetTitle}>{talleres.length} talleres cercanos</Text>
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
          <ScrollView style={s.sheetScroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
            {talleres.map((t) => (
              <View key={t.id} style={s.tallerCard}>
                <View style={s.tallerIconWrap}>
                  <Wrench color={colors.brand} size={16} strokeWidth={2.2} />
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
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBackground },
  mapArea: { flex: 1 },
  webview: { flex: 1 },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDE6F0',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.secondaryText },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 24,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  handleArea: { alignItems: 'center', paddingTop: 10, paddingBottom: 8 },
  dragHandle: { width: 40, height: 4, backgroundColor: colors.borderColor, borderRadius: 2 },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 15, fontWeight: '800', color: colors.primaryText },
  sheetSub: { fontSize: 11.5, color: colors.tertiaryText, marginTop: 2 },
  expandToggle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetScroll: { flex: 1, paddingHorizontal: 16 },
  tallerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
    gap: 12,
  },
  tallerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tallerInfo: { flex: 1 },
  tallerName: { fontSize: 14.5, fontWeight: '700', color: colors.primaryText, marginBottom: 5 },
  tallerMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tallerDist: { fontSize: 12, color: colors.tertiaryText, fontWeight: '500' },
  tallerBadge: {
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  tallerBadgeText: { fontSize: 11, color: colors.secondaryText, fontWeight: '600' },
  routeBtn: {
    backgroundColor: colors.navy,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    elevation: 2,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  routeBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
