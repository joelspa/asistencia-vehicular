# Contexto de la app — MecanicaYA

## Resumen

MecanicaYA es una app Expo/React Native de asistencia mecánica vehicular. El usuario describe síntomas del vehículo (texto libre o chips rápidos), la app consulta un backend local con IA vía Ollama, muestra un diagnóstico orientativo con causas y nivel de urgencia, y permite encontrar talleres cercanos usando ubicación + OpenStreetMap/Overpass. Incluye un módulo de seguridad vial (Modo Moto) que detecta accidentes por acelerómetro y envía alerta de emergencia por WhatsApp.

> Importante: el diagnóstico es orientativo. No reemplaza la revisión de un mecánico certificado.

## Stack

- App móvil: Expo `55`, React `19`, React Native `0.83`, TypeScript.
- Navegación: `@react-navigation/native`, Bottom Tabs + Native Stack.
- UI: componentes React Native propios + `lucide-react-native`.
- Persistencia local: `@react-native-async-storage/async-storage`.
- Ubicación/mapa: `expo-location` + `react-native-webview` con Leaflet/OSM.
- Sensores (Modo Moto): `expo-sensors` (Accelerometer).
- Backend: Express + TypeScript en `server/`.
- IA: Ollama local, modelo activo `phi3`, endpoint `/api/chat`.

## Estructura principal

```txt
App.tsx                             Navegación raíz: tabs + stack modal + ModoMotoProvider
src/
  components/
    EmergencyOverlay.tsx            Modal rojo pantalla completa para Modo Moto
    CauseRow.tsx                    Fila de causa con barra de probabilidad
    FilterPill.tsx                  Chip de filtro activo/inactivo
    SectionLabel.tsx                Etiqueta de sección uppercase
    UrgencyBadge.tsx                Badge de nivel de urgencia
    (otros componentes UI menores)
  constants/
    api.ts                          URL base dinámica + endpoints + timeouts
    html.ts                         HTML Leaflet para el mapa (generateLeafletMapHtml)
    urgency.ts                      Configuración visual por nivel de urgencia
  context/
    ModoMotoContext.tsx             Proveedor global del estado del Modo Moto
  data/
    mockData.ts                     Diagnóstico y talleres de fallback
  hooks/
    useDiagnosisFetch.ts            Orquesta fetch, fallback mock y guardado local
    useModoMoto.ts                  Lógica de detección de accidente y protocolo de alerta
    useVehicleProfile.ts            Carga y guarda perfil del vehículo
  screens/
    HomeScreen.tsx                  Entrada de síntomas (texto + chips rápidos)
    LoadingScreen.tsx               Progreso visual durante el diagnóstico
    ResultScreen.tsx                Resultado: urgencia, causas, razonamiento y especialidades
    MapScreen.tsx                   Mapa con talleres cercanos y panel arrastrable
    HistoryScreen.tsx               Historial de diagnósticos con filtros (refactorizado)
    SettingsScreen.tsx              Perfil del vehículo + Modo Moto
  services/
    storage.ts                      AsyncStorage: historial y perfil del vehículo
    ai.ts                           (sin uso activo; lógica delegada al backend)
  theme/
    colors.ts                       Design tokens: colores, spacing, borderRadius
  types/
    navigation.ts                   RootStackParamList y TabParamList
    apiTypes.ts                     DiagnosticoResponse y tipos de API
    models.ts                       Modelos de dominio internos
  utils/
    dateFormatter.ts                Fecha relativa ("hace 2 días")
    errorMessages.ts                Mensajes de error centralizados
server/
  index.ts                          API Express: /diagnosticar, /talleres, /config
  .env                              Variables de entorno (no versionado)
eas.json                            Perfiles EAS (development, preview, production)
app.json                            Config Expo: bundle IDs, permisos, plugins
```

## Flujo funcional

