import React, { useState } from 'react';
import styles from './QuestionMenu.module.css';

export default function QuestionMenu({ onAsk, onGuess, onHint, onGiveUp, usedQuestions = [] }) {
    const [questionInput, setQuestionInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (questionInput.trim()) {
            // Envoi en tant que catégorie spéciale 'free-text'
            // Le GameEngine se charge de détecter si c'est une devinette (Smart Guess)
            onAsk('free-text', questionInput);
            setQuestionInput('');
        }
    };

    return (
        <div className={`${styles.menuContainer} glass-panel`}>
            <div className={styles.inputArea}>
                <form onSubmit={handleSubmit} className={styles.freeForm}>
                    <input
                        type="text"
                        placeholder="Posez une question ou proposez un nom..."
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        className={styles.mainInput}
                        autoFocus
                    />
                    <button type="submit" className={styles.sendBtn}>Envoyer</button>
                </form>

                <div className={styles.actionsRow}>
                    <button className={styles.hintBtn} onClick={onHint}>💡 Indice (-150 pts)</button>
                    <button className={styles.giveUpBtn} onClick={onGiveUp}>🏳️ Abandonner</button>
                </div>
            </div>
        </div>
    );
}
