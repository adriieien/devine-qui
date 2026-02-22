import React from 'react';
import styles from './ScoreBoard.module.css';
import { ScoreManager } from '../logic/ScoreManager';

export default function ScoreBoard({ onClose }) {
    const scores = ScoreManager.getScores();

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '-';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className={styles.overlay}>
            <div className={`${styles.panel} glass-panel`}>
                <div className={styles.header}>
                    <h2>🏆 Mes Scores</h2>
                    <button onClick={onClose} className={styles.closeBtn}>✕</button>
                </div>

                {scores.length === 0 ? (
                    <p className={styles.empty}>Aucune partie jouée pour le moment. Lance-toi !</p>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Personnage</th>
                                    <th>Score</th>
                                    <th>Rang</th>
                                    <th>Tours</th>
                                    <th>⏱️</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scores.map((s, i) => (
                                    <tr key={i} className={i < 3 ? styles.topThree : ''}>
                                        <td className={styles.rank}>
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                        </td>
                                        <td className={styles.charName}>{s.characterName}</td>
                                        <td className={styles.scoreVal}>{s.score}</td>
                                        <td>{s.rank}</td>
                                        <td>{s.turns}/{s.maxTurns}</td>
                                        <td>{formatTime(s.timeSeconds)}</td>
                                        <td className={styles.date}>{formatDate(s.date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
