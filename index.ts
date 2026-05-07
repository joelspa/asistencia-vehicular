import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent llama a AppRegistry.registerComponent('main', () => App).
// También asegura que, tanto en Expo Go como en una compilación nativa,
// el entorno quede configurado correctamente.
registerRootComponent(App);
