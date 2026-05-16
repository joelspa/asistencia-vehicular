/**
 * routes/diagnostico.ts - Ruta POST /diagnosticar.
 */
import { Router, Request, Response } from 'express';
import { solicitarDiagnosticoOllama } from '../services/ollama';

export function diagnosticoRouter(activeModel: string): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    const { sintomas, perfilVehiculo } = req.body;

    if (!sintomas) {
      return res.status(400).json({ error: 'Debes proporcionar los síntomas.' });
    }

    try {
      const resultado = await solicitarDiagnosticoOllama(sintomas, perfilVehiculo ?? '', activeModel);
      console.log('Diagnóstico generado:', JSON.stringify(resultado, null, 2));
      res.json(resultado);
    } catch (error) {
      console.error('Error con Ollama:', error);
      res.status(500).json({ error: 'Falló al procesar el diagnóstico con la IA local.' });
    }
  });

  return router;
}
