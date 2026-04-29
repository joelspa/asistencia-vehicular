import { DiagnosticoMock } from '../types/models';

// src/data/mockData.ts

export const mockTalleres = [
  {
    id: '1',
    nombre: 'MotoMecánica Especializada Sur',
    especialidad: 'Mantenimiento preventivo y motores',
    distancia: '1.2 km',
    referencia: 'Cerca del Ventura Mall Sur',
    coordenadas: { lat: -17.808, lng: -63.165 }
  },
  {
    id: '2',
    nombre: 'Taller Electromecánica Rápida',
    especialidad: 'Sistemas eléctricos e inyección',
    distancia: '3.5 km',
    referencia: 'Avenida principal',
    coordenadas: { lat: -17.795, lng: -63.180 }
  },
  {
    id: '3',
    nombre: 'Grúas y Rescate 24/7',
    especialidad: 'Asistencia en ruta y accidentes',
    distancia: '5.0 km',
    referencia: 'Zona industrial',
    coordenadas: { lat: -17.770, lng: -63.190 }
  }
];

export const mockDiagnosticos = {
  leve: {
    urgency_level: 'leve',
    urgency_label: 'Falla Leve - Puedes seguir circulando',
    causas: [
      { causa: 'Aceite 10W-30 degradado', probabilidad: 85 },
      { causa: 'Filtro de aire sucio', probabilidad: 15 }
    ],
    razonamiento: 'Los síntomas indican que el motor está perdiendo suavidad debido a falta de lubricación óptima. Es recomendable programar un cambio de aceite pronto, pero no hay riesgo inminente de daño.',
    patron_detectado: null,
    taller_recomendado: mockTalleres[0]
  },
  moderada: {
    urgency_level: 'moderada',
    urgency_label: 'Falla Moderada - Revisar pronto',
    causas: [
      { causa: 'Acumulación de carbón en la culata', probabilidad: 70 },
      { causa: 'Bujía con desgaste prematuro', probabilidad: 30 }
    ],
    razonamiento: 'La pérdida de potencia y los tirones en altas revoluciones sugieren que hay exceso de carbón afectando la compresión. Requiere limpieza para evitar mayor consumo de combustible.',
    patron_detectado: 'Has reportado pérdida de potencia 2 veces este mes.',
    taller_recomendado: mockTalleres[0]
  },
  critica: {
    urgency_level: 'critica',
    urgency_label: 'Falla Crítica - Detén el vehículo',
    causas: [
      { causa: 'Fuga grave de compresión', probabilidad: 90 },
      { causa: 'Fallo en la bomba de aceite', probabilidad: 10 }
    ],
    razonamiento: 'El sonido metálico agudo junto con el apagado repentino indica que el motor podría estar trabajando en seco o sin compresión. Detén la marcha inmediatamente para evitar fundir el motor.',
    patron_detectado: null,
    taller_recomendado: mockTalleres[2]
  }
};

export const mockHistorial = [
  { id: '101', fecha: '2026-04-28', tipo: 'critica', titulo: 'Pérdida total de compresión' },
  { id: '102', fecha: '2026-04-15', tipo: 'moto_alerta', titulo: 'Alerta de Caída Registrada' },
  { id: '103', fecha: '2026-04-02', tipo: 'moderada', titulo: 'Tirones en 3ra marcha' },
  { id: '104', fecha: '2026-03-20', tipo: 'leve', titulo: 'Ruido en la cadena' },
  { id: '105', fecha: '2026-03-05', tipo: 'leve', titulo: 'Cambio de aceite sugerido' }
];