# MecanicaYA

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

En `src/constants/api.ts` reemplazá la IP hardcodeada por la de tu máquina (la que muestra Expo al arrancar). El celular y la PC deben estar en la misma red WiFi.

## Ejecutar

```bash
npm run dev
```

Escaneá el QR con Expo Go desde tu celular.

## Estructura

```
App.tsx              Navegación raíz
src/
  screens/           Pantallas (Home, Resultado, Mapa, Historial, Configuración)
  hooks/             Lógica reutilizable
  components/        Componentes UI
  context/           Estado global (Modo Moto)
  services/          AsyncStorage y API
  theme/             Design tokens
server/
  index.ts           API Express: /diagnosticar, /talleres, /config
```

## Funcionalidades

- **Diagnóstico por IA** — síntomas por texto o chips rápidos; Ollama (phi3) devuelve causas y nivel de urgencia
- **Mapa de talleres** — talleres cercanos con apertura de ruta en Google Maps
- **Historial** — diagnósticos guardados localmente, filtrables por urgencia
- **Perfil del vehículo** — marca, modelo, año y combustible para diagnósticos más precisos
- **Modo Moto** — detección de accidentes por acelerómetro con alerta de emergencia por WhatsApp

> El diagnóstico es orientativo. No reemplaza la revisión de un mecánico certificado.
