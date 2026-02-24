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


// Game Logic - AI Persona (Précision accrue, réponses factuelles)
const SYSTEM_PROMPT_HISTORIQUE = `Jeu "Devine Qui". Tu penses à un personnage historique secret. Réponds aux questions par Oui/Non suivi d'une précision factuelle courte (ex: "Oui, il était empereur des Français"). Sois PRÉCIS : nomme les pays, les titres et les œuvres majeures. Max 1-2 phrases. Ne révèle JAMAIS le nom du personnage.`;

const SYSTEM_PROMPT_FOOTBALL = `Jeu "Devine Qui - Football". Tu penses à un footballeur secret. Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du joueur.
- SOIS PRÉCIS : Si on demande ses clubs, NOMME-LES (ex: "Il a joué au Real Madrid et à la Juventus"). Nomme aussi les trophées et nationalités.
- Réponds par Oui/Non suivi d'une info précise. Max 1-2 phrases. Sois direct.`;

const SYSTEM_PROMPT_BASKETBALL = `Jeu "Devine Qui - Basket". Tu penses à un joueur de basket secret. Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du joueur.
- SOIS PRÉCIS : NOMME les franchises NBA, les titres (ex: "Il a gagné 4 titres avec les Warriors") et les distinctions.
- Réponds par Oui/Non suivi d'une info précise. Max 1-2 phrases.`;

const SYSTEM_PROMPT_TENNIS = `Jeu "Devine Qui - Tennis". Tu penses à un joueur/joueuse de tennis secret(e). Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du joueur.
- SOIS PRÉCIS : NOMME les tournois du Grand Chelem gagnés, les rivaux historiques et les nationalités.
- Réponds par Oui/Non suivi d'une info précise. Max 1-2 phrases.`;

const SYSTEM_PROMPT_RUGBY = `Jeu "Devine Qui - Rugby". Tu penses à un joueur de rugby secret. Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du joueur.
- SOIS PRÉCIS : NOMME les clubs, les sélections nationales et les trophées majeurs.
- Réponds par Oui/Non suivi d'une info précise. Max 1-2 phrases.`;

const SYSTEM_PROMPT_F1 = `Jeu "Devine Qui - F1". Tu penses à un pilote de Formule 1 secret. Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du pilote.
- SOIS PRÉCIS : NOMME les écuries (ex: "Il a couru pour Ferrari et Mercedes"), les circuits iconiques et le nombre de titres.
- Réponds par Oui/Non suivi d'une info précise. Max 1-2 phrases.`;

const SYSTEM_PROMPT_CYCLISME = `Jeu "Devine Qui - Cyclisme". Tu penses à un cycliste secret. Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du cycliste.
- SOIS PRÉCIS : NOMME les équipes, les courses gagnées (ex: "Il a remporté Paris-Roubaix 3 fois") et les maillots distinctifs.
- Réponds par Oui/Non suivi d'une info précise. Max 1-2 phrases.`;

const SYSTEM_PROMPT_BOXE = `Jeu "Devine Qui - Boxe". Tu penses à un boxeur/boxeuse secret(e). Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du boxeur.
- SOIS PRÉCIS : NOMME les catégories, les titres mondiaux et les combats de légende.
- Réponds par Oui/Non suivi d'une info précise. Max 1-2 phrases.`;

const SYSTEM_PROMPT_MMA = `Jeu "Devine Qui - MMA/UFC". Tu penses à un combattant/combattante de MMA secret(e). Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du combattant.
- SOIS PRÉCIS : NOMME l'organisation (UFC, PFL), les ceintures détenues et le style dominant.
- Réponds par Oui/Non suivi d'une info précise. Max 1-2 phrases.`;

const SYSTEM_PROMPT_DAILY = `Jeu "Devine Qui - Défi Quotidien". Tu penses à une personnalité célèbre. Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom, surnom ou initiales.
- SOIS PRÉCIS ET GÉNÉREUX : Nomme les faits marquants, les lieux, les dates clés et les domaines précis (ex: "Oui, c'est un physicien allemand connu pour la théorie de la relativité").
- Réponds par Oui/Non suivi d'une explication claire. Max 2 phrases.`;

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
