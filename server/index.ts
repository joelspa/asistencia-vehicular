/**
 * server/index.ts - Setup del servidor Express de MecanicaYA.
 * Solo registra middleware y rutas. La lógica vive en routes/ y services/.
 */
import express from 'express';
import cors from 'cors';
import os from 'os';
import { diagnosticoRouter } from './routes/diagnostico';
import { talleresRouter } from './routes/talleres';

const app = express();
const PORT = 3001;
const ACTIVE_MODEL = 'llama3.1';

app.use(cors());
app.use(express.json());

app.get('/config', (_req, res) => {
  res.json({ model: ACTIVE_MODEL });
});

app.use('/diagnosticar', diagnosticoRouter(ACTIVE_MODEL));
app.use('/talleres', talleresRouter());

function getLocalIps(): string[] {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i): i is os.NetworkInterfaceInfo => !!i && i.family === 'IPv4' && !i.internal)
    .map(i => i.address);
}

app.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIps();
  console.log(`\n✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`   Accesible desde el telefono en:`);
  ips.forEach(ip => console.log(`   → http://${ip}:${PORT}`));
  console.log(`   Verificá desde el browser del telefono: http://<IP>:${PORT}/config\n`);
});
