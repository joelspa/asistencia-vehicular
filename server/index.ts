/**
 * server/index.ts - Servidor de MecanicaYA.
 * Servidor Express que expone dos rutas:
 * 1. POST /diagnosticar - Recibe sintomas y genera un diagnostico via Ollama (IA local).
 * 2. GET /talleres - Busca talleres mecanicos cercanos usando la API de Overpass (OpenStreetMap).
 */
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;
const ACTIVE_MODEL = 'phi3';

app.use(cors());
app.use(express.json());

/**
 * Ruta GET /config
 * Devuelve la configuracion actual del servidor, como el modelo de IA.
 */
app.get('/config', (req: Request, res: Response) => {
    res.json({ model: ACTIVE_MODEL });
});

/**
 * Ruta POST /diagnosticar
 * Recibe los sintomas del vehiculo y un perfil opcional, los envia a Ollama
 * para generar un diagnostico con nivel de urgencia, causas y razonamiento.
 */
app.post('/diagnosticar', async (req: Request, res: Response) => {
    try {
        const { sintomas, perfilVehiculo } = req.body;

        if (!sintomas) {
            return res.status(400).json({ error: 'Debes proporcionar los sintomas.' });
        }

        /* Prompt refinado: diagnóstico diferencial con criterios de urgencia y calibración de probabilidades */
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

        /* Usa /api/chat para separar correctamente system prompt y mensaje del usuario */
        const ollamaResponse = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: ACTIVE_MODEL,
                messages: [
                    { role: 'system', content: promptSystem },
                    { role: 'user', content: `Síntomas del vehículo: ${sintomas}` }
                ],
                format: 'json',
                stream: false
            })
        });

        const data = await ollamaResponse.json();
        const resultadoIA = JSON.parse(data.message.content);

        /**
         * Normaliza la respuesta de Ollama para asegurar que siempre tenga
         * las claves correctas, incluso si el modelo responde con variaciones
         * como "causes" en vez de "causas" o "level" en vez de "urgency_level".
         */
        const normalizado = {
            urgency_level: resultadoIA.urgency_level || resultadoIA.level || 'moderada',
            urgency_label: resultadoIA.urgency_label || resultadoIA.label || resultadoIA.titulo || 'Diagnostico generado',
            razonamiento: resultadoIA.razonamiento || resultadoIA.reasoning || resultadoIA.explicacion || 'Sin detalle disponible.',
            causas: (resultadoIA.causas || resultadoIA.causes || []).map((c: any) => ({
                causa: c.causa || c.cause || c.nombre || 'Causa no especificada',
                probabilidad: typeof c.probabilidad === 'number' ? c.probabilidad : parseInt(c.probabilidad || c.probability || '50', 10),
            })),
            especialidades_recomendadas: Array.isArray(resultadoIA.especialidades_recomendadas)
                ? resultadoIA.especialidades_recomendadas
                : ['Mecanica general'],
        };

        /* Validar que urgency_level sea uno de los tres valores permitidos */
        if (!['leve', 'moderada', 'critica'].includes(normalizado.urgency_level)) {
            normalizado.urgency_level = 'moderada';
        }

        /* Asegurar que haya al menos una causa */
        if (normalizado.causas.length === 0) {
            normalizado.causas = [{ causa: 'Requiere revision presencial', probabilidad: 100 }];
        }

        console.log('Diagnostico generado:', JSON.stringify(normalizado, null, 2));
        res.json(normalizado);

    } catch (error) {
        console.error('Error con Ollama:', error);
        res.status(500).json({ error: 'Fallo al procesar el diagnostico con la IA local.' });
    }
});

/**
 * Calcula la distancia real en kilometros entre dos coordenadas usando la formula de Haversine.
 * @param lat1 Latitud del punto 1
 * @param lon1 Longitud del punto 1
 * @param lat2 Latitud del punto 2
 * @param lon2 Longitud del punto 2
 * @returns Distancia en kilometros
 */
