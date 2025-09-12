import React, { useState } from 'react';
import { Hero } from '../types';

interface GameSetupProps {
  heroes: Record<string, Hero>;
  onStartGame: (playerCount: number, difficulty: string, selectedCharacters: string[]) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ heroes, onStartGame }) => {
  const [playerCount, setPlayerCount] = useState(4);
  const [difficulty, setDifficulty] = useState('normal');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  const handleCharacterSelect = (heroId: string) => {
    if (selectedCharacters.includes(heroId)) {
      setSelectedCharacters(prev => prev.filter(id => id !== heroId));
    } else if (selectedCharacters.length < playerCount) {
      setSelectedCharacters(prev => [...prev, heroId]);
    }
  };

  const canStartGame = selectedCharacters.length === playerCount;

  const handleStartGame = () => {
    if (canStartGame) {
      onStartGame(playerCount, difficulty, selectedCharacters);
    }
  };

  const playerCountOptions = [2, 3, 4];
  const difficultyOptions = [
    { key: 'easy', label: 'Leicht' },
    { key: 'normal', label: 'Normal' },
    { key: 'hard', label: 'Schwer' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 py-8">
      {/* Header */}
      <header className="text-center py-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 tracking-wider mb-2">
          Apeiron
        </h1>
        <p className="text-xl sm:text-2xl text-gray-400">
          Spiel einrichten
        </p>
      </header>

      <main className="container mx-auto p-4 max-w-4xl">
        {/* Player Count Selection */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-4">
            1. Wählt die Anzahl der Helden
          </h2>
          <div className="flex justify-center gap-4">
            {playerCountOptions.map(count => (
              <button
                key={count}
                onClick={() => {
                  setPlayerCount(count);
                  setSelectedCharacters([]);
                }}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                  playerCount === count
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                } border-2`}
              >
                {count} Spieler
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty Selection */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-4">
            2. Wählt die Schwierigkeit
          </h2>
          <div className="flex justify-center gap-4">
            {difficultyOptions.map(diff => (
              <button
                key={diff.key}
                onClick={() => setDifficulty(diff.key)}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                  difficulty === diff.key
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                } border-2`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </section>

        {/* Character Selection */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-4">
            3. Wählt eure Helden
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(heroes).map(hero => {
              const isSelected = selectedCharacters.includes(hero.id);
              const isDisabled = !isSelected && selectedCharacters.length >= playerCount;
              
              return (
                <div
                  key={hero.id}
                  onClick={() => !isDisabled && handleCharacterSelect(hero.id)}
                  className={`relative bg-gray-800 rounded-xl p-4 transition-all duration-300 cursor-pointer border-4 ${
                    isSelected
                      ? 'border-blue-400 transform scale-105 shadow-lg shadow-blue-400/50'
                      : isDisabled
                      ? 'border-transparent opacity-60 cursor-not-allowed filter grayscale'
                      : 'border-transparent hover:border-gray-600'
                  }`}
                >
                  {/* Hero Image */}
                  <div className="aspect-square rounded-lg overflow-hidden mb-3">
                    <img
                      src={hero.image}
                      alt={hero.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Hero Info */}
                  <h3 className="text-lg font-bold text-center mb-2" style={{ color: hero.color }}>
                    {hero.name}
                  </h3>
                  
                  <p className="text-sm text-gray-400 text-center mb-3">
                    {hero.description}
                  </p>

                  {/* Skills */}
                  <div className="space-y-1">
                    {hero.innateSkills.map(skillId => (
                      <div key={skillId} className="text-xs text-gray-500 text-center">
                        • {skillId.replace('_', ' ')}
                      </div>
                    ))}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selection Counter */}
          <div className="text-center mt-4 text-gray-400">
            {selectedCharacters.length} von {playerCount} Helden ausgewählt
          </div>
        </section>

        {/* Start Game Button */}
        <section className="text-center">
          <button
            onClick={handleStartGame}
            disabled={!canStartGame}
            className={`px-10 py-4 text-2xl font-bold rounded-lg transition-all duration-200 ${
              canStartGame
                ? 'bg-green-600 hover:bg-green-700 text-white hover:transform hover:-translate-y-1 hover:shadow-lg'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Abenteuer beginnen
          </button>
        </section>
      </main>
    </div>
  );
};

export default GameSetup;