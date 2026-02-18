import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../logic/GameEngine';
import ChatMessage from './ChatMessage';
import QuestionMenu from './QuestionMenu';
import VictoryScreen from './VictoryScreen';
import styles from './GameInterface.module.css';

export default function GameInterface({ onExit }) {
    const [engine] = useState(() => new GameEngine());
    const [messages, setMessages] = useState([]);
    const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
    const [usedQuestions, setUsedQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Start game on mount
        const intro = engine.startNewGame();
        const rulesMsg = {
            text: `📜 Règles du jeu :\n\n` +
                `🎯 Je pense à un personnage historique français. Tu dois deviner qui c'est !\n\n` +
                `💬 Pose-moi des questions en tapant dans la barre ci-dessous (ex: "C'est un homme ?", "Il a vécu au 19ème siècle ?", "Il était roi ?")\n\n` +
                `🤔 Quand tu penses savoir, utilise le champ "Je pense que c'est..." pour proposer un nom.\n\n` +
                `💡 Tu peux demander un indice, mais ça te coûtera 150 points !\n\n` +
                `⏳ Tu as ${engine.maxTurns} tours pour deviner. Bonne chance ! 🍀`,
            sender: 'ai'
        };
        setMessages([rulesMsg, intro]);
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
        setIsLoading(true);
        try {
            const response = await engine.askQuestion(category, value);
            if (response) {
                // Si c'est une victoire via Smart Guess (détectée dans askQuestion)
                if (response.status === 'won') {
                    setMessages(prev => [...prev, {
                        text: response.text,
                        sender: 'ai',
                        score: response.score,
                        rank: response.rank
                    }]);
                    setGameStatus('won');
                } else {
                    setMessages(prev => [...prev, { text: response.text, sender: 'ai' }]);
                    if (response.answer === 'lost') setGameStatus('lost');
                }
            }
        } catch (e) {
            console.error("Error asking question:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuess = async (name) => {
        if (gameStatus !== 'playing' || isLoading) return;

        const userMsg = { text: `Je pense que c'est ${name}`, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleHint = () => {
        if (gameStatus !== 'playing' || isLoading) return;

        const userMsg = { text: "Donne-moi un indice !", sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        setTimeout(() => {
            const response = engine.getHint();
            if (response) {
                setMessages(prev => [...prev, { text: response.text, sender: 'ai' }]);
            }
            setIsLoading(false);
        }, 600);
    };

    const handleGiveUp = () => {
        if (gameStatus !== 'playing' || isLoading) return;

        const userMsg = { text: "Je donne ma langue au chat.", sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        setTimeout(() => {
            const response = engine.giveUp();
            if (response) {
                setMessages(prev => [...prev, { text: response.text, sender: 'ai' }]);
                setGameStatus('lost');
            }
            setIsLoading(false);
        }, 600);
    };

    const handleRestartGame = () => {
        setUsedQuestions([]);
        setGameStatus('playing');
        const intro = engine.startNewGame();
        const rulesMsg = {
            text: `📜 Règles du jeu :\n\n` +
                `🎯 Je pense à un personnage historique français. Tu dois deviner qui c'est !\n\n` +
                `💬 Pose-moi des questions en tapant dans la barre ci-dessous (ex: "C'est un homme ?", "Il a vécu au 19ème siècle ?", "Il était roi ?")\n\n` +
                `🤔 Quand tu penses savoir, utilise le champ "Je pense que c'est..." pour proposer un nom.\n\n` +
                `💡 Tu peux demander un indice, mais ça te coûtera 150 points !\n\n` +
                `⏳ Tu as ${engine.maxTurns} tours pour deviner. Bonne chance ! 🍀`,
            sender: 'ai'
        };
        setMessages([rulesMsg, intro]);
    };

    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : {};

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
                        disabled={isLoading}
                        isLoading={isLoading}
                    />
                ) : gameStatus === 'lost' ? (
                    <div className={`${styles.endGameCard} glass-panel`}>
                        <h3>Perdu...</h3>
                        <p className={styles.lostText}>Le personnage mystère était <strong>{engine.secretCharacter?.name}</strong>.</p>
                        <p className={styles.lostDescription}>{engine.secretCharacter?.description}</p>
                        <button onClick={handleRestartGame} className={styles.restartBtn}>🔄 Rejouer</button>
                    </div>
                ) : null}
            </div>

            {/* Victory overlay */}
            {gameStatus === 'won' && (
                <VictoryScreen
                    score={lastMsg.score}
                    rank={lastMsg.rank}
                    character={engine.secretCharacter}
                    turnCount={engine.turnCount}
                    maxTurns={engine.maxTurns}
                    hintsUsed={engine.hintsUsed}
                    onRestart={handleRestartGame}
                />
            )}
        </div>
    );
}