function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Ruta GET /talleres
 * Busca talleres mecanicos cercanos usando la API publica de Overpass (OpenStreetMap).
 * Requiere parametros de query: lat (latitud) y lng (longitud).
 * Retorna un arreglo de talleres con id, nombre, coordenadas, especialidad y distancia real.
 */
app.get('/talleres', async (req: Request, res: Response) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Faltan las coordenadas GPS (lat y lng).' });
        }

        const userLat = parseFloat(lat as string);
        const userLng = parseFloat(lng as string);
        const radioBusqueda = 5000;

        /* Consulta Overpass para buscar talleres de distintos tipos en el radio */
        const consultaGeo = `
        [out:json][timeout:25];
        (
            node["shop"="car_repair"](around:${radioBusqueda}, ${userLat}, ${userLng});
            node["shop"="car_parts"](around:${radioBusqueda}, ${userLat}, ${userLng});
            node["shop"="car"](around:${radioBusqueda}, ${userLat}, ${userLng});
            node["shop"="motorcycle_repair"](around:${radioBusqueda}, ${userLat}, ${userLng});
            node["craft"="electronics_repair"](around:${radioBusqueda}, ${userLat}, ${userLng});
            node["amenity"="car_wash"](around:${radioBusqueda}, ${userLat}, ${userLng});
            node["shop"="car_paint"](around:${radioBusqueda}, ${userLat}, ${userLng});
            node["shop"="tyres"](around:${radioBusqueda}, ${userLat}, ${userLng});
        );
        out body;
    `;

        const urlMapeo = 'https://overpass-api.de/api/interpreter';

        const respuestaMapas = await fetch(urlMapeo, {
            method: 'POST',
            headers: {
                'User-Agent': 'MecanicaYA/1.0 (Proyecto Universitario)',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `data=${encodeURIComponent(consultaGeo.trim())}`
        });

        const rawText = await respuestaMapas.text();

        if (rawText.trim().startsWith('<')) {
            console.error('El servicio de mapas devolvio HTML (probablemente saturado):', rawText.substring(0, 200));
            return res.status(502).json({ error: 'El servicio de mapas no esta disponible en este momento. Intenta de nuevo.' });
        }

        const datosGeo = JSON.parse(rawText);

        const determinarEspecialidad = (tags: any): string => {
            if (tags?.shop === 'car_paint') return 'Pintura y chaperia';
            if (tags?.shop === 'tyres') return 'Llantas y neumaticos';
            if (tags?.shop === 'motorcycle_repair') return 'Motos';
            if (tags?.shop === 'car_repair') return 'Mecanica automotriz';
            if (tags?.shop === 'car_parts') return 'Repuestos';
            if (tags?.shop === 'car') return 'Automotriz';
            if (tags?.craft === 'electronics_repair') return 'Electromecanica';
            if (tags?.amenity === 'car_wash') return 'Lavado';
            return 'Mecanica general';
        };

        /* Transformar datos, calcular distancia real y ordenar por cercania */
        const talleresLimpios = datosGeo.elements
            .map((taller: any) => {
                const distanciaKm = calcularDistanciaKm(userLat, userLng, taller.lat, taller.lon);
                return {
                    id: taller.id,
                    nombre: taller.tags?.name || 'Taller Mecanico Local',
                    latitud: taller.lat,
                    longitud: taller.lon,
                    especialidad: determinarEspecialidad(taller.tags),
                    distanciaKm: Math.round(distanciaKm * 100) / 100,
                    distancia: distanciaKm < 1
                        ? `${Math.round(distanciaKm * 1000)} m`
                        : `${distanciaKm.toFixed(1)} km`,
                };
            })
            .sort((a: any, b: any) => a.distanciaKm - b.distanciaKm);

        console.log(`Talleres encontrados: ${talleresLimpios.length} cerca de [${userLat}, ${userLng}]`);
        res.json({ talleres: talleresLimpios });

    } catch (error) {
        console.error('Error interno al buscar talleres:', error);
        res.status(500).json({ error: 'Fallo interno al conectar con el servicio de geolocalizacion.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
