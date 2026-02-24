import { characters } from '../data/characters';
import { footballers } from '../data/footballers';
import { cyclists } from '../data/cyclists';
import { mmaFighters } from '../data/mmaFighters';
import { boxers } from '../data/boxers';
import { basketballPlayers } from '../data/basketballPlayers';
import { rugbyPlayers } from '../data/rugbyPlayers';
import { tennisPlayers } from '../data/tennisPlayers';
import { f1Drivers } from '../data/f1Drivers';

// Difficulty settings
const DIFFICULTY_CONFIG = {
    easy: {
        label: 'Facile',
        maxTurns: 25,
        // Well-known characters only
        filter: (chars) => chars.filter(c =>
            ['napoleon', 'louis_xiv', 'de_gaulle', 'marie_curie', 'victor_hugo', 'moliere',
                'jeanne_darc', 'voltaire', 'louis_xvi', 'marie_antoinette', 'pasteur',
                'vercingetorix', 'charlemagne', 'monet', 'coco_chanel', 'edith_piaf',
                'zinedine_zidane', 'louis_de_funes', 'saint_exupery', 'jules_verne',
                'brigitte_bardot', 'jean_moulin', 'robespierre', 'dumas', 'rousseau',
                'henri_iv', 'descartes', 'josephine_baker', 'alain_delon', 'eiffel',
                'verne'].includes(c.id)
        )
    },
    medium: {
        label: 'Moyen',
        maxTurns: 20,
        filter: (chars) => chars // All characters
    },
    hard: {
        label: 'Difficile',
        maxTurns: 15,
        // Exclude the most well-known characters
        filter: (chars) => chars.filter(c =>
            !['napoleon', 'louis_xiv', 'de_gaulle', 'marie_curie', 'victor_hugo',
                'jeanne_darc', 'voltaire', 'zinedine_zidane', 'louis_de_funes',
                'coco_chanel', 'edith_piaf', 'monet'].includes(c.id)
        )
    }
};

export class GameEngine {
    constructor() {
        this.secretCharacter = null;
        this.turnCount = 0;
        this.totalQuestionsAsked = 0; // counts every question even if multiple per message
        this.hintsUsed = 0;
        this.maxTurns = 20;
        this.status = 'playing';
        this.difficulty = 'medium';
        this.mode = 'france'; // 'france' or 'world'
        this.gameMode = 'historique'; // 'historique' or 'football'
        this.startTime = null;
    }

