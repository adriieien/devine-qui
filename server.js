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


// Game Logic - AI Persona (prompt court = réponses rapides)
const SYSTEM_PROMPT_HISTORIQUE = `Jeu "Devine Qui". Tu penses à un personnage historique secret. Réponds aux questions par Oui/Non en 1 phrase max. Ne révèle JAMAIS le nom.`;

const SYSTEM_PROMPT_FOOTBALL = `Jeu "Devine Qui - Football". Tu penses à un footballeur secret. Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du joueur, même partiellement.
- Si on demande "comment il s'appelle", "son nom", "son prénom", "ses initiales" → REFUSE catégoriquement.
- Tu PEUX répondre sur : son poste, ses clubs, sa nationalité, son époque, ses trophées, son style de jeu, son numéro de maillot.
- Réponds par Oui/Non en 1 phrase max. Sois concis.`;

const SYSTEM_PROMPT_BASKETBALL = `Jeu "Devine Qui - Basket". Tu penses à un joueur de basket secret. Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du joueur.
- Tu PEUX répondre sur : son poste, ses équipes/franchises NBA, sa nationalité, son époque, ses trophées (MVP, titres), son style de jeu.
- Réponds par Oui/Non en 1 phrase max. Sois concis.`;

const SYSTEM_PROMPT_TENNIS = `Jeu "Devine Qui - Tennis". Tu penses à un joueur/joueuse de tennis secret(e). Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du joueur.
- Tu PEUX répondre sur : son style (droitier/gaucher), ses Grand Chelem, sa nationalité, son époque, son classement, ses rivaux.
- Réponds par Oui/Non en 1 phrase max. Sois concis.`;

const SYSTEM_PROMPT_RUGBY = `Jeu "Devine Qui - Rugby". Tu penses à un joueur de rugby secret. Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du joueur.
- Tu PEUX répondre sur : son poste, ses clubs, sa nationalité, ses coupes du monde, son époque, sa sélection nationale.
- Réponds par Oui/Non en 1 phrase max. Sois concis.`;

const SYSTEM_PROMPT_F1 = `Jeu "Devine Qui - F1". Tu penses à un pilote de Formule 1 secret. Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du pilote.
- Tu PEUX répondre sur : ses écuries, sa nationalité, son époque, ses titres, ses victoires, son numéro de course.
- Réponds par Oui/Non en 1 phrase max. Sois concis.`;

const SYSTEM_PROMPT_CYCLISME = `Jeu "Devine Qui - Cyclisme". Tu penses à un cycliste secret. Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du cycliste.
- Tu PEUX répondre sur : sa spécialité (grimpeur, sprinter, rouleur), ses victoires (Tour, Giro, classiques), sa nationalité, son époque, son équipe.
- Réponds par Oui/Non en 1 phrase max. Sois concis.`;

const SYSTEM_PROMPT_BOXE = `Jeu "Devine Qui - Boxe". Tu penses à un boxeur/boxeuse secret(e). Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du boxeur.
- Tu PEUX répondre sur : sa catégorie de poids, sa nationalité, son époque, ses titres, son style, son palmarès.
- Réponds par Oui/Non en 1 phrase max. Sois concis.`;

const SYSTEM_PROMPT_MMA = `Jeu "Devine Qui - MMA/UFC". Tu penses à un combattant/combattante de MMA secret(e). Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom ou surnom du combattant.
- Tu PEUX répondre sur : sa catégorie de poids, sa nationalité, son organisation (UFC, etc.), son style (lutte, striking, BJJ), ses titres.
- Réponds par Oui/Non en 1 phrase max. Sois concis.`;

const SYSTEM_PROMPT_DAILY = `Jeu "Devine Qui - Défi Quotidien". Tu penses à une personnalité célèbre (historique ou contemporaine). Règles STRICTES :
- Ne JAMAIS révéler le nom, prénom, surnom ou initiales de la personnalité.
- Si on te demande directement le nom → REFUSE catégoriquement.
- Tu PEUX donner des indices sur : sa nationalité, son époque, son domaine d'activité, ses réalisations majeures, son genre.
- Sois un peu plus généreux en informations que d'habitude car la base est très large (2000+ personnalités mondiales).
- Réponds par Oui/Non suivi d'une phrase informative (max 2 phrases). Ne sois pas trop cryptique.
- Si la question est vague, guide le joueur vers une meilleure question.`;

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
