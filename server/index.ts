// server/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/diagnosticar', async (req: Request, res: Response) => {
    try {
        //Recibe síntomas y perfil del vehículo
        const { sintomas, perfilVehiculo } = req.body;

        if (!sintomas) {
            return res.status(400).json({ error: 'Debes proporcionar los síntomas.' });
        }

        const promptSystem = `
        Eres un mecánico experto en motocicletas. 
        Perfil del vehículo: ${perfilVehiculo || 'No especificado'}.
        El usuario te dará síntomas. 
        Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta, sin texto adicional:
        {
            "urgency_level": "leve" | "moderada" | "critica",
            "urgency_label": "Tu título aquí",
            "razonamiento": "Tu explicación técnica y clara de qué pasa",
            "causas": [
            { "causa": "Nombre de la causa", "probabilidad": numero_del_1_al_100 }
            ]
        }
    `;

        const ollamaResponse = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'phi3', // O llama3.1
                prompt: `${promptSystem}\n\nSíntomas: ${sintomas}`,
                format: 'json',
                stream: false
            })
        });

        const data = await ollamaResponse.json();
        const resultadoIA = JSON.parse(data.response);

        res.json(resultadoIA);

    } catch (error) {
        console.error('Error con Ollama:', error);
        res.status(500).json({ error: 'Fallo al procesar el diagnóstico con la IA local.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});