    startNewGame(options = {}) {
        this.difficulty = options.difficulty || 'medium';
        this.mode = options.mode || 'france';
        this.gameMode = options.gameMode || 'historique';

        const config = DIFFICULTY_CONFIG[this.difficulty] || DIFFICULTY_CONFIG.medium;
        this.maxTurns = config.maxTurns;

        let pool;

        // Daily mode: character provided externally
        if (this.gameMode === 'daily' && options.dailyCharacter) {
            this.secretCharacter = options.dailyCharacter;
            this.maxTurns = 30;
            this.turnCount = 0;
            this.totalQuestionsAsked = 0;
            this.hintsUsed = 0;
            this._revealedTags = [];
            this.status = 'playing';
            this.startTime = Date.now();
            console.log("Daily Character (Debug):", this.secretCharacter.name);
            return {
                text: `📅 Défi Quotidien ! Je pense à une personnalité célèbre... Tu as 30 questions pour deviner ! Pose-moi une question !`,
                sender: 'ai'
            };
        }

        // Sport mode data mapping
        const SPORT_POOLS = {
            football: footballers,
            basketball: basketballPlayers,
            tennis: tennisPlayers,
            rugby: rugbyPlayers,
            f1: f1Drivers,
            cyclisme: cyclists,
            boxe: boxers,
            mma: mmaFighters,
        };

        if (SPORT_POOLS[this.gameMode]) {
            pool = [...SPORT_POOLS[this.gameMode]];
            this.maxTurns = 15;
        } else {
            // Historical mode: filter by region
            if (this.mode === 'france') {
                pool = characters.filter(c => c.tags.includes('france'));
            } else {
                pool = [...characters];
            }
            pool = config.filter(pool);
        }

        // Fallback
        if (pool.length === 0) pool = SPORT_POOLS[this.gameMode] || characters;

        // --- NO-REPEAT LOGIC ---
        const storageKey = `played_ids_${this.gameMode}_${this.mode}`;
        let playedIds = [];
        try {
            const saved = localStorage.getItem(storageKey);
            playedIds = saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load played IDs", e);
        }

        // Filter pool to exclude played IDs
        let remainingPool = pool.filter(c => !playedIds.includes(c.id));

        // If pool is exhausted, reset
        if (remainingPool.length === 0) {
            console.log("Pool exhausted, resetting played list.");
            playedIds = [];
            remainingPool = pool;
        }

        const randomIndex = Math.floor(Math.random() * remainingPool.length);
        this.secretCharacter = remainingPool[randomIndex];

        // Save new ID
        playedIds.push(this.secretCharacter.id);
        localStorage.setItem(storageKey, JSON.stringify(playedIds));
        // --- END NO-REPEAT LOGIC ---

        this.turnCount = 0;
        this.totalQuestionsAsked = 0;
        this.hintsUsed = 0;
        this._revealedTags = [];
        this.status = 'playing';
        this.startTime = Date.now();

        console.log("Secret Character (Debug):", this.secretCharacter.name);

        // Sport mode labels
        const SPORT_LABELS = {
            football: '⚽ un footballeur',
            basketball: '🏀 un joueur de basket',
            tennis: '🎾 un joueur/une joueuse de tennis',
            rugby: '🏉 un joueur de rugby',
            f1: '🏎️ un pilote de F1',
            cyclisme: '🚴 un cycliste',
            boxe: '🥊 un boxeur/une boxeuse',
            mma: '🥋 un combattant/une combattante de MMA',
        };

        if (SPORT_LABELS[this.gameMode]) {
            return {
                text: `${SPORT_LABELS[this.gameMode].split(' ')[0]} Je pense à ${SPORT_LABELS[this.gameMode]}... Tu as ${this.maxTurns} questions pour deviner ! Pose-moi une question !`,
                sender: 'ai'
            };
        }

        const modeLabel = this.mode === 'france' ? 'FRANÇAIS 🇫🇷' : 'du MONDE 🌍';
        const diffLabel = config.label;

        return {
            text: `Je pense à un personnage historique ${modeLabel}... (${diffLabel}) Pose-moi une question !`,
            sender: 'ai'
        };
    }

    getElapsedSeconds() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    // Count number of questions in a message to prevent spamming
    _countQuestions(text) {
        if (!text || typeof text !== 'string') return 1;

        // Count question marks
        const questionMarks = (text.match(/\?/g) || []).length;

        // Count distinct lines/sentences (split by newline, period, semicolon)
        const sentences = text.split(/[\n;]+/).filter(s => s.trim().length > 3);

        // The number of questions is the max of question marks found and sentence count
        // but always at least 1 (a message always costs at least 1 turn)
        const count = Math.max(questionMarks, sentences.length, 1);
        return count;
    }

