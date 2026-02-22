const STORAGE_KEY = 'devineQui_scores';
const MAX_SCORES = 20;

export class ScoreManager {
    static getScores() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    static saveScore({ characterName, score, rank, turns, maxTurns, hintsUsed, difficulty, mode, timeSeconds }) {
        const scores = ScoreManager.getScores();
        scores.push({
            characterName,
            score,
            rank,
            turns,
            maxTurns,
            hintsUsed,
            difficulty,
            mode,
            timeSeconds,
            date: new Date().toISOString()
        });

        // Sort by score descending, keep top N
        scores.sort((a, b) => b.score - a.score);
        const trimmed = scores.slice(0, MAX_SCORES);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        return trimmed;
    }

    static getBestScore() {
        const scores = ScoreManager.getScores();
        return scores.length > 0 ? scores[0] : null;
    }

    static clearScores() {
        localStorage.removeItem(STORAGE_KEY);
    }
}
