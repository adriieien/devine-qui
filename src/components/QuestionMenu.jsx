import React, { useState } from 'react';
import styles from './QuestionMenu.module.css';

// Détecte si le message est une tentative de devinette
function isGuessAttempt(text) {
    const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return (
        lower.startsWith("c'est ") ||
        lower.startsWith("c est ") ||
        lower.startsWith("je pense que c'est") ||
        lower.startsWith("je pense que c est") ||
        lower.startsWith("je devine ") ||
        lower.startsWith("je propose ") ||
        lower.startsWith("est-ce que c'est ") ||
        lower.startsWith("est ce que c'est ") ||
        lower.startsWith("mon guess ") ||
        lower.startsWith("reponse ") ||
        lower.startsWith("réponse ")
    );
}

// Extrait le nom du personnage de la tentative
function extractGuessName(text) {
    const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const prefixes = [
        "je pense que c'est ", "je pense que c est ",
        "est-ce que c'est ", "est ce que c'est ",
        "c'est ", "c est ",
        "je devine ", "je propose ",
        "mon guess ", "reponse ", "réponse "
    ];
    for (const p of prefixes) {
        if (lower.startsWith(p)) {
            return text.trim().substring(p.length).trim();
        }
    }
    return text.trim();
}

export default function QuestionMenu({ onAsk, onGuess, onHint, onGiveUp, disabled, isLoading, gameMode = 'historique' }) {
    const [input, setInput] = useState('');

    const PLACEHOLDER_EXAMPLES = {
        historique: 'Napoléon',
        football: 'Zidane',
        basketball: 'LeBron',
        tennis: 'Nadal',
        rugby: 'Dupont',
        f1: 'Senna',
        cyclisme: 'Merckx',
        boxe: 'Tyson',
        mma: 'McGregor',
        daily: 'Einstein',
    };

    const example = PLACEHOLDER_EXAMPLES[gameMode] || 'Napoléon';

    const handleSubmit = (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || disabled) return;

        if (isGuessAttempt(text)) {
            onGuess(extractGuessName(text));
        } else {
            onAsk('free-text', text);
        }
        setInput('');
    };

    return (
        <div className={`${styles.menuContainer} glass-panel`}>
            <div className={styles.bottomBar}>
                <form onSubmit={handleSubmit} className={styles.chatForm}>
                    <input
                        type="text"
                        placeholder={disabled ? "L'IA réfléchit..." : `Pose une question ou devine (ex: "C'est ${example} ?")`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={disabled}
                        className={styles.chatInput}
                        autoFocus
                    />
                    <button type="submit" disabled={disabled || !input.trim()} className={styles.sendBtn}>
                        Envoyer
                    </button>
                </form>

                <div className={styles.actionButtons}>
                    <button className={styles.hintBtn} onClick={onHint} disabled={disabled}>💡 Indice (-150 pts)</button>
                    <button className={styles.giveUpBtn} onClick={onGiveUp} disabled={disabled}>🏳️ Abandonner</button>
                </div>
            </div>
        </div>
    );
}