1. `HomeScreen` permite ingresar síntomas por texto libre o chips rápidos.
2. Al presionar "Analizar con IA", navega a `Carga` con `{ sintomas, perfilVehiculo }`.
3. `LoadingScreen` usa `useDiagnosisFetch`.
4. `useDiagnosisFetch` llama a `solicitarDiagnostico`.
5. `solicitarDiagnostico` hace `POST /diagnosticar`.
6. El backend envía el prompt al endpoint `/api/chat` de Ollama (separación system/user) y normaliza el JSON de respuesta.
7. El resultado se guarda en AsyncStorage con `guardarDiagnostico`.
8. La app navega a `ResultScreen`.
9. `HistoryScreen` lee el historial local y permite filtrar por urgencia.
10. `MapScreen` pide ubicación y consulta `GET /talleres`; si falla, usa `mockTalleres`.

## Modo Moto (módulo de seguridad vial)

Activado desde `SettingsScreen`. Usa el acelerómetro para detectar impactos (umbral configurable). Al detectar un evento:

1. Se muestra `EmergencyOverlay` (pantalla roja con countdown de 10 segundos).
2. Si el usuario no cancela, obtiene coordenadas GPS (tracking continuo activo desde que se activa el modo) y abre WhatsApp con mensaje + link de Google Maps.
3. El evento queda registrado en AsyncStorage (`moto:eventos`).

**Estado**: El trigger actual usa solo acelerómetro (modo demo/simulación). La lógica de giroscopio (impacto + rotación en ventana de 3.5s) está comentada en `useModoMoto.ts` con la etiqueta `[GYRO]` para producción.

**Claves AsyncStorage del módulo:**
- `moto:contacto` — número de WhatsApp de emergencia
- `moto:eventos` — historial de eventos detectados

**Archivos clave:**
- `src/hooks/useModoMoto.ts` — lógica de sensores, countdown, envío de emergencia
- `src/context/ModoMotoContext.tsx` — proveedor global; monta `EmergencyOverlay` en el árbol raíz
- `src/components/EmergencyOverlay.tsx` — UI de alerta (modal rojo a pantalla completa)

## Navegación

Archivo: `src/types/navigation.ts`

### Stack principal (`RootStackParamList`)

| Pantalla | Params |
|---|---|
| `MainTabs` | `NavigatorScreenParams<TabParamList> \| undefined` |
| `Carga` | `{ sintomas: string; perfilVehiculo: string }` |
| `Resultado` | `{ diagnostico: DiagnosticoResponse }` |

### Tabs (`TabParamList`)

| Tab | Pantalla |
|---|---|
| `Inicio` | `HomeScreen` |
| `Mapa` | `MapScreen` |
| `Historial` | `HistoryScreen` |
| `Configuracion` | `SettingsScreen` |

> Para navegar desde una tab screen tanto a otras tabs como a pantallas de pila, usar `CompositeNavigationProp<BottomTabNavigationProp<TabParamList>, NativeStackNavigationProp<RootStackParamList>>`.

## Contrato de API

### `POST /diagnosticar`

```json
// Body
{ "sintomas": "string", "perfilVehiculo": "string" }
```

```ts
// Response
interface DiagnosticoResponse {
  urgency_level: 'leve' | 'moderada' | 'critica';
  urgency_label: string;
  razonamiento: string;
  causas: { causa: string; probabilidad: number }[];
  especialidades_recomendadas: string[];
}
```

El backend usa `/api/chat` de Ollama con separación `system`/`user`. El prompt incluye criterios de urgencia con ejemplos concretos, calibración de probabilidades (65-90% / 35-64% / 10-34%) y metodología de diagnóstico diferencial.

### `GET /talleres?lat={lat}&lng={lng}`

Busca talleres en radio 5 km vía Overpass API. Devuelve talleres ordenados por distancia con especialidad inferida.

### `GET /config`

```json
{ "model": "phi3" }
```

## Estado local

Archivo: `src/services/storage.ts`

| Clave AsyncStorage | Contenido |
|---|---|
| `@mecanicaya_historial` | Array de `EntradaHistorial` |
| `@mecanicaya_perfil_vehiculo` | `{ marca, modelo, anio, combustible }` |
| `moto:contacto` | Número WhatsApp de emergencia |
| `moto:eventos` | Array de eventos Modo Moto `{ fecha, lat, lng }` |

