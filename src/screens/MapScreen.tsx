import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Dimensions,
  TouchableOpacity, Linking, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { LucideNavigation, LucideStar, LucideMapPin, LucideWrench } from 'lucide-react-native';

import { colors } from '../theme/colors';
import { BottomTabs } from '../components/BottomTabs';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_EXPANDED = SCREEN_HEIGHT * 0.6; // Altura cuando está abierto
const SHEET_COLLAPSED = 180; // Altura cuando está cerrado
const SNAP_POINT_CLOSED = SHEET_EXPANDED - SHEET_COLLAPSED;

const MOCK_TALLERES = [
  { id: '1', name: 'Mecánica El Rayo', specialty: 'Motores y Frenos', dist: '1.2 km', lat: -17.7831, lng: -63.1822, recommended: true },
  { id: '2', name: 'Taller Chiriguano', specialty: 'Electrónica Automotriz', dist: '2.5 km', lat: -17.7865, lng: -63.1788, recommended: false },
  { id: '3', name: 'AutoFix SC', specialty: 'Mantenimiento General', dist: '3.1 km', lat: -17.7801, lng: -63.1905, recommended: false },
  { id: '4', name: 'Repuestos Warnes', specialty: 'Cajas de Cambio', dist: '0.8 km', lat: -17.7845, lng: -63.1810, recommended: false },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTaller, setSelectedTaller] = useState(MOCK_TALLERES[0]);
  
  // --- LÓGICA DE ANIMACIÓN (REANIMATED) ---
  const translateY = useSharedValue(SNAP_POINT_CLOSED);
  const context = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value;
      // Limites: No dejar subir más de 0 ni bajar más del punto cerrado
      translateY.value = Math.max(translateY.value, 0);
      translateY.value = Math.min(translateY.value, SNAP_POINT_CLOSED);
    })
    .onEnd(() => {
      if (translateY.value < SNAP_POINT_CLOSED / 2) {
        translateY.value = withSpring(0, { damping: 20 });
      } else {
        translateY.value = withSpring(SNAP_POINT_CLOSED, { damping: 20 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // --- MAPA HTML ---
  const mapHtml = useMemo(() => {
    const centerLat = -17.7831;
    const centerLng = -63.1822;
    const markers = MOCK_TALLERES.map(t => `
      L.marker([${t.lat}, ${t.lng}], {
        icon: L.divIcon({
          className: 'custom-pin',
          html: '<div style="background-color:${t.recommended ? '#FF6B00' : '#444'}; width:30px; height:30px; border-radius:50%; border:3px solid white; box-shadow:0 2px 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;"><div style="width:8px; height:8px; background:white; border-radius:50%;"></div></div>',
          iconSize: [30, 30], iconAnchor: [15, 30]
        })
      }).addTo(map).on('click', () => window.ReactNativeWebView.postMessage(JSON.stringify(${JSON.stringify(t)})));
    `).join('');

    return `
      <!DOCTYPE html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; } #map { height: 100vh; width: 100vw; background: #f0f0f0; }
        .leaflet-control-zoom { display: none; }
      </style>
      </head><body><div id="map"></div><script>
        var map = L.map('map', { zoomControl: false }).setView([${centerLat}, ${centerLng}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        ${markers}
      </script></body></html>
    `;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        
        {/* Capa 1: Mapa */}
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.map}
          onMessage={(e) => setSelectedTaller(JSON.parse(e.nativeEvent.data))}
        />

        {/* Capa 2: Bottom Sheet Arrastrable */}
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.bottomSheet, animatedStyle]}>
            {/* Indicador visual de arrastre */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.iconBox}>
                  <LucideWrench color="#FF6B00" size={22} />
                </View>
                <View style={styles.titleInfo}>
                  <Text style={styles.name}>{selectedTaller.name}</Text>
                  <Text style={styles.specialty}>{selectedTaller.specialty}</Text>
                </View>
                {selectedTaller.recommended && (
                  <View style={styles.starBadge}>
                    <LucideStar size={12} color="#F57C00" fill="#F57C00" />
                  </View>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.footer}>
                <View>
                  <View style={styles.row}>
                    <LucideMapPin size={14} color="#666" />
                    <Text style={styles.distance}>A {selectedTaller.dist} de distancia</Text>
                  </View>
                  <Text style={styles.status}>Abierto ahora</Text>
                </View>

                <TouchableOpacity 
                  style={styles.btnIr} 
                  onPress={() => Linking.openURL(`geo:${selectedTaller.lat},${selectedTaller.lng}?q=${selectedTaller.name}`)}
                >
                  <LucideNavigation color="white" size={20} />
                  <Text style={styles.btnText}>IR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>

        {/* Capa 3: Tabs (Siempre fijos) */}
        <BottomTabs />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  map: { flex: 1 },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // Inicia desde abajo
    height: SHEET_EXPANDED,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    paddingBottom: 80, // Espacio para los BottomTabs
  },
  handleContainer: {
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF0E6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleInfo: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  starBadge: {
    backgroundColor: '#FFF8E1',
    padding: 8,
    borderRadius: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  distance: {
    fontSize: 13,
    color: '#666',
  },
  status: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 4,
  },
  btnIr: {
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
    elevation: 4,
  },
  btnText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
});