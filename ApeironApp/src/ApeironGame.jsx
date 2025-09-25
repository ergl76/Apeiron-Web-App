import React, { useState } from 'react';
import eventsConfig from './config/events.json';

// Konter-Informationen aus ereigniskarten.md
const eventCounters = {
  // Phase 1 Negative
  "fluestern_der_schatten": "Kein Konter möglich",
  "dichter_nebel": "Corvus' Fähigkeit 'Spähen' funktioniert weiterhin",
  "erdrutsch_am_krater": "Terra kann das Hindernis mit 'Geröll beseitigen' entfernen",
  "dornenplage_im_osten": "Ignis kann das Hindernis mit 'Dornenwald entfernen' beseitigen",
  "sturzflut_im_westen": "Lyra kann mit 'Überflutung trockenlegen' das Gebiet wieder passierbar machen",
  "schwere_buerde": "Lyra kann mit 'Heilende Reinigung' den Effekt aufheben",
  "kristallverlust": "Kein Konter möglich",
  "zwietracht": "Kein Konter möglich",
  "truegerische_stille": "Kein Konter möglich",
  "erschoepfung": "Kein Konter möglich",
  "verwirrende_vision": "Lyra kann mit 'Heilende Reinigung' den Effekt aufheben",
  "gierige_schatten": "Kein Konter möglich",
  "blockade_im_sueden": "Terra kann das Hindernis mit 'Geröll beseitigen' entfernen",
  "laehmende_kaelte": "Kein Konter möglich",
  "dunkle_vorahnung": "Kein Konter möglich",
  "verlockung_der_schatten": "Kein Konter möglich",
  "zerrissener_beutel": "Kein Konter möglich",
  "wuchernde_wildnis": "Ignis kann die Hindernisse einzeln mit 'Dornenwald entfernen' beseitigen",
  "echo_der_verzweiflung": "Teilweise - Lyra kann den AP-Verlust mit 'Heilende Reinigung' verhindern",
  "falle_der_finsternis": "Lyra kann mit 'Heilende Reinigung' die Bindung lösen",

  // Phase 1 Positive
  "sternschnuppe": "-",
  "gluecksfund": "-",
  "rueckenwind": "-",
  "moment_der_klarheit": "-",
  "gemeinsame_staerke": "-",
  "hoffnungsschimmer": "-",
  "versteckter_schatz": "-",
  "guenstiges_omen": "-",
  "apeirons_segen": "-",
  "leuchtfeuer": "-",

  // Phase 2 Negative
  "zorn_der_sphaere": "Kein Konter möglich",
  "welle_der_finsternis": "Kein Konter möglich",
  "fragment_diebstahl": "Kein Konter möglich",
  "totale_erschoepfung": "Lyra kann mit 'Heilende Reinigung' einzelne Helden davon befreien",
  "verlorene_hoffnung": "Teilweise - Lyra kann das Aussetzen mit 'Heilende Reinigung' verhindern",
  "dreifache_blockade": "Terra kann die Hindernisse einzeln mit 'Geröll beseitigen' entfernen",
  "dornen_der_verzweiflung": "Ignis kann die Hindernisse einzeln mit 'Dornenwald entfernen' beseitigen",
  "sintflut_der_traenen": "Lyra kann mit 'Überflutung trockenlegen' die Gebiete wieder passierbar machen",
  "boeser_zauber": "Kein Konter möglich",
  "schattensturm": "Kein Konter möglich",
  "kristall_fluch": "Kein Konter möglich",
  "paralyse": "Lyra kann mit 'Heilende Reinigung' einzelne Helden befreien",
  "verrat_der_elemente": "Kein Konter möglich",
  "dunkle_metamorphose": "Lyra kann die Felder einzeln mit 'Heilende Reinigung' säubern",
  "verlust_der_orientierung": "Teilweise - Lyra kann den AP-Verlust einzeln aufheben",
  "opfer_der_schatten": "Kein Konter möglich",
  "gebrochene_verbindung": "Kein Konter möglich",
  "tsunami_der_finsternis": "Lyra kann Überflutungen einzeln trockenlegen",
  "letztes_aufbaeumen": "Teilweise - Lyra kann AP-Verlust und Aussetzen bei einzelnen Helden aufheben",
  "herz_der_finsternis_pulsiert": "Kein Konter möglich",

  // Phase 2 Positive
  "apeirons_intervention": "-",
  "reinigendes_feuer": "-",
  "welle_der_hoffnung": "-",
  "geschenk_der_ahnen": "-",
  "elementare_harmonie": "-",
  "sternenkonstellation": "-",
  "durchbruch": "-",
  "laeuterung": "-",
  "vereinte_kraft": "-",
  "triumph_des_lichts": "-"
};

// Game Data
const heroes = {
  terra: { 
    id: 'terra', 
    name: 'Terra', 
    element: 'earth',
    description: 'Meisterin der Erde und des Bauens',
    color: '#ca8a04',
    image: 'https://storage.googleapis.com/gemini-prod-us-west1-409905595311/images/8410058b-302a-4384-93f0-5847b85e05d0.jpg'
  },
  ignis: { 
    id: 'ignis', 
    name: 'Ignis', 
    element: 'fire',
    description: 'Herr des Feuers und der Aktivierung',
    color: '#ef4444',
    image: 'https://storage.googleapis.com/gemini-prod-us-west1-409905595311/images/05b13824-2c6f-443b-87b6-14fdd1f9d45e.jpg'
  },
  lyra: { 
    id: 'lyra', 
    name: 'Lyra', 
    element: 'water',
    description: 'Hüterin des Wassers und der Reinigung',
    color: '#3b82f6',
    image: 'https://storage.googleapis.com/gemini-prod-us-west1-409905595311/images/e7e9549f-b983-4a60-b6a2-632b71900a68.jpg'
  },
  corvus: { 
    id: 'corvus', 
    name: 'Corvus', 
    element: 'air',
    description: 'Späher der Lüfte und schneller Beweger',
    color: '#a78bfa',
    image: 'https://storage.googleapis.com/gemini-prod-us-west1-409905595311/images/b0559c5d-24e5-4f7f-a63e-a74092d63428.jpg'
  }
};

