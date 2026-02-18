import React, { useState } from 'react';
import styles from './QuestionMenu.module.css';

export default function QuestionMenu({ onAsk, onGuess, onHint, onGiveUp, usedQuestions = [], disabled, isLoading }) {
    const [guessInput, setGuessInput] = useState('');
    const [questionInput, setQuestionInput] = useState('');

    const handleGuessSubmit = (e) => {
        e.preventDefault();
        if (guessInput.trim() && !disabled) {
            onGuess(guessInput);
            setGuessInput('');
        }
    };

    const handleQuestionSubmit = (e) => {
        e.preventDefault();
        if (questionInput.trim() && !disabled) {
            onAsk('free-text', questionInput);
            setQuestionInput('');
        }
    };

    return (
        <div className={`${styles.menuContainer} glass-panel`}>
            <div className={styles.bottomBar}>
                <div className={styles.formsContainer}>
                    <form onSubmit={handleQuestionSubmit} className={styles.freeForm}>
                        <input
                            type="text"
                            placeholder={disabled ? "L'IA réfléchit..." : "Pose ta question ici..."}
                            value={questionInput}
                            onChange={(e) => setQuestionInput(e.target.value)}
                            disabled={disabled}
                            className={styles.freeInput}
                        />
                        <button type="submit" disabled={disabled} className={styles.actionBtn}>Demander</button>
                    </form>

                    <form onSubmit={handleGuessSubmit} className={styles.guessForm}>
                        <input
                            type="text"
                            placeholder={disabled ? "..." : "Je pense que c'est..."}
                            value={guessInput}
                            onChange={(e) => setGuessInput(e.target.value)}
                            disabled={disabled}
                            className={styles.guessInput}
                        />
                        <button type="submit" disabled={disabled} className={styles.guessBtn}>Deviner</button>
                    </form>
                </div>

                <div className={styles.actionButtons}>
                    <button className={styles.hintBtn} onClick={onHint} disabled={disabled}>💡 Indice (-150 pts)</button>
                    <button className={styles.giveUpBtn} onClick={onGiveUp} disabled={disabled}>🏳️ Abandonner</button>
                </div>
            </div>
        </div>
    );
}
