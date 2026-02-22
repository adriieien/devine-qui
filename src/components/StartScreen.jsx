import React, { useState } from 'react';
import styles from './StartScreen.module.css';
import ScoreBoard from './ScoreBoard';

export default function StartScreen({ onStart, onBack }) {
    const [difficulty, setDifficulty] = useState('medium');
    const [mode, setMode] = useState('france');
    const [showScores, setShowScores] = useState(false);

    const handleStart = () => {
        onStart({ difficulty, mode });
    };

    return (
        <div className={styles.container}>
            {onBack && <button onClick={onBack} className={styles.backLink}>← Retour</button>}
            <h1 className="title-glow">Devine Qui ?</h1>
            <h2 className={styles.subtitle}>Édition Historique</h2>
            <p className={styles.description}>
                Je pense à un personnage célèbre de l'histoire.<br />
                Pose-moi des questions pour deviner qui c'est !
            </p>

            <div className={styles.card}>
                {/* Mode selection */}
                <div className={styles.optionGroup}>
                    <label className={styles.optionLabel}>🌍 Mode</label>
                    <div className={styles.toggleRow}>
                        <button
                            className={`${styles.toggleBtn} ${mode === 'france' ? styles.active : ''}`}
                            onClick={() => setMode('france')}
                        >
                            🇫🇷 France
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${mode === 'world' ? styles.active : ''}`}
                            onClick={() => setMode('world')}
                        >
                            🌍 Monde
                        </button>
                    </div>
                </div>

                {/* Difficulty selection */}
                <div className={styles.optionGroup}>
                    <label className={styles.optionLabel}>⚡ Difficulté</label>
                    <div className={styles.toggleRow}>
                        <button
                            className={`${styles.toggleBtn} ${difficulty === 'easy' ? styles.activeGreen : ''}`}
                            onClick={() => setDifficulty('easy')}
                        >
                            😊 Facile
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${difficulty === 'medium' ? styles.activeYellow : ''}`}
                            onClick={() => setDifficulty('medium')}
                        >
                            🤔 Moyen
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${difficulty === 'hard' ? styles.activeRed : ''}`}
                            onClick={() => setDifficulty('hard')}
                        >
                            🔥 Difficile
                        </button>
                    </div>
                </div>

                <button className={styles.startBtn} onClick={handleStart}>
                    Commencer le Jeu
                </button>

                <button className={styles.scoresBtn} onClick={() => setShowScores(true)}>
                    🏆 Mes Scores
                </button>
            </div>

            {showScores && <ScoreBoard onClose={() => setShowScores(false)} />}
        </div>
    );
}
