import React from 'react';
import styles from './HomeScreen.module.css';
import AdBanner from './AdBanner';

const MODES = [
    {
        id: 'historique',
        emoji: '🏛️',
        title: 'Personnages Historiques',
        description: 'Devine un personnage célèbre de l\'histoire.',
        color: '#818cf8'
    },
    {
        id: 'football',
        emoji: '⚽',
        title: 'Football',
        description: 'Devine un footballeur légendaire avec photo floue.',
        color: '#34d399'
    },
    {
        id: 'basketball',
        emoji: '🏀',
        title: 'Basket-ball',
        description: 'Devine un joueur NBA ou international.',
        color: '#f97316'
    },
    {
        id: 'tennis',
        emoji: '🎾',
        title: 'Tennis',
        description: 'Devine un joueur ou une joueuse de tennis.',
        color: '#eab308'
    },
    {
        id: 'rugby',
        emoji: '🏉',
        title: 'Rugby',
        description: 'Devine un joueur de rugby international.',
        color: '#22c55e'
    },
    {
        id: 'f1',
        emoji: '🏎️',
        title: 'Formule 1',
        description: 'Devine un pilote de F1 légendaire.',
        color: '#ef4444'
    },
    {
        id: 'cyclisme',
        emoji: '🚴',
        title: 'Cyclisme',
        description: 'Devine un cycliste du Tour de France ou d\'ailleurs.',
        color: '#facc15'
    },
    {
        id: 'boxe',
        emoji: '🥊',
        title: 'Boxe',
        description: 'Devine un boxeur ou une boxeuse légendaire.',
        color: '#dc2626'
    },
    {
        id: 'mma',
        emoji: '🥋',
        title: 'MMA / UFC',
        description: 'Devine un combattant ou combattante de MMA.',
        color: '#a855f7'
    }
];

export default function HomeScreen({ onSelectMode, onDailyClick, dailyPlayed }) {
    return (
        <div className={styles.container}>
            <h1 className="title-glow">Devine Qui ?</h1>
            <p className={styles.subtitle}>Choisis ton mode de jeu</p>

            <div className={styles.cards}>
                {/* Daily Challenge Card - always first */}
                <button
                    className={`${styles.card} ${styles.dailyCard} ${dailyPlayed ? styles.dailyDone : ''}`}
                    onClick={onDailyClick}
                    style={{ '--card-accent': dailyPlayed ? '#22c55e' : '#f59e0b', '--card-index': 0 }}
                >
                    <span className={dailyPlayed ? styles.dailyBadgeDone : styles.dailyBadge}>
                        {dailyPlayed ? '✅ Déjà joué' : 'Nouveau'}
                    </span>
                    <span className={styles.emoji}>{dailyPlayed ? '✅' : '📅'}</span>
                    <h2 className={styles.cardTitle}>Défi Quotidien</h2>
                    <p className={styles.cardDesc}>
                        {dailyPlayed
                            ? 'Tu as déjà joué aujourd\'hui ! Reviens demain pour un nouveau défi.'
                            : 'Une personnalité mondiale à deviner chaque jour. Un seul essai !'}
                    </p>
                    <span className={styles.playBtn}>{dailyPlayed ? 'Voir résultat' : 'Jouer →'}</span>
                </button>

                {MODES.map((mode, index) => (
                    <button
                        key={mode.id}
                        className={styles.card}
                        onClick={() => onSelectMode(mode.id)}
                        style={{ '--card-accent': mode.color, '--card-index': index + 1 }}
                    >
                        <span className={styles.emoji}>{mode.emoji}</span>
                        <h2 className={styles.cardTitle}>{mode.title}</h2>
                        <p className={styles.cardDesc}>{mode.description}</p>
                        <span className={styles.playBtn}>Jouer →</span>
                    </button>
                ))}
            </div>

            <AdBanner format="auto" slot="" />
        </div>
    );
}
