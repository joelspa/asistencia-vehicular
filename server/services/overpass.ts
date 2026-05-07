/**
 * overpass.ts - Consultas a la API pública de Overpass (OpenStreetMap).
 * Responsabilidad única: buscar talleres cercanos y transformar el resultado.
 */
import { calcularDistanciaKm, formatearDistancia } from '../utils/geo';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const RADIO_BUSQUEDA_METROS = 5000;

export interface TallerResultado {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  especialidad: string;
  distanciaKm: number;
  distancia: string;
}

/**
 * Busca talleres mecánicos cercanos a las coordenadas dadas.
 * Retorna la lista ordenada por distancia ascendente.
 */
export async function buscarTalleresCercanos(
  userLat: number,
  userLng: number
): Promise<TallerResultado[]> {
  const consulta = buildQuery(userLat, userLng);

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'User-Agent': 'MecanicaYA/1.0 (Proyecto Universitario)',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(consulta.trim())}`,
  });

  const rawText = await response.text();

  if (rawText.trim().startsWith('<')) {
    throw new Error('Overpass devolvió HTML — servicio saturado o no disponible.');
  }

  const datos = JSON.parse(rawText);

  return datos.elements
    .map((taller: any) => {
      const distanciaKm = calcularDistanciaKm(userLat, userLng, taller.lat, taller.lon);
      return {
        id: taller.id,
        nombre: taller.tags?.name ?? 'Taller Mecánico Local',
        latitud: taller.lat,
        longitud: taller.lon,
        especialidad: determinarEspecialidad(taller.tags),
        distanciaKm: Math.round(distanciaKm * 100) / 100,
        distancia: formatearDistancia(distanciaKm),
      };
    })
    .sort((a: TallerResultado, b: TallerResultado) => a.distanciaKm - b.distanciaKm);
}

function buildQuery(lat: number, lng: number): string {
  const r = RADIO_BUSQUEDA_METROS;
  return `
    [out:json][timeout:25];
    (
      node["shop"="car_repair"](around:${r},${lat},${lng});
      node["shop"="car_parts"](around:${r},${lat},${lng});
      node["shop"="car"](around:${r},${lat},${lng});
      node["shop"="motorcycle_repair"](around:${r},${lat},${lng});
      node["craft"="electronics_repair"](around:${r},${lat},${lng});
      node["amenity"="car_wash"](around:${r},${lat},${lng});
      node["shop"="car_paint"](around:${r},${lat},${lng});
      node["shop"="tyres"](around:${r},${lat},${lng});
    );
    out body;
  `;
}

function determinarEspecialidad(tags: any): string {
  if (tags?.shop === 'car_paint') return 'Pintura y chaperia';
  if (tags?.shop === 'tyres') return 'Llantas y neumaticos';
  if (tags?.shop === 'motorcycle_repair') return 'Motos';
  if (tags?.shop === 'car_repair') return 'Mecanica automotriz';
  if (tags?.shop === 'car_parts') return 'Repuestos';
  if (tags?.shop === 'car') return 'Automotriz';
  if (tags?.craft === 'electronics_repair') return 'Electromecanica';
  if (tags?.amenity === 'car_wash') return 'Lavado';
  return 'Mecanica general';
}