    // Tente de comprendre une question libre
    parseFreeQuestion(text) {
        const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (lower.includes('homme') || lower.includes('garcon') || lower.includes('male') || lower.includes('il est')) return { category: 'gender', value: 'm' };
        if (lower.includes('femme') || lower.includes('fille') || lower.includes('feminin') || lower.includes('elle est')) return { category: 'gender', value: 'f' };

        if (lower.includes('antiquite') || lower.includes('romain') || lower.includes('grec') || lower.includes('pharaon')) return { category: 'era', value: 'antiquité' };
        if (lower.includes('moyen') && lower.includes('age')) return { category: 'era', value: 'moyen-age' };
        if (lower.includes('renaissance')) return { category: 'era', value: 'renaissance' };
        if (lower.includes('19') || lower.includes('xix')) return { category: 'era', value: '19e' };
        if (lower.includes('20') || lower.includes('xx')) return { category: 'era', value: '20e' };

        if (lower.includes('france') || lower.includes('francais')) return { category: 'tag', value: 'france' };
        if (lower.includes('allemagne') || lower.includes('allemand')) return { category: 'tag', value: 'allemagne' };
        if (lower.includes('angleterre') || lower.includes('anglais') || lower.includes('britannique')) return { category: 'tag', value: 'angleterre' };
        if (lower.includes('italie') || lower.includes('italien')) return { category: 'tag', value: 'italie' };
        if (lower.includes('inde') || lower.includes('indien')) return { category: 'tag', value: 'inde' };
        if (lower.includes('egypte') || lower.includes('egyptien')) return { category: 'tag', value: 'egypte' };

        if (lower.includes('europe')) return { category: 'continent', value: 'europe' };
        if (lower.includes('asie')) return { category: 'continent', value: 'asie' };
        if (lower.includes('afrique')) return { category: 'continent', value: 'afrique' };
        if (lower.includes('amerique') || lower.includes('usa')) return { category: 'continent', value: 'usa' };

        if (lower.includes('politique') || lower.includes('roi') || lower.includes('reine') || lower.includes('chef') || lower.includes('president') || lower.includes('dirigeant')) return { category: 'tag', value: 'politique' };
        if (lower.includes('science') || lower.includes('scientifique') || lower.includes('physique') || lower.includes('chimie') || lower.includes('inventeur')) return { category: 'tag', value: 'science' };
        if (lower.includes('art') || lower.includes('peintre') || lower.includes('artiste') || lower.includes('ecrivain') || lower.includes('auteur') || lower.includes('litterature')) return { category: 'tag', value: 'art' };
        if (lower.includes('guerre') || lower.includes('soldat') || lower.includes('armee') || lower.includes('general') || lower.includes('militaire')) return { category: 'tag', value: 'militaire' };
        if (lower.includes('religion') || lower.includes('saint') || lower.includes('dieu') || lower.includes('spirituel')) return { category: 'tag', value: 'religion' };
        if (lower.includes('prix nobel')) return { category: 'tag', value: 'nobel' };

        return null;
    }

    async askQuestion(category, value) {
        if (this.status !== 'playing') return null;

        let userText = value;
        if (category === 'gender') userText = value === 'm' ? "Est-ce un homme ?" : "Est-ce une femme ?";
        if (category === 'tag') userText = `Est-ce lié à : ${value} ?`;
        if (category === 'era') userText = `A-t-il vécu durant : ${value} ?`;

        if (category === 'free-text') {
            userText = value;

            // SMART GUESS DETECTION
            const normalizedValue = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normalizedName = this.secretCharacter.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (normalizedValue.includes(normalizedName)) {
                return this.guessCharacter(value);
            }

            const secretWords = normalizedName.split(' ').filter(w => w.length > 2 || w === 'xiv' || w === 'xvi');
            let matchCount = 0;
            for (const word of secretWords) {
                if (normalizedValue.includes(word)) matchCount++;
            }
            const hasLongWordMatch = secretWords.some(w => w.length > 3 && normalizedValue.includes(w));
            if (hasLongWordMatch || (matchCount >= 2 && secretWords.length > 0)) {
                return this.guessCharacter(value);
            }
        }

        // Count number of questions in the message for score penalty
        const questionCount = this._countQuestions(value);
        this.totalQuestionsAsked += questionCount;
        this.turnCount++;

        if (this.turnCount >= this.maxTurns) {
            this.status = 'lost';
            return {
                text: `Tu as posé trop de questions ! Mon personnage était ${this.secretCharacter.name}.`,
                answer: 'lost',
                sender: 'ai'
            };
        }

        try {
            const API_BASE = import.meta.env.PROD ? 'https://devine-qui.onrender.com' : 'http://localhost:3001';
            const response = await fetch(`${API_BASE}/api/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    character: this.secretCharacter,
                    history: [],
                    gameMode: this.gameMode
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return {
                text: data.text,
                sender: 'ai'
            };

        } catch (e) {
            console.error("ERREUR CRITIQUE GameEngine:", e);
            return {
                text: `Oups, je n'arrive pas à réfléchir (Erreur connexion serveur : ${e.message}).`,
                sender: 'ai'
            };
        }
    }

