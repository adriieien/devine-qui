import React, { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import StartScreen from './components/StartScreen'
import GameInterface from './components/GameInterface'
import DailyScreen from './components/DailyScreen'
import Layout from './components/Layout'
import VictoryScreen from './components/VictoryScreen'
import DailyManager from './logic/DailyManager'
import styles from './components/GameInterface.module.css'
import './styles/theme.css'

function App() {
  const [screen, setScreen] = useState('home');
  const [gameMode, setGameMode] = useState(null);
  const [gameOptions, setGameOptions] = useState({ difficulty: 'medium', mode: 'france' });
  const [dailyCharacter, setDailyCharacter] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [gameResult, setGameResult] = useState(null);

  const handleSelectMode = (mode) => {
    setGameStatus('playing');
    setGameResult(null);
    setGameMode(mode);
    if (mode === 'historique') {
      setScreen('start'); // Go to settings screen
    } else {
      // All sport modes go directly to game
      setGameOptions({ difficulty: 'medium', mode: 'france' });
      setScreen('game');
    }
  };

  const handleDailyClick = () => {
    setScreen('daily');
  };

  const handleStartDaily = () => {
    const character = DailyManager.getTodayCharacter();
    setDailyCharacter(character);
    setGameMode('daily');
    setGameOptions({ difficulty: 'medium', mode: 'monde' });
    setGameStatus('playing');
    setGameResult(null);
    setScreen('game');
  };

  const handleStart = (options) => {
    setGameOptions(options);
    setGameStatus('playing');
    setGameResult(null);
    setScreen('game');
  };

  const handleExit = () => {
    setScreen('home');
    setGameMode(null);
    setDailyCharacter(null);
    setGameStatus('playing');
    setGameResult(null);
  };

  const handleDailyEnd = () => {
    setScreen('daily');
    setGameStatus('playing');
    setGameResult(null);
  };

  const handleStatusChange = (status, result) => {
    setGameStatus(status);
    setGameResult(result);
  };

  return (
    <div className="app-root">
      <Layout>
        {screen === 'home' && (
          <HomeScreen onSelectMode={handleSelectMode} onDailyClick={handleDailyClick} dailyPlayed={DailyManager.hasPlayedToday()} />
        )}

        {screen === 'daily' && (
          <DailyScreen onBack={() => setScreen('home')} onStartDaily={handleStartDaily} />
        )}

        {screen === 'start' && (
          <StartScreen onStart={handleStart} onBack={() => setScreen('home')} />
        )}

        {screen === 'game' && (
          <GameInterface
            key={gameMode}
            onExit={gameMode === 'daily' ? handleDailyEnd : handleExit}
            onStatusChange={handleStatusChange}
            difficulty={gameOptions.difficulty}
            mode={gameOptions.mode}
            gameMode={gameMode}
            dailyCharacter={dailyCharacter}
          />
        )}
      </Layout>

      {/* Global Overlays (Outside Layout for stability) */}
      {gameStatus === 'lost' && gameResult && (
        <div className={styles.lostOverlay}>
          <div className={`${styles.endGameCard} glass-panel`}>
            <h3>Perdu...</h3>
            <p className={styles.lostText}>Le personnage mystère était <strong>{gameResult.character?.name}</strong>.</p>
            <p className={styles.lostDescription}>{gameResult.character?.description}</p>
            <button onClick={handleExit} className={styles.restartBtn}>🏠 Retour à l'accueil</button>
          </div>
        </div>
      )}

      {gameStatus === 'won' && gameResult && (
        <VictoryScreen
          score={gameResult.score}
          rank={gameResult.rank}
          character={gameResult.character}
          turnCount={gameResult.turnCount}
          totalQuestionsAsked={gameResult.totalQuestionsAsked}
          maxTurns={gameResult.maxTurns}
          hintsUsed={gameResult.hintsUsed}
          onRestart={handleExit}
        />
      )}
    </div>
  )
}

export default App

