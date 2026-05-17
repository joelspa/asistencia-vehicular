/** Respuesta normalizada de la ruta POST /diagnosticar. */
export interface DiagnosticoResponse {
  /** Determina el color de la sección principal y el texto de acción recomendada. */
  urgency_level: 'leve' | 'moderada' | 'critica';
  /** Etiqueta legible generada por Ollama, ej: "Falla Moderada - Sistema de Frenos". */
  urgency_label: string;
  /** Explicación del modelo de por qué llegó a este diagnóstico. */
  razonamiento: string;
  /** Lista de causas con probabilidad de 0 a 100, ordenadas de mayor a menor por el servidor. */
  causas: { causa: string; probabilidad: number }[];
  /** Especialidades de taller que el usuario debería buscar, ej: ["Frenos", "Suspensión"]. */
  especialidades_recomendadas: string[];
}