    getHint() {
        if (this.status !== 'playing') return null;
        this.turnCount += 2;
        this.hintsUsed += 1;

        const availableTags = this.secretCharacter.tags;

        // Sport-specific tag category labels for better hints
        const TAG_CATEGORIES = {
            football: { nationality: ['france', 'brésil', 'argentine', 'espagne', 'portugal', 'allemagne', 'italie', 'angleterre', 'pays-bas', 'belgique', 'cameroun', 'côte-d-ivoire', 'sénégal', 'usa', 'mexique', 'colombie', 'uruguay', 'croatie', 'danemark'], position: ['gardien', 'défenseur', 'milieu', 'attaquant', 'ailier'], era: ['20e', '21e'] },
            basketball: { nationality: ['usa', 'france', 'grèce', 'nigeria', 'serbie', 'slovénie', 'cameroun', 'allemagne'], position: ['meneur', 'arrière', 'ailier', 'ailier-fort', 'pivot'], league: ['nba'], era: ['20e', '21e'] },
            tennis: { nationality: ['suisse', 'espagne', 'serbie', 'france', 'usa', 'grande-bretagne', 'allemagne', 'suède', 'pologne', 'italie', 'russie'], style: ['revers-à-une-main', 'service-volée', 'terre-battue', 'défensif'], tournament: ['grand-chelem', 'wimbledon', 'roland-garros', 'us-open', 'open-australie'], era: ['20e', '21e'] },
            rugby: { nationality: ['france', 'nouvelle-zélande', 'afrique-du-sud', 'angleterre', 'australie', 'irlande', 'pays-de-galles'], position: ['ouvreur', 'demi-de-mêlée', 'ailier', 'centre', 'arrière', 'deuxième-ligne', 'troisième-ligne', 'pilier', 'talonneur'], era: ['20e', '21e'] },
            f1: { nationality: ['grande-bretagne', 'allemagne', 'brésil', 'france', 'espagne', 'finlande', 'pays-bas', 'autriche', 'australie', 'monaco', 'canada', 'argentine'], team: ['ferrari', 'mclaren', 'mercedes', 'red-bull', 'williams', 'renault', 'lotus', 'alpine', 'aston-martin'], era: ['20e', '21e'] },
            cyclisme: { nationality: ['belgique', 'france', 'italie', 'espagne', 'colombie', 'slovénie', 'grande-bretagne', 'pays-bas', 'usa', 'suisse', 'danemark'], specialty: ['grimpeur', 'sprinter', 'puncheur', 'rouleur', 'contre-la-montre', 'classiques', 'polyvalent'], race: ['tour-de-france', 'giro', 'vuelta'], era: ['20e', '21e'] },
            boxe: { nationality: ['usa', 'mexique', 'grande-bretagne', 'ukraine', 'japon', 'philippines', 'cuba', 'russie', 'france', 'panama'], weight: ['poids-lourd', 'poids-mi-lourd', 'poids-moyen', 'poids-super-moyen', 'poids-welter', 'poids-léger', 'poids-plume', 'poids-coq', 'poids-super-coq', 'poids-super-léger'], era: ['20e', '21e'] },
            mma: { nationality: ['usa', 'brésil', 'russie', 'irlande', 'nigeria', 'cameroun', 'australie', 'canada', 'espagne'], weight: ['poids-lourd', 'poids-mi-lourd', 'poids-moyen', 'poids-welter', 'poids-léger', 'poids-plume', 'poids-coq', 'poids-mouche'], style: ['lutte', 'striker', 'grappling', 'jiu-jitsu', 'muay-thai', 'boxe', 'kickboxing', 'sambo'], era: ['20e', '21e'] },
        };

        const CATEGORY_LABELS = {
            nationality: '🌍 Nationalité',
            position: '📋 Poste',
            league: '🏟️ Ligue',
            team: '🏁 Écurie',
            style: '🎯 Style',
            specialty: '⚡ Spécialité',
            tournament: '🏆 Tournoi',
            race: '🚴 Course',
            weight: '⚖️ Catégorie',
            era: '📅 Époque',
        };

        // Try to find a categorized hint
        const categories = TAG_CATEGORIES[this.gameMode];
        if (categories) {
            // Collect tags not yet revealed
            if (!this._revealedTags) this._revealedTags = [];
            const unrevealed = availableTags.filter(t => !this._revealedTags.includes(t));
            if (unrevealed.length === 0) {
                return { text: `💡 Indice: ${this.secretCharacter.description.split('.')[0]}.`, sender: 'ai' };
            }

            const randomTag = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            this._revealedTags.push(randomTag);

            // Find which category this tag belongs to
            let label = '💡 Info';
            for (const [cat, values] of Object.entries(categories)) {
                if (values.includes(randomTag)) {
                    label = CATEGORY_LABELS[cat] || `💡 ${cat}`;
                    break;
                }
            }

            return { text: `${label} : ${randomTag}`, sender: 'ai' };
        }

        // Fallback for historique mode
        const randomTag = availableTags[Math.floor(Math.random() * availableTags.length)];
        return {
            text: `💡 Indice: C'est lié à "${randomTag}".`,
            sender: 'ai'
        };
    }

