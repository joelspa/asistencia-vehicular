# SDD: Módulo de Detección de Siniestros (Modo Moto)
**Versión:** 1.1 (Solo Developer Edition)
**Estado:** Para Implementación
**Proyecto:** Aplicación de Asistencia Vehicular - UDI

## 1. Objetivo Técnico
Implementar un sistema de monitoreo en tiempo real utilizando la API de `expo-sensors` para identificar patrones de movimiento característicos de un accidente de motocicleta (impacto + caída) y ejecutar un protocolo de emergencia automatizado.

## 2. Stack Tecnológico Específico
- **Sensores:** `Accelerometer`, `Gyroscope` (expo-sensors).
- **Geolocalización:** `expo-location`.
- **Persistencia:** `@react-native-async-storage/async-storage`.
- **Comunicación:** `react-native/Linking` (WhatsApp Deep Linking).

## 3. Especificaciones de Lógica (Business Logic)

### A. Algoritmo de Disparo (The Trigger)
Para evitar falsos positivos por baches, el trigger requiere la validación secuencial de dos condiciones en una ventana máxima de 2 segundos:

1. **Condición de Impacto (Acelerómetro):**
   - Se calcula el vector resultante: `||V|| = √(x² + y² + z²)`.
   - Umbral Crítico: `> 3.5 G`.
2. **Condición de Posición (Giroscopio):**
   - Cambio de inclinación del eje Z o Y superior a 70 grados respecto a la posición inicial de "monitoreo".

### B. Protocolo de Alerta
- **Estado 1:** Al cumplirse el trigger, pausar la lectura de sensores y lanzar un `Overlay` (Modal) rojo en toda la pantalla.
- **Estado 2:** Iniciar temporizador de 10 segundos con un botón de "CANCELAR".
- **Estado 3:** Si el temporizador llega a 0 (el usuario está incapacitado):
  - Obtener `Coords` actuales vía `expo-location`.
  - Formatear mensaje: `https://wa.me/{numero_emergencia}?text={mensaje_con_coordenadas}`.
  - Registrar el evento (fecha, hora, coordenadas) en `AsyncStorage`.
  - Ejecutar `Linking.openURL()`.

## 4. Fases de Implementación (Hoja de Ruta Personal)

Al desarrollar en solitario, se debe seguir este orden estricto para evitar bloqueos:

- **Fase 1: La Interfaz de Alerta (UI/UX)**
  - Construir el botón "Activar Modo Moto".
  - Construir el Modal de emergencia con la cuenta regresiva de 10 segundos y el botón de cancelar. (Probarlo con un botón temporal manual antes de conectar sensores).
- **Fase 2: El Cerebro Matemático (Sensores)**
  - Importar `expo-sensors`.
  - Crear la función que lee el acelerómetro y calcula la raíz cuadrada de X, Y, Z.
  - Conectar el resultado matemático para que dispare el Modal de la Fase 1.
- **Fase 3: La Integración Final (Salida de Datos)**
  - Integrar `expo-location` para capturar el GPS cuando la cuenta llegue a cero.
  - Configurar el Deep Link a WhatsApp y el guardado local en `AsyncStorage`.

## 5. Casos de Prueba (QA Local)
- **TC-01 (Falso Positivo):** Agitar el teléfono en la mano simulando un bache (`< 3.0 G`). El modal no debe aparecer.
- **TC-02 (Siniestro Real):** Golpear el teléfono contra un cojín y dejarlo de lado (impacto + rotación). El modal debe aparecer y la cuenta regresiva debe iniciar.
- **TC-03 (Cancelación):** Pulsar "Cancelar" en el segundo 3. El modal se cierra, los sensores vuelven a monitorear y WhatsApp NO se abre.