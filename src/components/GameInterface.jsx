import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../logic/GameEngine';
import ChatMessage from './ChatMessage';
import QuestionMenu from './QuestionMenu';
import styles from './GameInterface.module.css';

export default function GameInterface({ onExit }) {
    const [engine] = useState(() => new GameEngine());
    const [messages, setMessages] = useState([]);
    const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
    const [usedQuestions, setUsedQuestions] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Start game on mount
        const intro = engine.startNewGame();
        setMessages([intro]);
    }, [engine]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleAsk = async (category, value) => {
        if (gameStatus !== 'playing') return;

        // Marquer la question comme posée pour la masquer
        if (category !== 'free-text') {
            const questionId = `${category}-${value}`;
            if (usedQuestions.includes(questionId)) return; // Déjà posée
            setUsedQuestions(prev => [...prev, questionId]);
        }

        let userText = `Question : ${value}`;
        if (category === 'gender') userText = value === 'm' ? "Est-ce un homme ?" : "Est-ce une femme ?";
        if (category === 'tag') userText = `Est-ce lié à : ${value} ?`;
        if (category === 'era') userText = `A-t-il vécu durant : ${value} ?`;
        if (category === 'continent') userText = `Vient-il de ce continent : ${value} ?`;
        if (category === 'free-text') userText = value;

        const userMsg = { text: userText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);

        // Call API
        try {
            const response = await engine.askQuestion(category, value);
            if (response) {
                setMessages(prev => [...prev, { text: response.text, sender: 'ai' }]);
                if (response.answer === 'lost') setGameStatus('lost');
            }
        } catch (e) {
            console.error("Error asking question:", e);
        }
    };

    const handleGuess = async (name) => {
        if (gameStatus !== 'playing') return;

        const userMsg = { text: `Je pense que c'est ${name}`, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);

        const response = await engine.guessCharacter(name);
        if (response) {
            setMessages(prev => [...prev, {
                text: response.text,
                sender: 'ai',
                score: response.score, // Passer le score au message
                rank: response.rank
            }]);

            if (response.status === 'won') {
                setGameStatus('won');
            }
        }
    };

    const handleHint = () => {
        if (gameStatus !== 'playing') return;

        const userMsg = { text: "Donne-moi un indice !", sender: 'user' };
        setMessages(prev => [...prev, userMsg]);

        setTimeout(() => {
            const response = engine.getHint();
            if (response) {
                setMessages(prev => [...prev, { text: response.text, sender: 'ai' }]);
            }
        }, 600);
    };

    const handleGiveUp = () => {
        if (gameStatus !== 'playing') return;

        const userMsg = { text: "Je donne ma langue au chat.", sender: 'user' };
        setMessages(prev => [...prev, userMsg]);

        setTimeout(() => {
            const response = engine.giveUp();
            if (response) {
                setMessages(prev => [...prev, { text: response.text, sender: 'ai' }]);
                setGameStatus('lost');
            }
        }, 600);
    };

    const handleRestartGame = () => {
        setUsedQuestions([]);
        setGameStatus('playing');
        const intro = engine.startNewGame();
        setMessages([intro]);
    };

    return (
        <div className={styles.gameContainer}>
            <header className={styles.header}>
                <button onClick={onExit} className={styles.backBtn}>← Quitter</button>
                <span className={styles.turnBadge}>Tour {engine.turnCount}/{engine.maxTurns}</span>
            </header>

            <div className={styles.chatArea}>
                {messages.map((msg, i) => (
                    <ChatMessage key={i} text={msg.text} sender={msg.sender} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.controlsArea}>
                {gameStatus === 'playing' ? (
                    <QuestionMenu
                        onAsk={handleAsk}
                        onGuess={handleGuess}
                        onHint={handleHint}
                        onGiveUp={handleGiveUp}
                        usedQuestions={usedQuestions}
                    />
                ) : (
                    <div className={`${styles.endGameCard} glass-panel`}>
                        <h3>{gameStatus === 'won' ? "Victoire !" : "Perdu..."}</h3>
                        {/* Affichage du score si victoire */}
                        {gameStatus === 'won' && messages.length > 0 && messages[messages.length - 1].score !== undefined && (
                            <div className={styles.scoreBoard}>
                                <div className={styles.scoreValue}>{messages[messages.length - 1].score} pts</div>
                                <div className={styles.scoreRank}>Rang: {messages[messages.length - 1].rank}</div>
                            </div>
                        )}
                        <button onClick={handleRestartGame} className={styles.restartBtn}>Rejouer</button>
                    </div>
                )}
            </div>
        </div>
    );
}
