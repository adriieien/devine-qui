import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Body:', JSON.stringify(req.body).substring(0, 100) + '...');
    next();
});

// xAI Setup (OpenAI-compatible API)
const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
});
const MODEL = "grok-code-fast-1";


// Game Logic - AI Persona
const SYSTEM_PROMPT = `
Tu es le maître du jeu pour "Devine Qui - Historique".
Ton rôle est d'incarner une IA qui pense à un personnage historique secret.
L'utilisateur va te poser des questions pour le deviner.

Règles impératives :
1. Tu ne dois JAMAIS révéler le nom du personnage, sauf si l'utilisateur a explicitement GAGNÉ en devinant le bon nom.
2. Tes réponses doivent être courtes (1-2 phrases maximum) et dans le style du jeu "Akinator" ou "Devine Qui".
3. Si la question est "Est-ce un homme ?", réponds simplement "Oui" ou "Non".
4. Si l'utilisateur demande un INDICE, donne un indice subtil mais utile.
5. Si l'utilisateur ABANDONNE, révèle le personnage avec une petite anecdote.
6. Si l'utilisateur tente de DEVINER le nom (ex: "Est-ce Napoléon ?") :
   - Si c'est le bon : CONFIRME avec enthousiasme.
   - Si c'est faux : Dis non et encourage à continuer.

Le personnage secret pour cette session est (envoyé dans la requête).
`;

// API Routes
app.post('/api/ask', async (req, res) => {
    try {
        const { message, character, history } = req.body;

        // Build messages array in OpenAI format
        const messages = [
            {
                role: "system",
                content: `${SYSTEM_PROMPT}\n\nLe personnage secret est : ${character.name}. Description : ${character.description}. Ses tags sont : ${character.tags.join(', ')}.`
            },
            {
                role: "assistant",
                content: "Compris. Je suis prêt à jouer. Je ne révélerai pas le nom. Pose ta question."
            },
            {
                role: "user",
                content: message
            }
        ];

        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: messages,
            max_tokens: 150,
        });

        const text = completion.choices[0].message.content;
        console.log("xAI response generated");

        res.json({ text: text });

    } catch (error) {
        console.error('Error calling xAI:', error);
        res.status(500).json({ text: `Désolé, j'ai eu un trou de mémoire (Erreur API: ${error.message}).` });
    }
});

// Production: Serve Frontend
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
