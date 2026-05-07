/**
 * routes/talleres.ts - Ruta GET /talleres.
 */
import { Router, Request, Response } from 'express';
import { buscarTalleresCercanos } from '../services/overpass';

export function talleresRouter(): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Faltan las coordenadas GPS (lat y lng).' });
    }

    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({ error: 'Las coordenadas deben ser números válidos.' });
    }

    try {
      const talleres = await buscarTalleresCercanos(userLat, userLng);
      console.log(`Talleres encontrados: ${talleres.length} cerca de [${userLat}, ${userLng}]`);
      res.json({ talleres });
    } catch (error) {
      console.error('Error al buscar talleres:', error);
      res.status(502).json({ error: 'El servicio de mapas no está disponible. Intentá de nuevo.' });
    }
  });

  return router;
}
