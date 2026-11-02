import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// API Endpoint to parse homework image/text with Gemini and generate a kid-friendly quiz and summary
app.post('/api/parse-homework', async (req, res) => {
  try {
    const { imageBase64, mimeType, textPrompt, subject, language } = req.body;

    const model = 'gemini-2.5-flash-lite';
    const contents: any[] = [];

    let promptText = `Eres un profesor experto, amigable y divertido para niños. Analiza la siguiente información de tarea o resumen escolar (en ${language || 'español'} sobre la materia "${subject || 'General'}").
    Genera una respuesta en formato JSON estrictamente válido (sin markdown code blocks extra, solo el objeto JSON) con la siguiente estructura:
    {
      "title": "Título divertido y motivador del tema",
      "summary": "Resumen súper claro, colorido y fácil de entender para un niño en 3 o 4 párrafos cortos.",
      "keyPoints": ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
      "questions": [
        {
          "id": "q1",
          "question": "¿Pregunta divertida relacionada con el texto?",
          "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
          "correctIndex": 0,
          "explanation": "¡Explicación genial de por qué esta es la respuesta correcta!"
        }
      ],
      "suggestedNextTopics": ["Tema sugerido 1", "Tema sugerido 2"]
    }
    Crea al menos 5 preguntas variadas de opción múltiple. Asegúrate de que el JSON sea impecable.`;

    if (imageBase64) {
      contents.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || 'image/jpeg',
        }
      });
    }

    if (textPrompt) {
      promptText += `\nTexto adicional del estudiante: ${textPrompt}`;
    }

    contents.push(promptText);

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('No se pudo generar contenido con IA.');
    }

    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/parse-homework:', error);
    res.status(500).json({ error: error.message || 'Error al procesar la tarea con IA.' });
  }
});

// API Endpoint to generate suggested study topics and custom quizzes
app.post('/api/generate-topic-quiz', async (req, res) => {
  try {
    const { topic, subject, language, difficulty } = req.body;

    const model = 'gemini-2.5-flash-lite';
    const prompt = `Actúa como un tutor y aventurero espacial divertido para niños. Crea un cuestionario de estudio sobre el tema "${topic}" de la materia "${subject}", en idioma "${language || 'español'}" con nivel de dificultad "${difficulty || 'normal'}".
    Devuelve estrictamente un objeto JSON con esta estructura:
    {
      "title": "Título épico del desafío",
      "summary": "Breve explicación motivadora del tema.",
      "questions": [
        {
          "id": "q1",
          "question": "Pregunta...",
          "options": ["A", "B", "C", "D"],
          "correctIndex": 0,
          "explanation": "Explicación divertida..."
        }
      ]
    }
    Crea 5 preguntas emocionantes.`;

    const response = await ai.models.generateContent({
      model,
      contents: [prompt],
      config: { responseMimeType: 'application/json' }
    });

    const resultText = response.text;
    if (!resultText) throw new Error('Error generando quiz');
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('Error in /api/generate-topic-quiz:', error);
    res.status(500).json({ error: error.message || 'Error al generar quiz' });
  }
});

// AI Study Buddy Chat
app.post('/api/study-buddy-chat', async (req, res) => {
  try {
    const { message, contextTopic, language } = req.body;
    const model = 'gemini-2.5-flash-lite';

    const prompt = `Eres "RoboAmigo", un tutor virtual espacial súper amigable, cariñoso y motivador para niños. El estudiante te pregunta sobre "${contextTopic || 'estudios'}". Responde de forma breve, alegre, con emojis y en idioma "${language || 'español'}". Motívalo a seguir aprendiendo.
    Pregunta del niño: "${message}"`;

    const response = await ai.models.generateContent({
      model,
      contents: [prompt],
    });

    res.json({ reply: response.text || '¡Sigue así, lo estás haciendo genial! 🌟' });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({ reply: '¡Hola! Sigue practicando con entusiasmo. 🚀' });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
