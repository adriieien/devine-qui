import { characters } from '../data/characters';

export class GameEngine {
    constructor() {
        this.secretCharacter = null;
        this.turnCount = 0;
        this.hintsUsed = 0; // New tracker
        this.maxTurns = 20;
        this.status = 'playing'; // 'playing', 'won', 'lost'
    }

    startNewGame() {
        // Filtrer uniquement les personnages français pour ce mode de jeu
        const frenchCharacters = characters.filter(c => c.tags.includes('france'));

        // Fallback si aucun personnage trouvé (pour éviter crash)
        const pool = frenchCharacters.length > 0 ? frenchCharacters : characters;

        const randomIndex = Math.floor(Math.random() * pool.length);
        this.secretCharacter = pool[randomIndex];
        this.turnCount = 0;
        this.hintsUsed = 0;
        this.status = 'playing';
        console.log("Secret Character (Debug):", this.secretCharacter.name);
        return {
            message: "Je pense à un personnage historique FRANÇAIS... 🇫🇷 Pose-moi une question !",
            sender: 'ai'
        };
    }

    // Tente de comprendre une question libre
    parseFreeQuestion(text) {
        const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Mots-clés pour le genre
        if (lower.includes('homme') || lower.includes('garcon') || lower.includes('male') || lower.includes('il est')) return { category: 'gender', value: 'm' };
        if (lower.includes('femme') || lower.includes('fille') || lower.includes('feminin') || lower.includes('elle est')) return { category: 'gender', value: 'f' };

        // Mots-clés pour les époques
        if (lower.includes('antiquite') || lower.includes('romain') || lower.includes('grec') || lower.includes('pharaon')) return { category: 'era', value: 'antiquité' };
        if (lower.includes('moyen') && lower.includes('age')) return { category: 'era', value: 'moyen-age' };
        if (lower.includes('renaissance')) return { category: 'era', value: 'renaissance' };
        if (lower.includes('19') || lower.includes('xix')) return { category: 'era', value: '19e' };
        if (lower.includes('20') || lower.includes('xx')) return { category: 'era', value: '20e' };

        // Mots-clés pour les continents/lieux
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

        // Mots-clés métiers/tags
        if (lower.includes('politique') || lower.includes('roi') || lower.includes('reine') || lower.includes('chef') || lower.includes('president') || lower.includes('dirigeant')) return { category: 'tag', value: 'politique' };
        if (lower.includes('science') || lower.includes('scientifique') || lower.includes('physique') || lower.includes('chimie') || lower.includes('inventeur')) return { category: 'tag', value: 'science' };
        if (lower.includes('art') || lower.includes('peintre') || lower.includes('artiste') || lower.includes('ecrivain') || lower.includes('auteur') || lower.includes('litterature')) return { category: 'tag', value: 'art' };
        if (lower.includes('guerre') || lower.includes('soldat') || lower.includes('armee') || lower.includes('general') || lower.includes('militaire')) return { category: 'tag', value: 'militaire' };
        if (lower.includes('religion') || lower.includes('saint') || lower.includes('dieu') || lower.includes('spirituel')) return { category: 'tag', value: 'religion' };
        if (lower.includes('prix nobel')) return { category: 'tag', value: 'nobel' };

        return null;
    }

    // Envoie la question à l'API via notre Backend
    async askQuestion(category, value) {
        if (this.status !== 'playing') return null;

        let userText = value;
        if (category === 'gender') userText = value === 'm' ? "Est-ce un homme ?" : "Est-ce une femme ?";
        if (category === 'tag') userText = `Est-ce lié à : ${value} ?`;
        if (category === 'era') userText = `A-t-il vécu durant : ${value} ?`;

        if (category === 'free-text') {
            userText = value;

            // SMART GUESS DETECTION
            // Si l'utilisateur tape le nom du personnage dans la question, on considère que c'est une victoire
            const normalizedValue = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normalizedName = this.secretCharacter.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            // On vérifie si le nom est présent dans la phrase (ex: "est-ce moliere ?")
            // Ou si l'entrée est très proche du nom
            if (normalizedValue.includes(normalizedName) || normalizedName.includes(normalizedValue)) {
                // On évite les faux positifs sur les mots courts (ex: "le", "un")
                if (normalizedValue.length > 3) {
                    console.log("Smart Guess Detected!", { value, secret: this.secretCharacter.name });
                    return this.guessCharacter(value);
                }
            }
        }

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
            console.log("Envoi requête à http://localhost:3001/api/ask", { userText });
            const response = await fetch('http://localhost:3001/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    character: this.secretCharacter,
                    history: []
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

    // Pour l'instant, l'indice reste local pour économiser des tokens, ou on peut le demander à l'IA
    getHint() {
        if (this.status !== 'playing') return null;
        this.turnCount += 2;
        this.hintsUsed += 1;

        const availableTags = this.secretCharacter.tags;
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
        const penaltyPerTurn = 40; // Moins punitif par tour
        const penaltyPerHint = 150; // Très punitif sur les indices

        let score = baseScore;
        score -= (this.turnCount * penaltyPerTurn);
        score -= (this.hintsUsed * penaltyPerHint);

        // Bonus rapidité (si trouvé en moins de 5 tours)
        if (this.turnCount <= 5) score += 300;

        score = Math.max(0, score); // Pas de score négatif

        let rank = "F";
        if (score >= 1400) rank = "S+ 👑";
        else if (score >= 1200) rank = "S 🏆";
        else if (score >= 1000) rank = "A 🥇";
        else if (score >= 800) rank = "B 🥈";
        else if (score >= 500) rank = "C 🥉";
        else rank = "D 😐";

        return { score, rank };
    }

    // La devinette reste locale pour éviter la triche / hallucination, ou on peut demander à l'IA de valider
    // Pour ce prototype, on garde la validation stricte locale pour être sûr de la victoire.
    async guessCharacter(name) {
        if (this.status !== 'playing') return null;

        const targetName = this.secretCharacter.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const guessName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Validation locale pour être sûr
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
            // Optionnel : Demander à l'IA de générer un message de refus gentil
            this.turnCount++;
            return {
                text: "Non, ce n'est pas lui/elle. Essaie encore.",
                status: 'continue',
                sender: 'ai'
            };
        }
    }
}
