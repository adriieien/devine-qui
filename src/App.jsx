import { useState } from 'react'
import StartScreen from './components/StartScreen'
import GameInterface from './components/GameInterface'

function App() {
  const [screen, setScreen] = useState('start'); // 'start' or 'game'

  return (
    <main>
      {screen === 'start' && (
        <StartScreen onStart={() => setScreen('game')} />
      )}

      {screen === 'game' && (
        <GameInterface onExit={() => setScreen('start')} />
      )}
    </main>
  )
}

export default App
