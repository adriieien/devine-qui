import { dailyPoliticians } from './dailyPoliticians.js';
import { dailyScientists } from './dailyScientists.js';
import { dailyMusicians } from './dailyMusicians.js';
import { dailyActors } from './dailyActors.js';
import { dailyWriters } from './dailyWriters.js';
import { dailyArtists } from './dailyArtists.js';
import { dailyAthletes } from './dailyAthletes.js';
import { dailyEntrepreneurs } from './dailyEntrepreneurs.js';
import { dailyEntertainers } from './dailyEntertainers.js';
import { dailyHistorical } from './dailyHistorical.js';

// Deduplicate by name (case-insensitive)
function deduplicateByName(arr) {
    const seen = new Set();
    return arr.filter(entry => {
        const key = entry.name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// Combine all pools and deduplicate
export const DAILY_POOL = deduplicateByName([
    ...dailyPoliticians,
    ...dailyScientists,
    ...dailyMusicians,
    ...dailyActors,
    ...dailyWriters,
    ...dailyArtists,
    ...dailyAthletes,
    ...dailyEntrepreneurs,
    ...dailyEntertainers,
    ...dailyHistorical,
]);

// Deterministic hash based on date string → same character for everyone each day
function hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0; // djb2
    }
    return Math.abs(hash);
}

/**
 * Returns the daily character for a given date string (YYYY-MM-DD).
 * Same date → same character for everyone.
 */
export function getDailyCharacter(dateString) {
    const index = hashString(dateString) % DAILY_POOL.length;
    return DAILY_POOL[index];
}

/**
 * Returns the daily character number (days since launch).
 */
export function getDailyNumber(dateString) {
    const launch = new Date('2026-02-22');
    const today = new Date(dateString);
    return Math.floor((today - launch) / 86400000) + 1;
}
