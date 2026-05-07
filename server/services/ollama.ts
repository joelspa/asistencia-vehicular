/**
 * ollama.ts - Comunicación con la instancia local de Ollama.
 * Responsabilidad única: enviar el prompt y normalizar la respuesta.
 */

const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';

export interface DiagnosticoNormalizado {
  urgency_level: 'leve' | 'moderada' | 'critica';
  urgency_label: string;
  razonamiento: string;
  causas: { causa: string; probabilidad: number }[];
  especialidades_recomendadas: string[];
}

/**
 * Envía síntomas + perfil a Ollama y retorna el diagnóstico normalizado.
 * El prompt del sistema está diseñado para obtener JSON válido en una sola pasada.
 */
export async function solicitarDiagnosticoOllama(
  sintomas: string,
  perfilVehiculo: string,
  model: string
): Promise<DiagnosticoNormalizado> {
  const promptSystem = `Sos un mecánico automotriz con 20 años de experiencia en diagnóstico de fallas en taller. Tu especialidad es identificar causas raíz a partir de síntomas descritos por conductores no técnicos.

VEHÍCULO EN CONSULTA: ${perfilVehiculo || 'No especificado'}
Usá el perfil del vehículo para ajustar el diagnóstico: la antigüedad aumenta la probabilidad de desgaste; el tipo de combustible descarta o incluye ciertas fallas; la marca/modelo tiene fallas conocidas frecuentes.

METODOLOGÍA:
1. Identificá el sistema afectado (motor, frenos, eléctrico, suspensión, etc.) según los síntomas.
2. Listá las causas más probables para ese sistema en ese tipo de vehículo, de mayor a menor frecuencia estadística.
3. Asigná urgencia según impacto real en seguridad y daño progresivo.

CRITERIOS DE URGENCIA — sé estricto, no sobrediagnostiques:
- "critica": riesgo inmediato de accidente o daño irreversible al motor → fallo de frenos, humo del capó, pérdida de dirección, recalentamiento severo, fuga de combustible, golpeteo metálico fuerte en motor
- "moderada": falla que empeora en 48-72hs si no se atiende → pérdida de líquido, vibración progresiva, batería en descarga, temperatura elevada sin humo, ruido constante bajo carga
- "leve": problema menor sin riesgo inmediato → luz de advertencia sin síntomas físicos, ruido ocasional, consumo levemente elevado, detalle estético

CALIBRACIÓN DE PROBABILIDADES:
- 65-90%: causa más frecuente que explica exactamente los síntomas descritos
- 35-64%: causa plausible, requiere confirmación presencial para descartar
- 10-34%: causa posible pero menos típica, incluirla si el síntoma es ambiguo

Respondé ÚNICAMENTE con JSON válido sin markdown ni texto extra:
{
  "urgency_level": "leve|moderada|critica",
  "urgency_label": "Título de 4-6 palabras que describe el problema concreto",
  "razonamiento": "2-3 oraciones técnicas: qué componente está fallando, por qué produce exactamente esos síntomas, y qué consecuencia tiene no atenderlo",
  "causas": [
    { "causa": "Nombre técnico preciso de la causa", "probabilidad": 70 },
    { "causa": "Segunda causa posible", "probabilidad": 20 },
    { "causa": "Tercera causa a descartar", "probabilidad": 10 }
  ],
  "especialidades_recomendadas": ["Mecanica general"]
}

RESTRICCIONES ABSOLUTAS:
- urgency_level: exactamente "leve", "moderada" o "critica", sin variaciones
- causas: entre 2 y 4 entradas, probabilidades suman aproximadamente 100
- urgency_label: específico al problema (NO "Falla detectada" ni genéricos)
- razonamiento: explicación causal concreta, NO repetir los síntomas del usuario
- especialidades_recomendadas: 1 o 2 elementos de esta lista exacta:
  "Mecanica general" → motor, transmisión, embrague, frenos mecánicos, correas de distribución/alternador, aceite
  "Electromecanica" → batería, alternador, motor de arranque, sensores (lambda, MAF, temperatura), fusibles, luces, ECU
  "Llantas y neumaticos" → neumáticos, aros, alineación, balanceo, dirección, rótulas, amortiguadores
  "Pintura y chaperia" → carrocería, golpes, abolladuras, óxido, rayones
  "Repuestos" → pieza específica rota que requiere reemplazo directo (bomba de agua, filtro de combustible, termostato, bujías)
  "Lavado" → olores internos, suciedad, problemas estéticos sin falla mecánica
- Idioma: español rioplatense`;

  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: promptSystem },
        { role: 'user', content: `Síntomas del vehículo: ${sintomas}` },
      ],
      format: 'json',
      stream: false,
    }),
  });

  const data = await response.json();
  const raw = JSON.parse(data.message.content);
  return normalizarRespuesta(raw);
}

/**
 * Normaliza la respuesta de Ollama para garantizar claves correctas
 * incluso cuando el modelo responde con variaciones de nombres (causes, level, etc.).
 */
function normalizarRespuesta(raw: any): DiagnosticoNormalizado {
  const urgency_level: 'leve' | 'moderada' | 'critica' = (['leve', 'moderada', 'critica'] as const).includes(
    raw.urgency_level ?? raw.level
  )
    ? (raw.urgency_level ?? raw.level)
    : 'moderada';

  const causas = (raw.causas ?? raw.causes ?? []).map((c: any) => ({
    causa: c.causa ?? c.cause ?? c.nombre ?? 'Causa no especificada',
    probabilidad:
      typeof c.probabilidad === 'number'
        ? c.probabilidad
        : parseInt(c.probabilidad ?? c.probability ?? '50', 10),
  }));

  return {
    urgency_level,
    urgency_label: raw.urgency_label ?? raw.label ?? raw.titulo ?? 'Diagnóstico generado',
    razonamiento: raw.razonamiento ?? raw.reasoning ?? raw.explicacion ?? 'Sin detalle disponible.',
    causas: causas.length > 0 ? causas : [{ causa: 'Requiere revisión presencial', probabilidad: 100 }],
    especialidades_recomendadas: Array.isArray(raw.especialidades_recomendadas)
      ? raw.especialidades_recomendadas
      : ['Mecanica general'],
  };
}
