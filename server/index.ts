/**
 * server/index.ts - Setup del servidor Express de MecanicaYA.
 * Solo registra middleware y rutas. La lógica vive en routes/ y services/.
 */
import express from 'express';
import cors from 'cors';
import { diagnosticoRouter } from './routes/diagnostico';
import { talleresRouter } from './routes/talleres';

const app = express();
const PORT = 3001;
const ACTIVE_MODEL = 'qwen2.5:3b';

app.use(cors());
app.use(express.json());

app.get('/config', (_req, res) => {
  res.json({ model: ACTIVE_MODEL });
});

app.use('/diagnosticar', diagnosticoRouter(ACTIVE_MODEL));
app.use('/talleres', talleresRouter());

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
