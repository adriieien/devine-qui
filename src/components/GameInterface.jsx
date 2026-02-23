import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../logic/GameEngine';
import { ScoreManager } from '../logic/ScoreManager';
import DailyManager from '../logic/DailyManager';
import ChatMessage from './ChatMessage';
import QuestionMenu from './QuestionMenu';
import VictoryScreen from './VictoryScreen';
import InfoPanel from './InfoPanel';
import AdBanner from './AdBanner';
import styles from './GameInterface.module.css';

export default function GameInterface({ onExit, difficulty, mode, gameMode = 'historique', dailyCharacter }) {
    const [engine] = useState(() => new GameEngine());
    const [messages, setMessages] = useState([]);
    const [gameStatus, setGameStatus] = useState('playing');
    const [usedQuestions, setUsedQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [facts, setFacts] = useState([]);
    const [infoPanelOpen, setInfoPanelOpen] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const messagesEndRef = useRef(null);
    const timerRef = useRef(null);

    // Build rules message
    const buildRulesMsg = (eng) => {
        const SPORT_NAMES = {
            football: 'footballeur',
            basketball: 'joueur de basket',
            tennis: 'joueur/joueuse de tennis',
            rugby: 'joueur de rugby',
            f1: 'pilote de F1',
            cyclisme: 'cycliste',
            boxe: 'boxeur/boxeuse',
            mma: 'combattant(e) de MMA',
        };

        if (SPORT_NAMES[eng.gameMode]) {
            const name = SPORT_NAMES[eng.gameMode];
            const hasPhoto = eng.gameMode === 'football';
            return {
                text: `🎯 Règles du jeu :\n\n` +
                    `🎯 Je pense à un ${name} célèbre. Devine qui c'est !\n\n` +
                    (hasPhoto ? `📸 Tu verras une photo floue qui se dévoile au fil des tours.\n\n` : '') +
                    `💬 Pose des questions (ex: "C'est un homme ?", "Il est français ?")\n\n` +
                    `🤔 Tape "C'est [nom]" pour deviner.\n\n` +
                    `⏳ Tu as ${eng.maxTurns} tours. Bonne chance ! 🍀`,
                sender: 'ai'
            };
        }
        return {
            text: `📜 Règles du jeu :\n\n` +
                `🎯 Je pense à un personnage historique. Tu dois deviner qui c'est !\n\n` +
                `💬 Pose-moi des questions en tapant dans la barre ci-dessous (ex: "C'est un homme ?", "Il a vécu au 19ème siècle ?")\n\n` +
                `🤔 Tape "C'est [nom]" pour deviner.\n\n` +
                `💡 Tu peux demander un indice, mais ça te coûtera 150 points !\n\n` +
                `⏱️ Plus tu es rapide, plus tu gagnes de points bonus !\n\n` +
                `⏳ Tu as ${eng.maxTurns} tours pour deviner. Bonne chance ! 🍀`,
            sender: 'ai'
        };
    };

    useEffect(() => {
        const intro = engine.startNewGame({ difficulty, mode, gameMode, dailyCharacter });
        const rulesMsg = buildRulesMsg(engine);
        setMessages([rulesMsg, intro]);

        // Start timer
        timerRef.current = setInterval(() => {
            setElapsed(engine.getElapsedSeconds());
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [engine, difficulty, mode]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Stop timer when game ends
    useEffect(() => {
        if (gameStatus !== 'playing') {
            clearInterval(timerRef.current);
        }
    }, [gameStatus]);

    // Parse AI response for info summary
    const extractFact = (question, aiResponse) => {
        const lower = aiResponse.toLowerCase();
        const isYes = lower.startsWith('oui') || lower.includes('c\'est exact') ||
            lower.includes('bien vu') || lower.includes('tu as raison') ||
            lower.includes('en effet') || lower.includes('tout à fait') ||
            lower.includes('absolument');
        const isNo = lower.startsWith('non') || lower.includes('pas vraiment') ||
            lower.includes('ce n\'est pas') || lower.includes('pas du tout') ||
            lower.includes('incorrect');

        if (isYes || isNo) {
            return {
                text: question,
                confirmed: isYes
            };
        }
        return null;
    };

    const handleAsk = async (category, value) => {
        if (gameStatus !== 'playing') return;

        if (category !== 'free-text') {
            const questionId = `${category}-${value}`;
            if (usedQuestions.includes(questionId)) return;
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

        setIsLoading(true);
        try {
            const response = await engine.askQuestion(category, value);
            if (response) {
                if (response.status === 'won') {
                    setMessages(prev => [...prev, {
                        text: response.text, sender: 'ai',
                        score: response.score, rank: response.rank
                    }]);
                    setGameStatus('won');
                    // Save score
                    ScoreManager.saveScore({
                        characterName: engine.secretCharacter.name,
                        score: response.score,
                        rank: response.rank,
                        turns: engine.turnCount,
                        maxTurns: engine.maxTurns,
                        hintsUsed: engine.hintsUsed,
                        difficulty: engine.difficulty,
                        mode: engine.mode,
                        timeSeconds: engine.getElapsedSeconds()
                    });
                    // Save daily result
                    if (gameMode === 'daily') {
                        DailyManager.saveResult({
                            won: true,
                            turnsUsed: engine.turnCount,
                            maxTurns: engine.maxTurns,
                            characterName: engine.secretCharacter.name,
                        });
                    }
                } else {
                    setMessages(prev => [...prev, { text: response.text, sender: 'ai' }]);
                    if (response.answer === 'lost') {
                        setGameStatus('lost');
                        if (gameMode === 'daily') {
                            DailyManager.saveResult({
                                won: false,
                                turnsUsed: engine.turnCount,
                                maxTurns: engine.maxTurns,
                                characterName: engine.secretCharacter.name,
                            });
                        }
                    }

                    // Extract fact for info panel
                    const fact = extractFact(userText, response.text);
                    if (fact) {
                        setFacts(prev => [...prev, fact]);
                    }
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
                    text: response.text, sender: 'ai',
                    score: response.score, rank: response.rank
                }]);

                if (response.status === 'won') {
                    setGameStatus('won');
                    ScoreManager.saveScore({
                        characterName: engine.secretCharacter.name,
                        score: response.score,
                        rank: response.rank,
                        turns: engine.turnCount,
                        maxTurns: engine.maxTurns,
                        hintsUsed: engine.hintsUsed,
                        difficulty: engine.difficulty,
                        mode: engine.mode,
                        timeSeconds: engine.getElapsedSeconds()
                    });
                    if (gameMode === 'daily') {
                        DailyManager.saveResult({
                            won: true,
                            turnsUsed: engine.turnCount,
                            maxTurns: engine.maxTurns,
                            characterName: engine.secretCharacter.name,
                        });
                    }
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
                if (gameMode === 'daily') {
                    DailyManager.saveResult({
                        won: false,
                        turnsUsed: engine.turnCount,
                        maxTurns: engine.maxTurns,
                        characterName: engine.secretCharacter.name,
                    });
                }
            }
            setIsLoading(false);
        }, 600);
    };

    const handleRestartGame = () => {
        setUsedQuestions([]);
        setFacts([]);
        setGameStatus('playing');
        setElapsed(0);
        const intro = engine.startNewGame({ difficulty, mode, gameMode });
        const rulesMsg = buildRulesMsg(engine);
        setMessages([rulesMsg, intro]);

        // Restart timer
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setElapsed(engine.getElapsedSeconds());
        }, 1000);
    };

    const formatTimer = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : {};

    return (
        <div className={styles.gameContainer}>
            <header className={styles.header}>
                <button onClick={onExit} className={styles.homeBtn}>
                    <span className={styles.homeBtnIcon}>🏠</span>
                    <span className={styles.homeBtnText}>Accueil</span>
                </button>
                <div className={styles.headerInfo}>
                    <span className={styles.timerBadge}>⏱️ {formatTimer(elapsed)}</span>
                    <span className={styles.turnBadge}>Tour {engine.turnCount}/{engine.maxTurns}</span>
                </div>
            </header>

            <InfoPanel
                facts={facts}
                isOpen={infoPanelOpen}
                onToggle={() => setInfoPanelOpen(prev => !prev)}
            />

            <div className={styles.chatArea}>
                {/* Football photo with blur */}
                {gameMode === 'football' && engine.secretCharacter?.photo && gameStatus === 'playing' && (
                    <div className={styles.photoContainer}>
                        <img
                            src={engine.secretCharacter.photo}
                            alt="Qui est-ce ?"
                            className={styles.playerPhoto}
                            style={{
                                filter: `blur(${Math.max(0, 20 - engine.turnCount * 2.5)}px)`,
                                transition: 'filter 0.5s ease'
                            }}
                        />
                        <span className={styles.photoHint}>📸 La photo se dévoile à chaque tour...</span>
                    </div>
                )}
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
                        gameMode={gameMode}
                    />
                ) : gameStatus === 'lost' ? (
                    <div className={`${styles.endGameCard} glass-panel`}>
                        <h3>Perdu...</h3>
                        <p className={styles.lostText}>Le personnage mystère était <strong>{engine.secretCharacter?.name}</strong>.</p>
                        <p className={styles.lostDescription}>{engine.secretCharacter?.description}</p>
                        <button onClick={handleRestartGame} className={styles.restartBtn}>🔄 Rejouer</button>
                        <AdBanner format="auto" slot="" />
                    </div>
                ) : null}
            </div>

            {gameStatus === 'won' && (
                <>
                    <VictoryScreen
                        score={lastMsg.score}
                        rank={lastMsg.rank}
                        character={engine.secretCharacter}
                        turnCount={engine.turnCount}
                        totalQuestionsAsked={engine.totalQuestionsAsked}
                        maxTurns={engine.maxTurns}
                        hintsUsed={engine.hintsUsed}
                        onRestart={handleRestartGame}
                    />
                    <AdBanner format="auto" slot="" />
                </>
            )}
        </div>
    );
}
