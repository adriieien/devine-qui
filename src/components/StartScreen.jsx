import React from 'react';
import styles from './StartScreen.module.css';

export default function StartScreen({ onStart }) {
    return (
        <div className={styles.container}>
            <h1 className="title-glow">Devine Qui ?</h1>
            <h2 className={styles.subtitle}>Édition Historique</h2>
            <p className={styles.description}>
                Je pense à un personnage célèbre de l'histoire.<br />
                Pose-moi des questions pour deviner qui c'est !
            </p>

            <div className={styles.card}>
                <button className={styles.startBtn} onClick={onStart}>
                    Commencer le Jeu
                </button>
            </div>
        </div>
    );
}
