
# Asistencia Vehicular


## Importaciones

## Recursos Cambios Importo esta libreria
---
UI - HOME SCREEN
import { Ionicons } from "@expo/vector-icons";

npx expo install react-native-svg
npm install lucide-react-native
---
UI-MAPS-POO
npx expo install react-native-maps expo-location
npx expo install react-native-maps expo-location


npx expo install react-native-webview

## Estructura del proyecto

```text
asistencia-vehicular/
├── app.json
├── App.tsx
├── index.ts
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── .gitignore
├── assets/
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── server/
│   ├── index.ts
│   └── package.json
└── src/
	├── components/
	│   ├── BottomTabs.tsx
	│   ├── MotoModeToggle.tsx
	│   ├── SymptomsChips.tsx
	│   └── VoiceCard.tsx
	├── data/
	│   └── mockData.ts
	├── hooks/
	│   └── useAccidentDetection.ts
	├── screens/
	│   ├── AccidentAlertScreen.tsx
	│   ├── HistoryScreen.tsx
	│   ├── HomeScreen.tsx
	│   ├── LoadingScreen.tsx
	│   ├── MapScreen.tsx
	│   ├── ResultScreen.tsx
	│   └── SettingsScreen.tsx
	├── services/
	│   ├── ai.ts
	│   └── whatsapp.ts
	├── styles/
	│   └── HomeStyles.ts
	├── theme/
	│   └── colors.ts
	└── types/
		├── models.ts
		└── navigation.ts
```

