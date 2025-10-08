import React, { useState } from 'react';

interface Hero {
  id: string;
  name: string;
  element: string;
  description: string;
  color: string;
  image: string;
  innateSkills: string[];
}

interface GameSetupProps {
  heroes: Record<string, Hero>;
  onStartGame: (playerCount: number, difficulty: string, selectedCharacters: string[]) => void;
}

// Hero-Informationen aus spielanleitung.md
const heroInfo = {
  terra: {
    icon: '🌍',
    subtitle: 'Der Fels in der Brandung',
    description: 'Stärke und Loyalität. Unerschütterlicher Anker der Gruppe.',
    skills: [
      { icon: '🧱', name: 'Grundstein legen' },
      { icon: '⛏️', name: 'Geröll beseitigen' }
    ]
  },
  ignis: {
    icon: '🔥',
    subtitle: 'Die wandelnde Flamme',
    description: 'Impulsiv, leidenschaftlich, voller Optimismus.',
    skills: [
      { icon: '🔥', name: 'Element aktivieren' },
      { icon: '🌿', name: 'Dornen entfernen' }
    ]
  },
  lyra: {
    icon: '💧',
    subtitle: 'Die Stimme der Gezeiten',
    description: 'Weise, anmutig, voller Empathie.',
    skills: [
      { icon: '💧', name: 'Heilende Reinigung' },
      { icon: '🌊', name: 'Überflutung trockenlegen' }
    ]
  },
  corvus: {
    icon: '🦅',
    subtitle: 'Der stille Beobachter',
    description: 'Scharfsinnig, neugierig, Meister der Beobachtung.',
    skills: [
      { icon: '💨', name: 'Schnell bewegen' },
      { icon: '👁️', name: 'Spähen' }
    ]
  }
};

const GameSetup: React.FC<GameSetupProps> = ({ heroes, onStartGame }) => {
  const [difficulty, setDifficulty] = useState('normal');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  const handleCharacterSelect = (heroId: string) => {
    if (selectedCharacters.includes(heroId)) {
      setSelectedCharacters(prev => prev.filter(id => id !== heroId));
    } else {
      setSelectedCharacters(prev => [...prev, heroId]);
    }
  };

  const canStartGame = selectedCharacters.length >= 2;

  const handleStartGame = () => {
    if (canStartGame) {
      onStartGame(selectedCharacters.length, difficulty, selectedCharacters);
    }
  };

  const difficultyOptions = [
    { key: 'easy', label: 'Leicht' },
    { key: 'normal', label: 'Normal' },
    { key: 'hard', label: 'Schwer' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a202c', color: '#e2e8f0', padding: '2rem 1rem' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#f59e0b',
          letterSpacing: '0.1em',
          marginBottom: '0.5rem'
        }}>
          Apeiron
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#9ca3af' }}>
          Spiel einrichten
        </p>
      </header>

      <main style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Difficulty Selection */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
            1. Wählt die Schwierigkeit
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {difficultyOptions.map(diff => (
              <button
                key={diff.key}
                onClick={() => setDifficulty(diff.key)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  backgroundColor: difficulty === diff.key ? '#3b82f6' : '#374151',
                  color: 'white',
                  border: `2px solid ${difficulty === diff.key ? '#60a5fa' : '#4b5563'}`,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (difficulty !== diff.key) {
                    e.currentTarget.style.backgroundColor = '#4b5563';
                  }
                }}
                onMouseLeave={(e) => {
                  if (difficulty !== diff.key) {
                    e.currentTarget.style.backgroundColor = '#374151';
                  }
                }}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </section>

        {/* Character Selection - Vertical Layout */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem' }}>
            2. Wählt eure Helden
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            {Object.values(heroes).map(hero => {
              const isSelected = selectedCharacters.includes(hero.id);
              const isDisabled = false; // No longer need to disable based on player count
              const info = heroInfo[hero.id as keyof typeof heroInfo];

              return (
                <div
                  key={hero.id}
                  onClick={() => handleCharacterSelect(hero.id)}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: '#1f2937',
                    border: isSelected ? `3px solid ${hero.color}` : '2px solid #374151',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: 1,
                    filter: 'none',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isSelected ? `0 4px 12px ${hero.color}40` : '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = hero.color;
                      e.currentTarget.style.boxShadow = `0 4px 8px ${hero.color}20`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#374151';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                    }
                  }}
                >
                  {/* Hero Icon Circle */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: hero.color,
                    border: '3px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                    boxShadow: `0 2px 8px ${hero.color}60`
                  }}>
                    {info.icon}
                  </div>

                  {/* Hero Content */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: hero.color,
                      marginBottom: '0.25rem'
                    }}>
                      {hero.name} - {info.subtitle}
                    </h3>

                    <p style={{
                      fontSize: '0.875rem',
                      color: '#9ca3af',
                      marginBottom: '0.5rem'
                    }}>
                      {info.description}
                    </p>

                    {/* Skills with Icons */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {info.skills.map((skill, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          <span>{skill.icon}</span>
                          <span>{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: hero.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selection Counter */}
          <div style={{
            textAlign: 'center',
            marginTop: '1rem',
            color: '#9ca3af',
            fontSize: '0.875rem'
          }}>
            {selectedCharacters.length} Helden ausgewählt
          </div>
        </section>

        {/* Start Game Button */}
        <section style={{ textAlign: 'center' }}>
          <button
            onClick={handleStartGame}
            disabled={!canStartGame}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              transition: 'all 0.2s',
              backgroundColor: canStartGame ? '#10b981' : '#4b5563',
              color: canStartGame ? 'white' : '#9ca3af',
              border: 'none',
              cursor: canStartGame ? 'pointer' : 'not-allowed',
              boxShadow: canStartGame ? '0 4px 6px rgba(16, 185, 129, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (canStartGame) {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (canStartGame) {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.3)';
              }
            }}
          >
            ⚔️ Abenteuer beginnen
          </button>
        </section>
      </main>
    </div>
  );
};

export default GameSetup;