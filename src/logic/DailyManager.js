import { getDailyCharacter, getDailyNumber } from '../data/daily/dailyPool.js';

const STORAGE_KEY = 'devine_qui_daily';

function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadData() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const DailyManager = {
    getTodayKey,

    getTodayCharacter() {
        return getDailyCharacter(getTodayKey());
    },

    getDailyNumber() {
        return getDailyNumber(getTodayKey());
    },

    hasPlayedToday() {
        const data = loadData();
        return !!data[getTodayKey()];
    },

    saveResult({ won, turnsUsed, maxTurns, characterName }) {
        const data = loadData();
        const today = getTodayKey();
        data[today] = {
            won,
            turnsUsed,
            maxTurns,
            characterName,
            timestamp: Date.now(),
        };
        saveData(data);
    },

    getResult() {
        const data = loadData();
        return data[getTodayKey()] || null;
    },

    getStreak() {
        const data = loadData();
        let streak = 0;
        const d = new Date();
        while (true) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const entry = data[key];
            if (!entry || !entry.won) break;
            streak++;
            d.setDate(d.getDate() - 1);
        }
        return streak;
    },

    getStats() {
        const data = loadData();
        const entries = Object.values(data);
        const played = entries.length;
        const wins = entries.filter(e => e.won).length;
        const avgTurns = wins > 0
            ? Math.round(entries.filter(e => e.won).reduce((a, e) => a + e.turnsUsed, 0) / wins)
            : 0;
        return { played, wins, winRate: played > 0 ? Math.round((wins / played) * 100) : 0, avgTurns, streak: this.getStreak() };
    },

    generateShareText() {
        const result = this.getResult();
        if (!result) return '';
        const num = this.getDailyNumber();
        const squares = result.won
            ? '🟩'.repeat(Math.min(result.turnsUsed, 10)) + (result.turnsUsed > 10 ? '…' : '')
            : '🟥'.repeat(Math.min(result.turnsUsed, 10)) + '…';
        const status = result.won
            ? `✅ Trouvé en ${result.turnsUsed}/${result.maxTurns} questions !`
            : `❌ Pas trouvé en ${result.maxTurns} questions`;
        return `🎯 Devine Qui ? — Quotidien #${num}\n${status}\n${squares}\nhttps://devineQui.app`;
    },

    getTimeUntilNext() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const diff = tomorrow - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return {
            hours: h,
            minutes: m,
            seconds: s,
            formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        };
    },
};

export default DailyManager;
