import { DiagnosticoResponse } from '../types/apiTypes';

/** 15 talleres de ejemplo con coordenadas de Santa Cruz de la Sierra, Bolivia */
export const mockTalleres = [
  {
    id: '1',
    nombre: 'MotoMecánica Especializada Sur',
    especialidad: 'Mantenimiento preventivo y motores',
    distancia: '1.2 km',
    coordenadas: { lat: -17.808, lng: -63.165 },
  },
  {
    id: '2',
    nombre: 'Taller Electromecánica Rápida',
    especialidad: 'Sistemas eléctricos e inyección',
    distancia: '3.5 km',
    coordenadas: { lat: -17.795, lng: -63.180 },
  },
  {
    id: '3',
    nombre: 'Grúas y Rescate 24/7',
    especialidad: 'Asistencia en ruta y accidentes',
    distancia: '5.0 km',
    coordenadas: { lat: -17.770, lng: -63.190 },
  },
  {
    id: '4',
    nombre: 'Neumáticos del Este',
    especialidad: 'Venta y reparación de llantas y neumáticos',
    distancia: '2.1 km',
    coordenadas: { lat: -17.785, lng: -63.155 },
  },
  {
    id: '5',
    nombre: 'AutoPintura Express',
    especialidad: 'Pintura automotriz y reparación de chapería',
    distancia: '4.3 km',
    coordenadas: { lat: -17.775, lng: -63.172 },
  },
  {
    id: '6',
    nombre: 'Taller Motos Bolivia',
    especialidad: 'Reparación de motos y motocicletas',
    distancia: '1.8 km',
    coordenadas: { lat: -17.800, lng: -63.175 },
  },
  {
    id: '7',
    nombre: 'Centro Frenos Confianza',
    especialidad: 'Frenos ABS y sistema de frenado',
    distancia: '2.7 km',
    coordenadas: { lat: -17.790, lng: -63.195 },
  },
  {
    id: '8',
    nombre: 'Transmisiones del Norte',
    especialidad: 'Caja de cambios y transmisión automática',
    distancia: '6.2 km',
    coordenadas: { lat: -17.758, lng: -63.185 },
  },
  {
    id: '9',
    nombre: 'AutoElect Vargas',
    especialidad: 'Electrónica automotriz y diagnóstico digital',
    distancia: '3.9 km',
    coordenadas: { lat: -17.782, lng: -63.200 },
  },
  {
    id: '10',
    nombre: 'Suspensiones Santa Cruz',
    especialidad: 'Suspensión, amortiguadores y dirección',
    distancia: '4.8 km',
    coordenadas: { lat: -17.765, lng: -63.165 },
  },
  {
    id: '11',
    nombre: 'Mecánica Cruz del Sur',
    especialidad: 'Mecánica general y mantenimiento',
    distancia: '2.3 km',
    coordenadas: { lat: -17.798, lng: -63.158 },
  },
  {
    id: '12',
    nombre: 'Repuestos Warnes',
    especialidad: 'Repuestos y autopartes originales',
    distancia: '5.5 km',
    coordenadas: { lat: -17.762, lng: -63.178 },
  },
  {
    id: '13',
    nombre: 'Taller Motos Norte',
    especialidad: 'Servicio técnico de motocicletas',
    distancia: '7.1 km',
    coordenadas: { lat: -17.752, lng: -63.192 },
  },
  {
    id: '14',
    nombre: 'Pintura y Chapería Bolivar',
    especialidad: 'Carrocería, pintura y abolladuras',
    distancia: '3.2 km',
    coordenadas: { lat: -17.788, lng: -63.168 },
  },
  {
    id: '15',
    nombre: 'Mecánica Integral Pérez',
    especialidad: 'Mantenimiento general y afinación',
    distancia: '1.5 km',
    coordenadas: { lat: -17.803, lng: -63.188 },
  },
];

export const mockDiagnosticos: Record<'leve' | 'moderada' | 'critica', DiagnosticoResponse> = {
  leve: {
    urgency_level: 'leve',
    urgency_label: 'Falla Leve - Puedes seguir circulando',
    causas: [
      { causa: 'Aceite 10W-30 degradado', probabilidad: 85 },
      { causa: 'Filtro de aire sucio', probabilidad: 15 },
    ],
    razonamiento:
      'Los síntomas indican que el motor está perdiendo suavidad debido a falta de lubricación óptima. Es recomendable programar un cambio de aceite pronto, pero no hay riesgo inminente de daño.',
    especialidades_recomendadas: ['Mecanica general'],
  },
  moderada: {
    urgency_level: 'moderada',
    urgency_label: 'Falla Moderada - Revisar pronto',
    causas: [
      { causa: 'Acumulación de carbón en la culata', probabilidad: 70 },
      { causa: 'Bujía con desgaste prematuro', probabilidad: 30 },
    ],
    razonamiento:
      'La pérdida de potencia y los tirones en altas revoluciones sugieren que hay exceso de carbón afectando la compresión. Requiere limpieza para evitar mayor consumo de combustible.',
    especialidades_recomendadas: ['Mecanica general', 'Electromecanica'],
  },
  critica: {
    urgency_level: 'critica',
    urgency_label: 'Falla Crítica - Detén el vehículo',
    causas: [
      { causa: 'Fuga grave de compresión', probabilidad: 90 },
      { causa: 'Fallo en la bomba de aceite', probabilidad: 10 },
    ],
    razonamiento:
      'El sonido metálico agudo junto con el apagado repentino indica que el motor podría estar trabajando en seco o sin compresión. Detén la marcha inmediatamente para evitar fundir el motor.',
    especialidades_recomendadas: ['Mecanica general'],
  },
};

export const mockHistorial = [
  { id: '101', fecha: '2026-04-28', tipo: 'critica', titulo: 'Pérdida total de compresión' },
  { id: '102', fecha: '2026-04-15', tipo: 'moto_alerta', titulo: 'Alerta de Caída Registrada' },
  { id: '103', fecha: '2026-04-02', tipo: 'moderada', titulo: 'Tirones en 3ra marcha' },
  { id: '104', fecha: '2026-03-20', tipo: 'leve', titulo: 'Ruido en la cadena' },
  { id: '105', fecha: '2026-03-05', tipo: 'leve', titulo: 'Cambio de aceite sugerido' },
];