function GameSetup({ onStartGame }) {
  const [playerCount, setPlayerCount] = useState(4);
  const [difficulty, setDifficulty] = useState('normal');
  const [selectedCharacters, setSelectedCharacters] = useState([]);

  const handleCharacterSelect = (heroId) => {
    if (selectedCharacters.includes(heroId)) {
      setSelectedCharacters(prev => prev.filter(id => id !== heroId));
    } else if (selectedCharacters.length < playerCount) {
      setSelectedCharacters(prev => [...prev, heroId]);
    }
  };

  const canStartGame = selectedCharacters.length === playerCount;

  const cardStyle = (hero, isSelected, isDisabled) => ({
    position: 'relative',
    backgroundColor: '#374151',
    borderRadius: '12px',
    padding: '16px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    border: `4px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
    opacity: isDisabled ? 0.6 : 1,
    filter: isDisabled ? 'grayscale(80%)' : 'none',
    transition: 'all 0.3s ease',
    boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a202c', color: '#e2e8f0', padding: '2rem' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 'bold',
          color: '#f59e0b', 
          marginBottom: '0.5rem',
          letterSpacing: '0.1em'
        }}>
          Apeiron
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#9ca3af' }}>
          Spiel einrichten
        </p>
      </header>

      <main style={{ maxWidth: '1024px', margin: '0 auto' }}>
        {/* Player Count */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
            1. Wählt die Anzahl der Helden
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {[2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => {
                  setPlayerCount(count);
                  setSelectedCharacters([]);
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  border: '2px solid',
                  backgroundColor: playerCount === count ? '#2563eb' : '#374151',
                  borderColor: playerCount === count ? '#3b82f6' : '#6b7280',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                {count} Spieler
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
            2. Wählt die Schwierigkeit
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {[
              { key: 'easy', label: 'Leicht' },
              { key: 'normal', label: 'Normal' },
              { key: 'hard', label: 'Schwer' }
            ].map(diff => (
              <button
                key={diff.key}
                onClick={() => setDifficulty(diff.key)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  border: '2px solid',
                  backgroundColor: difficulty === diff.key ? '#2563eb' : '#374151',
                  borderColor: difficulty === diff.key ? '#3b82f6' : '#6b7280',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </section>

        {/* Character Selection */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
            3. Wählt eure Helden
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '1rem'
          }}>
            {Object.values(heroes).map(hero => {
              const isSelected = selectedCharacters.includes(hero.id);
              const isDisabled = !isSelected && selectedCharacters.length >= playerCount;
              
              return (
                <div
                  key={hero.id}
                  onClick={() => !isDisabled && handleCharacterSelect(hero.id)}
                  style={cardStyle(hero, isSelected, isDisabled)}
                >
                  {/* Hero Image */}
                  <div style={{ 
                    aspectRatio: '1/1', 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    marginBottom: '12px' 
                  }}>
                    <img
                      src={hero.image}
                      alt={hero.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Hero Info */}
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold', 
                    textAlign: 'center', 
                    marginBottom: '8px',
                    color: hero.color 
                  }}>
                    {hero.name}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#9ca3af', 
                    textAlign: 'center', 
                    marginBottom: '12px' 
                  }}>
                    {hero.description}
                  </p>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selection Counter */}
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
            {selectedCharacters.length} von {playerCount} Helden ausgewählt
          </div>
        </section>

        {/* Start Game Button */}
        <section style={{ textAlign: 'center' }}>
          <button
            onClick={() => canStartGame && onStartGame(playerCount, difficulty, selectedCharacters)}
            disabled={!canStartGame}
            style={{
              padding: '16px 40px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: canStartGame ? '#16a34a' : '#6b7280',
              color: canStartGame ? '#fff' : '#9ca3af',
              cursor: canStartGame ? 'pointer' : 'not-allowed',
              transform: canStartGame ? 'none' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Abenteuer beginnen
          </button>
        </section>
      </main>
    </div>
  );
}

// Game Board Component
function GameBoard({ gameState, onTileClick }) {
  const boardSize = 9;
  
  const renderTile = (x, y) => {
    const position = `${x},${y}`;
    const isKrater = position === '4,4';
    const tile = gameState.board[position];
    
    // Find heroes on this tile
    const heroesOnTile = gameState.players.filter(player => player.position === position);
    
    // Check if discoverable (adjacent to current player's position)
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isDiscoverable = !tile && isAdjacentToCurrentPlayer(x, y, currentPlayer.position);
    
    // Check if movable (revealed tile within movement range)
    const isMovable = tile && canMoveToPosition(currentPlayer.position, position, currentPlayer.id);
    
    // Check scouting mode states
    const isScoutingAvailable = gameState.scoutingMode.active && gameState.scoutingMode.availablePositions.includes(position);
    const isScoutingSelected = gameState.scoutingMode.active && gameState.scoutingMode.selectedPositions.includes(position);
    
    const tileStyle = {
      position: 'relative',
      border: isScoutingAvailable && !isScoutingSelected ? '3px solid #3b82f6' : // Blue border for available scouting
              isScoutingSelected ? '3px solid #3b82f6' : // Blue border for selected
              '1px solid #4b5563',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      fontSize: '10px',
      lineHeight: '1.2',
      padding: '2px',
      aspectRatio: '1/1',
      minHeight: '40px',
      cursor: (isDiscoverable || isMovable || isScoutingAvailable) ? 'pointer' : 'default',
      background: isKrater ? '#6b7280' : 
                  tile ? getTileColor(tile.id) :
                  isScoutingSelected ? 'rgba(59, 130, 246, 0.3)' : // Blue background for selected
                  isDiscoverable ? '#374151' : '#1f2937',
      outline: isMovable ? '3px solid #10b981' : 'none',
      outlineOffset: isMovable ? '-3px' : '0',
      transition: 'all 0.2s ease-in-out',
      boxShadow: isScoutingAvailable ? '0 0 8px rgba(59, 130, 246, 0.4)' : 'none'
    };

    return (
      <div
        key={position}
        onClick={() => onTileClick(position)}
        style={tileStyle}
      >
        {/* Krater */}
        {isKrater && (
          <>
            <div style={{ fontSize: '16px' }}>🌋</div>
            <div>Krater</div>
          </>
        )}
        
        {/* Revealed Tile - Only Text */}
        {tile && (
          <div style={{ 
            fontSize: '0.6rem', 
            fontWeight: 'bold', 
            textAlign: 'center',
            color: '#ffffff',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            zIndex: 1,
            position: 'relative'
          }}>
            {getTileName(tile.id)}
          </div>
        )}

        {/* Discoverable Indicator */}
        {isDiscoverable && !tile && (
          <div style={{ color: '#9ca3af', fontSize: '20px' }}>?</div>
        )}

        {/* Large Item Icons in Center */}
        {tile?.resources && tile.resources.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2px',
            zIndex: 2
          }}>
            {tile.resources.map((resource, index) => (
              <div key={index} style={{
                fontSize: tile.resources.length === 1 ? '20px' : '14px',
                lineHeight: '1',
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))',
                cursor: 'pointer'
              }}
              title={resource === 'kristall' ? 'Apeiron-Kristall' :
                     resource === 'bauplan_erde' ? 'Bauplan: Erde' :
                     resource === 'bauplan_wasser' ? 'Bauplan: Wasser' :
                     resource === 'bauplan_feuer' ? 'Bauplan: Feuer' :
                     resource === 'bauplan_luft' ? 'Bauplan: Luft' : resource}>
                {resource === 'kristall' ? '💎' :
                 resource.startsWith('bauplan_') ? '📋' : '📦'}
              </div>
            ))}
          </div>
        )}

        {/* Heroes on tile */}
        {heroesOnTile.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            display: 'flex',
            gap: '1px'
          }}>
            {heroesOnTile.map(hero => (
              <div
                key={hero.id}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: heroes[hero.id].color,
                  border: gameState.currentPlayerIndex === gameState.players.indexOf(hero) ? '2px solid #facc15' : '1px solid #000',
                  fontSize: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                title={hero.name}
              >
                {hero.name[0]}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          width: 'min(90vw, 90vh, 600px)',
          height: 'min(90vw, 90vh, 600px)',
          backgroundColor: '#111827',
          border: '2px solid #4b5563',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {Array.from({ length: boardSize }, (_, y) =>
          Array.from({ length: boardSize }, (_, x) =>
            renderTile(x, y)
          )
        )}
      </div>
    </div>
  );
}

// Helper functions
const isAdjacentToCurrentPlayer = (x, y, playerPosition) => {
  const [playerX, playerY] = playerPosition.split(',').map(Number);
  
  // Only horizontal and vertical directions (no diagonals)
  const directions = [
    [-1, 0], // up
    [1, 0],  // down  
    [0, -1], // left
    [0, 1]   // right
  ];

  return directions.some(([dx, dy]) => {
    const adjacentX = playerX + dx;
    const adjacentY = playerY + dy;
    
    // Check if this tile position matches the adjacent position to player
    return x === adjacentX && y === adjacentY;
  });
};

const canMoveToPosition = (fromPosition, toPosition, playerId) => {
  const [fromX, fromY] = fromPosition.split(',').map(Number);
  const [toX, toY] = toPosition.split(',').map(Number);
  
  // Calculate distances
  const deltaX = Math.abs(toX - fromX);
  const deltaY = Math.abs(toY - fromY);
  const manhattanDistance = deltaX + deltaY;
  
  if (manhattanDistance === 0) return false; // Same position
  
  if (playerId === 'corvus') {
    // Corvus can move up to 2 fields total, including diagonal
    // Diagonal means: 1 step horizontal + 1 step vertical = 2 steps total
    // But each individual step is max 1 field, so max diagonal is (1,1)
    return (deltaX <= 1 && deltaY <= 1) && manhattanDistance <= 2;
  } else {
    // Normal heroes: only 1 field horizontal OR vertical (no diagonal)
    return manhattanDistance === 1;
  }
};

const getTileColor = (tileId) => {
  const colors = {
    wiese_kristall: 'linear-gradient(135deg, #4ade80, #16a34a)', // Green gradient
    hoehle_kristall: 'linear-gradient(135deg, #6b7280, #374151)', // Gray gradient
    bauplan_erde: 'linear-gradient(135deg, #eab308, #ca8a04)', // Golden gradient
    bauplan_wasser: 'linear-gradient(135deg, #60a5fa, #3b82f6)', // Blue gradient
    bauplan_feuer: 'linear-gradient(135deg, #f87171, #ef4444)', // Red gradient
    bauplan_luft: 'linear-gradient(135deg, #c084fc, #a78bfa)', // Purple gradient
    fluss: 'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan gradient
    gebirge: 'linear-gradient(135deg, #71717a, #52525b)', // Stone gradient
    wald: 'linear-gradient(135deg, #22c55e, #16a34a)', // Forest gradient
    huegel: 'linear-gradient(135deg, #84cc16, #65a30d)' // Lime gradient
  };
  return colors[tileId] || 'linear-gradient(135deg, #4b5563, #374151)';
};

const getTileSymbol = (tileId) => {
  const symbols = {
    wiese_kristall: '💎',
    hoehle_kristall: '💎',
    bauplan_erde: '📜',
    bauplan_wasser: '📜', 
    bauplan_feuer: '📜',
    bauplan_luft: '📜',
    fluss: '🌊',
    gebirge: '⛰️',
    wald: '🌲',
    huegel: '⛰️'
  };
  return symbols[tileId] || '🔍';
};

const getTileName = (tileId) => {
  const names = {
    wiese_kristall: 'Wiese',
    hoehle_kristall: 'Höhle',
    bauplan_erde: 'Erde',
    bauplan_wasser: 'Wasser',
    bauplan_feuer: 'Feuer', 
    bauplan_luft: 'Luft',
    fluss: 'Fluss',
    gebirge: 'Berg',
    wald: 'Wald',
    huegel: 'Hügel'
  };
  return names[tileId] || tileId;
};

const getTileResources = (tileId) => {
  const resourceTiles = {
    wiese_kristall: ['kristall'],
    hoehle_kristall: ['kristall'],
    bauplan_erde: ['bauplan_erde'],
    bauplan_wasser: ['bauplan_wasser'],
    bauplan_feuer: ['bauplan_feuer'],
    bauplan_luft: ['bauplan_luft']
  };
  return resourceTiles[tileId] || [];
};

function GameScreen({ gameData, onNewGame }) {
  const [gameState, setGameState] = useState({
    round: 1,
    light: 20,
    currentPlayerIndex: 0,
    players: gameData.selectedCharacters.map((heroId, index) => ({
      id: heroId,
      name: heroes[heroId].name,
      position: '4,4',
      ap: 3,
      maxAp: 3,
      inventory: [],
      maxInventory: 2,
      learnedSkills: heroes[heroId].element === 'earth' ? ['grundstein_legen', 'geroell_beseitigen', 'aufdecken'] :
                    heroes[heroId].element === 'fire' ? ['element_aktivieren', 'dornen_entfernen', 'aufdecken'] :
                    heroes[heroId].element === 'water' ? ['reinigen', 'fluss_freimachen', 'aufdecken'] :
                    ['spaehen', 'schnell_bewegen', 'aufdecken'] // air/corvus
    })),
    board: {},
    tower: { foundations: [], activatedElements: [] },
    isTransitioning: false,
    currentEvent: null,
    eventDeck: [...eventsConfig.phase1.positive, ...eventsConfig.phase1.negative],
    scoutingMode: {
      active: false,
      availablePositions: [],
      selectedPositions: [],
      maxSelections: 2
    },
    tileDeck: [
      'wiese_kristall', 'wiese_kristall', 'wiese_kristall',
      'hoehle_kristall', 'hoehle_kristall', 
      'bauplan_erde', 'bauplan_wasser', 'bauplan_feuer', 'bauplan_luft',
      'fluss', 'fluss', 'gebirge', 'gebirge', 
      'wald', 'wald', 'huegel', 'huegel'
    ].sort(() => Math.random() - 0.5) // shuffle
  });

  const handleTileClick = (position) => {
    // Handle scouting mode selection
    if (gameState.scoutingMode.active) {
      if (gameState.scoutingMode.availablePositions.includes(position)) {
        handleScoutingSelection(position);
      }
      return;
    }

    const tile = gameState.board[position];
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const [clickedX, clickedY] = position.split(',').map(Number);
    
    // Check if clicked tile is adjacent to current player
    const isAdjacentToPlayer = isAdjacentToCurrentPlayer(clickedX, clickedY, currentPlayer.position);
    
    if (!tile && gameState.tileDeck.length > 0 && currentPlayer.ap > 0 && isAdjacentToPlayer) {
      // Discover new tile
      const newTileId = gameState.tileDeck.pop();
      const [x, y] = position.split(',').map(Number);
      
      setGameState(prev => {
        const newPlayers = prev.players.map((player, index) => 
          index === prev.currentPlayerIndex 
            ? { ...player, ap: player.ap - 1 }
            : player
        );
        
        // Handle automatic turn transition
        const { nextPlayerIndex, newRound } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round);
        
        return {
          ...prev,
          board: {
            ...prev.board,
            [position]: { 
              id: newTileId, 
              x, 
              y,
              resources: getTileResources(newTileId)
            }
          },
          players: newPlayers,
          currentPlayerIndex: nextPlayerIndex,
          round: newRound
        };
      });
    } else if (tile && currentPlayer.ap > 0 && canMoveToPosition(currentPlayer.position, position, currentPlayer.id)) {
      // Move to tile (only if within allowed movement range)
      setGameState(prev => {
        const newPlayers = prev.players.map((player, index) => 
          index === prev.currentPlayerIndex 
            ? { ...player, position, ap: player.ap - 1 }
            : player
        );
        
        // Handle automatic turn transition
        const { nextPlayerIndex, newRound } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round);
        
        return {
          ...prev,
          players: newPlayers,
          currentPlayerIndex: nextPlayerIndex,
          round: newRound
        };
      });
    }
  };

  const handleCollectResources = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const currentTile = gameState.board[currentPlayer.position];
    
    if (!currentTile || currentTile.resources.length === 0 || currentPlayer.ap === 0) return;
    if (currentPlayer.inventory.length >= currentPlayer.maxInventory) return; // Inventory full
    
    setGameState(prev => {
      const newPlayers = prev.players.map((player, index) => {
        if (index === prev.currentPlayerIndex) {
          const resourcesToTake = Math.min(
            currentTile.resources.length,
            player.maxInventory - player.inventory.length
          );
          const takenResources = currentTile.resources.slice(0, resourcesToTake);
          
          return {
            ...player,
            inventory: [...player.inventory, ...takenResources],
            ap: player.ap - 1
          };
        }
        return player;
      });
      
      // Remove collected resources from tile
      const updatedBoard = {
        ...prev.board,
        [currentPlayer.position]: {
          ...currentTile,
          resources: currentTile.resources.slice(
            Math.min(currentTile.resources.length, currentPlayer.maxInventory - currentPlayer.inventory.length)
          )
        }
      };
      
      // Handle automatic turn transition
      const { nextPlayerIndex, newRound } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round);
      
      return {
        ...prev,
        players: newPlayers,
        board: updatedBoard,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound
      };
    });
  };

  const triggerTurnTransition = (nextPlayerIndex) => {
    setGameState(prev => ({
      ...prev,
      currentPlayerIndex: nextPlayerIndex,
      isTransitioning: true
    }));

    // Clear transition after animation duration
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        isTransitioning: false
      }));
    }, 1500);
  };

  const handleAutoTurnTransition = (updatedPlayers, currentPlayerIndex, round) => {
    const updatedCurrentPlayer = updatedPlayers[currentPlayerIndex];

    // Only transition if current player has no AP left
    if (updatedCurrentPlayer.ap === 0) {
      // Find next player with AP
      let nextPlayerWithAP = null;

      for (let i = 1; i < updatedPlayers.length; i++) {
        const checkIndex = (currentPlayerIndex + i) % updatedPlayers.length;
        if (updatedPlayers[checkIndex].ap > 0) {
          nextPlayerWithAP = checkIndex;
          break;
        }
      }

      if (nextPlayerWithAP !== null) {
        // Continue with next player who has AP
        triggerTurnTransition(nextPlayerWithAP);
        return { nextPlayerIndex: nextPlayerWithAP, newRound: round };
      } else {
        // NO player has AP left - round is truly complete
        const newRound = round + 1;

        // Reset ALL players AP and start new round
        updatedPlayers.forEach(player => { player.ap = player.maxAp; });

        // Set next player to 0 (start of new round)
        triggerTurnTransition(0);

        // Trigger event IMMEDIATELY if we're starting round 2 or later
        // (Events start from round 2, not round 1)
        if (newRound >= 2) {
          console.log(`Round completed: ${round} -> ${newRound}, triggering event`);
          // Use a very short timeout to ensure state is updated
          setTimeout(() => {
            triggerRandomEvent();
          }, 10);
        }

        return { nextPlayerIndex: 0, newRound: newRound };
      }
    }

    // Current player still has AP, no transition needed
    return { nextPlayerIndex: currentPlayerIndex, newRound: round };
  };

  // Event System
  const triggerRandomEvent = () => {
    setGameState(prev => {
      // Prevent triggering if there's already an active event
      if (prev.currentEvent) {
        console.log('Event trigger blocked - event already active:', prev.currentEvent.name);
        return prev;
      }

      // Prevent triggering if no events left
      if (prev.eventDeck.length === 0) {
        console.log('Event trigger blocked - deck empty');
        return prev;
      }

      const randomIndex = Math.floor(Math.random() * prev.eventDeck.length);
      const selectedEvent = prev.eventDeck[randomIndex];

      console.log(`Triggering event: ${selectedEvent.name} at round ${prev.round}. Deck has ${prev.eventDeck.length} cards left.`);

      return {
        ...prev,
        currentEvent: selectedEvent,
        eventDeck: prev.eventDeck.filter((_, index) => index !== randomIndex)
      };
    });
  };

  const applyEventEffect = (event) => {
    setGameState(prev => {
      let newState = { ...prev };

      event.effects.forEach(effect => {
        switch (effect.type) {
          case 'light_gain':
            let gainValue = effect.value;
            if (gainValue === 'player_count') {
              gainValue = newState.players.length;
            } else if (gainValue === 'player_count_times_2') {
              gainValue = newState.players.length * 2;
            }
            newState.light = Math.min(20, newState.light + gainValue);
            break;
          case 'light_loss':
            newState.light = Math.max(0, newState.light - effect.value);
            break;
          case 'bonus_ap':
            if (effect.target === 'active_player') {
              newState.players[newState.currentPlayerIndex].ap += effect.value;
            } else if (effect.target === 'all_players') {
              newState.players = newState.players.map(player => ({
                ...player,
                ap: Math.min(player.maxAp + 2, player.ap + effect.value)
              }));
            } else if (effect.target === 'random_hero') {
              const randomIndex = Math.floor(Math.random() * newState.players.length);
              newState.players[randomIndex].ap += effect.value;
            }
            break;
          case 'reduce_ap':
            if (effect.target === 'all_players') {
              newState.players = newState.players.map(player => ({
                ...player,
                ap: Math.max(0, player.ap - effect.value)
              }));
            } else if (effect.target === 'random_hero') {
              const randomIndex = Math.floor(Math.random() * newState.players.length);
              newState.players[randomIndex].ap = Math.max(0, newState.players[randomIndex].ap - effect.value);
            }
            break;
          case 'set_ap':
            if (effect.target === 'all_players') {
              newState.players = newState.players.map(player => ({
                ...player,
                ap: effect.value
              }));
            }
            break;
          case 'add_resource':
            if (effect.target === 'active_player') {
              const currentPlayer = newState.players[newState.currentPlayerIndex];
              if (currentPlayer.inventory.length < currentPlayer.maxInventory) {
                currentPlayer.inventory.push(effect.resource);
              }
            } else if (effect.target === 'crater') {
              // Add resources to crater field
              if (!newState.board['4,4'].resources) {
                newState.board['4,4'].resources = [];
              }
              for (let i = 0; i < effect.value; i++) {
                newState.board['4,4'].resources.push(effect.resource);
              }
            } else if (effect.target === 'all_adjacent_to_crater') {
              // Add resources to fields adjacent to crater
              const adjacentPositions = ['3,4', '5,4', '4,3', '4,5'];
              adjacentPositions.forEach(pos => {
                if (newState.board[pos]) {
                  if (!newState.board[pos].resources) {
                    newState.board[pos].resources = [];
                  }
                  newState.board[pos].resources.push(effect.resource);
                }
              });
            }
            break;
          case 'drop_resource':
            if (effect.target === 'hero_with_most_crystals') {
              let maxCrystals = 0;
              let heroesWithMost = [];
              newState.players.forEach((player, index) => {
                const crystalCount = player.inventory.filter(item => item === 'kristall').length;
                if (crystalCount > maxCrystals) {
                  maxCrystals = crystalCount;
                  heroesWithMost = [index];
                } else if (crystalCount === maxCrystals && crystalCount > 0) {
                  heroesWithMost.push(index);
                }
              });
              heroesWithMost.forEach(playerIndex => {
                const player = newState.players[playerIndex];
                const crystalIndex = player.inventory.findIndex(item => item === 'kristall');
                if (crystalIndex !== -1) {
                  player.inventory.splice(crystalIndex, 1);
                  // Add to current field
                  const pos = player.position;
                  if (!newState.board[pos].resources) {
                    newState.board[pos].resources = [];
                  }
                  newState.board[pos].resources.push('kristall');
                }
              });
            } else if (effect.target === 'heroes_on_crater') {
              newState.players.forEach(player => {
                if (player.position === '4,4') {
                  const crystalIndex = player.inventory.findIndex(item => item === 'kristall');
                  if (crystalIndex !== -1) {
                    player.inventory.splice(crystalIndex, 1);
                    if (!newState.board['4,4'].resources) {
                      newState.board['4,4'].resources = [];
                    }
                    newState.board['4,4'].resources.push('kristall');
                  }
                }
              });
            }
            break;
          case 'drop_all_items':
            if (effect.target === 'random_hero') {
              const randomIndex = Math.floor(Math.random() * newState.players.length);
              const player = newState.players[randomIndex];
              const pos = player.position;
              if (!newState.board[pos].resources) {
                newState.board[pos].resources = [];
              }
              newState.board[pos].resources.push(...player.inventory);
              player.inventory = [];
            }
            break;
          case 'add_obstacle':
            if (effect.target === 'north_of_crater') {
              if (newState.board['4,3']) {
                newState.board['4,3'].obstacle = effect.obstacle;
              }
            } else if (effect.target === 'east_of_crater') {
              if (newState.board['5,4']) {
                newState.board['5,4'].obstacle = effect.obstacle;
              }
            } else if (effect.target === 'south_of_crater') {
              if (newState.board['4,5']) {
                newState.board['4,5'].obstacle = effect.obstacle;
              }
            } else if (effect.target === 'west_of_crater') {
              if (newState.board['3,4']) {
                newState.board['3,4'].obstacle = effect.obstacle;
              }
            } else if (effect.target === 'all_adjacent_to_crater') {
              const adjacentPositions = ['3,4', '5,4', '4,3', '4,5'];
              adjacentPositions.forEach(pos => {
                if (newState.board[pos]) {
                  newState.board[pos].obstacle = effect.obstacle;
                }
              });
            } else if (effect.target === 'random_revealed_tile') {
              const revealedTiles = Object.keys(newState.board).filter(pos => pos !== '4,4');
              if (revealedTiles.length > 0) {
                const randomTile = revealedTiles[Math.floor(Math.random() * revealedTiles.length)];
                if (newState.board[randomTile]) {
                  newState.board[randomTile].obstacle = effect.obstacle;
                }
              }
            }
            break;
          case 'skip_turn':
            if (effect.target === 'random_hero') {
              const randomIndex = Math.floor(Math.random() * newState.players.length);
              // Mark player to skip next turn - would need additional state tracking
              console.log(`Player ${newState.players[randomIndex].name} will skip next turn`);
            }
            break;
          case 'remove_all_negative_effects':
            // Remove all negative effects from players - would need effect tracking
            console.log('All negative effects removed');
            break;
          // Block/Prevent actions would require additional state management
          case 'block_action':
          case 'block_skills':
          case 'prevent_movement':
          case 'disable_communication':
            console.log(`Effect ${effect.type} applied - UI feedback needed`);
            break;
          // Phase 2 effects - not yet implemented
          case 'spread_darkness':
          case 'cleanse_darkness':
          case 'remove_obstacles':
          case 'remove_all_obstacles':
            console.log(`Phase 2 effect ${effect.type} - not yet implemented`);
            break;
        }
      });

      return {
        ...newState,
        currentEvent: null
      };
    });
  };


  // Special Hero Actions
  const handleBuildFoundation = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.position !== '4,4' || currentPlayer.ap < 1) return;
    
    const kristallCount = currentPlayer.inventory.filter(item => item === 'kristall').length;
    if (kristallCount < 2) return;

    // Terra can build foundations
    if (!currentPlayer.learnedSkills.includes('grundstein_legen')) return;

    setGameState(prev => {
      const newPlayers = prev.players.map((player, index) => {
        if (index === prev.currentPlayerIndex) {
          const newInventory = [...player.inventory];
          let removed = 0;
          for (let i = newInventory.length - 1; i >= 0 && removed < 2; i--) {
            if (newInventory[i] === 'kristall') {
              newInventory.splice(i, 1);
              removed++;
            }
          }
          
          return {
            ...player,
            inventory: newInventory,
            ap: player.ap - 1
          };
        }
        return player;
      });

      const newTower = {
        ...prev.tower,
        foundations: [...(prev.tower.foundations || []), currentPlayer.id === 'terra' ? 'erde' : 
                     currentPlayer.id === 'ignis' ? 'feuer' : 
                     currentPlayer.id === 'lyra' ? 'wasser' : 'luft']
      };

      // Handle automatic turn transition
      const { nextPlayerIndex, newRound } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round);

      return {
        ...prev,
        players: newPlayers,
        tower: newTower,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound
      };
    });
  };

  const handleScout = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer.learnedSkills.includes('spaehen') || currentPlayer.ap < 1) return;
    if (gameState.tileDeck.length === 0) return;

    const [x, y] = currentPlayer.position.split(',').map(Number);
    const adjacentPositions = [
      [x-1, y], [x+1, y], [x, y-1], [x, y+1]
    ].filter(([nx, ny]) => nx >= 0 && nx < 9 && ny >= 0 && ny < 9)
     .map(([nx, ny]) => `${nx},${ny}`)
     .filter(pos => !gameState.board[pos]);

    if (adjacentPositions.length === 0) return;

    // Enter scouting mode
    setGameState(prev => ({
      ...prev,
      scoutingMode: {
        active: true,
        availablePositions: adjacentPositions,
        selectedPositions: [],
        maxSelections: Math.min(2, adjacentPositions.length, prev.tileDeck.length)
      }
    }));
  };

  const handleScoutingSelection = (position) => {
    if (!gameState.scoutingMode.active) return;
    
    setGameState(prev => {
      const { scoutingMode } = prev;
      const isSelected = scoutingMode.selectedPositions.includes(position);
      
      let newSelectedPositions;
      if (isSelected) {
        // Deselect
        newSelectedPositions = scoutingMode.selectedPositions.filter(pos => pos !== position);
        return {
          ...prev,
          scoutingMode: {
            ...scoutingMode,
            selectedPositions: newSelectedPositions
          }
        };
      } else if (scoutingMode.selectedPositions.length < scoutingMode.maxSelections) {
        // Select
        newSelectedPositions = [...scoutingMode.selectedPositions, position];
        
        // Auto-reveal if 2 positions selected
        if (newSelectedPositions.length === 2 || newSelectedPositions.length === scoutingMode.maxSelections) {
          // Immediately reveal tiles
          const newBoard = { ...prev.board };
          
          newSelectedPositions.forEach(pos => {
            const newTileId = prev.tileDeck.pop();
            const [px, py] = pos.split(',').map(Number);
            newBoard[pos] = {
              id: newTileId,
              x: px,
              y: py,
              resources: getTileResources(newTileId)
            };
          });

          const newPlayers = prev.players.map((player, index) => 
            index === prev.currentPlayerIndex ? { ...player, ap: player.ap - 1 } : player
          );

          // Handle automatic turn transition
          const { nextPlayerIndex, newRound } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round);

          return {
            ...prev,
            board: newBoard,
            players: newPlayers,
            tileDeck: prev.tileDeck,
            currentPlayerIndex: nextPlayerIndex,
            round: newRound,
            scoutingMode: {
              active: false,
              availablePositions: [],
              selectedPositions: [],
              maxSelections: 2
            }
          };
        }
        
        return {
          ...prev,
          scoutingMode: {
            ...scoutingMode,
            selectedPositions: newSelectedPositions
          }
        };
      } else {
        // Max selections reached
        return prev;
      }
    });
  };

  const confirmScouting = () => {
    if (!gameState.scoutingMode.active || gameState.scoutingMode.selectedPositions.length === 0) return;

    setGameState(prev => {
      const newBoard = { ...prev.board };
      const tilesToReveal = prev.scoutingMode.selectedPositions;
      
      tilesToReveal.forEach(position => {
        const newTileId = prev.tileDeck.pop();
        const [px, py] = position.split(',').map(Number);
        newBoard[position] = {
          id: newTileId,
          x: px,
          y: py,
          resources: getTileResources(newTileId)
        };
      });

      const newPlayers = prev.players.map((player, index) => 
        index === prev.currentPlayerIndex ? { ...player, ap: player.ap - 1 } : player
      );

      // Handle automatic turn transition
      const { nextPlayerIndex, newRound } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round);

      return {
        ...prev,
        board: newBoard,
        players: newPlayers,
        tileDeck: prev.tileDeck, // tileDeck is already modified by .pop()
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        scoutingMode: {
          active: false,
          availablePositions: [],
          selectedPositions: [],
          maxSelections: 2
        }
      };
    });
  };

  const cancelScouting = () => {
    setGameState(prev => ({
      ...prev,
      scoutingMode: {
        active: false,
        availablePositions: [],
        selectedPositions: [],
        maxSelections: 2
      }
    }));
  };

  const handleLearn = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const currentTile = gameState.board[currentPlayer.position];
    
    if (!currentTile?.resources?.some(r => r.startsWith('bauplan_')) || currentPlayer.ap < 1) return;

    setGameState(prev => {
      // Find all players on the same position
      const playersOnSamePosition = prev.players.filter(player => player.position === currentPlayer.position);
      
      // Determine what skills to learn from available blueprints
      const availableBlueprints = currentTile.resources.filter(r => r.startsWith('bauplan_'));
      const newSkillsToLearn = [];
      
      availableBlueprints.forEach(blueprint => {
        switch (blueprint) {
          case 'bauplan_erde':
            // Can learn foundation building (requires Terra's base skill)
            if (prev.players.some(p => p.learnedSkills.includes('grundstein_legen'))) {
              newSkillsToLearn.push('grundstein_legen');
            }
            // Learn Terra's other skills
            newSkillsToLearn.push('geroell_beseitigen');
            break;
          case 'bauplan_wasser':
            newSkillsToLearn.push('reinigen', 'fluss_freimachen');
            break;
          case 'bauplan_feuer':
            newSkillsToLearn.push('element_aktivieren', 'dornen_entfernen');
            break;
          case 'bauplan_luft':
            newSkillsToLearn.push('spaehen', 'schnell_bewegen');
            break;
        }
      });

      // Update all players on the same position with new skills
      const newPlayers = prev.players.map(player => {
        if (player.position === currentPlayer.position) {
          const updatedSkills = [...new Set([...player.learnedSkills, ...newSkillsToLearn])];
          return {
            ...player,
            learnedSkills: updatedSkills,
            ap: player.id === currentPlayer.id ? player.ap - 1 : player.ap
          };
        }
        return player;
      });

      // Handle automatic turn transition
      const { nextPlayerIndex, newRound } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round);

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound
      };
    });
  };

  const renderActionButtons = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const currentTile = gameState.board[currentPlayer.position];
    const canCollect = currentTile?.resources?.length > 0 && 
                      currentPlayer.inventory.length < currentPlayer.maxInventory && 
                      currentPlayer.ap > 0;
    const canBuildFoundation = currentPlayer.position === '4,4' && 
                              currentPlayer.learnedSkills.includes('grundstein_legen') &&
                              currentPlayer.inventory.filter(item => item === 'kristall').length >= 2 &&
                              currentPlayer.ap > 0;
    const canScout = currentPlayer.learnedSkills.includes('spaehen') && 
                    currentPlayer.ap > 0 && 
                    gameState.tileDeck.length > 0;
    const canLearn = currentTile?.resources?.some(r => r.startsWith('bauplan_')) && 
                    currentPlayer.ap > 0;

    // Show simplified scouting mode UI when active
    if (gameState.scoutingMode.active) {
      const selectedCount = gameState.scoutingMode.selectedPositions.length;
      
      return (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div style={{ 
            textAlign: 'center', 
            color: '#3b82f6', 
            fontWeight: 'bold',
            fontSize: '0.75rem',
            padding: '8px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '4px',
            border: '1px solid #3b82f6'
          }}>
            👁️ Späh-Modus aktiv
          </div>
          <div style={{ 
            textAlign: 'center', 
            color: '#9ca3af',
            fontSize: '0.7rem'
          }}>
            Klicke auf {gameState.scoutingMode.maxSelections - selectedCount} {gameState.scoutingMode.maxSelections - selectedCount === 1 ? 'Feld' : 'Felder'} zum Aufdecken
            {selectedCount > 0 && <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>
              {selectedCount}/{gameState.scoutingMode.maxSelections} ausgewählt
            </div>}
          </div>
          <button 
            onClick={cancelScouting}
            style={{ 
              backgroundColor: '#ef4444', 
              color: 'white', 
              padding: '8px', 
              borderRadius: '4px', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            ❌ Abbrechen
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <button 
          onClick={handleCollectResources}
          disabled={!canCollect}
          style={{ 
            backgroundColor: canCollect ? '#7c3aed' : '#4b5563', 
            color: canCollect ? 'white' : '#9ca3af',
            padding: '10px 12px', 
            borderRadius: '8px', 
            border: canCollect ? '2px solid #8b5cf6' : '2px solid transparent',
            fontWeight: 'bold', 
            cursor: canCollect ? 'pointer' : 'not-allowed',
            fontSize: '0.8rem',
            transition: 'all 0.2s ease-in-out',
            boxShadow: canCollect ? '0 2px 4px rgba(124, 58, 237, 0.3)' : 'none',
            transform: canCollect ? 'translateY(0)' : 'translateY(1px)'
          }}
          title={canCollect ? 'Sammle Ressourcen von diesem Feld' : 'Keine Ressourcen verfügbar oder Inventar voll'}
        >
          💰 Sammeln (1 AP)
        </button>

        {currentPlayer.learnedSkills.includes('grundstein_legen') && (
          <button 
            onClick={handleBuildFoundation}
            disabled={!canBuildFoundation}
            style={{ 
              backgroundColor: canBuildFoundation ? '#ca8a04' : '#4b5563',
              color: canBuildFoundation ? 'white' : '#9ca3af',
              padding: '10px 12px', 
              borderRadius: '8px', 
              border: canBuildFoundation ? '2px solid #eab308' : '2px solid transparent',
              fontWeight: 'bold', 
              cursor: canBuildFoundation ? 'pointer' : 'not-allowed',
              fontSize: '0.8rem',
              transition: 'all 0.2s ease-in-out',
              boxShadow: canBuildFoundation ? '0 2px 4px rgba(202, 138, 4, 0.3)' : 'none',
              transform: canBuildFoundation ? 'translateY(0)' : 'translateY(1px)'
            }}
            title={canBuildFoundation ? 'Baue ein Fundament (benötigt 2 Kristalle)' : 'Benötigt Krater-Position und 2 Kristalle'}
          >
            🏗️ Fundament (1AP+2💎)
          </button>
        )}

        {currentPlayer.learnedSkills.includes('spaehen') && (
          <button 
            onClick={handleScout}
            disabled={!canScout}
            style={{ 
              backgroundColor: canScout ? '#3b82f6' : '#4b5563',
              color: canScout ? 'white' : '#9ca3af',
              padding: '10px 12px', 
              borderRadius: '8px', 
              border: canScout ? '2px solid #60a5fa' : '2px solid transparent',
              fontWeight: 'bold', 
              cursor: canScout ? 'pointer' : 'not-allowed',
              fontSize: '0.8rem',
              transition: 'all 0.2s ease-in-out',
              boxShadow: canScout ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none',
              transform: canScout ? 'translateY(0)' : 'translateY(1px)'
            }}
            title={canScout ? 'Spähe angrenzende Felder aus' : 'Benötigt 1 AP und verfügbare Karten'}
          >
            👁️ Spähen (1 AP)
          </button>
        )}

        {canLearn && (
          <button 
            onClick={handleLearn}
            style={{ 
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '10px 12px', 
              borderRadius: '8px', 
              border: '2px solid #a78bfa',
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)',
              gridColumn: '1 / -1',
              marginBottom: '0.5rem'
            }}
            title="Lerne Fähigkeiten von verfügbaren Bauplänen (alle Spieler auf diesem Feld)"
          >
            📚 Lernen (1 AP)
          </button>
        )}

        <button
          onClick={handleEndTurn}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '2px solid #ef4444',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.9rem',
            gridColumn: '1 / -1',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
            marginTop: '0.5rem'
          }}
          title="Beende deinen Zug und wechsle zum nächsten Spieler"
        >
          ⏭️ Zug beenden
        </button>
      </div>
    );
  };

  const handleEndTurn = () => {
    setGameState(prev => {
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const newRound = nextPlayerIndex === 0 ? prev.round + 1 : prev.round;
      
      return {
        ...prev,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        players: prev.players.map(player => ({
          ...player,
          ap: player.maxAp
        }))
      };
    });
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a202c', color: '#e2e8f0' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', padding: '1rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
          Apeiron
        </h1>
        <button
          onClick={onNewGame}
          style={{
            backgroundColor: '#ea580c',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
        >
          Neues Spiel einrichten
        </button>
      </header>

      {/* Event Card Modal */}
      {gameState.currentEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: gameState.currentEvent.effects?.some(e => e.type === 'light_loss' || e.type === 'reduce_ap' || e.type === 'add_obstacle')
              ? '3px solid #ef4444' : '3px solid #10b981'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '0.5rem'
              }}>
                {gameState.currentEvent.symbol}
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#f59e0b',
                marginBottom: '0.5rem'
              }}>
                {gameState.currentEvent.name}
              </h2>
              <p style={{
                color: '#d1d5db',
                fontSize: '1rem',
                lineHeight: '1.5',
                marginBottom: '1rem'
              }}>
                {gameState.currentEvent.description}
              </p>

              {/* Konter-Information */}
              {eventCounters[gameState.currentEvent.id] && eventCounters[gameState.currentEvent.id] !== '-' && (
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginTop: '1rem'
                }}>
                  <h4 style={{
                    color: '#3b82f6',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    marginBottom: '0.25rem'
                  }}>
                    Möglicher Konter:
                  </h4>
                  <p style={{
                    color: '#e5e7eb',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    {eventCounters[gameState.currentEvent.id]}
                  </p>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => applyEventEffect(gameState.currentEvent)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-friendly Layout */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'row',
        minHeight: 'calc(100vh - 120px)',
        gap: '1rem',
        padding: '0 1rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        
        {/* Game Summary - Top on mobile, right on desktop */}
        <div style={{
          backgroundColor: '#374151',
          borderRadius: '8px',
          padding: '1rem',
          width: '350px',
          flexShrink: 0
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '1rem' }}>
            Übersicht
          </h3>
          
          {/* Round and Light */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem' }}>
              Runde {gameState.round}
            </h4>
            <div style={{ 
              width: '100%', 
              backgroundColor: '#000', 
              borderRadius: '9999px', 
              height: '16px', 
              border: '2px solid #6b7280',
              overflow: 'hidden'
            }}>
              <div 
                style={{ 
                  backgroundColor: '#e5e7eb', 
                  height: '100%', 
                  width: `${(gameState.light / 20) * 100}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '4px'
                }}
              >
                <span style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.75rem' }}>
                  {gameState.light}
                </span>
              </div>
            </div>
          </div>

          {/* All Players Overview */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Alle Spieler
            </h4>
            {gameState.players.map((player, index) => {
              const isCurrentPlayer = index === gameState.currentPlayerIndex;
              return (
                <div
                  key={player.id}
                  style={{
                    backgroundColor: isCurrentPlayer ? 'rgba(59, 130, 246, 0.2)' : '#374151',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '0.75rem',
                    border: isCurrentPlayer ? '2px solid #3b82f6' : '2px solid #4b5563',
                    transition: 'all 0.3s ease',
                    boxShadow: isCurrentPlayer ? '0 4px 8px rgba(59, 130, 246, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
                    transform: isCurrentPlayer ? 'translateY(-2px)' : 'translateY(0)'
                  }}
                >
                  {/* Player Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      backgroundColor: heroes[player.id].color 
                    }}></div>
                    <span style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                      {player.name}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#d1d5db' }}>
                      AP: {player.ap}/{player.maxAp}
                    </div>
                  </div>
                  
                  {/* Inventory Slots */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: player.maxInventory }, (_, slotIndex) => {
                      const item = player.inventory[slotIndex];
                      const isEmpty = !item;
                      
                      return (
                        <div
                          key={slotIndex}
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: isEmpty ? '#2d3748' : 'rgba(59, 130, 246, 0.1)',
                            border: isEmpty ? '2px dashed #4a5568' : `2px solid ${item === 'kristall' ? '#3b82f6' : '#ca8a04'}`,
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s ease-in-out',
                            boxShadow: isEmpty ? 'inset 0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                          title={isEmpty ? 'Leerer Inventar-Slot' : 
                                item === 'kristall' ? 'Apeiron-Kristall' :
                                item === 'bauplan_erde' ? 'Bauplan: Erde' :
                                item === 'bauplan_wasser' ? 'Bauplan: Wasser' :
                                item === 'bauplan_feuer' ? 'Bauplan: Feuer' :
                                item === 'bauplan_luft' ? 'Bauplan: Luft' :
                                item}
                        >
                          {isEmpty ? (
                            <div style={{ width: '8px', height: '8px', backgroundColor: '#6b7280', borderRadius: '2px' }}></div>
                          ) : (
                            <span style={{ color: 'white', fontWeight: 'bold' }}>
                              {item === 'kristall' ? '💎' : item.startsWith('bauplan_') ? '📋' : '📦'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Skills indicator */}
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#fbbf24', 
                    marginTop: '6px',
                    display: 'flex',
                    gap: '4px',
                    flexWrap: 'wrap'
                  }}>
                    {player.learnedSkills.filter(skill => skill !== 'aufdecken').map((skill, index) => {
                      const skillEmojis = {
                        'grundstein_legen': '🧱',
                        'geroell_beseitigen': '⛏️',
                        'spaehen': '👁️',
                        'schnell_bewegen': '💨',
                        'element_aktivieren': '🔥',
                        'dornen_entfernen': '🌿',
                        'reinigen': '💧',
                        'fluss_freimachen': '🌊'
                      };
                      return (
                        <span 
                          key={skill}
                          style={{
                            backgroundColor: 'rgba(251, 191, 36, 0.2)',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            fontSize: '0.7rem'
                          }}
                          title={skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        >
                          {skillEmojis[skill] || '⚡'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {/* Turn transition indicator */}
            {gameState.isTransitioning && (
              <div style={{
                backgroundColor: '#fbbf24',
                color: '#1f2937',
                padding: '8px',
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                animation: 'fadeInOut 1.5s ease-in-out'
              }}>
                🔄 {gameState.players[gameState.currentPlayerIndex].name} ist dran!
              </div>
            )}
          </div>

          {/* Tower Status */}
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Turm der Elemente
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem' }}>
              {['erde', 'wasser', 'feuer', 'luft'].map(element => {
                const hasFoundation = gameState.tower?.foundations?.includes(element);
                const isActivated = gameState.tower?.activatedElements?.includes(element);
                
                return (
                  <div
                    key={element}
                    style={{
                      height: '2rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      border: '2px solid',
                      backgroundColor: isActivated ? '#16a34a' : hasFoundation ? '#ca8a04' : '#4b5563',
                      borderColor: isActivated ? '#4ade80' : hasFoundation ? '#fbbf24' : '#6b7280',
                      color: 'white'
                    }}
                    title={`${element}: ${isActivated ? 'Aktiviert' : hasFoundation ? 'Fundament' : 'Nicht gebaut'}`}
                  >
                    {element === 'erde' ? '⛰️' : element === 'wasser' ? '💧' : element === 'feuer' ? '🔥' : '💨'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Aktionen
            </h4>
            {renderActionButtons()}
          </div>
        </div>

        {/* Game Board - Bottom on mobile, left on desktop */}
        <div style={{ 
          flex: 1,
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <GameBoard gameState={gameState} onTileClick={handleTileClick} />
        </div>

      </div>
    </div>
  );
}

function ApeironGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState(null);

  const handleStartGame = (playerCount, difficulty, selectedCharacters) => {
    setGameData({
      playerCount,
      difficulty,
      selectedCharacters
    });
    setGameStarted(true);
  };

  const handleNewGame = () => {
    setGameStarted(false);
    setGameData(null);
  };

  if (gameStarted && gameData) {
    return <GameScreen gameData={gameData} onNewGame={handleNewGame} />;
  }

  return <GameSetup onStartGame={handleStartGame} />;
}

export default ApeironGame;