## Pantallas

| Pantalla | Descripción |
|---|---|
| `HomeScreen` | Ingreso de síntomas por texto + chips rápidos. `KeyboardAvoidingView` activo. |
| `LoadingScreen` | Progreso visual en 3 pasos mientras se consulta Ollama. |
| `ResultScreen` | Urgencia con hero colorido, causas con probabilidades, razonamiento expandible, acción recomendada, especialidades con link al mapa. |
| `MapScreen` | Mapa Leaflet en WebView, bottom sheet arrastrable con talleres y botón de ruta a Google Maps. |
| `HistoryScreen` | Lista filtrable de diagnósticos. Arquitectura refactorizada: sub-componentes (`StatsRow`, `FilterBar`, `EmptyState`, `DiagnosticCard`) + funciones puras. |
| `SettingsScreen` | Perfil del vehículo (editable), info del motor IA, sección Modo Moto con toggle y contacto de emergencia. `KeyboardAvoidingView` activo. |

## Hooks

| Hook | Responsabilidad |
|---|---|
| `useDiagnosisFetch` | Orquesta fetch a `/diagnosticar`, fallback mock, guardado local, estado de carga/error. |
| `useModoMoto` | Suscripción al acelerómetro, máquina de estados (idle/monitoring/alert), countdown, tracking GPS continuo, envío de emergencia. |
| `useVehicleProfile` | Carga y persiste perfil del vehículo en AsyncStorage. |

## Diseño visual

Archivo: `src/theme/colors.ts`

| Token | Valor |
|---|---|
| `brand` | `#2563EB` (azul confianza) |
| `accent` | `#F59E0B` (ámbar herramienta) |
| `navy` | `#0E1A2B` |
| `appBackground` | `#F4F6F9` |
| `primaryText` | `#0E1A2B` |
| `critRed` | `#DC2626` |
| `warnOrange` | `#D97706` |
| `safeGreen` | `#15803D` |
| `motoPurple` | `#6D28D9` |
| `accidentBackground` | `#1A0505` |

Convención: importar `colors`, `spacing` y `borderRadius` desde `src/theme/colors.ts`. No usar valores mágicos nuevos salvo casos justificados.

## Fallbacks importantes

- Si falla `/diagnosticar`, `useDiagnosisFetch` retorna un diagnóstico mock desde `mockData.ts`.
- Si falla Overpass o no hay talleres, `MapScreen` usa `mockTalleres`.
- Si falla la lectura del perfil, se usa un perfil por defecto.
- Si `useModoMoto` no obtiene permiso de ubicación, el mensaje de WhatsApp incluye coordenadas `0,0`.

## Gotchas detectados

- `constants/api.ts` tiene una IP local para desarrollo. Cambia según red/dispositivo/emulador.
- `LoadingScreen` muestra "Tu información no sale del dispositivo", pero los síntomas sí se envían al backend local en la red. Es local, pero técnicamente atraviesa la red WiFi.
- `expo-sensors` con Expo Go en Android puede tener diferente normalización de unidades (m/s² vs g-force). El hook compensa con `Platform.OS === 'android' ? mag / 9.81 : mag`.
- `src/types/apiTypes.ts` exige `especialidades_recomendadas`, pero algunos fallbacks en `useDiagnosisFetch` no lo incluyen. `ResultScreen` lo tolera verificando existencia antes de renderizar.
- El Modo Moto con trigger solo por acelerómetro (umbral `0.5G`) es muy sensible — pensado para demo. Para producción, descomentar el bloque `[GYRO]` en `useModoMoto.ts`.
- `eas.json` existe para builds nativos con EAS, pero la app corre en Expo Go sin development build.

## Comandos

```bash
npm run dev          # backend + Expo en paralelo
npm run start        # solo Expo
npm run android      # Expo Android
npm run ios          # Expo iOS
```

```bash
npm run dev --prefix server   # solo backend
```

> Por instrucción del proyecto: no ejecutar build después de cambios.
