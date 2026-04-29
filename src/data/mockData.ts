import { DiagnosticoMock } from '../types/models';

export const mockDiagnosticos: DiagnosticoMock[] = [
  {
    id: "1",
    sintomaIngresado: "Ruido al frenar",
    nivelUrgencia: "Naranja",
    clasificacion: "Falla Moderada",
    indicaciones: "Atención necesaria en 48 horas. Evite viajes largos.",
    causas: [{ descripcion: "Desgaste de pastillas", probabilidad: 80 }],
    tallerRecomendado: {
      id: "t1",
      nombre: "Frenos Santa Cruz",
      especialidad: "Frenos y Suspensión [cite: 48]",
      distancia: "1.5 km",
      telefono: "77700000"
    }
  }
];