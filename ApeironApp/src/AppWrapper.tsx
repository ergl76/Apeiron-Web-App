import React, { useState } from 'react';
import GameSetup from './components/GameSetup';
import GameScreen from './ApeironGame.tsx';

interface Hero {
  id: string;
  name: string;
  element: string;
  description: string;
  color: string;
  image: string;
  innateSkills: string[];
}

interface GameData {
  playerCount: number;
  difficulty: string;
  selectedCharacters: string[];
}

const heroes: Record<string, Hero> = {
  terra: {
    id: 'terra',
    name: 'Terra',
    element: 'earth',
    description: 'Meisterin der Erde und des Bauens',
    color: '#22c55e',
    image: 'https://storage.googleapis.com/gemini-prod-us-west1-409905595311/images/8410058b-302a-4384-93f0-5847b85e05d0.jpg',
    innateSkills: ['grundstein_legen', 'geroell_beseitigen']
  },
  ignis: {
    id: 'ignis',
    name: 'Ignis',
    element: 'fire',
    description: 'Meister des Feuers',
    color: '#ef4444',
    image: 'https://storage.googleapis.com/gemini-prod-us-west1-409905595311/images/c74319e3-c14f-48d4-ad40-f56fa2f9c8f0.jpg',
    innateSkills: ['element_aktivieren', 'dornen_entfernen']
  },
  lyra: {
    id: 'lyra',
    name: 'Lyra',
    element: 'water',
    description: 'Meisterin des Wassers',
    color: '#3b82f6',
    image: 'https://storage.googleapis.com/gemini-prod-us-west1-409905595311/images/38d857fb-efe9-4da7-b5b1-3f8e1e982baa.jpg',
    innateSkills: ['reinigen', 'fluss_freimachen']
  },
  corvus: {
    id: 'corvus',
    name: 'Corvus',
    element: 'air',
    description: 'Meister der Lüfte',
    color: '#eab308',
    image: 'https://storage.googleapis.com/gemini-prod-us-west1-409905595311/images/7a8f8db5-6ca0-47f7-97b7-b2fe738b0fda.jpg',
    innateSkills: ['spaehen', 'schnell_bewegen']
  }
};

function AppWrapper() {
  const [gameData, setGameData] = useState<GameData | null>(null);

  const handleStartGame = (playerCount: number, difficulty: string, selectedCharacters: string[]) => {
    setGameData({
      playerCount,
      difficulty,
      selectedCharacters
    });
  };

  const handleNewGame = () => {
    setGameData(null);
  };

  if (!gameData) {
    return (
      <GameSetup
        heroes={heroes}
        onStartGame={handleStartGame}
      />
    );
  }

  return (
    <GameScreen
      gameData={gameData}
      onNewGame={handleNewGame}
    />
  );
}

export default AppWrapper;
