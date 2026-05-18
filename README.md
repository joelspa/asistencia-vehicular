# MotorSense

App de asistencia mecánica vehicular. Describís los síntomas de tu vehículo, la IA los analiza y te devuelve un diagnóstico orientativo con nivel de urgencia, causas probables y talleres cercanos.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) instalado en tu celular
- [Ollama](https://ollama.com/) corriendo localmente con el modelo `phi3`

```bash
ollama pull phi3
ollama serve
```

## Instalación

```bash
git clone https://github.com/joelspa/asistencia-vehicular.git
cd asistencia-vehicular

npm install
npm install --prefix server
```

## Configuración

Creá el archivo `server/.env`:

```env
PORT=3001
```

En **desarrollo** no hace falta hardcodear la IP: la app detecta automáticamente el host del Metro de Expo. Solo asegurate de que el celular y la PC estén en la misma red WiFi.

Para **builds de producción**, definí la URL del backend en `app.json` → `expo.extra.apiBaseUrl`:

```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://tu-backend.com"
    }
  }
}
```

Si queda vacía, la app loguea un warning y los requests fallan a propósito.

## Ejecutar

```bash
npm run dev
```

Escaneá el QR con Expo Go desde tu celular.

## Estructura

```
App.tsx                  Navegación raíz
src/
  screens/               Pantallas (Home, Loading, Resultado, Mapa, Historial, Configuración)
  hooks/                 useDiagnosisFetch, useVehicleProfile, useTalleresNearby, useModoMoto
  components/            Componentes UI (SegmentedControl, HeroUrgency, TallerListItem, etc.)
  context/               ThemeContext (light/dark) y ModoMotoContext
  constants/             api, urgency, sensors (feature flag de Modo Moto), html (mapa Leaflet)
  services/              ai, storage (AsyncStorage), http (fetchWithTimeout)
  theme/                 colors (paleta light/dark) y utils (withAlpha)
  types/                 Tipos compartidos (apiTypes, navigation)
  utils/                 categoryClassifier, dateFormatter, errorMessages
server/
  index.ts               API Express: /diagnosticar, /talleres, /config
```

## Funcionalidades

- **Diagnóstico por IA** — síntomas por texto o chips rápidos; Ollama (phi3) devuelve causas y nivel de urgencia.
- **Mapa de talleres** — Leaflet en WebView con filtros por categoría (frenos, eléctrico, llantas, etc.) y apertura de ruta en Google Maps.
- **Historial** — diagnósticos guardados localmente, filtrables por urgencia.
- **Perfil del vehículo** — marca, modelo, año y combustible para diagnósticos más precisos. Si está vacío, el resultado muestra un CTA "Agregar vehículo" que lleva directo a Configuración.
- **Modo claro/oscuro** — sigue al sistema o se fija manualmente desde Configuración. Paletas calibradas para WCAG AA en ambos temas.
- **Modo Moto** — detección de accidentes por sensores con alerta de emergencia por WhatsApp (countdown cancelable). Configurable vía `src/constants/sensors.ts`:
  - `MODO_GYRO_HABILITADO = false` → solo acelerómetro, umbral bajo (testing/QA).
  - `MODO_GYRO_HABILITADO = true` → acelerómetro + giroscopio con doble condición (producción).

> El diagnóstico es orientativo. No reemplaza la revisión de un mecánico certificado.
