import React, { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import StartScreen from './components/StartScreen'
import GameInterface from './components/GameInterface'
import DailyScreen from './components/DailyScreen'
import Layout from './components/Layout'
import DailyManager from './logic/DailyManager'
import './styles/theme.css'

function App() {
  const [screen, setScreen] = useState('home');
  const [gameMode, setGameMode] = useState(null);
  const [gameOptions, setGameOptions] = useState({ difficulty: 'medium', mode: 'france' });
  const [dailyCharacter, setDailyCharacter] = useState(null);

  const handleSelectMode = (mode) => {
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
    setScreen('game');
  };

  const handleStart = (options) => {
    setGameOptions(options);
    setScreen('game');
  };

  const handleExit = () => {
    setScreen('home');
    setGameMode(null);
    setDailyCharacter(null);
  };

  const handleDailyEnd = () => {
    setScreen('daily');
  };

  return (
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
          difficulty={gameOptions.difficulty}
          mode={gameOptions.mode}
          gameMode={gameMode}
          dailyCharacter={dailyCharacter}
        />
      )}
    </Layout>
  )
}

export default App

