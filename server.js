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
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body).substring(0, 100) + '...');
    }
    next();
});

// xAI Setup (OpenAI-compatible API)
const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
});
const MODEL = "grok-3";


// Game Logic - AI Persona (Précision équilibrée)
const SYSTEM_PROMPT_HISTORIQUE = `Jeu "Devine Qui". Tu penses à un personnage historique secret. Réponds précisément à la question par Oui/Non suivi d'une info courte. Si on demande un fait précis (lieu, date, titre), donne-le sans trop en rajouter. Max 1 phrase. Ne révèle JAMAIS le nom.`;

const SYSTEM_PROMPT_FOOTBALL = `Jeu "Devine Qui - Football". Tu penses à un footballeur secret. Règles :
- Ne JAMAIS révéler le nom, prénom ou surnom.
- PRÉCISION CIBLÉE : Réponds précisément à la question. Si on demande les clubs, NOMME-LES. Si on demande les trophées, donne le nombre ou les noms sans ajouter l'équipe sauf si demandé.
- Réponds par Oui/Non + info précise. Sois très concis (1 phrase).`;

const SYSTEM_PROMPT_BASKETBALL = `Jeu "Devine Qui - Basket". Tu penses à un joueur de basket secret. Règles :
- Ne JAMAIS révéler le nom, prénom ou surnom.
- PRÉCISION CIBLÉE : Nomme les franchises ou les titres si demandé, mais ne donne que ce qui est demandé.
- Réponds par Oui/Non + info précise. Sois très concis (1 phrase).`;

const SYSTEM_PROMPT_TENNIS = `Jeu "Devine Qui - Tennis". Tu penses à un joueur/joueuse de tennis secret(e). Règles :
- Ne JAMAIS révéler le nom, prénom ou surnom.
- PRÉCISION CIBLÉE : Donne les noms des tournois ou le nombre de titres précisément.
- Réponds par Oui/Non + info précise. Sois très concis (1 phrase).`;

const SYSTEM_PROMPT_RUGBY = `Jeu "Devine Qui - Rugby". Tu penses à un joueur de rugby secret.
- Ne JAMAIS révéler le nom, prénom ou surnom.
- PRÉCISION CIBLÉE : Répons précisément sur les clubs ou sélections si demandé.
- Réponds par Oui/Non + info précise. Sois très concis (1 phrase).`;

const SYSTEM_PROMPT_F1 = `Jeu "Devine Qui - F1". Tu penses à un pilote de F1 secret.
- Ne JAMAIS révéler le nom, prénom ou surnom.
- PRÉCISION CIBLÉE : Nomme les écuries ou titres si demandé.
- Réponds par Oui/Non + info précise. Sois très concis (1 phrase).`;

const SYSTEM_PROMPT_CYCLISME = `Jeu "Devine Qui - Cyclisme". Tu penses à un cycliste secret.
- Ne JAMAIS révéler le nom, prénom ou surnom.
- PRÉCISION CIBLÉE : Nomme les courses ou équipes si demandé.
- Réponds par Oui/Non + info précise. Sois très concis (1 phrase).`;

const SYSTEM_PROMPT_BOXE = `Jeu "Devine Qui - Boxe". Tu penses à un boxeur secret.
- Ne JAMAIS révéler le nom, prénom ou surnom.
- PRÉCISION CIBLÉE : Nomme les catégories ou titres si demandé.
- Réponds par Oui/Non + info précise. Sois très concis (1 phrase).`;

const SYSTEM_PROMPT_MMA = `Jeu "Devine Qui - MMA". Tu penses à un combattant secret.
- Ne JAMAIS révéler le nom, prénom ou surnom.
- PRÉCISION CIBLÉE : Nomme l'organisation ou titres si demandé.
- Réponds par Oui/Non + info précise. Sois très concis (1 phrase).`;

const SYSTEM_PROMPT_DAILY = `Jeu "Devine Qui - Défi Quotidien". Tu penses à une personnalité célèbre.
- Ne JAMAIS révéler le nom, prénom, surnom ou initiales.
- PRÉCISION CIBLÉE : Réponds précisément à la question. Sois informatif mais reste concis (max 1-2 phrases).`;

const SYSTEM_PROMPTS = {
    historique: SYSTEM_PROMPT_HISTORIQUE,
    football: SYSTEM_PROMPT_FOOTBALL,
    basketball: SYSTEM_PROMPT_BASKETBALL,
    tennis: SYSTEM_PROMPT_TENNIS,
    rugby: SYSTEM_PROMPT_RUGBY,
    f1: SYSTEM_PROMPT_F1,
    cyclisme: SYSTEM_PROMPT_CYCLISME,
    boxe: SYSTEM_PROMPT_BOXE,
    mma: SYSTEM_PROMPT_MMA,
    daily: SYSTEM_PROMPT_DAILY,
};

// API Routes
app.post('/api/ask', async (req, res) => {
    try {
        const { message, character, history, gameMode } = req.body;

        const systemPrompt = SYSTEM_PROMPTS[gameMode] || SYSTEM_PROMPT_HISTORIQUE;

        // Build messages array in OpenAI format
        const messages = [
            {
                role: "system",
                content: `${systemPrompt}\n\nLe personnage secret est : ${character.name}. Description : ${character.description}. Ses tags sont : ${character.tags.join(', ')}.`
            },
            {
                role: "assistant",
                content: "Compris. Je ne révélerai jamais le nom. Pose ta question."
            },
            {
                role: "user",
                content: message
            }
        ];

        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: messages,
            max_tokens: 80,
            temperature: 0,
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

// Serve Frontend (production)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
