import { useState, useEffect } from 'react';
import DailyManager from '../logic/DailyManager.js';
import styles from './DailyScreen.module.css';

export default function DailyScreen({ onBack, onStartDaily }) {
    const [hasPlayed, setHasPlayed] = useState(false);
    const [result, setResult] = useState(null);
    const [stats, setStats] = useState(null);
    const [countdown, setCountdown] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const played = DailyManager.hasPlayedToday();
        setHasPlayed(played);
        if (played) {
            setResult(DailyManager.getResult());
            setStats(DailyManager.getStats());
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!hasPlayed) return;
        const tick = () => {
            const t = DailyManager.getTimeUntilNext();
            setCountdown(t.formatted);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [hasPlayed]);

    const handleShare = async () => {
        const text = DailyManager.generateShareText();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const dailyNum = DailyManager.getDailyNumber();

    // Already played today → show results
    if (hasPlayed && result) {
        return (
            <div className={styles.container}>
                <button onClick={onBack} className={styles.backBtn}>← Retour</button>
                <div className={styles.header}>
                    <div className={styles.badge}>Quotidien #{dailyNum}</div>
                    <h1 className={styles.title}>Résultat du jour</h1>
                </div>
                <div className={styles.card}>
                    <div className={styles.resultIcon}>{result.won ? '🎉' : '😔'}</div>
                    <div className={`${styles.resultTitle} ${result.won ? styles.win : styles.lose}`}>
                        {result.won ? 'Bravo !' : 'Raté...'}
                    </div>
                    <div className={styles.characterName}>
                        {result.won ? `Trouvé en ${result.turnsUsed} question${result.turnsUsed > 1 ? 's' : ''} !` : `C'était : ${result.characterName}`}
                    </div>

                    {stats && (
                        <div className={styles.statsGrid}>
                            <div className={styles.stat}>
                                <div className={styles.statValue}>{stats.played}</div>
                                <div className={styles.statLabel}>Joués</div>
                            </div>
                            <div className={styles.stat}>
                                <div className={styles.statValue}>{stats.winRate}%</div>
                                <div className={styles.statLabel}>Victoires</div>
                            </div>
                            <div className={styles.stat}>
                                <div className={styles.statValue}>{stats.streak} 🔥</div>
                                <div className={styles.statLabel}>Série</div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleShare}
                        className={`${styles.shareBtn} ${copied ? styles.copied : ''}`}
                    >
                        {copied ? '✅ Copié !' : '📋 Partager mon résultat'}
                    </button>

                    <div className={styles.countdown}>
                        <div className={styles.countdownLabel}>Prochain défi dans</div>
                        <div className={styles.countdownTime}>{countdown}</div>
                    </div>
                </div>
            </div>
        );
    }

    // Not played yet → show start screen
    return (
        <div className={styles.container}>
            <button onClick={onBack} className={styles.backBtn}>← Retour</button>
            <div className={styles.header}>
                <div className={styles.badge}>Quotidien #{dailyNum}</div>
                <h1 className={styles.title}>Défi du Jour</h1>
                <p className={styles.subtitle}>Une personnalité à deviner par jour</p>
            </div>
            <div className={styles.card}>
                <div className={styles.characterEmoji}>🎯</div>
                <div className={styles.rulesTitle}>Règles</div>
                <ul className={styles.rules}>
                    <li>30 questions maximum pour deviner</li>
                    <li>Un seul essai par jour</li>
                    <li>Même personnalité pour tout le monde</li>
                    <li>Personnalité historique ou contemporaine</li>
                    <li>Partagez votre score avec vos amis</li>
                </ul>
                <button onClick={onStartDaily} className={styles.playBtn}>
                    🚀 Jouer le défi du jour
                </button>
            </div>
            <div className={styles.dailyNumber}>Défi #{dailyNum}</div>
        </div>
    );
}