    giveUp() {
        this.status = 'lost';
        return {
            text: `Dommage ! Je pensais à ${this.secretCharacter.name}. ${this.secretCharacter.description}`,
            answer: 'lost',
            sender: 'ai'
        };
    }

    calculateScore() {
        const baseScore = 1500;
        const penaltyPerQuestion = 40;
        const penaltyPerHint = 150;

        let score = baseScore;
        // Use totalQuestionsAsked: spamming many questions in 1 message = more penalty
        score -= (this.totalQuestionsAsked * penaltyPerQuestion);
        score -= (this.hintsUsed * penaltyPerHint);

        // Bonus rapidité tours
        if (this.turnCount <= 5) score += 300;

        // Bonus chrono (temps)
        const elapsed = this.getElapsedSeconds();
        if (elapsed < 60) score += 200;       // < 1 min
        else if (elapsed < 120) score += 100;  // < 2 min
        else if (elapsed < 180) score += 50;   // < 3 min
        // Pénalité si très lent
        if (elapsed > 300) score -= 100;       // > 5 min

        // Bonus difficulté
        if (this.difficulty === 'hard') score += 200;
        else if (this.difficulty === 'easy') score -= 100;

        score = Math.max(0, score);

        let rank = "F";
        if (score >= 1600) rank = "S+ 👑";
        else if (score >= 1400) rank = "S 🏆";
        else if (score >= 1200) rank = "A 🥇";
        else if (score >= 1000) rank = "B 🥈";
        else if (score >= 700) rank = "C 🥉";
        else if (score >= 400) rank = "D 😐";
        else rank = "F 💀";

        return { score, rank };
    }

    async guessCharacter(name) {
        if (this.status !== 'playing') return null;

        const targetName = this.secretCharacter.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const guessName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (targetName === guessName || targetName.includes(guessName)) {
            this.status = 'won';
            const { score, rank } = this.calculateScore();

            return {
                text: `🎉 Bravo ! Tu as trouvé. C'était bien ${this.secretCharacter.name}. ${this.secretCharacter.description}`,
                status: 'won',
                sender: 'ai',
                score: score,
                rank: rank
            };
        } else {
            this.turnCount++;
            return {
                text: "Non, ce n'est pas lui/elle. Essaie encore.",
                status: 'continue',
                sender: 'ai'
            };
        }
    }
}
