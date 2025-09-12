import React, { useState, useEffect } from 'react';
import { GameManager } from './utils/GameManager';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import { GameState } from './types';
import './App.css';

function App() {
  const [gameManager] = useState(() => new GameManager());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(true);

  const heroes = gameManager.getHeroes();
  const gameRules = gameManager.getGameRules();

  const handleStartGame = (playerCount: number, difficulty: string, selectedCharacters: string[]) => {
    gameManager.setPlayerCount(playerCount);
    gameManager.setDifficulty(difficulty);
    gameManager.setSelectedCharacters(selectedCharacters);
    
    const newGameState = gameManager.startGame();
    setGameState(newGameState);
    setIsSetupMode(false);
  };

  const handleNewGame = () => {
    setIsSetupMode(true);
    setGameState(null);
  };

  const handleTileClick = (position: string) => {
    if (!gameState) return;

    // Try to discover tile
    const discoveredTile = gameManager.discoverTile(position);
    if (discoveredTile) {
      setGameState(gameManager.getGameState());
      return;
    }

    // Try to move player
    const currentPlayer = gameManager.getCurrentPlayer();
    if (gameManager.movePlayer(currentPlayer.id, position)) {
      setGameState(gameManager.getGameState());
      return;
    }
  };

  const handleEndTurn = () => {
    gameManager.endTurn();
    setGameState(gameManager.getGameState());
  };

  if (isSetupMode) {
    return (
      <GameSetup 
        heroes={heroes}
        onStartGame={handleStartGame}
      />
    );
  }

  if (!gameState) return null;

  const currentPlayer = gameManager.getCurrentPlayer();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Header */}
      <header className="text-center pt-4 pb-2">
        <h1 className="text-3xl font-bold text-yellow-400 tracking-wider mb-2">
          Apeiron
        </h1>
        <button
          onClick={handleNewGame}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-bold"
        >
          Neues Spiel einrichten
        </button>
      </header>

      {/* Game Summary Sidebar */}
      <div className="fixed top-4 right-4 w-80 bg-gray-800 rounded-lg shadow-lg p-4 z-50">
        <h3 className="text-xl font-bold text-yellow-300 mb-4">Übersicht</h3>
        
        {/* Round and Light */}
        <div className="mb-4">
          <h4 className="text-lg font-bold text-center mb-2">Runde {gameState.round}</h4>
          <div className="w-full bg-black rounded-full h-4 border-2 border-gray-600">
            <div 
              className="bg-gray-300 h-full rounded-full flex items-center justify-end pr-2"
              style={{ width: `${(gameState.light / gameRules.light.maxValue) * 100}%` }}
            >
              <span className="font-bold text-gray-800 text-xs">{gameState.light}</span>
            </div>
          </div>
        </div>

        {/* Current Player */}
        <div className="mb-4">
          <h4 className="text-base font-bold mb-2">Aktueller Spieler</h4>
          <div className="bg-gray-700 p-3 rounded">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: heroes[currentPlayer.id].color }}
              />
              <span className="font-bold">{currentPlayer.name}</span>
            </div>
            <div className="text-sm">
              AP: {currentPlayer.ap}/{currentPlayer.maxAp}
            </div>
            <div className="text-sm">
              Position: {currentPlayer.position}
            </div>
            {currentPlayer.inventory.length > 0 && (
              <div className="text-sm">
                Inventar: {currentPlayer.inventory.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Phase Info */}
        <div className="mb-4">
          <h4 className="text-base font-bold mb-2">
            Phase {gameState.phase}: {gameState.phase === 1 ? 'Die Suche' : 'Der Aufbau'}
          </h4>
          <div className="text-sm text-gray-400">
            {gameState.phase === 1 
              ? 'Erkundet die Insel und sammelt Baupläne und Kristalle'
              : 'Aktiviert die Elemente und errichtet den Turm'
            }
          </div>
        </div>

        {/* Tower Status */}
        <div className="mb-4">
          <h4 className="text-base font-bold mb-2">Turm der Elemente</h4>
          <div className="grid grid-cols-4 gap-2">
            {['erde', 'wasser', 'feuer', 'luft'].map(element => {
              const hasFoundation = gameState.tower.foundations.includes(element);
              const isActivated = gameState.tower.activatedElements.includes(element);
              
              return (
                <div
                  key={element}
                  className={`h-12 rounded flex items-center justify-center text-2xl border-2 ${
                    isActivated 
                      ? 'bg-green-600 border-green-400' 
                      : hasFoundation
                      ? 'bg-yellow-600 border-yellow-400'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                  title={`${element}: ${isActivated ? 'Aktiviert' : hasFoundation ? 'Fundament' : 'Nicht gebaut'}`}
                >
                  {getElementSymbol(element)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-4">
        {/* Game Board */}
        <section className="flex flex-col items-center">
          <GameBoard gameState={gameState} onTileClick={handleTileClick} />
        </section>

        {/* Actions Section */}
        <section className="flex flex-col items-center p-4">
          <h2 className="text-3xl font-bold mb-6 text-yellow-400">Aktionen</h2>
          
          <div className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded font-bold">
              Aufdecken
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded font-bold">
              Bewegen
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded font-bold">
              Sammeln
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded font-bold">
              Bauen
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded font-bold">
              Spähen
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded font-bold">
              Fähigkeit
            </button>
          </div>

          <div className="w-full max-w-lg">
            <button
              onClick={handleEndTurn}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded font-bold w-full"
            >
              Zug beenden
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function getElementSymbol(element: string): string {
  const symbols: { [key: string]: string } = {
    erde: '⛰️',
    wasser: '💧', 
    feuer: '🔥',
    luft: '💨'
  };
  return symbols[element] || '';
}

export default App;
