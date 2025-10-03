import React, { useState, useEffect, useRef } from 'react';
import eventsConfig from './config/events.json';
import tilesConfig from './config/tiles.json';
import gameRules from './config/gameRules.json';

// MODULE-LEVEL LOCKS: Prevent React StrictMode from executing handlers twice
// These MUST be outside the component to work across simultaneous calls
let currentlyApplyingEventId = null;
let currentlyConfirmingCardDraw = false;
let phaseTransitionInProgress = false;

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

// Direction translations (EN → DE)
const directionNames = {
  north: 'Norden',
  east: 'Osten',
  south: 'Süden',
  west: 'Westen'
};

// Game Data
const heroes = {
  terra: {
    id: 'terra',
    name: 'Terra',
    element: 'earth',
    description: 'Meisterin der Erde und des Bauens',
    color: '#22c55e', // Green (Erde/Earth)
    image: 'https://storage.googleapis.com/gemini-prod-us-west1-409905595311/images/8410058b-302a-4384-93f0-5847b85e05d0.jpg'
  },
  ignis: {
    id: 'ignis',
    name: 'Ignis',
    element: 'fire',
    description: 'Herr des Feuers und der Aktivierung',
    color: '#ef4444', // Red (Feuer/Fire) - unchanged
    image: 'https://storage.googleapis.com/gemini-prod-us-west1-409905595311/images/05b13824-2c6f-443b-87b6-14fdd1f9d45e.jpg'
  },
  lyra: {
    id: 'lyra',
    name: 'Lyra',
    element: 'water',
    description: 'Hüterin des Wassers und der Reinigung',
    color: '#3b82f6', // Blue (Wasser/Water) - unchanged
    image: 'https://storage.googleapis.com/gemini-prod-us-west1-409905595311/images/e7e9549f-b983-4a60-b6a2-632b71900a68.jpg'
  },
  corvus: {
    id: 'corvus',
    name: 'Corvus',
    element: 'air',
    description: 'Späher der Lüfte und schneller Beweger',
    color: '#eab308', // Yellow (Luft/Air)
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
    // eslint-disable-next-line no-unused-vars
    const heroesOnTile = gameState.players.filter(player => player.position === position);
    
    // Check if discoverable (adjacent to current player's position)
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isDiscoverable = !tile && isAdjacentToCurrentPlayer(x, y, currentPlayer.position);
    
    // Check if movable (revealed tile within movement range)
    const isMovable = tile && canMoveToPosition(currentPlayer.position, position, currentPlayer.id, gameState.players);
    
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
            {/* Foundation Indicators */}
            {gameState.tower && gameState.tower.foundations && gameState.tower.foundations.length > 0 && (
              <div style={{
                position: 'absolute',
                bottom: '2px',
                left: '2px',
                right: '2px',
                display: 'flex',
                justifyContent: 'center',
                gap: '1px'
              }}>
                {gameState.tower.foundations.map((foundation, index) => {
                  const foundationSymbols = {
                    'erde': '🗿',
                    'feuer': '🔥',
                    'wasser': '💧',
                    'luft': '💨'
                  };
                  return (
                    <div
                      key={foundation}
                      style={{
                        fontSize: '8px',
                        opacity: 0.9,
                        textShadow: '0 0 2px rgba(0,0,0,0.8)'
                      }}
                      title={`${foundation.charAt(0).toUpperCase() + foundation.slice(1)}-Fundament`}
                    >
                      {foundationSymbols[foundation] || '⚪'}
                    </div>
                  );
                })}
              </div>
            )}
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
            maxWidth: '90%',
            zIndex: 10 // Above darkness overlay (z-index: 5)
          }}>
            {tile.resources.map((resource, index) => {
              // Dynamic sizing based on item count
              const itemCount = tile.resources.length;
              const fontSize = itemCount === 1 ? '20px' :
                              itemCount === 2 ? '16px' :
                              itemCount <= 4 ? '14px' : '12px';

              return (
                <div key={index} style={{
                  fontSize,
                  lineHeight: '1',
                  filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))',
                  cursor: 'pointer'
                }}
                title={resource === 'kristall' ? 'Apeiron-Kristall' :
                       resource === 'bauplan_erde' ? 'Bauplan: Erde' :
                       resource === 'bauplan_wasser' ? 'Bauplan: Wasser' :
                       resource === 'bauplan_feuer' ? 'Bauplan: Feuer' :
                       resource === 'bauplan_luft' ? 'Bauplan: Luft' :
                       resource === 'artefakt_terra' ? 'Hammer der Erbauerin' :
                       resource === 'artefakt_ignis' ? 'Herz des Feuers' :
                       resource === 'artefakt_lyra' ? 'Kelch der Reinigung' :
                       resource === 'artefakt_corvus' ? 'Auge des Spähers' :
                       resource === 'element_fragment_erde' ? 'Erd-Fragment' :
                       resource === 'element_fragment_wasser' ? 'Wasser-Fragment' :
                       resource === 'element_fragment_feuer' ? 'Feuer-Fragment' :
                       resource === 'element_fragment_luft' ? 'Luft-Fragment' : resource}>
                  {resource === 'kristall' ? '💎' :
                   resource === 'artefakt_terra' ? '🔨' :
                   resource === 'artefakt_ignis' ? '🔥' :
                   resource === 'artefakt_lyra' ? '🏺' :
                   resource === 'artefakt_corvus' ? '👁️' :
                   resource === 'element_fragment_erde' ? '🟩' :
                   resource === 'element_fragment_wasser' ? '🟦' :
                   resource === 'element_fragment_feuer' ? '🟥' :
                   resource === 'element_fragment_luft' ? '🟨' :
                   resource.startsWith('bauplan_') ? '📋' : '📦'}
                </div>
              );
            })}
          </div>
        )}

        {/* Heroes on tile */}
        {heroesOnTile.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 18px)', // Max 2 columns
            gap: '6px', // More space for pulse animation
            zIndex: 20
          }}>
            {heroesOnTile.map(hero => {
              const isActivePlayer = gameState.currentPlayerIndex === gameState.players.indexOf(hero);
              const heroColor = heroes[hero.id].color;

              return (
                <div
                  key={hero.id}
                  style={{
                    width: '18px', // 1.5× larger (was 12px)
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: heroColor,
                    border: '2px solid white',
                    fontSize: '10px', // 1.25× larger (was 8px)
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    zIndex: 20, // Always on top
                    animation: isActivePlayer ? `pulseHero-${hero.id} 2s ease-in-out infinite` : 'none',
                    boxShadow: isActivePlayer
                      ? `0 0 8px ${heroColor}, 0 4px 8px rgba(0, 0, 0, 0.4)`
                      : '0 2px 4px rgba(0, 0, 0, 0.3)',
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                  }}
                  title={hero.name}
                >
                  {hero.name[0]}
                  {/* Inline keyframe animation for hero-specific color */}
                  {isActivePlayer && (
                    <style>{`
                      @keyframes pulseHero-${hero.id} {
                        0%, 100% {
                          transform: scale(1);
                          box-shadow: 0 0 8px ${heroColor}, 0 4px 8px rgba(0, 0, 0, 0.4);
                        }
                        50% {
                          transform: scale(1.1);
                          box-shadow: 0 0 16px ${heroColor}, 0 0 24px ${heroColor}, 0 6px 12px rgba(0, 0, 0, 0.5);
                        }
                      }
                    `}</style>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Obstacle on tile */}
        {tile?.obstacle && (
          <div style={{
            position: 'absolute',
            fontSize: '24px',
            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))',
            zIndex: 8 // Below items but above darkness
          }}>
            {tile.obstacle === 'geroell' ? '🪨' : tile.obstacle === 'dornenwald' ? '🌿' : tile.obstacle === 'ueberflutung' ? '🌊' : '🚧'}
          </div>
        )}

        {/* Darkness Overlay (Phase 2) */}
        {gameState.herzDerFinsternis.darkTiles?.includes(position) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle, rgba(0, 0, 0, 0.7) 0%, rgba(20, 0, 0, 0.85) 50%, rgba(0, 0, 0, 0.95) 100%)',
            border: '2px solid #7f1d1d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5, // Below items (z-index: 10) but above background
            animation: 'pulseDarkness 3s ease-in-out infinite',
            pointerEvents: 'none' // Allow clicks to pass through to underlying tile
          }}>
            <div style={{
              fontSize: '32px',
              filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.8))',
              opacity: 0.9
            }}>
              ☠️
            </div>
          </div>
        )}

        {/* Tor der Weisheit Marker */}
        {gameState.torDerWeisheit.position === position && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(224, 242, 254, 0.9) 50%, rgba(191, 219, 254, 0.85) 100%)',
            border: '3px solid #3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 11,
            animation: 'pulseGate 3s ease-in-out infinite',
            pointerEvents: 'none',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              fontSize: '40px',
              filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8))',
              animation: 'gateGlow 2s ease-in-out infinite'
            }}>
              ⛩️
            </div>
          </div>
        )}

        {/* Herz der Finsternis Marker */}
        {gameState.herzDerFinsternis.position === position && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle, rgba(127, 29, 29, 0.9) 0%, rgba(20, 0, 0, 0.95) 100%)',
            border: '3px solid #dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 11,
            animation: 'heartbeat 1.5s ease-in-out infinite',
            pointerEvents: 'none'
          }}>
            <div style={{
              fontSize: '40px',
              filter: 'drop-shadow(0 0 12px rgba(220, 38, 38, 1))'
            }}>
              💀
            </div>
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

const canMoveToPosition = (fromPosition, toPosition, playerId, players) => {
  const [fromX, fromY] = fromPosition.split(',').map(Number);
  const [toX, toY] = toPosition.split(',').map(Number);

  // Calculate distances
  const deltaX = Math.abs(toX - fromX);
  const deltaY = Math.abs(toY - fromY);
  const manhattanDistance = deltaX + deltaY;

  if (manhattanDistance === 0) return false; // Same position

  // Check if player has schnell_bewegen skill
  const currentPlayer = players.find(p => p.id === playerId);
  const hasQuickMove = currentPlayer?.learnedSkills.includes('schnell_bewegen');

  // Normal movement: 1 field horizontal OR vertical (no diagonal)
  if (manhattanDistance === 1) return true;

  // Quick movement: up to 2 fields in any direction (including diagonal)
  if (hasQuickMove && manhattanDistance <= 2) return true;

  return false;
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
    huegel: 'linear-gradient(135deg, #84cc16, #65a30d)', // Lime gradient
    // Artifacts
    artefakt_terra: 'linear-gradient(135deg, #eab308, #ca8a04)', // Golden (Terra/Earth)
    artefakt_ignis: 'linear-gradient(135deg, #f87171, #ef4444)', // Red (Ignis/Fire)
    artefakt_lyra: 'linear-gradient(135deg, #60a5fa, #3b82f6)', // Blue (Lyra/Water)
    artefakt_corvus: 'linear-gradient(135deg, #c084fc, #a78bfa)', // Purple (Corvus/Air)
    // Element fragments (Phase 2)
    element_fragment_erde: 'linear-gradient(135deg, #d97706, #92400e)', // Brown gradient
    element_fragment_wasser: 'linear-gradient(135deg, #2563eb, #1e40af)', // Deep blue gradient
    element_fragment_feuer: 'linear-gradient(135deg, #dc2626, #991b1b)', // Deep red gradient
    element_fragment_luft: 'linear-gradient(135deg, #9333ea, #6b21a8)' // Deep purple gradient
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
    huegel: '⛰️',
    tor_der_weisheit: '🚪',
    // Artifacts
    artefakt_terra: '🔨',
    artefakt_ignis: '🔥',
    artefakt_lyra: '🏺',
    artefakt_corvus: '👁️',
    // Element fragments (Phase 2) - Color-coded squares matching hero elements
    element_fragment_erde: '🟩', // Green (Terra)
    element_fragment_wasser: '🟦', // Blue (Lyra)
    element_fragment_feuer: '🟥', // Red (Ignis)
    element_fragment_luft: '🟨' // Yellow (Corvus)
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
    huegel: 'Hügel',
    tor_der_weisheit: 'Tor der Weisheit',
    // Artifacts
    artefakt_terra: 'Hammer der Erbauerin',
    artefakt_ignis: 'Herz des Feuers',
    artefakt_lyra: 'Kelch der Reinigung',
    artefakt_corvus: 'Auge des Spähers',
    // Element fragments (Phase 2)
    element_fragment_erde: 'Erd-Fragment',
    element_fragment_wasser: 'Wasser-Fragment',
    element_fragment_feuer: 'Feuer-Fragment',
    element_fragment_luft: 'Luft-Fragment'
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
    bauplan_luft: ['bauplan_luft'],
    // Artifacts (only added to deck if heroes are missing)
    artefakt_terra: ['artefakt_terra'],
    artefakt_ignis: ['artefakt_ignis'],
    artefakt_lyra: ['artefakt_lyra'],
    artefakt_corvus: ['artefakt_corvus'],
    // Element fragments (Phase 2)
    element_fragment_erde: ['element_fragment_erde'],
    element_fragment_wasser: ['element_fragment_wasser'],
    element_fragment_feuer: ['element_fragment_feuer'],
    element_fragment_luft: ['element_fragment_luft']
  };
  return resourceTiles[tileId] || [];
};

function GameScreen({ gameData, onNewGame }) {
  // Short-term flag to prevent cascade of round completions (100ms window)
  const roundCompletionInProgress = useRef(false);
  // Cache the correct round completion result to share with cascaded calls
  const roundCompletionCache = useRef(null);
  // Track if an event trigger has been assigned
  const eventTriggerAssigned = useRef(false);
  // Track which round already had an event triggered
  const eventTriggeredForRound = useRef(0);
  // Global flag to prevent multiple simultaneous triggerRandomEvent calls
  const isTriggeringEvent = useRef(false);

  const [gameState, setGameState] = useState(() => {
    const phase1TileDeck = Object.entries(tilesConfig.phase1).flatMap(([tileId, config]) => {
      if (tileId === 'herz_finster') return [];
      // Skip artifact tiles in initial deck creation (they will be added based on missing heroes)
      if (tileId.startsWith('artefakt_')) return [];
      return Array(config.count).fill(tileId);
    });

    // Add artifacts for missing heroes
    const allHeroes = ['terra', 'ignis', 'lyra', 'corvus'];
    const missingHeroes = allHeroes.filter(heroId =>
      !gameData.selectedCharacters.includes(heroId)
    );

    // Add one artifact card per missing hero
    const artifacts = missingHeroes.map(heroId => `artefakt_${heroId}`);
    const completeDeck = [...phase1TileDeck, ...artifacts];

    return {
      round: 1,
      phase: 1,
      light: gameRules.light.startValue,
      currentPlayerIndex: 0,
      players: gameData.selectedCharacters.map((heroId, index) => ({
        id: heroId,
        name: heroes[heroId].name,
        position: '4,4',
        ap: gameRules.actionPoints.perTurn,
        maxAp: gameRules.actionPoints.maxPerTurn,
        inventory: [],
        maxInventory: gameRules.inventory.maxSlots,
        learnedSkills: heroes[heroId].element === 'earth' ? ['grundstein_legen', 'geroell_beseitigen', 'aufdecken'] :
                      heroes[heroId].element === 'fire' ? ['element_aktivieren', 'dornen_entfernen', 'aufdecken'] :
                      heroes[heroId].element === 'water' ? ['reinigen', 'fluss_freimachen', 'aufdecken'] :
                      ['spaehen', 'schnell_bewegen', 'aufdecken'], // air/corvus
        element: heroes[heroId].element,
        isMaster: false,
        artifactSkills: [] // Track skills learned via artifacts (cannot be taught)
      })),
      board: {
        '4,4': { id: 'krater', x: 4, y: 4, resources: [], revealed: true }
      },
      tower: { foundations: [], activatedElements: [] },
      torDerWeisheit: {
        triggered: false,
        position: null,
        lightLossAtTrigger: 0
      },
      herzDerFinsternis: {
        triggered: false,
        position: null,
        darkTiles: [] // Array of "x,y" positions that are covered in darkness
      },
      herzDerFinsternisModal: {
        show: false,
        position: null,
        chosenDirection: null,
        awaitingCardDraw: false
      },
      torDerWeisheitModal: {
        show: false,
        position: null,
        chosenDirection: null,
        awaitingCardDraw: false
      },
      gameIntroModal: {
        show: true // Show on game start
      },
      victoryModal: {
        show: false,
        stats: null
      },
      defeatModal: {
        show: false,
        stats: null
      },
      isTransitioning: false,
      currentEvent: null,
      eventDeck: [...eventsConfig.phase1.positive, ...eventsConfig.phase1.negative],
      scoutingMode: { active: false, availablePositions: [], selectedPositions: [], maxSelections: 2 },
      tileDeck: completeDeck.sort(() => Math.random() - 0.5),
      actionBlockers: [],
      isEventTriggering: false,
      roundCompleted: false,
      phaseTransitionModal: {
        show: false,
        foundationBonus: 0,
        phaseCompletionBonus: 0,
        totalBonus: 0
      },
      cardDrawQueue: [], // Queue of cards to draw [{type: 'direction'|'hero', options: [...], purpose: 'event_effect'}]
      drawnCards: {}, // Store drawn card results {direction: 'north', hero: 'terra', etc.}
      cardDrawState: 'none' // 'none' | 'event_shown' | 'drawing' | 'result_shown'
    };
  });

  // Monitor light level to trigger Tor der Weisheit
  useEffect(() => {
    triggerTorDerWeisheit(gameState.light);
  }, [gameState.light]);

  // Apply Tor der Weisheit placement after direction card is drawn
  useEffect(() => {
    if (gameState.cardDrawQueue.length === 0 &&
        gameState.cardDrawState === 'none' &&
        gameState.drawnCards?.direction &&
        gameState.torDerWeisheit.triggered &&
        !gameState.torDerWeisheit.position) {

      console.log('🎴 Direction card drawn for Tor der Weisheit - placing gate now');

      setGameState(prev => {
        const lightLoss = gameRules.light.startValue - prev.light;
        return placeTorDerWeisheit(prev, prev.drawnCards.direction, lightLoss);
      });
    }
  }, [gameState.cardDrawQueue.length, gameState.cardDrawState, gameState.drawnCards, gameState.torDerWeisheit]);

  // Apply Herz der Finsternis placement after direction card is drawn
  useEffect(() => {
    if (gameState.cardDrawQueue.length === 0 &&
        gameState.cardDrawState === 'none' &&
        gameState.drawnCards?.direction &&
        gameState.herzDerFinsternis.triggered &&
        !gameState.herzDerFinsternis.position) {

      console.log('🎴 Direction card drawn for Herz der Finsternis - placing heart now');

      setGameState(prev => {
        return placeHeartOfDarknessWithDirection(prev, prev.drawnCards.direction);
      });
    }
  }, [gameState.cardDrawQueue.length, gameState.cardDrawState, gameState.drawnCards, gameState.herzDerFinsternis]);

  // NOTE: Event effects are now applied DIRECTLY in the card-draw onClick handler
  // This useEffect is NO LONGER USED but kept for reference/backup
  // The direct approach prevents React StrictMode double-execution issues
  /*
  useEffect(() => {
    if (gameState.currentEvent &&
        gameState.cardDrawQueue.length === 0 &&
        gameState.isEventTriggering &&
        Object.keys(gameState.drawnCards).length > 0) {
      // Effect application happens in onClick handler now
    }
  }, [gameState.cardDrawQueue.length, gameState.currentEvent, gameState.drawnCards, gameState.isEventTriggering]);
  */

  // Check for DEFEAT condition whenever light changes
  useEffect(() => {
    if (gameState.light === 0 && !gameState.defeatModal.show && !gameState.victoryModal.show) {
      console.log('💀 DEFEAT! Light has been extinguished - Darkness prevails!');

      const gameStats = {
        rounds: gameState.round,
        playerCount: gameState.players.length,
        phase: gameState.phase,
        activatedElements: gameState.tower.activatedElements || [],
        remainingLight: 0,
        playerNames: gameState.players.map(p => p.name)
      };

      setGameState(prev => ({
        ...prev,
        defeatModal: {
          show: true,
          stats: gameStats
        }
      }));
    }
  }, [gameState.light]);

  // DISABLED: Handle round completion events with useEffect to prevent loops
  // NOTE: Events are now triggered directly in handleAutoTurnTransition
  /*
  useEffect(() => {
    console.log(`🔍 useEffect ROUND CHECK: roundCompleted=${gameState.roundCompleted}, round=${gameState.round}, isEventTriggering=${gameState.isEventTriggering}`);

    // Only trigger when roundCompleted becomes true
    if (gameState.roundCompleted && !gameState.isEventTriggering && !gameState.currentEvent) {
      console.log('🎯 useEffect detected round completion - triggering event');

      // Reset flag and trigger event
      setGameState(prev => ({
        ...prev,
        roundCompleted: false,
        isEventTriggering: true
      }));

      // Trigger event directly
      triggerRandomEvent();
    } else if (gameState.round > 1) {
      console.log(`❌ useEffect: NO event triggered. roundCompleted=${gameState.roundCompleted}, round=${gameState.round}`);
    }
  }, [gameState.roundCompleted]); // Only depend on roundCompleted flag
  */

  const handleTileClick = (position) => {
    // Prevent actions if current player should skip turn
    if (shouldPlayerSkipTurn(gameState.players[gameState.currentPlayerIndex], gameState.round)) {
      console.log('Player cannot perform actions - must skip turn due to effect');
      return;
    }

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
    
    // Check if 'discover' action is blocked
    const isDiscoverBlocked = (gameState.actionBlockers || []).some(blocker =>
      (blocker.action === 'discover' || blocker.action === 'discover_and_scout') &&
      (blocker.target === 'all_players' || blocker.target === currentPlayer.id) &&
      blocker.expiresInRound > gameState.round
    );

    if (!tile && gameState.tileDeck.length > 0 && currentPlayer.ap > 0 && isAdjacentToPlayer && !isDiscoverBlocked) {
      // Discover new tile
      setGameState(prev => {
        // Draw tile from deck
        const newTileDeck = [...prev.tileDeck];
        const newTileId = newTileDeck.pop();
        const [x, y] = position.split(',').map(Number);

        const newPlayers = prev.players.map((player, index) =>
          index === prev.currentPlayerIndex
            ? { ...player, ap: player.ap - 1 }
            : player
        );

        // Handle automatic turn transition
        const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

        // Apply darkness spread if needed
        const updatedDarkTiles = nextDarkPos
          ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
          : prev.herzDerFinsternis.darkTiles || [];

        console.log(`📝 handleTileClick DISCOVERED: ${newTileId} at ${position}. Deck size: ${newTileDeck.length}. Round: ${newRound}`);
        return {
          ...prev,
          board: {
            ...prev.board,
            [position]: {
              id: newTileId,
              x,
              y,
              resources: getTileResources(newTileId),
              revealed: true
            }
          },
          tileDeck: newTileDeck,
          players: updatedPlayers || newPlayers,
          herzDerFinsternis: {
            ...prev.herzDerFinsternis,
            darkTiles: updatedDarkTiles
          },
          currentPlayerIndex: nextPlayerIndex,
          round: newRound,
          actionBlockers: actionBlockers,
          light: Math.max(0, prev.light - lightDecrement),
          roundCompleted: roundCompleted || false
        };
      });
    } else if (tile && currentPlayer.ap > 0 && canMoveToPosition(currentPlayer.position, position, currentPlayer.id, gameState.players)) {
      // Prevent moving if player has 'prevent_movement' effect
      if (currentPlayer.effects?.some(e => e.type === 'prevent_movement' && e.expiresInRound > gameState.round)) {
        console.log(`Movement for ${currentPlayer.name} blocked by an effect.`);
        // Optional: Add visual feedback for the user
        return;
      }

      // Prevent moving to a tile with an obstacle
      if (tile.obstacle) {
        console.log(`Movement to ${position} blocked by obstacle: ${tile.obstacle}`);
        return;
      }

      // Prevent moving to a dark tile (Phase 2)
      if (gameState.herzDerFinsternis.darkTiles?.includes(position)) {
        console.log(`Movement to ${position} blocked by darkness!`);
        return;
      }

      // Prevent moving to Herz der Finsternis position
      if (position === gameState.herzDerFinsternis.position) {
        console.log(`Movement to ${position} blocked - Herz der Finsternis is unpassable!`);
        return;
      }

      // Move to tile (only if within allowed movement range)
      setGameState(prev => {
        const newPlayers = prev.players.map((player, index) => 
          index === prev.currentPlayerIndex 
            ? { ...player, position, ap: player.ap - 1 }
            : player
        );

        // Handle automatic turn transition
        const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

        // Apply darkness spread if needed
        const updatedDarkTiles = nextDarkPos
          ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
          : prev.herzDerFinsternis.darkTiles || [];

        return {
          ...prev,
          players: updatedPlayers || newPlayers,
          currentPlayerIndex: nextPlayerIndex,
          round: newRound,
          actionBlockers: actionBlockers,
          light: Math.max(0, prev.light - lightDecrement),
          roundCompleted: roundCompleted || false,
          herzDerFinsternis: {
            ...prev.herzDerFinsternis,
            darkTiles: updatedDarkTiles
          }
        };
      });
    }
  };

  const handleDropItem = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Check if player has items and AP
    if (currentPlayer.inventory.length === 0 || currentPlayer.ap < 1) return;

    // If multiple items available, show selection modal
    if (currentPlayer.inventory.length > 1) {
      setGameState(prev => ({
        ...prev,
        currentEvent: {
          type: 'drop_item_selection',
          title: 'Item ablegen',
          description: 'Wähle ein Item zum Ablegen (1 AP):',
          availableItems: currentPlayer.inventory,
          position: currentPlayer.position
        }
      }));
      return;
    }

    // Only one item, drop it directly
    dropSelectedItem(currentPlayer.inventory[0]);
  };

  const dropSelectedItem = (selectedItem) => {
    setGameState(prev => {
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const itemIndex = currentPlayer.inventory.findIndex(item => item === selectedItem);

      if (itemIndex === -1) return prev; // Item not found

      const newPlayers = prev.players.map((player, index) => {
        if (index === prev.currentPlayerIndex) {
          const newInventory = [...player.inventory];
          newInventory.splice(itemIndex, 1);
          return {
            ...player,
            inventory: newInventory,
            ap: player.ap - 1
          };
        }
        return player;
      });

      // Add the item to the current tile
      const updatedBoard = {
        ...prev.board,
        [currentPlayer.position]: {
          ...prev.board[currentPlayer.position],
          resources: [...(prev.board[currentPlayer.position]?.resources || []), selectedItem]
        }
      };

      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed
      const updatedDarkTiles = nextDarkPos
        ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
        : prev.herzDerFinsternis.darkTiles || [];

      return {
        ...prev,
        players: updatedPlayers || newPlayers,
        board: updatedBoard,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: actionBlockers,
        light: Math.max(0, prev.light - lightDecrement),
        currentEvent: null, // Close any selection modal
        roundCompleted: roundCompleted || false,
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          darkTiles: updatedDarkTiles
        }
      };
    });
  };

  const handleSelectResource = (selectedResource) => {
    setGameState(prev => {
      const currentTile = prev.board[prev.currentEvent.position];
      const resourceIndex = currentTile.resources.findIndex(r => r === selectedResource);

      if (resourceIndex === -1) return prev; // Resource not found

      const newPlayers = prev.players.map((player, index) => {
        if (index === prev.currentPlayerIndex) {
          return {
            ...player,
            inventory: [...player.inventory, selectedResource],
            ap: player.ap - 1
          };
        }
        return player;
      });

      // Remove the selected resource from the tile
      const updatedBoard = {
        ...prev.board,
        [prev.currentEvent.position]: {
          ...currentTile,
          resources: currentTile.resources.filter((r, idx) => idx !== resourceIndex)
        }
      };

      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed
      const updatedDarkTiles = nextDarkPos
        ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
        : prev.herzDerFinsternis.darkTiles || [];

      return {
        ...prev,
        players: updatedPlayers || newPlayers,
        board: updatedBoard,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: actionBlockers,
        light: Math.max(0, prev.light - lightDecrement),
        currentEvent: null, // Close the selection modal
        roundCompleted: roundCompleted || false,
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          darkTiles: updatedDarkTiles
        }
      };
    });
  };

  const handleCollectResources = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Prevent actions if current player should skip turn
    if (shouldPlayerSkipTurn(currentPlayer, gameState.round)) {
      console.log('Player cannot collect resources - must skip turn due to effect');
      return;
    }

    const currentTile = gameState.board[currentPlayer.position];

    if (!currentTile || currentTile.resources.length === 0 || currentPlayer.ap === 0) return;
    if (currentPlayer.inventory.length >= currentPlayer.maxInventory) return; // Inventory full

    // Prevent collecting resources from dark tiles (Phase 2)
    if (gameState.herzDerFinsternis.darkTiles?.includes(currentPlayer.position)) {
      console.log('Cannot collect resources from dark tile!');
      return;
    }

    // If multiple resources available, show selection modal
    if (currentTile.resources.length > 1) {
      setGameState(prev => ({
        ...prev,
        currentEvent: {
          type: 'resource_selection',
          title: 'Ressource auswählen',
          description: 'Wähle eine Ressource zum Sammeln (1 AP):',
          availableResources: currentTile.resources,
          position: currentPlayer.position
        }
      }));
      return;
    }

    // Only one resource, collect it directly
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
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed
      const updatedDarkTiles = nextDarkPos
        ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
        : prev.herzDerFinsternis.darkTiles || [];

      return {
        ...prev,
        players: updatedPlayers || newPlayers,
        board: updatedBoard,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: actionBlockers,
        light: Math.max(0, prev.light - lightDecrement),
        roundCompleted: roundCompleted || false,
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          darkTiles: updatedDarkTiles
        }
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

  // Tor der Weisheit System Functions
  const triggerTorDerWeisheit = (currentLight) => {
    const lightLoss = gameRules.light.startValue - currentLight;
    if (lightLoss >= gameRules.light.torDerWeisheitTrigger && !gameState.torDerWeisheit.triggered) {
      console.log(`🚪 Triggering Tor der Weisheit at light loss: ${lightLoss}`);

      setGameState(prev => {
        // Show the Tor modal first (UX improvement - explain before card draw)
        console.log('⛩️ Showing Tor der Weisheit modal - player needs to initiate card draw');
        return {
          ...prev,
          torDerWeisheit: {
            ...prev.torDerWeisheit,
            triggered: true,
            lightLossAtTrigger: lightLoss
          },
          torDerWeisheitModal: {
            show: true,
            position: null,
            chosenDirection: null,
            awaitingCardDraw: true
          }
          // Card draw will be initiated by player clicking button in modal
        };
      });
    }
  };

  // Helper function to actually place the gate after direction is determined
  const placeTorDerWeisheit = (prevState, direction, lightLoss) => {
    console.log(`🚪 Placing Tor der Weisheit in direction: ${direction}`);

    let torPosition = null;
    let chosenDirection = direction;

    // Try the drawn direction first
    torPosition = getTorPlacementPositionFromState(direction, prevState.board);

    // If drawn direction doesn't work, use clockwise fallback
    if (!torPosition) {
      console.log(`⚠️ Drawn direction ${direction} blocked, trying clockwise fallback...`);

      const getClockwiseOrder = (startDir) => {
        const directions = ['north', 'east', 'south', 'west'];
        const startIndex = directions.indexOf(startDir);
        const clockwise = [];
        for (let i = 1; i < 4; i++) {
          clockwise.push(directions[(startIndex + i) % 4]);
        }
        return clockwise;
      };

      const clockwiseDirections = getClockwiseOrder(direction);

      for (const dir of clockwiseDirections) {
        const position = getTorPlacementPositionFromState(dir, prevState.board);
        if (position) {
          torPosition = position;
          chosenDirection = dir;
          console.log(`🔄 Clockwise fallback successful: ${dir} -> ${position}`);
          break;
        }
      }
    }

    // Last resort: force placement on first available adjacent spot
    if (!torPosition) {
      console.log(`⚠️ Even clockwise fallback failed, forcing placement on adjacent field...`);
      const adjacentPositions = [
        { pos: '4,3', dir: 'north' },
        { pos: '5,4', dir: 'east' },
        { pos: '4,5', dir: 'south' },
        { pos: '3,4', dir: 'west' }
      ];

      for (const { pos, dir } of adjacentPositions) {
        const [x, y] = pos.split(',').map(Number);
        if (x >= 0 && x <= 8 && y >= 0 && y <= 8) {
          torPosition = pos;
          chosenDirection = dir;
          console.log(`🔧 Forcing Tor placement at ${pos} (${dir})`);
          break;
        }
      }
    }

    if (torPosition) {
      console.log(`🚪 Tor der Weisheit placed at position: ${torPosition} (direction: ${chosenDirection})`);

      return {
        ...prevState,
        torDerWeisheit: {
          triggered: true,
          position: torPosition,
          lightLossAtTrigger: lightLoss
        },
        torDerWeisheitModal: {
          show: true, // Re-open modal to show final placement
          position: torPosition,
          chosenDirection: chosenDirection, // Store chosen direction for display
          awaitingCardDraw: false // Card has been drawn, now showing result
        },
        board: {
          ...prevState.board,
          [torPosition]: {
            id: 'tor_der_weisheit',
            x: parseInt(torPosition.split(',')[0]),
            y: parseInt(torPosition.split(',')[1]),
            resources: [],
            revealed: true
          }
        },
        drawnCards: {},
        cardDrawQueue: [],
        cardDrawState: 'none'
      };
    } else {
      console.log(`❌ Could not place Tor der Weisheit anywhere!`);
      return prevState;
    }
  };

  const getTorPlacementPositionFromState = (direction, currentBoard) => {
    const craterX = 4, craterY = 4;
    let deltaX = 0, deltaY = 0;

    // Set direction deltas
    switch (direction) {
      case 'north': deltaX = 0; deltaY = -1; break;
      case 'east': deltaX = 1; deltaY = 0; break;
      case 'south': deltaX = 0; deltaY = 1; break;
      case 'west': deltaX = -1; deltaY = 0; break;
      default: return null;
    }

    console.log(`🔍 Searching for Tor placement in direction: ${direction} (delta: ${deltaX}, ${deltaY})`);

    // Search along the direction for the first completely free field
    for (let step = 1; step <= 4; step++) { // Maximum 4 steps from crater
      const targetX = craterX + (deltaX * step);
      const targetY = craterY + (deltaY * step);
      const position = `${targetX},${targetY}`;

      // Check if position is within bounds
      if (targetX < 0 || targetX > 8 || targetY < 0 || targetY > 8) {
        console.log(`❌ Position ${position} is out of bounds at step ${step}`);
        continue;
      }

      // Check if position is completely free (no tile exists at all)
      const existingTile = currentBoard[position];
      if (!existingTile) {
        // Position is completely empty - this is perfect for Tor placement
        console.log(`✅ Found free position ${position} at step ${step} - perfect for Tor`);
        return position;
      } else {
        // Position is occupied
        console.log(`❌ Position ${position} at step ${step} occupied by: ${existingTile.id || 'unknown'}`);
      }
    }

    // No free position found in this direction
    console.log(`❌ No free position found in direction ${direction} within 4 steps`);
    return null;
  };

  // Handler to initiate card draw from Tor modal
  const handleTorCardDrawInitiate = () => {
    console.log('🎴 Player initiated direction card draw for Tor der Weisheit');

    setGameState(prev => ({
      ...prev,
      torDerWeisheitModal: {
        ...prev.torDerWeisheitModal,
        show: false // Close modal temporarily during card draw
      },
      cardDrawQueue: [{
        type: 'direction',
        options: ['north', 'east', 'south', 'west'],
        purpose: 'tor_der_weisheit'
      }],
      cardDrawState: 'drawing'
    }));
  };

  // Handler to initiate card draw from Herz modal
  const handleHerzCardDrawInitiate = () => {
    console.log('🎴 Player initiated direction card draw for Herz der Finsternis');

    setGameState(prev => ({
      ...prev,
      herzDerFinsternisModal: {
        ...prev.herzDerFinsternisModal,
        show: false // Close modal temporarily during card draw
      },
      cardDrawQueue: [{
        type: 'direction',
        options: ['north', 'east', 'south', 'west'],
        purpose: 'herz_der_finsternis'
      }],
      cardDrawState: 'drawing'
    }));
  };

  const handleAutoTurnTransition = (players, currentPlayerIndex, round, prevState) => {
    const callStack = new Error().stack.split('\n').slice(1, 4).map(line => line.trim()).join(' -> ');
    console.log(`🔄 handleAutoTurnTransition called for round ${round}, currentPlayer ${currentPlayerIndex}`);
    console.log(`📍 Call stack: ${callStack}`);
    const updatedCurrentPlayer = players[currentPlayerIndex];

    // CRITICAL FIX: Only proceed if current player actually has 0 AP
    if (updatedCurrentPlayer.ap > 0) {
      console.log(`⏸️ Current player ${updatedCurrentPlayer.name} still has ${updatedCurrentPlayer.ap} AP - NO transition needed`);
      return {
        nextPlayerIndex: currentPlayerIndex,
        newRound: round,
        actionBlockers: prevState.actionBlockers || [],
        roundCompleted: false,
        lightDecrement: 0,
        updatedPlayers: players,
        spreadDarkness: false
      };
    }
    let lightDecrement = 0;

    // Only transition if current player has no AP left
    if (updatedCurrentPlayer.ap <= 0) {
      // Player completed their turn - decrease light by 1
      lightDecrement = 1;

      // Phase 2: Calculate darkness spread position
      const shouldSpreadDarkness = prevState.phase === 2 && prevState.herzDerFinsternis.triggered;
      const nextDarkPos = shouldSpreadDarkness ? calculateNextDarknessPosition(prevState) : null;

      if (shouldSpreadDarkness && nextDarkPos) {
        console.log(`☠️ Player turn completed in Phase 2 - darkness will spread to ${nextDarkPos}`);
      }

      // Check if all other players also have 0 AP.
      const allPlayersDone = players.every(p => p.ap <= 0);
      console.log(`🔍 Turn transition check: All players AP status:`, players.map(p => `${p.name}: ${p.ap}AP`));
      console.log(`🔍 All players done? ${allPlayersDone}`);

      if (allPlayersDone) {
        // Prevent cascade of duplicate round completions (short 100ms window)
        if (roundCompletionInProgress.current && roundCompletionCache.current) {
          console.log(`⚠️ Round completion cascade blocked - already processing round ${round}, returning CACHED result WITHOUT event trigger.`);
          // Return the cached result but WITHOUT triggering another event
          return { ...roundCompletionCache.current, roundCompleted: false };
        }

        // Set short-term flag to prevent cascade (resets after 100ms)
        roundCompletionInProgress.current = true;
        // Reset trigger assignment for the NEW round will happen in setTimeout
        setTimeout(() => {
          roundCompletionInProgress.current = false;
          roundCompletionCache.current = null;
          eventTriggerAssigned.current = false; // Reset for next round
        }, 100);

        // NO player has AP left - round is truly complete
        const newRound = round + 1;
        console.log(`🎯 Round ${round} completed! Starting round ${newRound}. Event will be handled by useEffect.`);

        // Reset ALL players AP and start new round, accounting for active effects
        const newPlayersState = players.map(p => {
          const allEffects = p.effects || [];
          const activeEffects = allEffects.filter(e => e.expiresInRound > round);

          console.log(`🔄 Round ${round} → ${newRound}: ${p.name} effects check:`, {
            allEffects: allEffects.map(e => `${e.type}(expires:${e.expiresInRound})`),
            activeEffects: activeEffects.map(e => `${e.type}(expires:${e.expiresInRound})`),
            currentRound: round,
            newRound: newRound
          });

          // Start with base AP
          let newAp = p.maxAp;

          // Apply AP effects that should persist
          const setApEffect = activeEffects.find(e => e.type === 'set_ap');
          if (setApEffect) {
            newAp = setApEffect.value;
            console.log(`  → ${p.name}: set_ap to ${setApEffect.value}`);
          } else {
            const bonusApEffect = activeEffects.find(e => e.type === 'bonus_ap');
            if (bonusApEffect) {
              newAp += bonusApEffect.value;
              console.log(`  → ${p.name}: bonus_ap +${bonusApEffect.value} (${p.maxAp} + ${bonusApEffect.value} = ${newAp})`);
            }
            const reduceApEffect = activeEffects.find(e => e.type === 'reduce_ap');
            if (reduceApEffect) {
              newAp = Math.max(0, newAp - reduceApEffect.value);
              console.log(`  → ${p.name}: reduce_ap -${reduceApEffect.value} (result: ${newAp})`);
            }
          }

          return {
            ...p,
            ap: newAp,
            effects: activeEffects
          };
        });

        // AP modifications are now applied immediately when events trigger
        // No need to reapply at round start to prevent double-application

        // Clean up expired player effects at the start of a new round
        newPlayersState.forEach(player => {
          if (player.effects) {
            player.effects = player.effects.filter(effect => effect.expiresInRound > round);
          }
        });

        // Clean up expired action blockers
        const activeBlockers = (prevState.actionBlockers || []).filter(blocker => blocker.expiresInRound > round);

        // Replace the players array with the new state
        players.splice(0, players.length, ...newPlayersState); // This is a mutation, be careful

        // Note: Round completed - event will be triggered by useEffect
        console.log(`✅ handleAutoTurnTransition RETURNING: roundCompleted=true, newRound=${newRound}, players with new AP:`, newPlayersState.map(p => `${p.name}: ${p.ap}AP`));

        // Assign event trigger to this first handler - but only if no event triggered for this round yet
        const shouldTriggerEvent = !eventTriggerAssigned.current && eventTriggeredForRound.current < newRound;
        if (shouldTriggerEvent) {
          eventTriggerAssigned.current = true;
          eventTriggeredForRound.current = newRound; // Mark this round as having an event
        }

        // Cache the result for cascaded calls
        // Start new round with first player (index 0) after event is resolved
        const result = {
          nextPlayerIndex: 0, // Always start new round with first player
          newRound: newRound,
          actionBlockers: activeBlockers,
          roundCompleted: shouldTriggerEvent,
          lightDecrement,
          updatedPlayers: newPlayersState,
          nextDarkPos: nextDarkPos
        };
        roundCompletionCache.current = result;

        console.log(`🎯 FIRST HANDLER - Will trigger event: ${shouldTriggerEvent}! (Round ${newRound}, already triggered for round: ${eventTriggeredForRound.current}) Setting roundCompleted=${shouldTriggerEvent}`);

        // CRITICAL FIX: Trigger event directly here instead of relying on useEffect
        if (shouldTriggerEvent) {
          console.log('🎯 Triggering event DIRECTLY from handleAutoTurnTransition');
          setTimeout(() => triggerRandomEvent(), 100);
        }

        return result;
      } else {
        // Not all players are done, find the next player with AP
        let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        while (players[nextPlayerIndex].ap <= 0) {
          nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
        }

        // Check if the next player must skip their turn
        const nextPlayer = players[nextPlayerIndex];
        const hasSkipTurnEffect = nextPlayer.effects?.some(e => e.type === 'skip_turn' && e.expiresInRound > round);

        if (hasSkipTurnEffect) {
          console.log(`${nextPlayer.name} is skipping their turn due to skip_turn effect.`);
          // Set AP to 0 to force skip and add visual indicator
          nextPlayer.ap = 0;
          nextPlayer.isSkippingTurn = true;

          // Find the next player who can actually take a turn
          let skipNextIndex = (nextPlayerIndex + 1) % players.length;
          let attempts = 0;

          // Prevent infinite loops by limiting attempts to player count
          while (attempts < players.length) {
            const skipNextPlayer = players[skipNextIndex];
            const nextHasSkip = skipNextPlayer.effects?.some(e => e.type === 'skip_turn' && e.expiresInRound > round);

            if (!nextHasSkip) {
              // Found a player who can take a turn
              triggerTurnTransition(skipNextIndex);
              return { nextPlayerIndex: skipNextIndex, newRound: round, actionBlockers: (prevState.actionBlockers || []).filter(b => b.expiresInRound > round), roundCompleted: false, lightDecrement, updatedPlayers: players, nextDarkPos };
            }

            // This player also needs to skip
            console.log(`${skipNextPlayer.name} is also skipping their turn due to skip_turn effect.`);
            skipNextPlayer.ap = 0;
            skipNextPlayer.isSkippingTurn = true;

            skipNextIndex = (skipNextIndex + 1) % players.length;
            attempts++;
          }

          // If all players need to skip (shouldn't happen with proper game logic)
          console.warn('All players have skip_turn effects - this should not happen!');
        }

        triggerTurnTransition(nextPlayerIndex);
        return { nextPlayerIndex: nextPlayerIndex, newRound: round, actionBlockers: (prevState.actionBlockers || []).filter(b => b.expiresInRound > round), roundCompleted: false, lightDecrement, updatedPlayers: players, nextDarkPos };
      }
    }

    // Current player still has AP, no transition needed
    return { nextPlayerIndex: currentPlayerIndex, newRound: round, actionBlockers: (prevState.actionBlockers || []).filter(b => b.expiresInRound > round), roundCompleted: false, lightDecrement, updatedPlayers: players, nextDarkPos: null };
  };

  // Event System
  const triggerRandomEvent = () => {
    console.log('🎯 triggerRandomEvent called');

    // CRITICAL PROTECTION: Prevent multiple simultaneous calls
    if (isTriggeringEvent.current) {
      console.warn('❌ triggerRandomEvent blocked - already in progress');
      return;
    }

    isTriggeringEvent.current = true;

    // BULLETPROOF FIX: Pre-calculate random values to prevent React StrictMode double execution
    const randomValues = {
      index: null,
      event: null,
      calculated: false,
      effectApplied: false,
      stateAfterEffect: null
    };

    setGameState(prev => {
      // Additional guard: check if already triggering
      if (prev.isEventTriggering && prev.currentEvent) {
        console.warn('❌ Event trigger blocked - already triggering or active event:', prev.currentEvent?.name);
        return prev;
      }

      // Prevent triggering if there's already an active event
      if (prev.currentEvent) {
        console.warn('❌ Event trigger blocked - event already active:', prev.currentEvent.name);
        return prev;
      }

      // Prevent triggering if no events left
      if (prev.eventDeck.length === 0) {
        console.log('❌ Event trigger blocked - deck empty');
        return prev;
      }

      // BULLETPROOF: Calculate random values only once, even with React StrictMode
      if (!randomValues.calculated) {
        randomValues.index = Math.floor(Math.random() * prev.eventDeck.length);
        randomValues.event = prev.eventDeck[randomValues.index];
        randomValues.calculated = true;
        console.log(`🎲 Triggering event: ${randomValues.event.name} at round ${prev.round}. Deck has ${prev.eventDeck.length} cards left.`);
      }

      const randomIndex = randomValues.index;
      const selectedEvent = randomValues.event;

      // Check if this event needs card draws BEFORE applying effects
      const neededCardDraws = analyzeEventForCardDraws(selectedEvent, prev);

      if (neededCardDraws.length > 0) {
        // Event needs card draws - show event first with instruction to draw cards
        console.log(`🎴 Event "${selectedEvent.name}" requires ${neededCardDraws.length} card draws. Showing event modal first...`);
        return {
          ...prev,
          currentEvent: selectedEvent,
          cardDrawQueue: neededCardDraws,
          cardDrawState: 'event_shown', // Show event modal with draw instruction
          isEventTriggering: true,
          eventDeck: prev.eventDeck.filter((_, index) => index !== randomIndex)
        };
      }

      // No card draws needed - apply effect immediately
      // BULLETPROOF: Only apply effect once, even with React StrictMode
      if (!randomValues.effectApplied) {
        randomValues.stateAfterEffect = applyEventEffect(selectedEvent, prev);
        randomValues.effectApplied = true;
        console.log(`🎮 Event effect applied for: ${selectedEvent.name}`);
      }
      const stateAfterEffect = randomValues.stateAfterEffect;

      return {
        ...stateAfterEffect,
        // The modal will now show the event with the resolved text
        drawnCards: {}, // CRITICAL: Clear drawnCards to prevent next event from using old values
        eventDeck: prev.eventDeck.filter((_, index) => index !== randomIndex)
      };
    });

    // Reset the trigger flag after state update
    setTimeout(() => {
      isTriggeringEvent.current = false;
    }, 0);
  };

  const applyEventEffect = (event, currentState) => {
      let newState = { ...currentState };
      let resolvedTexts = [];

      // Use drawn cards if available, otherwise random (fallback for events without card draws)
      let randomHero = null;
      if (currentState.drawnCards?.hero) {
        // Use drawn hero card
        randomHero = newState.players.find(p => p.id === currentState.drawnCards.hero);
        console.log(`🎴 Using drawn hero card: ${randomHero?.name}`);
      } else {
        // Fallback: random hero (for events that don't need card draws)
        const randomHeroIndex = newState.players.length > 0 ? Math.floor(Math.random() * newState.players.length) : -1;
        randomHero = randomHeroIndex !== -1 ? newState.players[randomHeroIndex] : null;
        if (randomHero) console.log(`🎲 Fallback: Random hero selected: ${randomHero.name}`);
      }
      
      const revealedTiles = Object.keys(newState.board).filter(pos => pos !== '4,4' && newState.board[pos]);
      const randomRevealedTilePos = revealedTiles.length > 0 ? revealedTiles[Math.floor(Math.random() * revealedTiles.length)] : null;



      event.effects.forEach(effect => {
        switch (effect.type) {
          case 'light_gain':
            let gainValue = effect.value;
            if (gainValue === 'player_count') {
              gainValue = newState.players.length;
            } else if (gainValue === 'player_count_times_2') {
              gainValue = newState.players.length * 2;
            }
            newState.light = Math.min(gameRules.light.maxValue, newState.light + gainValue);
            break;
          case 'light_loss':
            newState.light = Math.max(0, newState.light - effect.value);
            break;
          case 'bonus_ap':
            {
              // BUGFIX: "next_round" Events werden am Rundenende getriggert NACHDEM AP bereits zurückgesetzt wurden
              // "next_round" = einmalige sofortige Anwendung (AP bereits gesetzt, nur modifizieren)
              // "permanent" = dauerhafter Effekt mit expiresInRound: 999999
              // Andere durations = dauerhafter Effekt der im effects Array gespeichert wird
              const durationText = effect.duration === 'permanent' ? 'permanent' :
                                   effect.duration === 'next_round' ? 'in der nächsten Runde' : 'sofort';
              if (effect.target === 'all_players') {
                // IMMUTABLE UPDATE: Map over players instead of forEach mutation
                newState.players = newState.players.map(player => {
                  if (effect.duration === 'next_round') {
                    // Einmalige sofortige Anwendung - KEIN Effekt speichern!
                    const newAp = player.ap + effect.value;
                    console.log(`  ⚡ bonus_ap ONE-TIME: ${player.name} AP increased to ${newAp} (no persistent effect)`);
                    return { ...player, ap: newAp };
                  } else {
                    // Dauerhafter Effekt (inkl. permanent mit expiresInRound: 999999)
                    const expiresInRound = effect.duration === 'permanent' ? 999999 : newState.round;
                    const newEffects = [...(player.effects || []), { type: 'bonus_ap', value: effect.value, expiresInRound }];
                    console.log(`  💾 bonus_ap STORED: ${player.name} will get +${effect.value} AP at round start (${effect.duration || 'instant'})`);
                    return { ...player, effects: newEffects };
                  }
                });
                resolvedTexts.push(`Gemeinsame Stärke: Alle Helden erhalten ${durationText} +${effect.value} AP.`);
              } else if (effect.target === 'random_hero' && randomHero) {
                // IMMUTABLE UPDATE: Map over players to update the specific hero
                newState.players = newState.players.map(player => {
                  if (player.id !== randomHero.id) return player;

                  if (effect.duration === 'next_round') {
                    // Einmalige sofortige Anwendung - KEIN Effekt speichern!
                    const newAp = player.ap + effect.value;
                    console.log(`  ⚡ bonus_ap ONE-TIME: ${player.name} AP increased to ${newAp} (no persistent effect)`);
                    return { ...player, ap: newAp };
                  } else {
                    // Dauerhafter Effekt (inkl. permanent mit expiresInRound: 999999)
                    const expiresInRound = effect.duration === 'permanent' ? 999999 : newState.round;
                    const newEffects = [...(player.effects || []), { type: 'bonus_ap', value: effect.value, expiresInRound }];
                    console.log(`  💾 bonus_ap STORED: ${player.name} will get +${effect.value} AP at round start (${effect.duration || 'instant'})`);
                    return { ...player, effects: newEffects };
                  }
                });
                resolvedTexts.push(`Günstiges Omen: ${randomHero.name} erhält ${durationText} +${effect.value} AP.`);
              }
            }
            break;
          case 'reduce_ap':
            {
              // BUGFIX: "next_round" = einmalige sofortige Anwendung, andere durations = dauerhafter Effekt
              // "permanent" = dauerhafter Effekt mit expiresInRound: 999999
              const durationText = effect.duration === 'permanent' ? 'permanent' :
                                   effect.duration === 'next_round' ? 'in der nächsten Runde' : 'sofort';
              if (effect.target === 'all_players') {
                // IMMUTABLE UPDATE: Map over players instead of forEach mutation
                newState.players = newState.players.map(player => {
                  if (effect.duration === 'next_round') {
                    // Einmalige sofortige Anwendung - KEIN Effekt speichern!
                    const newAp = Math.max(0, player.ap - effect.value);
                    console.log(`  ⚡ reduce_ap ONE-TIME: ${player.name} AP reduced to ${newAp} (no persistent effect)`);
                    return { ...player, ap: newAp };
                  } else {
                    // Dauerhafter Effekt (inkl. permanent mit expiresInRound: 999999)
                    const expiresInRound = effect.duration === 'permanent' ? 999999 : newState.round;
                    const newEffects = [...(player.effects || []), { type: 'reduce_ap', value: effect.value, expiresInRound }];
                    return { ...player, effects: newEffects };
                  }
                });
                resolvedTexts.push(`Lähmende Kälte: Alle Helden haben ${durationText} -${effect.value} AP.`);
              } else if (effect.target === 'random_hero' && randomHero) {
                // IMMUTABLE UPDATE: Map over players to update the specific hero
                newState.players = newState.players.map(player => {
                  if (player.id !== randomHero.id) return player;

                  if (effect.duration === 'next_round') {
                    // Einmalige sofortige Anwendung - KEIN Effekt speichern!
                    const newAp = Math.max(0, player.ap - effect.value);
                    console.log(`  ⚡ reduce_ap ONE-TIME: ${player.name} AP reduced to ${newAp} (no persistent effect)`);
                    return { ...player, ap: newAp };
                  } else {
                    // Dauerhafter Effekt (inkl. permanent mit expiresInRound: 999999)
                    const expiresInRound = effect.duration === 'permanent' ? 999999 : newState.round;
                    const newEffects = [...(player.effects || []), { type: 'reduce_ap', value: effect.value, expiresInRound }];
                    return { ...player, effects: newEffects };
                  }
                });
                resolvedTexts.push(`Echo der Verzweiflung: ${randomHero.name} hat ${durationText} -${effect.value} AP.`);
              } else if (effect.target === 'furthest_from_crater') {
                // Find players furthest from crater (4,4)
                const craterPos = { x: 4, y: 4 };
                let maxDistance = -1;
                let furthestPlayerIds = [];

                newState.players.forEach(player => {
                  const [px, py] = player.position.split(',').map(Number);
                  const distance = Math.abs(px - craterPos.x) + Math.abs(py - craterPos.y);
                  if (distance > maxDistance) {
                    maxDistance = distance;
                    furthestPlayerIds = [player.id];
                  } else if (distance === maxDistance) {
                    furthestPlayerIds.push(player.id);
                  }
                });

                // IMMUTABLE UPDATE: Apply effect to all furthest players
                newState.players = newState.players.map(player => {
                  if (!furthestPlayerIds.includes(player.id)) return player;

                  if (effect.duration === 'next_round') {
                    // Einmalige sofortige Anwendung - KEIN Effekt speichern!
                    const newAp = Math.max(0, player.ap - effect.value);
                    console.log(`  ⚡ reduce_ap ONE-TIME: ${player.name} AP reduced to ${newAp} (no persistent effect)`);
                    return { ...player, ap: newAp };
                  } else {
                    // Dauerhafter Effekt (inkl. permanent mit expiresInRound: 999999)
                    const expiresInRound = effect.duration === 'permanent' ? 999999 : newState.round;
                    const newEffects = [...(player.effects || []), { type: 'reduce_ap', value: effect.value, expiresInRound }];
                    return { ...player, effects: newEffects };
                  }
                });

                const playerNames = newState.players.filter(p => furthestPlayerIds.includes(p.id)).map(p => p.name).join(', ');
                resolvedTexts.push(`Schwere Bürde: ${playerNames} (am weitesten vom Krater entfernt) haben ${durationText} -${effect.value} AP.`);
              }
            }
            break;
          case 'set_ap':
            {
              // BUGFIX: "next_round" = einmalige sofortige Anwendung, andere durations = dauerhafter Effekt
              // "permanent" = dauerhafter Effekt mit expiresInRound: 999999
              const durationText = effect.duration === 'permanent' ? 'permanent' :
                                   effect.duration === 'next_round' ? 'in der nächsten Runde' : 'sofort';
              if (effect.target === 'all_players') {
                // IMMUTABLE UPDATE: Map over players instead of forEach mutation
                newState.players = newState.players.map(player => {
                  if (effect.duration === 'next_round') {
                    // Einmalige sofortige Anwendung - KEIN Effekt speichern!
                    console.log(`  ⚡ set_ap ONE-TIME: ${player.name} AP set to ${effect.value} (no persistent effect)`);
                    return { ...player, ap: effect.value };
                  } else {
                    // Dauerhafter Effekt (inkl. permanent mit expiresInRound: 999999)
                    const expiresInRound = effect.duration === 'permanent' ? 999999 : newState.round;
                    const newEffects = [...(player.effects || []), { type: 'set_ap', value: effect.value, expiresInRound }];
                    return { ...player, effects: newEffects };
                  }
                });
                resolvedTexts.push(`Totale Erschöpfung: Alle Helden haben ${durationText} nur ${effect.value} AP.`);
              }
            }
            break;
          case 'add_resource':
            if (effect.target === 'active_player') {
              // IMMUTABLE UPDATE: Map over players to update current player's inventory
              newState.players = newState.players.map((player, idx) => {
                if (idx !== newState.currentPlayerIndex) return player;
                if (player.inventory.length >= player.maxInventory) return player;
                return { ...player, inventory: [...player.inventory, effect.resource] };
              });
            } else if (effect.target === 'crater') {
              // Add resources to crater field
              if (!newState.board['4,4'].resources) {
                newState.board['4,4'].resources = [];
              }
              const amount = effect.value || 1;
              for (let i = 0; i < amount; i++) {
                  newState.board['4,4'].resources.push(effect.resource);
              }
              resolvedTexts.push(`Glücksfund: ${amount} Kristalle wurden auf dem Krater platziert.`);
            } else if (effect.target === 'all_adjacent_to_crater') {
              // Add resources to fields adjacent to crater
              const adjacentPositions = ['3,4', '5,4', '4,3', '4,5'];
              adjacentPositions.forEach(pos => {
                if (newState.board[pos] || pos.match(/^\d+,\d+$/)) {
                  if (!newState.board[pos].resources) {
                    newState.board[pos].resources = [];
                  }
                  const amount = effect.value || 1;
                  for (let i = 0; i < amount; i++) {
                    newState.board[pos].resources.push(effect.resource);
                  }
                }
              });
            }
            break;
          case 'drop_resource':
            if (effect.target === 'hero_with_most_crystals') {
              let maxCrystals = 0;
              let heroesWithMostIds = [];
              newState.players.forEach(player => {
                const crystalCount = player.inventory.filter(item => item === 'kristall').length;
                if (crystalCount > maxCrystals) {
                  maxCrystals = crystalCount;
                  heroesWithMostIds = [player.id];
                } else if (crystalCount === maxCrystals && crystalCount > 0) {
                  heroesWithMostIds.push(player.id);
                }
              });

              // IMMUTABLE UPDATE: Map over players to drop crystal from heroes with most
              newState.players = newState.players.map(player => {
                if (!heroesWithMostIds.includes(player.id)) return player;

                const crystalIndex = player.inventory.findIndex(item => item === 'kristall');
                if (crystalIndex === -1) return player;

                // Drop crystal to current field
                const pos = player.position;
                if (!newState.board[pos]) newState.board[pos] = { resources: [] };
                if (!newState.board[pos].resources) newState.board[pos].resources = [];
                newState.board[pos].resources.push('kristall');

                // Remove crystal from inventory immutably
                return { ...player, inventory: player.inventory.filter((_, idx) => idx !== crystalIndex) };
              });
            } else if (effect.target === 'heroes_on_crater') {
              // IMMUTABLE UPDATE: Map over players to drop crystal from heroes on crater
              newState.players = newState.players.map(player => {
                if (player.position !== '4,4') return player;

                const crystalIndex = player.inventory.findIndex(item => item === 'kristall');
                if (crystalIndex === -1) return player;

                // Drop crystal to crater
                if (!newState.board['4,4'].resources) {
                  newState.board['4,4'].resources = [];
                }
                newState.board['4,4'].resources.push('kristall');

                // Remove crystal from inventory immutably
                return { ...player, inventory: player.inventory.filter((_, idx) => idx !== crystalIndex) };
              });
            }
            break;
          case 'drop_all_items':
            if (effect.target === 'random_hero' && randomHero) {
              // IMMUTABLE UPDATE: Map over players to drop all items from random hero
              newState.players = newState.players.map(player => {
                if (player.id !== randomHero.id) return player;

                const pos = player.position;
                if (!newState.board[pos]) newState.board[pos] = { resources: [] };
                if (!newState.board[pos].resources) {
                  newState.board[pos].resources = [];
                }
                newState.board[pos].resources.push(...player.inventory);

                return { ...player, inventory: [] };
              });
              resolvedTexts.push(`Zerrissener Beutel: ${randomHero.name} verliert alle Gegenstände.`);
            }
            break;
          case 'drop_all_resources': {
            if (effect.target === 'all_players') {
              const resourceType = effect.resource || 'kristall';
              // IMMUTABLE UPDATE: Map over players to drop all resources of specific type
              newState.players = newState.players.map(player => {
                const pos = player.position;
                const resourcesToDrop = player.inventory.filter(item => item === resourceType);
                if (resourcesToDrop.length === 0) return player;

                if (!newState.board[pos]) newState.board[pos] = { resources: [] };
                if (!newState.board[pos].resources) {
                  newState.board[pos].resources = [];
                }
                newState.board[pos].resources.push(...resourcesToDrop);

                return { ...player, inventory: player.inventory.filter(item => item !== resourceType) };
              });
              resolvedTexts.push(`Kristall-Fluch: Alle Helden müssen ihre ${resourceType}e ablegen.`);
            }
            break;
          }
          case 'add_obstacle':
            {
              const newBoard = { ...newState.board };
              const obstacle = effect.obstacle;
              let targetPositions = [];

              if (effect.target === 'random_direction_from_crater') {
                // Use drawn direction card
                const direction = currentState.drawnCards?.direction || 'north'; // fallback
                console.log(`🎴 Using drawn direction: ${direction}`);

                const directionMap = {
                  north: '4,3',
                  east: '5,4',
                  south: '4,5',
                  west: '3,4'
                };
                targetPositions.push(directionMap[direction]);
              } else if (effect.target === 'north_of_crater') {
                targetPositions.push('4,3');
              } else if (effect.target === 'east_of_crater') {
                targetPositions.push('5,4');
              } else if (effect.target === 'south_of_crater') {
                targetPositions.push('4,5');
              } else if (effect.target === 'west_of_crater') {
                targetPositions.push('3,4');
              } else if (effect.target === 'all_adjacent_to_crater') {
                targetPositions.push('4,3', '5,4', '4,5', '3,4');
              } else if (effect.target === 'gate_and_adjacent') {
                const gatePosition = Object.keys(newBoard).find(pos => newBoard[pos]?.id === 'tor_der_weisheit');
                if (gatePosition) {
                  targetPositions.push(gatePosition);
                  const [x, y] = gatePosition.split(',').map(Number);
                  targetPositions.push(`${x},${y-1}`, `${x+1},${y}`, `${x},${y+1}`, `${x-1},${y}`);
                }
              } else if (effect.target === 'ring_around_crater') {
                // Ring with 2 fields distance from crater
                const ringPositions = [
                  '2,2', '3,2', '4,2', '5,2', '6,2',
                  '2,3', '6,3',
                  '2,4', '6,4',
                  '2,5', '6,5',
                  '2,6', '3,6', '4,6', '5,6', '6,6'
                ];
                targetPositions.push(...ringPositions);
              } else if (effect.target === 'diagonal_to_crater') {
                targetPositions.push('5,3', '5,5', '3,5', '3,3');
              } else if (effect.target === 'all_apeiron_sources_random_direction') {
                // Use drawn direction card
                const direction = currentState.drawnCards?.direction || 'east'; // fallback
                console.log(`🎴 Using drawn direction for apeiron sources: ${direction}`);

                const sourcePositions = Object.keys(newBoard).filter(pos => {
                  const tile = newBoard[pos];
                  const [x, y] = pos.split(',').map(Number);

                  const isApeironSource = tile?.id === 'wiese_kristall' || tile?.id === 'hoehle_kristall';
                  if (!isApeironSource) return false;

                  // Check if in the drawn direction from crater (4,4)
                  if (direction === 'north') return y < 4;
                  if (direction === 'east') return x > 4;
                  if (direction === 'south') return y > 4;
                  if (direction === 'west') return x < 4;
                  return false;
                });
                targetPositions.push(...sourcePositions);
              } else if (effect.target === 'all_apeiron_sources_east') {
                const sourcePositions = Object.keys(newBoard).filter(pos => {
                  const tile = newBoard[pos];
                  const [x] = pos.split(',').map(Number);
                  return x > 4 && (tile?.id === 'wiese_kristall' || tile?.id === 'hoehle_kristall');
                });
                targetPositions.push(...sourcePositions);
              } else if (effect.target === 'random_revealed_tile' && randomRevealedTilePos) {
                targetPositions.push(randomRevealedTilePos);
              }

              targetPositions.forEach(pos => {
                // Only place obstacles on REVEALED tiles (not on undiscovered tiles)
                // Check 1: Tile must exist in board (has been discovered)
                // Check 2: Tile must have revealed flag set to true
                const tile = newBoard[pos];
                if (tile && tile.revealed === true) {
                  newBoard[pos] = { ...tile, obstacle };
                  console.log(`🪨 Obstacle "${obstacle}" placed on revealed tile at ${pos} (tile: ${tile.id})`);
                } else if (!tile) {
                  console.log(`⚠️ Skipped obstacle placement at ${pos} - tile does not exist (not discovered yet)`);
                } else {
                  console.log(`⚠️ Skipped obstacle placement at ${pos} - tile exists but not revealed (revealed=${tile.revealed})`);
                }
              });

              newState.board = newBoard;
            }
            break;
          case 'skip_turn':
            {
              // Support permanent effects: "permanent" → expiresInRound: 999999
              const duration = effect.duration === 'permanent' ? 999999 :
                               effect.duration === 'next_round' ? newState.round + 1 : newState.round;
              const durationText = effect.duration === 'permanent' ? 'permanent' :
                                   effect.duration === 'next_round' ? 'in der nächsten Runde' : 'sofort';
              if (effect.target === 'random_hero' && randomHero) {
                if (!randomHero.effects) randomHero.effects = [];
                randomHero.effects.push({ type: 'skip_turn', expiresInRound: duration });
                resolvedTexts.push(`Erschöpfung: ${randomHero.name} muss ${durationText} aussetzen.`);
              }
            }
            break;
          // This case is handled later in the switch statement
          case 'block_action': {
            // Support permanent effects: "permanent" → expiresInRound: 999999
            const duration = effect.duration === 'permanent' ? 999999 :
                             effect.duration === 'next_round' ? newState.round + 1 : newState.round;
            const newBlocker = {
              action: effect.action,
              expiresInRound: duration,
              target: effect.target || 'all_players',
            };
            if (newBlocker.target === 'random_hero') {
              if (randomHero) {
                newBlocker.target = randomHero.id;
                resolvedTexts.push(`${effect.action === 'discover_and_scout' ? 'Entdecken/Spähen' : effect.action} blockiert für ${randomHero.name}.`);
              } else {
                newBlocker.target = 'all_players';
                resolvedTexts.push(`${effect.action === 'discover_and_scout' ? 'Entdecken/Spähen' : effect.action} für alle blockiert.`);
              }
            } else if (newBlocker.target === 'all_players') {
              resolvedTexts.push(`${effect.action === 'discover_and_scout' ? 'Entdecken/Spähen' : effect.action} für alle blockiert.`);
            }
            if (!newState.actionBlockers) newState.actionBlockers = [];
            newState.actionBlockers.push(newBlocker);
            break;
          }
          case 'block_skills': {
            // Support permanent effects: "permanent" → expiresInRound: 999999
            const duration = effect.duration === 'permanent' ? 999999 :
                             effect.duration === 'next_round' ? newState.round + 1 : newState.round;
            const durationText = effect.duration === 'permanent' ? 'permanent' :
                                 effect.duration === 'next_round' ? 'in der nächsten Runde' : 'sofort';
            if (effect.target === 'all_players') {
              // IMMUTABLE UPDATE: Map over players to add block_skills effect
              newState.players = newState.players.map(player => {
                const newEffects = [...(player.effects || []), { type: 'block_skills', expiresInRound: duration }];
                return { ...player, effects: newEffects };
              });
              resolvedTexts.push(`Spezialfähigkeiten für alle Helden ${durationText} blockiert.`);
            } else if (effect.target === 'random_hero' && randomHero) {
              // IMMUTABLE UPDATE: Map over players to add block_skills effect to random hero
              newState.players = newState.players.map(player => {
                if (player.id !== randomHero.id) return player;
                const newEffects = [...(player.effects || []), { type: 'block_skills', expiresInRound: duration }];
                return { ...player, effects: newEffects };
              });
              resolvedTexts.push(`Spezialfähigkeiten für ${randomHero.name} ${durationText} blockiert.`);
            }
            break;
          }
          case 'prevent_movement': {
            // Support permanent effects: "permanent" → expiresInRound: 999999
            const duration = effect.duration === 'permanent' ? 999999 :
                             effect.duration === 'next_round' ? newState.round + 1 : newState.round;
            const durationText = effect.duration === 'permanent' ? 'permanent' :
                                 effect.duration === 'next_round' ? 'in der nächsten Runde' : 'sofort';
            if (effect.target === 'all_players') {
              // IMMUTABLE UPDATE: Map over players to add prevent_movement effect
              newState.players = newState.players.map(player => {
                const newEffects = [...(player.effects || []), { type: 'prevent_movement', expiresInRound: duration }];
                return { ...player, effects: newEffects };
              });
              resolvedTexts.push(`Bewegung für alle Helden ${durationText} blockiert.`);
            } else if (effect.target === 'random_hero' && randomHero) {
              // IMMUTABLE UPDATE: Map over players to add prevent_movement effect to random hero
              newState.players = newState.players.map(player => {
                if (player.id !== randomHero.id) return player;
                const newEffects = [...(player.effects || []), { type: 'prevent_movement', expiresInRound: duration }];
                return { ...player, effects: newEffects };
              });
              resolvedTexts.push(`Bewegung für ${randomHero.name} ${durationText} blockiert.`);
            }
            break;
          }
          case 'disable_communication': {
            // Support permanent effects: "permanent" → expiresInRound: 999999
            const duration = effect.duration === 'permanent' ? 999999 :
                             effect.duration === 'next_round' ? newState.round + 1 : newState.round;
            const durationText = effect.duration === 'permanent' ? 'permanent' :
                                 effect.duration === 'next_round' ? 'in der nächsten Runde' : 'sofort';
            if (!newState.actionBlockers) newState.actionBlockers = [];
            newState.actionBlockers.push({
              action: 'communication',
              expiresInRound: duration,
              target: 'all_players'
            });
            resolvedTexts.push(`Kommunikation zwischen Spielern ist ${durationText} nicht erlaubt.`);
            break;
          }
          case 'remove_obstacles': {
            const obstacleType = effect.obstacle;
            const newBoard = { ...newState.board };
            Object.keys(newBoard).forEach(pos => {
              if (newBoard[pos]?.obstacle === obstacleType) {
                delete newBoard[pos].obstacle;
              }
            });
            newState.board = newBoard;
            resolvedTexts.push(`Reinigendes Feuer: Alle ${obstacleType}-Hindernisse wurden entfernt.`);
            break;
          }
          case 'remove_all_obstacles': {
            const newBoard = { ...newState.board };
            Object.keys(newBoard).forEach(pos => {
              if (newBoard[pos]?.obstacle) {
                delete newBoard[pos].obstacle;
              }
            });
            newState.board = newBoard;
            resolvedTexts.push('Läuterung: Alle Hindernisse wurden vom Spielfeld entfernt.');
            break;
          }
          case 'remove_all_negative_effects': {
            if (effect.target === 'all_players') {
              // IMMUTABLE UPDATE: Map over players to filter out negative effects
              newState.players = newState.players.map(player => {
                if (!player.effects || player.effects.length === 0) return player;

                // Remove negative effects (keep positive ones like bonus_ap)
                const newEffects = player.effects.filter(e =>
                  e.type === 'bonus_ap' || !['skip_turn', 'reduce_ap', 'set_ap', 'prevent_movement', 'block_skills'].includes(e.type)
                );
                return { ...player, effects: newEffects };
              });
              // Also remove action blockers
              newState.actionBlockers = [];
              resolvedTexts.push('Apeirons Segen: Alle negativen Effekte wurden aufgehoben.');
            }
            break;
          }
          // Phase 2 effects
          case 'spread_darkness': {
            // UPDATED: Use the same Spiral-Algorithmus as automatic darkness spreading
            const spreadCount = effect.value || 1;
            let fieldsSpread = 0;
            const spreadPositions = [];

            // Use calculateNextDarknessPosition multiple times to spread darkness according to spiral rules
            // We need to create a temporary state that gets updated with each spread
            let tempState = { ...newState };

            for (let i = 0; i < spreadCount; i++) {
              const nextPos = calculateNextDarknessPosition(tempState);

              if (nextPos) {
                spreadPositions.push(nextPos);

                // Update tempState to include this new dark tile for next iteration
                tempState = {
                  ...tempState,
                  herzDerFinsternis: {
                    ...tempState.herzDerFinsternis,
                    darkTiles: [...(tempState.herzDerFinsternis.darkTiles || []), nextPos]
                  }
                };

                fieldsSpread++;
                console.log(`☠️ spread_darkness Event: Spreading to ${nextPos} (${i+1}/${spreadCount})`);
              } else {
                console.log(`☠️ spread_darkness Event: No more valid positions available (spread ${fieldsSpread}/${spreadCount})`);
                break; // No more valid positions
              }
            }

            // Apply all spreads to the actual state
            if (spreadPositions.length > 0) {
              newState.herzDerFinsternis = {
                ...newState.herzDerFinsternis,
                darkTiles: [...(newState.herzDerFinsternis.darkTiles || []), ...spreadPositions]
              };
            }

            resolvedTexts.push(`Welle der Finsternis: ${fieldsSpread} Felder wurden von Dunkelheit erfasst.`);
            break;
          }
          case 'cleanse_darkness': {
            const cleanseCount = effect.value || 1;
            const newBoard = { ...newState.board };
            let fieldsCleansed = 0;

            if (effect.target === 'closest_to_crater') {
              // Find dark fields closest to crater and cleanse them
              const darkFields = Object.keys(newBoard)
                .filter(pos => newBoard[pos]?.isDark)
                .map(pos => {
                  const [x, y] = pos.split(',').map(Number);
                  const distance = Math.abs(x - 4) + Math.abs(y - 4); // Manhattan distance to crater
                  return { pos, distance };
                })
                .sort((a, b) => a.distance - b.distance)
                .slice(0, cleanseCount);

              darkFields.forEach(field => {
                delete newBoard[field.pos].isDark;
                fieldsCleansed++;
              });
            } else if (effect.target === 'all_adjacent_to_crater') {
              // Cleanse all dark fields adjacent to crater
              const adjacentToCrater = ['3,4', '5,4', '4,3', '4,5'];
              adjacentToCrater.forEach(pos => {
                if (newBoard[pos]?.isDark) {
                  delete newBoard[pos].isDark;
                  fieldsCleansed++;
                }
              });
            }

            newState.board = newBoard;
            resolvedTexts.push(`Triumph des Lichts: ${fieldsCleansed} Felder wurden von Finsternis gereinigt.`);
            break;
          }
        }
      });

      // Update the event object with the resolved text for the modal
      newState.currentEvent = { ...event, resolvedEffectText: resolvedTexts.join(' ') || event.effectText };
      return newState;
  };



  // Special Hero Actions - Grundstein legen (Foundation Building)
  const handleBuildFoundation = (foundationType = null) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Must be at crater (4,4) and have AP
    if (currentPlayer.position !== '4,4' || currentPlayer.ap < 1) return;

    // Must have 'grundstein_legen' ability (Terra's base skill)
    if (!currentPlayer.learnedSkills.includes('grundstein_legen')) return;

    // Must have 2 crystals
    const kristallCount = currentPlayer.inventory.filter(item => item === 'kristall').length;
    if (kristallCount < 2) return;

    // Must have at least one learned foundation building skill
    const availableBlueprints = currentPlayer.learnedSkills.filter(skill => skill.startsWith('kenntnis_bauplan_'));
    if (availableBlueprints.length === 0) return;

    // If no specific foundation type provided, try to determine from available blueprints
    let blueprintToUse = null;
    let elementToAdd = null;

    if (foundationType) {
      // Specific foundation type requested
      const blueprintMap = {
        'erde': 'kenntnis_bauplan_erde',
        'feuer': 'kenntnis_bauplan_feuer',
        'wasser': 'kenntnis_bauplan_wasser',
        'luft': 'kenntnis_bauplan_luft'
      };
      blueprintToUse = blueprintMap[foundationType];
      elementToAdd = foundationType;

      // Check if player has this specific blueprint skill
      if (!currentPlayer.learnedSkills.includes(blueprintToUse)) return;
    } else {
      // Use first available blueprint
      blueprintToUse = availableBlueprints[0];
      const elementMap = {
        'kenntnis_bauplan_erde': 'erde',
        'kenntnis_bauplan_feuer': 'feuer',
        'kenntnis_bauplan_wasser': 'wasser',
        'kenntnis_bauplan_luft': 'luft'
      };
      elementToAdd = elementMap[blueprintToUse];
    }

    // Check if this foundation already exists
    if (gameState.tower.foundations.includes(elementToAdd)) return;

    setGameState(prev => {
      const newPlayers = prev.players.map((player, index) => {
        if (index === prev.currentPlayerIndex) {
          const newInventory = [...player.inventory];

          // Remove 2 crystals
          let kristallsRemoved = 0;
          for (let i = newInventory.length - 1; i >= 0 && kristallsRemoved < 2; i--) {
            if (newInventory[i] === 'kristall') {
              newInventory.splice(i, 1);
              kristallsRemoved++;
            }
          }

          // Note: Blueprint is not removed as it's a learned skill, not an inventory item

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
        foundations: [...(prev.tower.foundations || []), elementToAdd]
      };

      // Check for Phase 2 transition (all 4 foundations built)
      if (newTower.foundations.length === 4 && prev.phase === 1) {
        // Calculate bonuses
        const foundationBonus = gameRules.foundations.lightBonusPerFoundation; // +4 for last foundation
        const phaseCompletionBonus = 10; // +10 for Phase 1 completion
        const totalBonus = foundationBonus + phaseCompletionBonus;

        console.log(`🎉 Phase 2 transition triggered! Showing modal with +${totalBonus} Light bonus`);

        // Show modal (Phase transition happens AFTER user confirms)
        return {
          ...prev,
          players: newPlayers,
          tower: newTower,
          light: Math.max(0, Math.min(gameRules.light.maxValue, prev.light + totalBonus)),
          phaseTransitionModal: {
            show: true,
            foundationBonus,
            phaseCompletionBonus,
            totalBonus
          }
          // phase stays 1, tileDeck/eventDeck stay Phase 1 until user confirms!
        };
      }

      // Normal foundation building (not the 4th one)
      const lightBonus = gameRules.foundations.lightBonusPerFoundation;
      console.log(`🏗️ Foundation built! +${lightBonus} Light bonus`);

      // Handle automatic turn transition
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed
      const updatedDarkTiles = nextDarkPos
        ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
        : prev.herzDerFinsternis.darkTiles || [];

      return {
        ...prev,
        players: updatedPlayers || newPlayers,
        tower: newTower,
        actionBlockers: actionBlockers,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        light: Math.max(0, Math.min(gameRules.light.maxValue, prev.light - lightDecrement + lightBonus)),
        roundCompleted: roundCompleted || false,
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          darkTiles: updatedDarkTiles
        }
      };
    });
  };

  // Phase 2 Transition Confirmation Handler
  const handlePhaseTransitionConfirm = () => {
    // CRITICAL: Lock to prevent React StrictMode double-call from overwriting artifact placement
    if (phaseTransitionInProgress) {
      console.log('🔒 Phase transition already in progress - blocking duplicate StrictMode call');
      return;
    }
    phaseTransitionInProgress = true;
    console.log('🚀 Phase transition starting - lock acquired');

    setGameState(prev => {
      // Create Phase 2 Tile Deck from tiles.json
      const phase2TileDeck = Object.entries(tilesConfig.phase2).flatMap(
        ([tileId, config]) => Array(config.count).fill(tileId)
      );
      const shuffledTileDeck = phase2TileDeck.sort(() => Math.random() - 0.5);

      // Create Phase 2 Event Deck from events.json
      const phase2EventDeck = [
        ...eventsConfig.phase2.positive,
        ...eventsConfig.phase2.negative
      ].sort(() => Math.random() - 0.5);

      // Find all artifacts that are still in the tileDeck (not yet discovered)
      const allHeroes = ['terra', 'ignis', 'lyra', 'corvus'];
      const playingHeroes = prev.players.map(p => p.id);
      const missingHeroes = allHeroes.filter(heroId => !playingHeroes.includes(heroId));

      const undiscoveredArtifacts = missingHeroes
        .map(heroId => `artefakt_${heroId}`)
        .filter(artifactId => prev.tileDeck.includes(artifactId));

      // Place undiscovered artifacts on Tor der Weisheit (if it exists)
      let updatedBoard = { ...prev.board };

      console.log(`📦 Checking artifact placement:`, {
        undiscoveredArtifacts,
        torTriggered: prev.torDerWeisheit.triggered,
        torPosition: prev.torDerWeisheit.position
      });

      if (prev.torDerWeisheit.triggered && prev.torDerWeisheit.position) {
        const torPosition = prev.torDerWeisheit.position;
        const torTile = updatedBoard[torPosition];

        if (torTile && undiscoveredArtifacts.length > 0) {
          updatedBoard[torPosition] = {
            ...torTile,
            resources: [...(torTile.resources || []), ...undiscoveredArtifacts]
          };

          console.log(`📦 Platziere ${undiscoveredArtifacts.length} Artefakte auf Tor der Weisheit:`, undiscoveredArtifacts);
        } else {
          console.log(`⚠️ Cannot place artifacts - torTile:`, torTile, `artifacts:`, undiscoveredArtifacts.length);
        }
      } else {
        console.log(`⚠️ Tor der Weisheit not ready for artifacts - triggered: ${prev.torDerWeisheit.triggered}, position: ${prev.torDerWeisheit.position}`);
      }

      console.log(`🎉 Phase 2 transition confirmed!`);
      console.log(`🃏 Phase 2 tile deck: ${shuffledTileDeck.length} tiles`);
      console.log(`🎴 Phase 2 event deck: ${phase2EventDeck.length} events`);
      if (undiscoveredArtifacts.length > 0) {
        console.log(`📦 ${undiscoveredArtifacts.length} undiscovered artifacts placed on Tor der Weisheit`);
      }

      return {
        ...prev,
        phase: 2,
        tileDeck: shuffledTileDeck,  // Phase 2 deck replaces Phase 1 deck completely
        eventDeck: phase2EventDeck,
        board: updatedBoard,
        phaseTransitionModal: {
          show: false,
          foundationBonus: 0,
          phaseCompletionBonus: 0,
          totalBonus: 0
        }
      };
    });

    // Release lock after state update
    setTimeout(() => {
      phaseTransitionInProgress = false;
      console.log('🔓 Phase transition lock released');
    }, 300);

    // Immediately place Herz der Finsternis after Phase 2 transition
    setTimeout(() => {
      placeHerzDerFinsternis();
    }, 500); // Small delay to ensure state update has completed
  };

  // Element Activation Handler (Phase 2)
  const handleActivateElement = (fragmentType) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Fragment to Element mapping
    const fragmentToElement = {
      'element_fragment_erde': 'erde',
      'element_fragment_wasser': 'wasser',
      'element_fragment_feuer': 'feuer',
      'element_fragment_luft': 'luft'
    };

    const element = fragmentToElement[fragmentType];
    if (!element) return;

    // Validations
    // 1. Must be in Phase 2 (all 4 foundations built)
    if (gameState.phase !== 2) return;

    // 2. Must be at crater (4,4)
    if (currentPlayer.position !== '4,4') return;

    // 3. Must have 'element_aktivieren' skill
    // (Ignis innate, OR learned via Master Ignis, OR via "Herz des Feuers" artifact)
    if (!currentPlayer.learnedSkills.includes('element_aktivieren')) return;

    // 4. Must have at least 1 AP
    if (currentPlayer.ap < 1) return;

    // 5. Must have 1 crystal
    const kristallCount = currentPlayer.inventory.filter(item => item === 'kristall').length;
    if (kristallCount < 1) return;

    // 6. Must have the specific element fragment
    if (!currentPlayer.inventory.includes(fragmentType)) return;

    // 7. Element must not already be activated
    if (gameState.tower.activatedElements.includes(element)) return;

    setGameState(prev => {
      const newPlayers = prev.players.map((player, index) => {
        if (index === prev.currentPlayerIndex) {
          const newInventory = [...player.inventory];

          // Remove 1 crystal
          const kristallIndex = newInventory.indexOf('kristall');
          if (kristallIndex !== -1) {
            newInventory.splice(kristallIndex, 1);
          }

          // Remove element fragment
          const fragmentIndex = newInventory.indexOf(fragmentType);
          if (fragmentIndex !== -1) {
            newInventory.splice(fragmentIndex, 1);
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
        activatedElements: [...(prev.tower.activatedElements || []), element]
      };

      // Apply bonuses based on element type
      const bonusConfig = gameRules.elementActivation.bonuses[element];
      let lightBonus = 0;
      let apBonus = 0;
      let bonusText = '';
      let finalPlayers = newPlayers;

      if (bonusConfig.type === 'light') {
        lightBonus = bonusConfig.value;
        bonusText = `+${lightBonus} Licht`;
      } else if (bonusConfig.type === 'permanent_ap') {
        apBonus = bonusConfig.value;
        bonusText = `Alle Helden erhalten permanent +${apBonus} AP`;

        // Apply permanent AP bonus to ALL players
        finalPlayers = newPlayers.map(player => ({
          ...player,
          maxAp: player.maxAp + apBonus,
          ap: player.ap + apBonus  // Also increase current AP
        }));
      }

      console.log(`🔥 ${element.toUpperCase()}-Element aktiviert!`);
      console.log(`✨ Bonus: ${bonusText}`);

      // Check for VICTORY condition (4th element activated!)
      if (newTower.activatedElements.length === 4) {
        console.log('🎉 VICTORY! All 4 elements activated - Tower of Elements is complete!');

        // Calculate game statistics
        const gameStats = {
          rounds: prev.round,
          playerCount: prev.players.length,
          phase: prev.phase,
          activatedElements: newTower.activatedElements,
          remainingLight: prev.light + lightBonus,
          playerNames: prev.players.map(p => p.name)
        };

        return {
          ...prev,
          players: finalPlayers,
          tower: newTower,
          light: prev.light + lightBonus,
          victoryModal: {
            show: true,
            stats: gameStats
          }
        };
      }

      // Handle automatic turn transition
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } =
        handleAutoTurnTransition(finalPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed
      const updatedDarkTiles = nextDarkPos
        ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
        : prev.herzDerFinsternis.darkTiles || [];

      const newLight = Math.max(0, Math.min(gameRules.light.maxValue, prev.light - lightDecrement + lightBonus));

      return {
        ...prev,
        players: updatedPlayers || finalPlayers,
        tower: newTower,
        actionBlockers: actionBlockers,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        light: newLight,
        roundCompleted: roundCompleted || false,
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          darkTiles: updatedDarkTiles
        }
      };
    });
  };

  // Place Herz der Finsternis immediately after Phase 2 transition
  const placeHerzDerFinsternis = () => {
    if (gameState.herzDerFinsternis.triggered) {
      console.log('⚠️ Herz der Finsternis already placed!');
      return;
    }

    setGameState(prev => {
      // Show the Herz modal first (UX improvement - explain before card draw)
      console.log('💀 Showing Herz der Finsternis modal - player needs to initiate card draw');
      return {
        ...prev,
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          triggered: true
        },
        herzDerFinsternisModal: {
          show: true,
          position: null,
          chosenDirection: null,
          awaitingCardDraw: true
        }
        // Card draw will be initiated by player clicking button in modal
      };
    });
  };

  // Helper function to actually place the heart after direction is determined
  const placeHeartOfDarknessWithDirection = (prevState, drawnDirection) => {
    console.log(`💀 Placing Herz der Finsternis in direction: ${drawnDirection}`);

    // Helper function to find first unrevealed position in a direction
    const getHerzPlacementPosition = (direction, currentBoard) => {
      const craterX = 4, craterY = 4;
      let deltaX = 0, deltaY = 0;

      // Set direction deltas
      switch (direction) {
        case 'north': deltaX = 0; deltaY = -1; break;
        case 'east': deltaX = 1; deltaY = 0; break;
        case 'south': deltaX = 0; deltaY = 1; break;
        case 'west': deltaX = -1; deltaY = 0; break;
        default: return null;
      }

      console.log(`🔍 Searching for Herz placement in direction: ${direction} (delta: ${deltaX}, ${deltaY})`);

      // Search along the direction for the first completely free field (unrevealed)
      for (let step = 1; step <= 4; step++) {
        const targetX = craterX + (deltaX * step);
        const targetY = craterY + (deltaY * step);
        const position = `${targetX},${targetY}`;

        // Check if position is within bounds
        if (targetX < 0 || targetX > 8 || targetY < 0 || targetY > 8) {
          console.log(`❌ Position ${position} is out of bounds at step ${step}`);
          continue;
        }

        // Check if position is completely free (no tile exists at all = unrevealed)
        const existingTile = currentBoard[position];
        if (!existingTile) {
          console.log(`✅ Found unrevealed position ${position} at step ${step} - perfect for Herz der Finsternis`);
          return position;
        } else {
          console.log(`❌ Position ${position} at step ${step} occupied by: ${existingTile.id || 'unknown'}`);
        }
      }

      console.log(`❌ No free position found in direction: ${direction}`);
      return null;
    };

    // Try drawn direction first
    let foundPosition = getHerzPlacementPosition(drawnDirection, prevState.board);
    let chosenDirection = drawnDirection;

    // If drawn direction doesn't work, try clockwise order
    if (!foundPosition) {
      console.log(`⚠️ No free position found in drawn direction ${drawnDirection}, trying clockwise...`);
      const clockwiseOrder = ['north', 'east', 'south', 'west'];
      const startIndex = clockwiseOrder.indexOf(drawnDirection);

      for (let i = 1; i < 4; i++) {
        const dirIndex = (startIndex + i) % 4;
        const currentDir = clockwiseOrder[dirIndex];
        foundPosition = getHerzPlacementPosition(currentDir, prevState.board);
        if (foundPosition) {
          chosenDirection = currentDir;
          console.log(`🔄 Clockwise fallback successful: ${currentDir} -> ${foundPosition}`);
          break;
        }
      }
    }

    if (!foundPosition) {
      console.log('❌ No free position found for Herz der Finsternis in any direction!');
      return prevState;
    }

    // Place the Heart of Darkness tile
    const updatedBoard = { ...prevState.board };
    updatedBoard[foundPosition] = {
      id: 'herz_finsternis',
      x: parseInt(foundPosition.split(',')[0]),
      y: parseInt(foundPosition.split(',')[1]),
      resources: [],
      revealed: true
    };

    console.log(`💀 Herz der Finsternis placed at ${foundPosition} (direction: ${chosenDirection})`);

    return {
      ...prevState,
      board: updatedBoard,
      herzDerFinsternis: {
        triggered: true,
        position: foundPosition,
        darkTiles: []
      },
      herzDerFinsternisModal: {
        show: true, // Re-open modal to show final placement
        position: foundPosition,
        chosenDirection: chosenDirection, // Store chosen direction for display
        awaitingCardDraw: false // Card has been drawn, now showing result
      },
      drawnCards: {},
      cardDrawQueue: [],
      cardDrawState: 'none'
    };
  };

  // Helper function to calculate next darkness position (pure function, no state update)
  const calculateNextDarknessPosition = (currentState) => {
    if (!currentState.herzDerFinsternis.triggered || !currentState.herzDerFinsternis.position) {
      return null; // Heart not yet placed
    }

    const heartPos = currentState.herzDerFinsternis.position;
    const [heartX, heartY] = heartPos.split(',').map(Number);
    const kraterPos = '4,4';
    const torPos = currentState.torDerWeisheit.position;
    const currentDarkTiles = currentState.herzDerFinsternis.darkTiles || [];

    // Helper function to check if a position is valid and suitable for darkness
    const canBeDarkened = (pos, debugInfo = false) => {
      if (!pos) {
        if (debugInfo) console.log(`  ❌ ${pos}: position is null/undefined`);
        return false;
      }

      const tile = currentState.board[pos];
      if (!tile) {
        if (debugInfo) console.log(`  ❌ ${pos}: tile does not exist in board`);
        return false;
      }

      // Must be revealed
      if (!tile.revealed) {
        if (debugInfo) console.log(`  ⏸️ ${pos}: not revealed (tile: ${tile.id})`);
        return false;
      }

      // Must not already be dark
      if (currentDarkTiles.includes(pos)) {
        if (debugInfo) console.log(`  ⏸️ ${pos}: already dark`);
        return false;
      }

      // Must not be Krater or Tor der Weisheit
      if (pos === kraterPos || pos === torPos) {
        if (debugInfo) console.log(`  ⏸️ ${pos}: is Krater or Tor der Weisheit`);
        return false;
      }

      // Must not be the heart itself
      if (pos === heartPos) {
        if (debugInfo) console.log(`  ⏸️ ${pos}: is Herz der Finsternis itself`);
        return false;
      }

      if (debugInfo) console.log(`  ✅ ${pos}: CAN BE DARKENED (tile: ${tile.id})`);
      return true;
    };

    // Helper function to get positions in a ring at given distance, starting from North, clockwise
    const getRingPositions = (distance) => {
      const positions = [];

      for (let dx = -distance; dx <= distance; dx++) {
        for (let dy = -distance; dy <= distance; dy++) {
          // Check if Chebyshev distance matches (max of |dx| and |dy|)
          if (Math.max(Math.abs(dx), Math.abs(dy)) === distance) {
            const x = heartX + dx;
            const y = heartY + dy;
            const pos = `${x},${y}`;

            // Calculate angle: 0° = North, 90° = East, 180° = South, 270° = West
            let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
            if (angle < 0) angle += 360;

            positions.push({ pos, angle, x, y });
          }
        }
      }

      // Sort by angle (clockwise from North)
      positions.sort((a, b) => a.angle - b.angle);

      return positions.map(p => p.pos);
    };

    // Try rings starting from distance 1 (ALWAYS start from ring 1!)
    const maxDistance = 10; // reasonable upper limit

    console.log(`☠️ Starting darkness spread check. Herz at ${heartPos}, already dark tiles:`, currentDarkTiles);

    for (let distance = 1; distance <= maxDistance; distance++) {
      const ringPositions = getRingPositions(distance);

      console.log(`☠️ Checking ring at distance ${distance}, ${ringPositions.length} positions:`, ringPositions);

      // Check each position in clockwise order
      for (const pos of ringPositions) {
        if (canBeDarkened(pos, true)) {
          // Found the first valid position!
          console.log(`☠️ ✅ Darkness will spread to ${pos} (ring ${distance})`);
          return pos;
        }
      }

      console.log(`☠️ Ring ${distance} complete - no valid position found, trying next ring...`);
    }

    // If we reach here, no suitable tile was found
    console.log('☠️ ❌ No suitable tile found for darkness spread (all checked tiles are blocked)');
    return null;
  };

  const handleTorDurchschreiten = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Must be on Tor der Weisheit field and have AP
    if (currentPlayer.position !== gameState.torDerWeisheit.position || currentPlayer.ap < 1) return;

    // Must not already be a master
    if (currentPlayer.isMaster) return;

    setGameState(prev => {
      const newPlayers = prev.players.map((player, index) => {
        if (index === prev.currentPlayerIndex) {
          return {
            ...player,
            ap: player.ap - 1,
            isMaster: true,
            learnedSkills: [...player.learnedSkills, 'lehren']
          };
        }
        return player;
      });

      // Handle automatic turn transition
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed
      const updatedDarkTiles = nextDarkPos
        ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
        : prev.herzDerFinsternis.darkTiles || [];

      console.log(`🚪 ${currentPlayer.name} has become a master of ${currentPlayer.element}!`);

      return {
        ...prev,
        players: updatedPlayers || newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: actionBlockers || prev.actionBlockers,
        roundCompleted: roundCompleted,
        light: Math.max(0, prev.light - lightDecrement),
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          darkTiles: updatedDarkTiles
        }
      };
    });
  };

  const handleScout = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    const isScoutBlocked = (gameState.actionBlockers || []).some(blocker =>
      (blocker.action === 'spaehen' || blocker.action === 'discover_and_scout') &&
      (blocker.target === 'all_players' || blocker.target === currentPlayer.id) &&
      blocker.expiresInRound > gameState.round
    );

    if (!currentPlayer.learnedSkills.includes('spaehen') || currentPlayer.ap < 1 || isScoutBlocked) return;

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
          const newTileDeck = [...prev.tileDeck];
          const newBoard = { ...prev.board };
          
          newSelectedPositions.forEach(pos => {
            const newTileId = newTileDeck.pop();
            const [px, py] = pos.split(',').map(Number);
            newBoard[pos] = {
              id: newTileId,
              x: px,
              y: py,
              resources: getTileResources(newTileId),
              revealed: true
            };
          });

          const newPlayers = prev.players.map((player, index) => 
            index === prev.currentPlayerIndex ? { ...player, ap: player.ap - 1 } : player
          );

          // Handle automatic turn transition with the correct signature
          const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

          // Apply darkness spread if needed
          const updatedDarkTiles = nextDarkPos
            ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
            : prev.herzDerFinsternis.darkTiles || [];

          console.log(`🔍 SCOUTING COMPLETE: Revealed ${newSelectedPositions.length} tiles. Deck size: ${newTileDeck.length}`);

          return {
            ...prev,
            board: newBoard,
            players: updatedPlayers || newPlayers,
            tileDeck: newTileDeck,
            currentPlayerIndex: nextPlayerIndex,
            round: newRound,
            actionBlockers: actionBlockers,
            light: Math.max(0, prev.light - lightDecrement),
            scoutingMode: { // Reset scouting mode
              active: false,
              availablePositions: [],
              selectedPositions: [],
              maxSelections: 2
            },
            roundCompleted: roundCompleted || false,
            herzDerFinsternis: {
              ...prev.herzDerFinsternis,
              darkTiles: updatedDarkTiles
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

      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed
      const updatedDarkTiles = nextDarkPos
        ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
        : prev.herzDerFinsternis.darkTiles || [];

      return {
        ...prev,
        board: newBoard,
        players: updatedPlayers || newPlayers,
        tileDeck: prev.tileDeck, // tileDeck is already modified by .pop()
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: actionBlockers,
        light: Math.max(0, prev.light - lightDecrement),
        scoutingMode: { // Reset scouting mode
          active: false,
          availablePositions: [],
          selectedPositions: [],
          maxSelections: 2
        },
        roundCompleted: roundCompleted || false,
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          darkTiles: updatedDarkTiles
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

  // Removed handleFastMove function - integrated into normal movement
  const handleFastMove_OLD = (direction) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Check prerequisites and movement prevention
    if (!currentPlayer.learnedSkills.includes('schnell_bewegen') || currentPlayer.ap < 1) return;
    if (currentPlayer.effects?.some(e => e.type === 'prevent_movement' && e.expiresInRound > gameState.round)) return;

    // Calculate 2-field movement in specified direction
    const [x, y] = currentPlayer.position.split(',').map(Number);
    let newPosition;

    switch (direction) {
      case 'north':
        newPosition = `${x},${y-2}`;
        break;
      case 'east':
        newPosition = `${x+2},${y}`;
        break;
      case 'south':
        newPosition = `${x},${y+2}`;
        break;
      case 'west':
        newPosition = `${x-2},${y}`;
        break;
      default:
        return;
    }

    // Check if target position is valid (within bounds and accessible)
    const [newX, newY] = newPosition.split(',').map(Number);
    if (newX < 0 || newX > 8 || newY < 0 || newY > 8) return; // Out of bounds

    const targetTile = gameState.board[newPosition];
    if (!targetTile) return; // Target field not yet discovered
    if (targetTile.obstacle) return; // Target field has obstacle

    // Check if path is clear (both intermediate and target fields)
    const [midX, midY] = direction === 'north' ? [x, y-1] :
                        direction === 'east' ? [x+1, y] :
                        direction === 'south' ? [x, y+1] :
                        [x-1, y]; // west
    const midPosition = `${midX},${midY}`;
    const midTile = gameState.board[midPosition];
    if (!midTile || midTile.obstacle) return; // Path blocked

    // Perform the fast movement
    setGameState(prev => {
      const newPlayers = prev.players.map((player, index) =>
        index === prev.currentPlayerIndex
          ? { ...player, position: newPosition, ap: player.ap - 1 }
          : player
      );

      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed
      const updatedDarkTiles = nextDarkPos
        ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
        : prev.herzDerFinsternis.darkTiles || [];

      return {
        ...prev,
        players: updatedPlayers || newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: actionBlockers,
        light: Math.max(0, prev.light - lightDecrement),
        roundCompleted: roundCompleted || false,
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          darkTiles: updatedDarkTiles
        }
      };
    });
  };

  const handleLearn = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Check if player has blueprints in inventory and has AP
    const availableBlueprints = currentPlayer.inventory.filter(item => item.startsWith('bauplan_'));
    if (availableBlueprints.length === 0 || currentPlayer.ap < 1) return;

    // If multiple blueprints available, show selection modal
    if (availableBlueprints.length > 1) {
      setGameState(prev => ({
        ...prev,
        currentEvent: {
          type: 'learn_item_selection',
          title: 'Bauplan lernen',
          description: 'Wähle einen Bauplan zum Lernen (1 AP):',
          availableItems: availableBlueprints,
          itemType: 'blueprint'
        }
      }));
      return;
    }

    // Only one blueprint, learn it directly
    learnSelectedItem(availableBlueprints[0]);
  };

  const learnSelectedItem = (selectedItem) => {
    setGameState(prev => {
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      // Find all players on the same position
      const playersOnSamePosition = prev.players.filter(player => player.position === currentPlayer.position);

      // Determine foundation building skill from selected blueprint
      const blueprintToUse = selectedItem;
      let foundationSkill = '';

      // Each blueprint teaches the knowledge skill (matches skills.json IDs)
      switch (blueprintToUse) {
        case 'bauplan_erde':
          foundationSkill = 'kenntnis_bauplan_erde';
          break;
        case 'bauplan_wasser':
          foundationSkill = 'kenntnis_bauplan_wasser';
          break;
        case 'bauplan_feuer':
          foundationSkill = 'kenntnis_bauplan_feuer';
          break;
        case 'bauplan_luft':
          foundationSkill = 'kenntnis_bauplan_luft';
          break;
      }

      // Update all players on the same position with new foundation building skill
      const newPlayers = prev.players.map(player => {
        if (player.position === currentPlayer.position) {
          // Add foundation building skill (avoid duplicates)
          const updatedSkills = player.learnedSkills.includes(foundationSkill)
            ? player.learnedSkills
            : [...player.learnedSkills, foundationSkill];

          let updatedInventory = player.inventory;
          let updatedAp = player.ap;

          // If this is the current player, consume the blueprint and spend AP
          if (player.id === currentPlayer.id) {
            updatedInventory = [...player.inventory];
            const blueprintIndex = updatedInventory.findIndex(item => item === blueprintToUse);
            if (blueprintIndex !== -1) {
              updatedInventory.splice(blueprintIndex, 1); // Remove the blueprint
            }
            updatedAp = player.ap - 1;
          }

          return {
            ...player,
            learnedSkills: updatedSkills,
            inventory: updatedInventory,
            ap: updatedAp
          };
        }
        return player;
      });

      // Handle automatic turn transition
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed
      const updatedDarkTiles = nextDarkPos
        ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
        : prev.herzDerFinsternis.darkTiles || [];

      return {
        ...prev,
        players: updatedPlayers || newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: actionBlockers,
        light: Math.max(0, prev.light - lightDecrement),
        roundCompleted: roundCompleted || false,
        currentEvent: null, // Close the selection modal
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          darkTiles: updatedDarkTiles
        }
      };
    });
  };

  const handleLearnArtifact = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Check if player has artifacts in inventory and has AP
    const availableArtifacts = currentPlayer.inventory.filter(item =>
      item.startsWith('artefakt_')
    );
    if (availableArtifacts.length === 0 || currentPlayer.ap < 1) return;

    // If multiple artifacts available, show selection modal
    if (availableArtifacts.length > 1) {
      setGameState(prev => ({
        ...prev,
        currentEvent: {
          type: 'learn_item_selection',
          title: 'Artefakt lernen',
          description: 'Wähle ein Artefakt zum Lernen (1 AP):',
          availableItems: availableArtifacts,
          itemType: 'artifact'
        }
      }));
      return;
    }

    // Only one artifact, learn it directly
    learnSelectedArtifact(availableArtifacts[0]);
  };

  const learnSelectedArtifact = (selectedItem) => {
    setGameState(prev => {
      const currentPlayer = prev.players[prev.currentPlayerIndex];
      const artifactToUse = selectedItem;
      const heroId = artifactToUse.replace('artefakt_', '');

      // Map hero IDs to their innate skills
      const heroSkillsMap = {
        'terra': ['grundstein_legen', 'geroell_beseitigen'],
        'ignis': ['element_aktivieren', 'dornen_entfernen'],
        'lyra': ['reinigen', 'fluss_freimachen'],
        'corvus': ['spaehen', 'schnell_bewegen']
      };

      // Get innate skills from the artifact's hero
      const artifactSkills = heroSkillsMap[heroId] || [];

      console.log(`📚 Learning artifact for hero: ${heroId}, skills:`, artifactSkills);
      console.log(`📍 Current player position: ${currentPlayer.position}`);
      console.log(`👥 All players:`, prev.players.map(p => `${p.name}@${p.position}`));

      // Find all players on the same position
      const playersOnSamePosition = prev.players.filter(
        player => player.position === currentPlayer.position
      );

      console.log(`✨ Players on same position (${currentPlayer.position}):`, playersOnSamePosition.map(p => p.name));

      const newPlayers = prev.players.map(player => {
        if (player.position === currentPlayer.position) {
          // Add artifact skills to learned skills (avoid duplicates)
          const newSkills = artifactSkills.filter(
            skill => !player.learnedSkills.includes(skill)
          );
          const updatedSkills = [...player.learnedSkills, ...newSkills];

          console.log(`🎓 ${player.name}: adding ${newSkills.length} new skills:`, newSkills);
          console.log(`   Before:`, player.learnedSkills);
          console.log(`   After:`, updatedSkills);

          // Mark these skills as artifact-learned (cannot be taught)
          const updatedArtifactSkills = [
            ...(player.artifactSkills || []),
            ...newSkills
          ];

          let updatedInventory = player.inventory;
          let updatedAp = player.ap;

          // If this is the current player, consume the artifact and spend AP
          if (player.id === currentPlayer.id) {
            updatedInventory = [...player.inventory];
            const artifactIndex = updatedInventory.findIndex(
              item => item === artifactToUse
            );
            if (artifactIndex !== -1) {
              updatedInventory.splice(artifactIndex, 1);
            }
            updatedAp = player.ap - 1;
            console.log(`💰 ${player.name}: Artifact consumed, AP: ${player.ap} -> ${updatedAp}`);
          }

          return {
            ...player,
            learnedSkills: updatedSkills,
            artifactSkills: updatedArtifactSkills,
            inventory: updatedInventory,
            ap: updatedAp
          };
        }
        return player;
      });

      // Handle automatic turn transition
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement,
              roundCompleted, updatedPlayers } = handleAutoTurnTransition(
        newPlayers, prev.currentPlayerIndex, prev.round, prev
      );

      return {
        ...prev,
        players: updatedPlayers || newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: actionBlockers,
        light: Math.max(0, prev.light - lightDecrement),
        roundCompleted: roundCompleted || false,
        currentEvent: null // Close the selection modal
      };
    });
  };

  const handleMasterLehren = (skillToTeach) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Must be a master and have the 'lehren' skill
    if (!currentPlayer.isMaster || !currentPlayer.learnedSkills.includes('lehren') || currentPlayer.ap < 1) return;

    // Get the player's innate skills based on their element
    const innateSkills = {
      'earth': ['grundstein_legen', 'geroell_beseitigen'],
      'fire': ['element_aktivieren', 'dornen_entfernen'],
      'water': ['reinigen', 'fluss_freimachen'],
      'air': ['spaehen', 'schnell_bewegen']
    };

    const playerInnateSkills = innateSkills[currentPlayer.element] || [];

    // IMPORTANT: Cannot teach artifact-learned skills
    if (currentPlayer.artifactSkills && currentPlayer.artifactSkills.includes(skillToTeach)) {
      console.log('❌ Cannot teach artifact-learned skills:', skillToTeach);
      return;
    }

    // Must have the skill to teach (must be an innate skill)
    if (!playerInnateSkills.includes(skillToTeach)) return;

    setGameState(prev => {
      // Find all players on the same position
      const playersOnSamePosition = prev.players.filter(player =>
        player.position === currentPlayer.position && player.id !== currentPlayer.id
      );

      if (playersOnSamePosition.length === 0) return prev; // No one to teach

      const newPlayers = prev.players.map((player, index) => {
        if (index === prev.currentPlayerIndex) {
          return {
            ...player,
            ap: player.ap - 1
          };
        }
        // Teach skill to players on same position who don't have it
        if (player.position === currentPlayer.position &&
            player.id !== currentPlayer.id &&
            !player.learnedSkills.includes(skillToTeach)) {
          return {
            ...player,
            learnedSkills: [...player.learnedSkills, skillToTeach]
          };
        }
        return player;
      });

      // Handle automatic turn transition
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed
      const updatedDarkTiles = nextDarkPos
        ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
        : prev.herzDerFinsternis.darkTiles || [];

      console.log(`🎓 ${currentPlayer.name} teaches ${skillToTeach} to ${playersOnSamePosition.length} player(s)`);

      return {
        ...prev,
        players: updatedPlayers || newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: actionBlockers || prev.actionBlockers,
        roundCompleted: roundCompleted || false,
        light: Math.max(0, prev.light - lightDecrement),
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          darkTiles: updatedDarkTiles
        }
      };
    });
  };

  const handleRemoveObstacle = (obstaclePosition, obstacleType) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const targetTile = gameState.board[obstaclePosition];

    const skillMap = {
      'geroell': 'geroell_beseitigen',
      'dornenwald': 'dornen_entfernen',
      'ueberflutung': 'fluss_freimachen'
    };

    const requiredSkill = skillMap[obstacleType];

    // Check if player is adjacent to the obstacle
    const [playerX, playerY] = currentPlayer.position.split(',').map(Number);
    const [obstacleX, obstacleY] = obstaclePosition.split(',').map(Number);
    const isAdjacent = Math.abs(playerX - obstacleX) + Math.abs(playerY - obstacleY) === 1;

    if (isAdjacent && currentPlayer.ap > 0 && targetTile?.obstacle === obstacleType && currentPlayer.learnedSkills.includes(requiredSkill)) {
      setGameState(prev => {
        const newBoard = { ...prev.board };
        const { [obstaclePosition]: tileToUpdate, ...restOfBoard } = newBoard;
        const { obstacle, ...restOfTile } = tileToUpdate;
        newBoard[obstaclePosition] = restOfTile;

        const newPlayers = prev.players.map((player, index) =>
          index === prev.currentPlayerIndex ? { ...player, ap: player.ap - 1 } : player
        );

        const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

        // Apply darkness spread if needed
        const updatedDarkTiles = nextDarkPos
          ? [...(prev.herzDerFinsternis.darkTiles || []), nextDarkPos]
          : prev.herzDerFinsternis.darkTiles || [];

        return {
          ...prev,
          board: newBoard,
          players: updatedPlayers || newPlayers,
          currentPlayerIndex: nextPlayerIndex,
          round: newRound,
          actionBlockers: actionBlockers,
          light: Math.max(0, prev.light - lightDecrement),
          herzDerFinsternis: {
            ...prev.herzDerFinsternis,
            darkTiles: updatedDarkTiles
          }
        };
      });
    }
  };

  // ========== CARD DRAW SYSTEM ==========

  const analyzeEventForCardDraws = (event, currentState) => {
    const cardDrawQueue = [];

    // Check each effect for random selections needed
    event.effects.forEach(effect => {
      // Check for random_hero target
      if (effect.target === 'random_hero' && !currentState.drawnCards.hero) {
        // Only add if not already drawn
        if (!cardDrawQueue.find(card => card.type === 'hero')) {
          cardDrawQueue.push({
            type: 'hero',
            options: currentState.players.map(p => p.id),
            purpose: 'event_effect'
          });
        }
      }

      // Check for random direction targets
      if (effect.target === 'random_direction_from_crater' ||
          effect.target === 'all_apeiron_sources_random_direction') {
        if (!currentState.drawnCards.direction) {
          // Only add if not already drawn
          if (!cardDrawQueue.find(card => card.type === 'direction')) {
            cardDrawQueue.push({
              type: 'direction',
              options: ['north', 'east', 'south', 'west'],
              purpose: 'event_effect'
            });
          }
        }
      }
    });

    console.log(`🔍 Event "${event.name}" needs ${cardDrawQueue.length} card draws:`, cardDrawQueue);
    return cardDrawQueue;
  };

  const handleCardDraw = (drawnValue, cardType) => {
    console.log(`🎴 Card drawn: ${cardType} = ${drawnValue}`);

    setGameState(prev => {
      // Check the purpose to determine how to store the drawn card
      const currentCard = prev.cardDrawQueue[0];
      const purpose = currentCard?.purpose;

      let newDrawnCards = { ...prev.drawnCards };

      if (purpose === 'tor_der_weisheit' || purpose === 'herz_der_finsternis') {
        // For special purposes, store with purpose-specific key
        newDrawnCards[cardType] = drawnValue;
        console.log(`📝 Direction card drawn for ${purpose}: ${drawnValue}`);
      } else {
        // For event effects, use standard key
        newDrawnCards[cardType] = drawnValue;
        console.log(`📝 Drawn cards so far:`, newDrawnCards);
      }

      return {
        ...prev,
        drawnCards: newDrawnCards,
        cardDrawState: 'result_shown' // Show result in same modal (DON'T remove from queue yet!)
      };
    });
  };

  const handleHeilendeReinigung = (darknessPosition) => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Check if player has the "reinigen" skill
    if (!currentPlayer.learnedSkills.includes('reinigen')) {
      console.log('❌ Player does not have "reinigen" skill');
      return;
    }

    // Check if player is adjacent to the darkness (only cardinal directions: N, E, S, W)
    const [playerX, playerY] = currentPlayer.position.split(',').map(Number);
    const [darkX, darkY] = darknessPosition.split(',').map(Number);
    const isAdjacent = Math.abs(playerX - darkX) + Math.abs(playerY - darkY) === 1; // Manhattan distance = 1

    // Check if position is actually dark
    const isDark = gameState.herzDerFinsternis.darkTiles?.includes(darknessPosition);

    if (isAdjacent && currentPlayer.ap > 0 && isDark) {
      setGameState(prev => {
        // Remove darkness from this position
        const updatedDarkTilesAfterRemoval = (prev.herzDerFinsternis.darkTiles || []).filter(pos => pos !== darknessPosition);

        const newPlayers = prev.players.map((player, index) =>
          index === prev.currentPlayerIndex ? { ...player, ap: player.ap - 1 } : player
        );

        const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

        // Apply darkness spread if needed (but AFTER we removed one)
        const updatedDarkTiles = nextDarkPos
          ? [...updatedDarkTilesAfterRemoval, nextDarkPos]
          : updatedDarkTilesAfterRemoval;

        console.log(`💧 Heilende Reinigung: Darkness removed from ${darknessPosition}`);

        return {
          ...prev,
          players: updatedPlayers || newPlayers,
          currentPlayerIndex: nextPlayerIndex,
          round: newRound,
          actionBlockers: actionBlockers,
          light: Math.max(0, prev.light - lightDecrement),
          herzDerFinsternis: {
            ...prev.herzDerFinsternis,
            darkTiles: updatedDarkTiles
          }
        };
      });
    } else {
      if (!isAdjacent) console.log('❌ Not adjacent to darkness field');
      if (!isDark) console.log('❌ Target position is not dark');
      if (currentPlayer.ap <= 0) console.log('❌ No AP left');
    }
  };

  const handleHeilendeReinigungEffekte = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Check if player has the "reinigen" skill
    if (!currentPlayer.learnedSkills.includes('reinigen')) {
      console.log('❌ Player does not have "reinigen" skill');
      return;
    }

    if (currentPlayer.ap <= 0) {
      console.log('❌ No AP left');
      return;
    }

    // Find all players at same position with negative effects OR action blockers (inkl. current player!)
    const affectedPlayerIds = [];
    gameState.players.forEach(player => {
      if (player.position === currentPlayer.position) {
        // Check player.effects for negative effects
        const hasNegativeEffects = player.effects?.some(e =>
          ['skip_turn', 'reduce_ap', 'set_ap', 'prevent_movement', 'block_skills'].includes(e.type) &&
          e.expiresInRound > gameState.round
        );

        // Check actionBlockers for this specific player
        const hasActionBlocker = gameState.actionBlockers?.some(blocker =>
          (blocker.target === player.id || blocker.target === 'all_players') &&
          blocker.expiresInRound > gameState.round
        );

        if (hasNegativeEffects || hasActionBlocker) {
          affectedPlayerIds.push(player.id);
        }
      }
    });

    if (affectedPlayerIds.length === 0) {
      console.log('❌ No players with negative effects at this position');
      return;
    }

    setGameState(prev => {
      // Remove negative effects from all affected players (inkl. permanente Effekte!)
      const newPlayers = prev.players.map(player => {
        if (!affectedPlayerIds.includes(player.id)) return player;

        // Filter out negative effects (keep positive ones like bonus_ap)
        const newEffects = player.effects.filter(e =>
          e.type === 'bonus_ap' || !['skip_turn', 'reduce_ap', 'set_ap', 'prevent_movement', 'block_skills'].includes(e.type)
        );
        return { ...player, effects: newEffects };
      });

      // Remove action blockers for affected players (inkl. permanente blockers!)
      const newActionBlockers = (prev.actionBlockers || []).filter(blocker =>
        !affectedPlayerIds.includes(blocker.target) && blocker.target !== 'all_players'
      );

      // Reduce AP for current player
      const playersAfterAp = newPlayers.map((player, index) =>
        index === prev.currentPlayerIndex ? { ...player, ap: player.ap - 1 } : player
      );

      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, nextDarkPos } =
        handleAutoTurnTransition(playersAfterAp, prev.currentPlayerIndex, prev.round, prev);

      const affectedNames = prev.players.filter(p => affectedPlayerIds.includes(p.id)).map(p => p.name).join(', ');
      console.log(`💧 Heilende Reinigung: Removed negative effects + action blockers from ${affectedNames}`);

      return {
        ...prev,
        players: updatedPlayers || playersAfterAp,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: newActionBlockers.filter(b => b.expiresInRound > newRound), // Filter expired blockers
        light: Math.max(0, prev.light - lightDecrement)
      };
    });
  };

  const renderActionButtons = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Check if skills are blocked
    const areSkillsBlocked = currentPlayer.effects?.some(e => e.type === 'block_skills' && e.expiresInRound > gameState.round);

    // Show skip turn message if player should skip
    if (shouldPlayerSkipTurn(currentPlayer, gameState.round)) {
      return (
        <div style={{
          textAlign: 'center',
          color: '#fbbf24',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          padding: '16px',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          border: '2px solid #fbbf24'
        }}>
          😴 {currentPlayer.name} muss aussetzen
          <div style={{
            fontSize: '0.7rem',
            color: '#9ca3af',
            marginTop: '8px',
            fontWeight: 'normal'
          }}>
            Effekt läuft bis zum Ende der Runde
          </div>
          <button
            onClick={handleEndTurn}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#f59e0b',
              border: 'none',
              borderRadius: '4px',
              color: '#1a202c',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            title="Zug beenden - nächster Spieler ist dran"
          >
            ⏭️ Zug beenden
          </button>
        </div>
      );
    }

    const currentTile = gameState.board[currentPlayer.position];
    const canCollect = currentTile?.resources?.length > 0 && 
                      currentPlayer.inventory.length < currentPlayer.maxInventory && 
                      currentPlayer.ap > 0;
    const availableFoundationBlueprints = currentPlayer.learnedSkills.filter(skill => skill.startsWith('kenntnis_bauplan_'));
    const canBuildFoundation = currentPlayer.position === '4,4' &&
                              currentPlayer.learnedSkills.includes('grundstein_legen') &&
                              currentPlayer.inventory.filter(item => item === 'kristall').length >= 2 &&
                              availableFoundationBlueprints.length > 0 &&
                              currentPlayer.ap > 0 &&
                              !areSkillsBlocked;    
    const isScoutBlocked = (gameState.actionBlockers || []).some(blocker =>
      (blocker.action === 'spaehen' || blocker.action === 'discover_and_scout') &&
      (blocker.target === 'all_players' || blocker.target === currentPlayer.id) &&
      blocker.expiresInRound > gameState.round);
    const canScout = currentPlayer.learnedSkills.includes('spaehen') &&
                    currentPlayer.ap > 0 &&
                    gameState.tileDeck.length > 0 &&
                    !isScoutBlocked &&
                    !areSkillsBlocked;
    const canLearn = (currentPlayer.inventory.some(item => item.startsWith('bauplan_')) ||
                     currentPlayer.inventory.some(item => item.startsWith('artefakt_'))) &&
                    currentPlayer.ap > 0 &&
                    !areSkillsBlocked;
    
    // Obstacle Removal Actions - Check adjacent tiles
    const adjacentObstacles = [];
    const adjacentDarkness = [];

    if (currentPlayer.ap > 0) {
      const [x, y] = currentPlayer.position.split(',').map(Number);
      // Only cardinal directions (N, E, S, W) for obstacle/darkness removal
      const adjacentPositions = {
        'Norden': `${x},${y-1}`,
        'Osten': `${x+1},${y}`,
        'Süden': `${x},${y+1}`,
        'Westen': `${x-1},${y}`
      };

      for (const [direction, pos] of Object.entries(adjacentPositions)) {
        const adjacentTile = gameState.board[pos];

        // Check for obstacles
        if (adjacentTile?.obstacle) {
          const obstacleType = adjacentTile.obstacle;
          const skillMap = {
            'geroell': 'geroell_beseitigen',
            'dornenwald': 'dornen_entfernen',
            'ueberflutung': 'fluss_freimachen'
          };
          if (currentPlayer.learnedSkills.includes(skillMap[obstacleType]) && !areSkillsBlocked) {
            adjacentObstacles.push({
              position: pos,
              type: obstacleType,
              direction: direction
            });
          }
        }

        // Check for darkness (Phase 2) - also only cardinal directions
        if (gameState.herzDerFinsternis.darkTiles?.includes(pos) &&
            currentPlayer.learnedSkills.includes('reinigen') &&
            !areSkillsBlocked) {
          adjacentDarkness.push({
            position: pos,
            direction: direction
          });
        }
      }
    }

    // Check if heroes on same field have negative effects (inkl. current player selbst!)
    const heroesWithNegativeEffects = [];
    if (currentPlayer.learnedSkills.includes('reinigen') && !areSkillsBlocked && currentPlayer.ap > 0) {
      gameState.players.forEach(player => {
        if (player.position === currentPlayer.position) {
          // Check player.effects for negative effects
          const hasNegativeEffects = player.effects?.some(e =>
            ['skip_turn', 'reduce_ap', 'set_ap', 'prevent_movement', 'block_skills'].includes(e.type) &&
            e.expiresInRound > gameState.round
          );

          // Check actionBlockers for this specific player
          const hasActionBlocker = gameState.actionBlockers?.some(blocker =>
            (blocker.target === player.id || blocker.target === 'all_players') &&
            blocker.expiresInRound > gameState.round
          );

          if (hasNegativeEffects || hasActionBlocker) {
            heroesWithNegativeEffects.push(player);
          }
        }
      });
    }

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

        {/* Ablegen Button */}
        <button
          onClick={handleDropItem}
          disabled={currentPlayer.inventory.length === 0 || currentPlayer.ap === 0}
          style={{
            backgroundColor: (currentPlayer.inventory.length > 0 && currentPlayer.ap > 0) ? '#dc2626' : '#4b5563',
            color: (currentPlayer.inventory.length > 0 && currentPlayer.ap > 0) ? 'white' : '#9ca3af',
            padding: '10px 12px',
            borderRadius: '8px',
            border: (currentPlayer.inventory.length > 0 && currentPlayer.ap > 0) ? '2px solid #ef4444' : '2px solid transparent',
            fontWeight: 'bold',
            cursor: (currentPlayer.inventory.length > 0 && currentPlayer.ap > 0) ? 'pointer' : 'not-allowed',
            fontSize: '0.8rem',
            transition: 'all 0.2s ease-in-out',
            boxShadow: (currentPlayer.inventory.length > 0 && currentPlayer.ap > 0) ? '0 2px 4px rgba(220, 38, 38, 0.3)' : 'none',
            transform: (currentPlayer.inventory.length > 0 && currentPlayer.ap > 0) ? 'translateY(0)' : 'translateY(1px)'
          }}
          title={
            currentPlayer.inventory.length === 0 ? 'Kein Item im Inventar' :
            currentPlayer.ap === 0 ? 'Keine AP verfügbar' :
            'Lege ein Item auf diesem Feld ab'
          }
        >
          📦 Ablegen (1 AP)
        </button>

        {currentPlayer.learnedSkills.includes('grundstein_legen') && availableFoundationBlueprints.length > 0 && currentPlayer.position === '4,4' && (
          <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
            {availableFoundationBlueprints.length === 1 ? (
              <button
                onClick={() => handleBuildFoundation()}
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
                  transform: canBuildFoundation ? 'translateY(0)' : 'translateY(1px)',
                  width: '100%'
                }}
                title={canBuildFoundation ? 'Grundstein legen (benötigt Bauplan + 2 Kristalle)' : 'Benötigt Krater-Position, Bauplan und 2 Kristalle'}
              >
                🏗️ Grundstein legen (1AP+Bauplan+2💎)
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center', marginBottom: '4px' }}>
                  Wähle Bauplan für Fundament:
                </div>
                {availableFoundationBlueprints.map(blueprint => {
                  const elementMap = {
                    'kenntnis_bauplan_erde': { name: 'Erde', emoji: '🗿', element: 'erde', color: '#ca8a04' },
                    'kenntnis_bauplan_feuer': { name: 'Feuer', emoji: '🔥', element: 'feuer', color: '#ef4444' },
                    'kenntnis_bauplan_wasser': { name: 'Wasser', emoji: '💧', element: 'wasser', color: '#3b82f6' },
                    'kenntnis_bauplan_luft': { name: 'Luft', emoji: '💨', element: 'luft', color: '#10b981' }
                  };
                  const foundationInfo = elementMap[blueprint];
                  const alreadyBuilt = gameState.tower.foundations.includes(foundationInfo.element);

                  if (!foundationInfo) return null;

                  return (
                    <button
                      key={blueprint}
                      onClick={() => handleBuildFoundation(foundationInfo.element)}
                      disabled={!canBuildFoundation || alreadyBuilt}
                      style={{
                        backgroundColor: (canBuildFoundation && !alreadyBuilt) ? foundationInfo.color : '#4b5563',
                        color: (canBuildFoundation && !alreadyBuilt) ? 'white' : '#9ca3af',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: (canBuildFoundation && !alreadyBuilt) ? `2px solid ${foundationInfo.color}` : '2px solid transparent',
                        fontWeight: 'bold',
                        cursor: (canBuildFoundation && !alreadyBuilt) ? 'pointer' : 'not-allowed',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s ease-in-out',
                        opacity: alreadyBuilt ? 0.5 : 1
                      }}
                      title={alreadyBuilt ? `${foundationInfo.name}-Fundament bereits gebaut` : `Grundstein für ${foundationInfo.name}-Element legen`}
                    >
                      {foundationInfo.emoji} {foundationInfo.name}-Fundament {alreadyBuilt ? '(✓)' : ''}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Element Activation (Phase 2) */}
        {gameState.phase === 2 && currentPlayer.learnedSkills.includes('element_aktivieren') && currentPlayer.position === '4,4' && (
          <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center', marginBottom: '6px' }}>
              Element aktivieren (1 AP + 💎 + Fragment)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {['element_fragment_erde', 'element_fragment_wasser', 'element_fragment_feuer', 'element_fragment_luft'].map(fragmentType => {
                const elementMap = {
                  'element_fragment_erde': { name: 'Erde', emoji: '🟫', element: 'erde', bonusText: '+1 AP' },
                  'element_fragment_wasser': { name: 'Wasser', emoji: '🟦', element: 'wasser', bonusText: '+4 Licht' },
                  'element_fragment_feuer': { name: 'Feuer', emoji: '🟥', element: 'feuer', bonusText: '+4 Licht' },
                  'element_fragment_luft': { name: 'Luft', emoji: '🟪', element: 'luft', bonusText: '+1 AP' }
                };

                const elementInfo = elementMap[fragmentType];
                const hasFragment = currentPlayer.inventory.includes(fragmentType);
                const hasKristall = currentPlayer.inventory.includes('kristall');
                const isActivated = gameState.tower?.activatedElements?.includes(elementInfo.element);
                const canActivate = hasFragment && hasKristall && !isActivated && currentPlayer.ap >= 1;

                return (
                  <button
                    key={fragmentType}
                    onClick={() => handleActivateElement(fragmentType)}
                    disabled={!canActivate}
                    style={{
                      backgroundColor: isActivated ? '#065f46' : canActivate ? '#10b981' : '#4b5563',
                      color: isActivated || canActivate ? 'white' : '#9ca3af',
                      padding: '8px 8px',
                      borderRadius: '6px',
                      border: isActivated ? '2px solid #10b981' : canActivate ? '2px solid #34d399' : '2px solid transparent',
                      fontWeight: 'bold',
                      cursor: canActivate ? 'pointer' : 'not-allowed',
                      fontSize: '0.7rem',
                      transition: 'all 0.2s ease-in-out',
                      opacity: isActivated ? 0.7 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                    title={
                      isActivated ? `${elementInfo.name}-Element bereits aktiviert` :
                      !hasFragment ? `${elementInfo.name}-Fragment nicht im Inventar` :
                      !hasKristall ? 'Kristall benötigt' :
                      currentPlayer.ap < 1 ? 'Keine AP verfügbar' :
                      `${elementInfo.name}-Element aktivieren (${elementInfo.bonusText})`
                    }
                  >
                    <div style={{ fontSize: '1rem' }}>{elementInfo.emoji}</div>
                    <div>{elementInfo.name}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                      {isActivated ? '✅ Aktiviert' : elementInfo.bonusText}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
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

        {/* Schnell bewegen info - Show if player has the skill */}
        {currentPlayer.learnedSkills.includes('schnell_bewegen') && (
          <div style={{
            fontSize: '0.7rem',
            color: '#10b981',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '4px 8px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '4px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            💨 Schnell bewegen: Klicke auf ein Feld bis 2 Felder entfernt (1 AP)
          </div>
        )}

        {canLearn && (
          <button
            onClick={() => {
              // Check if we have artifacts or blueprints
              const hasArtifacts = currentPlayer.inventory.some(item =>
                item.startsWith('artefakt_')
              );
              const hasBlueprints = currentPlayer.inventory.some(item =>
                item.startsWith('bauplan_')
              );

              if (hasArtifacts) {
                handleLearnArtifact();
              } else if (hasBlueprints) {
                handleLearn();
              }
            }}
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
            title={
              currentPlayer.inventory.some(item => item.startsWith('artefakt_'))
                ? 'Artefakt lernen (1 AP) - ALLE Spieler am selben Feld lernen die Fähigkeiten'
                : 'Bauplan lernen (1 AP) - ALLE Spieler am selben Feld lernen die Fähigkeit'
            }
          >
            📚 Lernen (1 AP)
          </button>
        )}

        {/* Obstacle Removal Buttons */}
        {adjacentObstacles.map(obstacle => {
          const obstacleInfo = {
            'geroell': { icon: '⛏️', text: 'Geröll beseitigen', color: '#a16207', borderColor: '#ca8a04' },
            'dornenwald': { icon: '🔥', text: 'Dornen entfernen', color: '#b91c1c', borderColor: '#ef4444' },
            'ueberflutung': { icon: '💧', text: 'Überflutung trockenlegen', color: '#1d4ed8', borderColor: '#3b82f6' }
          }[obstacle.type];

          return (
            <button
              key={obstacle.position}
              onClick={() => handleRemoveObstacle(obstacle.position, obstacle.type)}
              style={{
                backgroundColor: obstacleInfo.color,
                color: 'white',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `2px solid ${obstacleInfo.borderColor}`,
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.8rem',
                gridColumn: '1 / -1',
                marginBottom: '0.5rem'
              }}
              title={`Entferne ${obstacle.type} im ${obstacle.direction}`}
            >
              {obstacleInfo.icon} {obstacleInfo.text} im {obstacle.direction} (1 AP)
            </button>
          );
        })}

        {/* Darkness Removal Buttons (Heilende Reinigung) */}
        {adjacentDarkness.map(darkness => {
          return (
            <button
              key={darkness.position}
              onClick={() => handleHeilendeReinigung(darkness.position)}
              style={{
                backgroundColor: '#7c3aed',
                color: 'white',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '2px solid #a78bfa',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.8rem',
                gridColumn: '1 / -1',
                marginBottom: '0.5rem',
                boxShadow: '0 0 8px rgba(124, 58, 237, 0.4)'
              }}
              title={`Entferne Finsternis im ${darkness.direction} mit Heilender Reinigung`}
            >
              💧 Heilende Reinigung im {darkness.direction} (1 AP)
            </button>
          );
        })}

        {/* Player Cleansing Button (Heilende Reinigung für Helden) */}
        {heroesWithNegativeEffects.length > 0 && (
          <button
            onClick={() => handleHeilendeReinigungEffekte()}
            style={{
              backgroundColor: '#06b6d4',
              color: 'white',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '2px solid #67e8f9',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.8rem',
              gridColumn: '1 / -1',
              marginBottom: '0.5rem',
              boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)'
            }}
            title={`Entferne negative Effekte von: ${heroesWithNegativeEffects.map(p => p.name).join(', ')}`}
          >
            💧 Heilende Reinigung {heroesWithNegativeEffects.length === 1 && heroesWithNegativeEffects[0].id === currentPlayer.id
              ? '(dich selbst)'
              : `(${heroesWithNegativeEffects.length} ${heroesWithNegativeEffects.length === 1 ? 'Held' : 'Helden'})`
            } (1 AP)
          </button>
        )}

        {/* Tor der Weisheit durchschreiten button */}
        {gameState.torDerWeisheit.triggered &&
         currentPlayer.position === gameState.torDerWeisheit.position &&
         !currentPlayer.isMaster &&
         currentPlayer.ap > 0 && (
          <button
            onClick={handleTorDurchschreiten}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '2px solid #a78bfa',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.8rem',
              gridColumn: '1 / -1',
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)',
              marginBottom: '0.5rem'
            }}
            title="Durchschreite das Tor der Weisheit und werde Meister deines Elements"
          >
            🚪 Tor der Weisheit durchschreiten (1AP)
          </button>
        )}

        {/* Master lehren button */}
        {currentPlayer.isMaster &&
         currentPlayer.learnedSkills.includes('lehren') &&
         currentPlayer.ap > 0 &&
         gameState.players.some(player =>
           player.position === currentPlayer.position && player.id !== currentPlayer.id
         ) && (
          <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center', marginBottom: '4px' }}>
              Wähle Fähigkeit zum Lehren:
            </div>
            {(() => {
              const innateSkills = {
                'earth': [
                  { skill: 'grundstein_legen', name: 'Grundstein legen', emoji: '🧱' },
                  { skill: 'geroell_beseitigen', name: 'Geröll beseitigen', emoji: '⛏️' }
                ],
                'fire': [
                  { skill: 'element_aktivieren', name: 'Element aktivieren', emoji: '🔥' },
                  { skill: 'dornen_entfernen', name: 'Dornen entfernen', emoji: '🌿' }
                ],
                'water': [
                  { skill: 'reinigen', name: 'Reinigen', emoji: '💧' },
                  { skill: 'fluss_freimachen', name: 'Fluss freimachen', emoji: '🌊' }
                ],
                'air': [
                  { skill: 'spaehen', name: 'Spähen', emoji: '👁️' },
                  { skill: 'schnell_bewegen', name: 'Schnell bewegen', emoji: '💨' }
                ]
              };
              const playerSkills = innateSkills[currentPlayer.element] || [];

              return playerSkills.map(({ skill, name, emoji }) => (
                <button
                  key={skill}
                  onClick={() => handleMasterLehren(skill)}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '2px solid #34d399',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    marginRight: '4px',
                    marginBottom: '4px',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                  }}
                  title={`Lehre ${name} an alle Spieler auf diesem Feld`}
                >
                  {emoji} {name} (1AP)
                </button>
              ));
            })()}
          </div>
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
      if (prev.currentEvent) {
        return prev; // Prevent during events, but allow during transitions
      }

      // Create a new players array with the current player's AP set to 0
      const playersWithEndedTurn = prev.players.map((p, index) =>
        index === prev.currentPlayerIndex ? { ...p, ap: 0 } : p
      );

      // The auto-transition logic will handle finding the next player or starting a new round
      const { nextPlayerIndex, newRound, actionBlockers, roundCompleted, lightDecrement, updatedPlayers } = handleAutoTurnTransition(
        [...playersWithEndedTurn], // Pass a copy to avoid mutation issues
        prev.currentPlayerIndex,
        prev.round,
        { ...prev, players: playersWithEndedTurn } // Pass a consistent state view
      );

      // Event triggering is now handled centrally in handleAutoTurnTransition
      // No need for separate handling here as roundCompleted is now consistently managed

      // The state update is now based on the result of the transition logic
      console.log(`📝 handleEndTurn SETTING STATE: roundCompleted=${roundCompleted}, newRound=${newRound}, from round ${prev.round}, currentPlayerIndex=${nextPlayerIndex}`);

      // Ensure we're setting the correct values
      if (roundCompleted && newRound <= prev.round) {
        console.error(`🚨 CRITICAL BUG: roundCompleted=true but newRound=${newRound} is not greater than prev.round=${prev.round}!`);
      }

      return {
        ...prev,
        players: updatedPlayers || playersWithEndedTurn, // Use updated players if available
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: actionBlockers,
        light: Math.max(0, prev.light - lightDecrement),
        roundCompleted: roundCompleted || false // Make sure to pass the flag
      };
    });
  };

  // Helper function to check if a player should skip their turn
  const shouldPlayerSkipTurn = (player, currentRound) => {
    return player.effects?.some(e => e.type === 'skip_turn' && e.expiresInRound > currentRound);
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const currentPlayerShouldSkip = shouldPlayerSkipTurn(currentPlayer, gameState.round);

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

      {/* Card Draw Modal - only show when in 'drawing' or 'result_shown' state */}
      {gameState.cardDrawQueue && gameState.cardDrawQueue.length > 0 && (gameState.cardDrawState === 'drawing' || gameState.cardDrawState === 'result_shown') && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            border: '3px solid #3b82f6',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            {(() => {
              const currentCard = gameState.cardDrawQueue[0];
              const isDirection = currentCard.type === 'direction';
              const isHero = currentCard.type === 'hero';
              const cardIsFlipped = gameState.cardDrawState === 'result_shown';

              // Get the drawn result if card is flipped
              const drawnDirection = cardIsFlipped && isDirection ? gameState.drawnCards.direction : null;
              const drawnHeroId = cardIsFlipped && isHero ? gameState.drawnCards.hero : null;
              const drawnHero = drawnHeroId ? gameState.players.find(p => p.id === drawnHeroId) : null;

              const heroColors = {
                terra: '#22c55e',
                ignis: '#ef4444',
                lyra: '#3b82f6',
                corvus: '#eab308'
              };

              // Determine title based on purpose
              const purpose = currentCard.purpose;
              let title = '🎴 Himmelsrichtung ziehen';
              if (isHero) {
                title = '🎴 Held ziehen';
              } else if (purpose === 'tor_der_weisheit') {
                title = '🚪 Tor der Weisheit - Himmelsrichtung ziehen';
              } else if (purpose === 'herz_der_finsternis') {
                title = '💀 Herz der Finsternis - Himmelsrichtung ziehen';
              }

              return (
                <>
                  {/* Title */}
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '24px',
                    textAlign: 'center',
                    color: isDirection ? '#3b82f6' : '#ca8a04'
                  }}>
                    {title}
                  </h2>

                  {/* Card Stack - clickable */}
                  <div
                    onClick={() => {
                      if (!cardIsFlipped) {
                        // First click: Draw and flip card
                        const randomIndex = Math.floor(Math.random() * currentCard.options.length);
                        const drawnValue = currentCard.options[randomIndex];

                        // BUGFIX: Set cardDrawState in same setGameState call to avoid timing issues
                        // This prevents need for double-click (state update happens immediately)
                        setGameState(prev => {
                          const purpose = currentCard?.purpose;
                          let newDrawnCards = { ...prev.drawnCards };
                          newDrawnCards[currentCard.type] = drawnValue;

                          console.log(`🎴 Card drawn: ${currentCard.type} = ${drawnValue}`);
                          console.log(`📝 Drawn cards so far:`, newDrawnCards);

                          return {
                            ...prev,
                            drawnCards: newDrawnCards,
                            cardDrawState: 'result_shown' // Flip card immediately
                          };
                        });
                      } else {
                        // Second click: Remove card from queue and proceed
                        // CRITICAL: Prevent React StrictMode from handling this click twice
                        if (currentlyConfirmingCardDraw) {
                          console.log('🔒 BLOCKED: Card confirmation already in progress - duplicate StrictMode click');
                          return;
                        }

                        currentlyConfirmingCardDraw = true;
                        console.log('✅ Card result confirmed by player - proceeding');

                        setGameState(prev => {
                          // Remove first item from queue NOW (on confirmation)
                          const newQueue = prev.cardDrawQueue.slice(1);
                          console.log(`📋 Remaining queue after confirmation: ${newQueue.length}`);

                          // Check if more cards need to be drawn
                          if (newQueue.length > 0) {
                            console.log(`📋 More cards to draw`);
                            // Release lock for next card
                            setTimeout(() => { currentlyConfirmingCardDraw = false; }, 100);
                            return {
                              ...prev,
                              cardDrawQueue: newQueue,
                              cardDrawState: 'event_shown' // Go back to event to draw next card
                            };
                          } else {
                            console.log('🎯 All cards drawn - applying effects NOW (directly in handler)');

                            // CRITICAL: Use module-level lock INSIDE setState to prevent React StrictMode double-execution
                            // This is the ONLY reliable way to prevent both:
                            // 1) Duplicate AP modifications (player.ap mutated twice)
                            // 2) Missing obstacles (second call overwrites first)
                            const eventId = prev.currentEvent?.id;

                            // SYNCHRONOUS check of module-level lock
                            if (currentlyApplyingEventId === eventId) {
                              console.log(`🔒 BLOCKED: Effect already applied for ${eventId} - duplicate StrictMode call`);
                              setTimeout(() => { currentlyConfirmingCardDraw = false; }, 200);
                              // CRITICAL: Return prev UNCHANGED (no spreading, no modifications)
                              // This ensures React doesn't overwrite the first call's changes with original state
                              return prev;
                            }

                            const eventToApply = prev.currentEvent;

                            if (eventToApply && prev.isEventTriggering) {
                              // Set lock IMMEDIATELY before applying effect
                              currentlyApplyingEventId = eventId;

                              console.log(`🎯 DIRECT: Applying effect for event ${eventToApply.id}`);

                              // Apply the effect with drawn cards
                              const stateAfterEffect = applyEventEffect(eventToApply, prev);

                              // Release both locks
                              setTimeout(() => {
                                currentlyConfirmingCardDraw = false;
                                currentlyApplyingEventId = null;
                                console.log(`🔓 Released locks for event ${eventId}`);
                              }, 200);

                              // Return state with effect applied AND modal closed
                              return {
                                ...stateAfterEffect,
                                cardDrawQueue: newQueue,
                                cardDrawState: 'none',
                                drawnCards: {},
                                isEventTriggering: false,
                                currentEvent: {
                                  ...eventToApply,
                                  effectApplied: true
                                }
                              };
                            } else {
                              console.log('⏭️ No event to apply - keeping drawnCards for special placement (Tor/Herz)');
                              setTimeout(() => { currentlyConfirmingCardDraw = false; }, 200);
                              return {
                                ...prev,
                                cardDrawQueue: newQueue,
                                cardDrawState: 'none'
                                // IMPORTANT: Keep drawnCards! (Tor/Herz placement needs it)
                              };
                            }
                          }
                        });
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '24px',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.backgroundColor = cardIsFlipped ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    {!cardIsFlipped ? (
                      /* Card Stack visualization - BEFORE flip */
                      <>
                        <div style={{
                          position: 'relative',
                          width: '200px',
                          height: '280px'
                        }}>
                          {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{
                              position: 'absolute',
                              top: `${i * 4}px`,
                              left: `${i * 4}px`,
                              width: '200px',
                              height: '280px',
                              backgroundColor: isDirection ? '#1e3a8a' : '#92400e',
                              borderRadius: '12px',
                              border: '3px solid ' + (isDirection ? '#3b82f6' : '#ca8a04'),
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              fontSize: '4rem',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                            }}>
                              {i === 3 && '🎴'}
                            </div>
                          ))}
                        </div>

                        <p style={{
                          fontSize: '1.1rem',
                          color: '#e5e7eb',
                          fontWeight: 'bold',
                          textAlign: 'center'
                        }}>
                          Klicke um eine Karte zu ziehen
                        </p>
                        <p style={{
                          fontSize: '0.9rem',
                          color: '#9ca3af',
                          textAlign: 'center'
                        }}>
                          {currentCard.options.length} Karten verfügbar
                        </p>
                      </>
                    ) : (
                      /* Flipped Card - Show Result with animation */
                      <>
                        {isDirection && drawnDirection && (
                          <div style={{
                            width: '200px',
                            height: '280px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '12px',
                            border: '3px solid #60a5fa',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.6)',
                            animation: 'flipCard 0.6s ease-out'
                          }}>
                            <div style={{ fontSize: '5rem', marginBottom: '16px' }}>
                              {drawnDirection === 'north' && '⬆️'}
                              {drawnDirection === 'east' && '➡️'}
                              {drawnDirection === 'south' && '⬇️'}
                              {drawnDirection === 'west' && '⬅️'}
                            </div>
                            <div style={{
                              fontSize: '1.8rem',
                              fontWeight: 'bold',
                              color: 'white',
                              textTransform: 'uppercase',
                              letterSpacing: '3px'
                            }}>
                              {drawnDirection === 'north' && 'NORDEN'}
                              {drawnDirection === 'east' && 'OSTEN'}
                              {drawnDirection === 'south' && 'SÜDEN'}
                              {drawnDirection === 'west' && 'WESTEN'}
                            </div>
                          </div>
                        )}

                        {isHero && drawnHero && (
                          <div style={{
                            width: '200px',
                            height: '280px',
                            backgroundColor: heroColors[drawnHero.id] || '#ca8a04',
                            borderRadius: '12px',
                            border: '3px solid rgba(255, 255, 255, 0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: `0 4px 20px ${heroColors[drawnHero.id] || '#ca8a04'}80`,
                            animation: 'flipCard 0.6s ease-out'
                          }}>
                            <div style={{ fontSize: '5rem', marginBottom: '16px' }}>
                              {drawnHero.icon}
                            </div>
                            <div style={{
                              fontSize: '1.8rem',
                              fontWeight: 'bold',
                              color: 'white',
                              textTransform: 'uppercase',
                              letterSpacing: '3px'
                            }}>
                              {drawnHero.name}
                            </div>
                          </div>
                        )}

                        <p style={{
                          fontSize: '1.1rem',
                          color: '#10b981',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          marginTop: '16px'
                        }}>
                          Klicke erneut um fortzufahren
                        </p>
                      </>
                    )}
                  </div>

                  {/* CSS Animation */}
                  <style>{`
                    @keyframes flipCard {
                      0% {
                        transform: rotateY(90deg) scale(0.8);
                        opacity: 0;
                      }
                      50% {
                        transform: rotateY(45deg) scale(0.9);
                      }
                      100% {
                        transform: rotateY(0deg) scale(1);
                        opacity: 1;
                      }
                    }
                  `}</style>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Event Card Modal */}
      {gameState.currentEvent && (gameState.cardDrawState === 'event_shown' || !gameState.cardDrawQueue.length) && (
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
            boxShadow: `0 0 30px 5px ${gameState.currentEvent.type === 'negative' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            border: gameState.currentEvent.type === 'negative'
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

              {/* Effekt-Information */}
              <div style={{
                backgroundColor: 'rgba(0,0,0, 0.2)',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                padding: '0.75rem',
                marginTop: '1rem'
              }}>
                <h4 style={{
                  color: '#facc15',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  marginBottom: '0.25rem'
                }}>
                  Effekt:
                </h4>
                <p style={{
                  color: '#e5e7eb',
                  fontSize: '0.875rem',
                  margin: 0
                }}>{gameState.currentEvent.resolvedEffectText || gameState.currentEvent.effectText}</p>
              </div>

              {/* Konter-Information */}
              {eventCounters[gameState.currentEvent.id] && eventCounters[gameState.currentEvent.id] !== '-' && (
                <div key={`counter-${gameState.currentEvent.id}`} style={{
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

            {/* Resource Selection, Drop Item Selection, or Regular Event Buttons */}
            {gameState.currentEvent.type === 'resource_selection' ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '16px'
              }}>
                {gameState.currentEvent.availableResources.map((resource, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectResource(resource)}
                    style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    title={`${resource} sammeln`}
                  >
                    {resource === 'kristall' ? '💎' :
                     resource.startsWith('bauplan_') ? '📜' :
                     '🎁'} {resource}
                  </button>
                ))}
                <button
                  onClick={() => setGameState(prev => ({ ...prev, currentEvent: null }))}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  Abbrechen
                </button>
              </div>
            ) : gameState.currentEvent.type === 'drop_item_selection' ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '16px'
              }}>
                {gameState.currentEvent.availableItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => dropSelectedItem(item)}
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    title={`${item} ablegen`}
                  >
                    {item === 'kristall' ? '💎' :
                     item === 'artefakt_terra' ? '🔨' :
                     item === 'artefakt_ignis' ? '🔥' :
                     item === 'artefakt_lyra' ? '🏺' :
                     item === 'artefakt_corvus' ? '👁️' :
                     item.startsWith('bauplan_') ? '📜' :
                     '🎁'} {item}
                  </button>
                ))}
                <button
                  onClick={() => setGameState(prev => ({ ...prev, currentEvent: null }))}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  Abbrechen
                </button>
              </div>
            ) : gameState.currentEvent.type === 'learn_item_selection' ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '16px'
              }}>
                {gameState.currentEvent.availableItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (gameState.currentEvent.itemType === 'blueprint') {
                        learnSelectedItem(item);
                      } else if (gameState.currentEvent.itemType === 'artifact') {
                        learnSelectedArtifact(item);
                      }
                    }}
                    style={{
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    title={`${item} lernen`}
                  >
                    {item === 'artefakt_terra' ? '🔨 Terras Hammer der Erbauerin' :
                     item === 'artefakt_ignis' ? '🔥 Ignis\' Herz des Feuers' :
                     item === 'artefakt_lyra' ? '🏺 Lyras Kelch der Reinigung' :
                     item === 'artefakt_corvus' ? '👁️ Corvus\' Auge des Spähers' :
                     item === 'bauplan_erde' ? '📜 Bauplan Erde' :
                     item === 'bauplan_wasser' ? '📜 Bauplan Wasser' :
                     item === 'bauplan_feuer' ? '📜 Bauplan Feuer' :
                     item === 'bauplan_luft' ? '📜 Bauplan Luft' :
                     item}
                  </button>
                ))}
                <button
                  onClick={() => setGameState(prev => ({ ...prev, currentEvent: null }))}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                justifyContent: 'center'
              }}>
                {gameState.cardDrawState === 'event_shown' && gameState.cardDrawQueue.length > 0 ? (
                  // Event needs card draw - show "Draw Card" button
                  <button
                    onClick={() => {
                      const cardType = gameState.cardDrawQueue[0].type;
                      console.log(`🎴 User clicked to draw ${cardType} card`);
                      setGameState(prev => ({
                        ...prev,
                        cardDrawState: 'drawing' // Switch to card draw modal
                      }));
                    }}
                    style={{
                      backgroundColor: gameState.cardDrawQueue[0].type === 'direction' ? '#3b82f6' : '#ca8a04',
                      color: 'white',
                      padding: '12px 32px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🎴 {gameState.cardDrawQueue[0].type === 'direction' ? 'Himmelsrichtung ziehen' : 'Heldenkarte ziehen'}
                  </button>
                ) : (
                  // No card draw needed - show normal "Continue" button
                  <button
                    onClick={() => setGameState(prev => ({
                      ...prev,
                      currentEvent: null,
                      isEventTriggering: false,
                      cardDrawState: 'none',
                      drawnCards: {}, // CRITICAL: Clear drawnCards when event modal closes
                      currentPlayerIndex: 0  // Start new round with first player
                    }))}
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
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 2 Transition Modal */}
      {gameState.phaseTransitionModal.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              border: '3px solid #fbbf24',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(251, 191, 36, 0.3)'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                🌟 MEILENSTEIN ERREICHT! 🌟
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '0.05em'
              }}>
                DER TURM DER ELEMENTE ERHEBT SICH
              </div>
            </div>

            <hr style={{
              border: 'none',
              borderTop: '2px solid #475569',
              margin: '1.5rem 0'
            }} />

            {/* Story Text */}
            <div style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: '#d1d5db',
              marginBottom: '1.5rem'
            }}>
              <p>Tapfere Helden, euer Mut und eure Zusammenarbeit haben die Welt verändert!</p>

              <p style={{ marginTop: '1rem' }}>
                Die vier Fundamente stehen fest im Krater von Elyria:
              </p>

              <div style={{
                fontSize: '1.5rem',
                textAlign: 'center',
                margin: '1rem 0',
                letterSpacing: '0.5rem'
              }}>
                🟫 🟦 🟥 💨
              </div>

              <p>
                Aus den Tiefen der Ursubstanz Apeiron erhebt sich das Fundament
                des Turms - ein Leuchtfeuer der Hoffnung, das die Finsternis zurückdrängt!
              </p>

              {/* Light Bonus Breakdown */}
              <div style={{
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                padding: '1rem',
                margin: '1.5rem 0',
                textAlign: 'center'
              }}>
                <div style={{ color: '#fbbf24', fontSize: '0.9rem' }}>
                  💡 +{gameState.phaseTransitionModal.foundationBonus} Licht für das Fundament
                </div>
                <div style={{ color: '#fbbf24', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  💡 +{gameState.phaseTransitionModal.phaseCompletionBonus} Licht für den Abschluss von Phase 1
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: '#fbbf24',
                  marginTop: '0.75rem'
                }}>
                  Das Licht wächst um {gameState.phaseTransitionModal.totalBonus} Punkte!
                </div>
              </div>

              <hr style={{
                border: 'none',
                borderTop: '1px dashed #475569',
                margin: '1.5rem 0'
              }} />

              <p>
                Doch die Sphäre der Dunkelheit spürt eure Kraft. Mit einem dunklen
                Pulsieren antwortet sie auf eure Tat - und beginnt, die Insel Elyria
                zu verschlingen...
              </p>

              {/* Phase 2 Warning */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid #ef4444',
                borderRadius: '8px',
                padding: '1rem',
                margin: '1.5rem 0',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: '#fbbf24',
                  marginBottom: '1rem'
                }}>
                  ⚠️ PHASE 2 BEGINNT ⚠️
                </div>

                <div style={{ fontSize: '0.9rem', textAlign: 'left' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    Ab jetzt gilt:
                  </div>
                  <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                    <li>Herausforderndere Ereignisse erwarten euch</li>
                    <li>Ein neues Gebiet der Insel wird erkundet</li>
                    <li>Die Finsternis breitet sich nach jedem Zug aus</li>
                  </ul>
                </div>
              </div>

              {/* Goal */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid #10b981',
                borderRadius: '8px',
                padding: '1rem',
                margin: '1.5rem 0'
              }}>
                <div style={{
                  fontWeight: 'bold',
                  color: '#10b981',
                  marginBottom: '0.5rem'
                }}>
                  EUER ZIEL IN PHASE 2:
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  Findet die 4 Element-Fragmente (🟫 🟦 🟥 💨) und aktiviert sie
                  am Turm mit je <strong style={{ color: '#fbbf24' }}>1 Kristall + 1 Fragment</strong>,
                  bevor das Licht erlischt!
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                  Nur so kann die Finsternis endgültig besiegt werden.
                </div>
              </div>

              {/* Quote */}
              <div style={{
                fontStyle: 'italic',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '0.9rem',
                marginTop: '1.5rem'
              }}>
                "Durch die Vielen wird das Eine zum Höchsten emporgehoben"
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handlePhaseTransitionConfirm}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #059669, #047857)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
            >
              🚀 WEITER ZU PHASE 2
            </button>
          </div>
        </div>
      )}

      {/* Tor der Weisheit Modal */}
      {gameState.torDerWeisheitModal.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%)',
              border: '3px solid #3b82f6',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '90%',
              padding: '2rem',
              boxShadow: '0 0 60px rgba(59, 130, 246, 0.4), inset 0 0 30px rgba(59, 130, 246, 0.1)',
              color: '#1e3a8a'
            }}
          >
            {/* Header with gate symbol */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '0.5rem'
              }}>
                ⛩️
              </div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#1e40af',
                letterSpacing: '0.1em'
              }}>
                DAS TOR DER WEISHEIT ERSCHEINT
              </div>
            </div>

            {/* Position/Direction Info - Different states based on awaitingCardDraw */}
            {gameState.torDerWeisheitModal.awaitingCardDraw ? (
              // STATE 1: Awaiting card draw - explain what will happen
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                padding: '1.25rem',
                margin: '1.5rem 0',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '1rem',
                  color: '#1e3a8a',
                  lineHeight: '1.7',
                  marginBottom: '0.75rem'
                }}>
                  Das Tor materialisiert sich an einem freien Feld neben dem Krater.
                </div>
                <div style={{
                  fontSize: '1rem',
                  color: '#2563eb',
                  fontWeight: 'bold',
                  lineHeight: '1.7'
                }}>
                  🎴 Ziehe eine Himmelsrichtungskarte, um zu bestimmen, in welcher Richtung das Tor erscheinen soll.
                </div>
              </div>
            ) : gameState.torDerWeisheitModal.chosenDirection ? (
              // STATE 2: Card drawn - show direction-based placement
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                padding: '1rem',
                margin: '1.5rem 0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.1rem', color: '#2563eb', marginBottom: '0.75rem' }}>
                  ⛩️ Das Tor der Weisheit erscheint
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  lineHeight: '1.6'
                }}>
                  am ersten freien Platz vom Krater aus in Richtung <strong style={{
                    fontSize: '1.4rem',
                    color: '#1e40af',
                    letterSpacing: '0.05em'
                  }}>{directionNames[gameState.torDerWeisheitModal.chosenDirection]}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#60a5fa', marginTop: '0.75rem' }}>
                  (Ein Ort des Lichts und der Transformation)
                </div>
              </div>
            ) : null}

            {/* Description */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontSize: '1rem',
                color: '#1e3a8a',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                Als das Licht zu schwinden drohte, öffnete sich ein Portal zwischen den Welten.
                Das <strong>Tor der Weisheit</strong> - ein uraltes Artefakt der Götter - gewährt denjenigen,
                die es durchschreiten, die Erleuchtung der Meisterschaft.
              </div>

              {/* Benefits */}
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <div style={{
                  fontWeight: 'bold',
                  color: '#1e40af',
                  marginBottom: '0.75rem',
                  fontSize: '1.1rem'
                }}>
                  ✨ Was euch erwartet:
                </div>

                <div style={{ fontSize: '0.95rem', color: '#1e3a8a', lineHeight: '1.8' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    🎯 <strong>Durchschreiten (1 AP):</strong> Werde zum <strong style={{ color: '#7c3aed' }}>Meister</strong>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    📚 <strong>Lehren (1 AP):</strong> Teile deine <strong>angeborenen Fähigkeiten</strong> mit Gefährten am selben Feld
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    🌟 <strong>Immunität:</strong> Das Tor ist immun gegen Finsternis
                  </div>
                  <div>
                    💎 <strong>Artefakte:</strong> Unentdeckte Artefakte erscheinen hier bei Phase 2
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div style={{
              fontStyle: 'italic',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.95rem',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(100, 116, 139, 0.05)',
              borderRadius: '8px'
            }}>
              "Durch Weisheit wird das Licht bewahrt, durch Meisterschaft wird es weitergegeben."
            </div>

            {/* Action Button - Different states */}
            {gameState.torDerWeisheitModal.awaitingCardDraw ? (
              // STATE 1: Button to initiate card draw
              <button
                onClick={handleTorCardDrawInitiate}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'white',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }}
              >
                🎴 HIMMELSRICHTUNG ZIEHEN UND TOR PLATZIEREN
              </button>
            ) : (
              // STATE 2: Button to close modal after placement
              <button
                onClick={() => setGameState(prev => ({
                  ...prev,
                  torDerWeisheitModal: { show: false, position: null, chosenDirection: null, awaitingCardDraw: false }
                }))}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'white',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }}
              >
                ⛩️ VERSTANDEN - WEITER SPIELEN
              </button>
            )}
          </div>
        </div>
      )}

      {/* Game Intro Modal */}
      {gameState.gameIntroModal.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10002
          }}
        >
          <div
            style={{
              background: '#1f2937',
              border: '2px solid #4b5563',
              borderRadius: '12px',
              maxWidth: '600px',
              maxHeight: '80vh',
              width: '90%',
              padding: '2rem',
              color: '#e5e7eb',
              overflow: 'auto'
            }}
          >
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#f3f4f6',
                marginBottom: '0.5rem'
              }}>
                APEIRON
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: '#9ca3af'
              }}>
                Der Turm der Elemente
              </div>
            </div>

            {/* Story */}
            <div style={{
              background: '#374151',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontSize: '0.95rem',
                color: '#d1d5db',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                Die Sphäre der Dunkelheit bedroht eure Welt. Nur durch die Macht der vier Elemente kann die Finsternis verbannt werden.
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#9ca3af',
                lineHeight: '1.5'
              }}>
                Minotauren (Erde), Sirenen (Wasser), Drachen (Feuer) und Aviari (Luft) müssen gemeinsam den Turm der Elemente errichten und alle vier Elemente aktivieren.
              </div>
            </div>

            {/* Objective */}
            <div style={{
              background: '#374151',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontWeight: 'bold',
                color: '#f3f4f6',
                marginBottom: '0.75rem',
                fontSize: '1rem'
              }}>
                Euer Ziel
              </div>
              <div style={{ fontSize: '0.9rem', color: '#d1d5db', lineHeight: '1.8' }}>
                <div>• Baut alle 4 Fundamente auf dem Krater</div>
                <div>• Findet die 4 Element-Fragmente in Phase 2</div>
                <div>• Aktiviert alle 4 Elemente am Krater</div>
                <div>• Bevor das Licht erlischt!</div>
              </div>
            </div>

            {/* Quote */}
            <div style={{
              fontStyle: 'italic',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#374151',
              borderRadius: '8px'
            }}>
              "Nur durch die Vielen kann das Eine zum Höchsten emporgehoben werden."
            </div>

            {/* Start Button */}
            <button
              onClick={() => setGameState(prev => ({
                ...prev,
                gameIntroModal: { show: false }
              }))}
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Spiel starten
            </button>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {gameState.victoryModal.show && gameState.victoryModal.stats && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10002
          }}
        >
          <div
            style={{
              background: '#1f2937',
              border: '2px solid #10b981',
              borderRadius: '12px',
              maxWidth: '600px',
              maxHeight: '80vh',
              width: '90%',
              padding: '2rem',
              color: '#e5e7eb',
              overflow: 'auto'
            }}
          >
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '0.5rem'
              }}>
                SIEG
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#9ca3af'
              }}>
                Der Turm der Elemente erhebt sich
              </div>
            </div>

            {/* Story */}
            <div style={{
              background: '#374151',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontSize: '0.95rem',
                color: '#d1d5db',
                lineHeight: '1.6',
                marginBottom: '0.75rem'
              }}>
                Gemeinsam habt ihr das Unmögliche vollbracht. Die vier Völker haben ihre Kräfte vereint.
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#9ca3af',
                lineHeight: '1.5'
              }}>
                Der Turm der Elemente erstrahlt in glorreicher Vollendung. Die Sphäre der Dunkelheit weicht zurück, die Finsternis ist verbannt. Das Licht kehrt zurück!
              </div>
            </div>

            {/* Statistics */}
            <div style={{
              background: '#374151',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontWeight: 'bold',
                color: '#f3f4f6',
                marginBottom: '1rem',
                fontSize: '1rem'
              }}>
                Spielstatistik
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.9rem',
                color: '#d1d5db'
              }}>
                <div>
                  <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Runden</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {gameState.victoryModal.stats.rounds}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Helden</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {gameState.victoryModal.stats.playerCount}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Phase</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {gameState.victoryModal.stats.phase}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Licht</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {gameState.victoryModal.stats.remainingLight}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #4b5563' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Helden</div>
                <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>
                  {gameState.victoryModal.stats.playerNames.join(', ')}
                </div>
              </div>
            </div>

            {/* Quote */}
            <div style={{
              fontStyle: 'italic',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#374151',
              borderRadius: '8px'
            }}>
              "Durch die Vielen wurde das Eine zum Höchsten emporgehoben."
            </div>

            {/* Button */}
            <button
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                background: '#10b981',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Neues Spiel
            </button>
          </div>
        </div>
      )}

      {/* Defeat Modal */}
      {gameState.defeatModal.show && gameState.defeatModal.stats && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10002
          }}
        >
          <div
            style={{
              background: '#1f2937',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              maxWidth: '600px',
              maxHeight: '80vh',
              width: '90%',
              padding: '2rem',
              color: '#e5e7eb',
              overflow: 'auto'
            }}
          >
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#ef4444',
                marginBottom: '0.5rem'
              }}>
                NIEDERLAGE
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#9ca3af'
              }}>
                Das Licht ist erloschen
              </div>
            </div>

            {/* Story */}
            <div style={{
              background: '#374151',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontSize: '0.95rem',
                color: '#d1d5db',
                lineHeight: '1.6',
                marginBottom: '0.75rem'
              }}>
                Trotz eures heldenhaften Kampfes konnte das Licht nicht bewahrt werden.
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#9ca3af',
                lineHeight: '1.5'
              }}>
                Die Sphäre der Dunkelheit triumphiert. Finsternis überzieht das Land, der Turm bleibt unvollendet. Doch die Hoffnung stirbt niemals ganz...
              </div>
            </div>

            {/* Statistics */}
            <div style={{
              background: '#374151',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                fontWeight: 'bold',
                color: '#f3f4f6',
                marginBottom: '1rem',
                fontSize: '1rem'
              }}>
                Spielstatistik
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.9rem',
                color: '#d1d5db'
              }}>
                <div>
                  <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Runden</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                    {gameState.defeatModal.stats.rounds}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Helden</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                    {gameState.defeatModal.stats.playerCount}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Elemente</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                    {gameState.defeatModal.stats.activatedElements.length} / 4
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9ca3af', marginBottom: '0.25rem' }}>Phase</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                    {gameState.defeatModal.stats.phase}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #4b5563' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Helden</div>
                <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>
                  {gameState.defeatModal.stats.playerNames.join(', ')}
                </div>
              </div>
              {gameState.defeatModal.stats.activatedElements.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #4b5563' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Aktivierte Elemente</div>
                  <div style={{ color: '#10b981', fontSize: '0.9rem' }}>
                    {gameState.defeatModal.stats.activatedElements.map(el =>
                      el === 'erde' ? 'Erde' :
                      el === 'wasser' ? 'Wasser' :
                      el === 'feuer' ? 'Feuer' :
                      'Luft'
                    ).join(', ')}
                  </div>
                </div>
              )}
            </div>

            {/* Quote */}
            <div style={{
              fontStyle: 'italic',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#374151',
              borderRadius: '8px'
            }}>
              "Aus der Niederlage erwächst neue Weisheit. Versucht es erneut."
            </div>

            {/* Button */}
            <button
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                background: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      {/* Herz der Finsternis Modal */}
      {gameState.herzDerFinsternisModal.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0f0f0f 0%, #1a0000 50%, #000000 100%)',
              border: '3px solid #dc2626',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 0 80px rgba(220, 38, 38, 0.6), inset 0 0 40px rgba(220, 38, 38, 0.1)'
            }}
          >
            {/* Header with heart symbol */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '0.5rem'
              }}>
                💀
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#dc2626',
                letterSpacing: '0.1em'
              }}>
                DAS HERZ DER FINSTERNIS ERWACHT
              </div>
            </div>

            <hr style={{
              border: 'none',
              borderTop: '2px solid #7f1d1d',
              margin: '1.5rem 0'
            }} />

            {/* Story Text */}
            <div style={{
              fontSize: '0.95rem',
              lineHeight: '1.7',
              color: '#d1d5db',
              marginBottom: '1.5rem'
            }}>
              <p style={{ color: '#ef4444' }}>
                <strong>Ein kalter Schauder durchfährt die Helden...</strong>
              </p>

              <p style={{ marginTop: '1rem' }}>
                Mit dem Errichten des Turms habt ihr die Balance der Welt erschüttert.
                Die Finsternis, die bisher in den Schatten lauerte, reagiert auf eure Kraft!
              </p>

              <p style={{ marginTop: '1rem', color: '#fca5a5' }}>
                Aus den Tiefen der Insel pulsiert ein uraltes, verdorbenes Herz.
                Schwärze kriecht über das Land wie ein lebendiger Organismus.
              </p>

              {/* Position/Direction Info - Different states based on awaitingCardDraw */}
              {gameState.herzDerFinsternisModal.awaitingCardDraw ? (
                // STATE 1: Awaiting card draw - explain what will happen
                <div style={{
                  background: 'rgba(220, 38, 38, 0.15)',
                  border: '2px solid #dc2626',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  margin: '1.5rem 0',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1rem',
                    color: '#d1d5db',
                    lineHeight: '1.7',
                    marginBottom: '0.75rem'
                  }}>
                    Das Herz materialisiert sich an einem freien Feld neben dem Krater.
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    color: '#ef4444',
                    fontWeight: 'bold',
                    lineHeight: '1.7'
                  }}>
                    🎴 Ziehe eine Himmelsrichtungskarte, um zu bestimmen, in welcher Richtung das Herz der Finsternis erscheinen soll.
                  </div>
                </div>
              ) : gameState.herzDerFinsternisModal.chosenDirection ? (
                // STATE 2: Card drawn - show direction-based placement
                <div style={{
                  background: 'rgba(220, 38, 38, 0.15)',
                  border: '2px solid #dc2626',
                  borderRadius: '8px',
                  padding: '1rem',
                  margin: '1.5rem 0',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: '0.75rem' }}>
                    💀 Das Herz der Finsternis erscheint
                  </div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#dc2626',
                    lineHeight: '1.6'
                  }}>
                    am ersten freien Platz vom Krater aus in Richtung <strong style={{
                      fontSize: '1.4rem',
                      color: '#dc2626',
                      letterSpacing: '0.05em'
                    }}>{directionNames[gameState.herzDerFinsternisModal.chosenDirection]}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fca5a5', marginTop: '0.75rem' }}>
                    (Dieses Feld ist unpassierbar und Ursprung der Verderbnis)
                  </div>
                </div>
              ) : null}

              {/* Warning Box */}
              <div style={{
                background: 'rgba(127, 29, 29, 0.3)',
                border: '2px solid #991b1b',
                borderRadius: '8px',
                padding: '1rem',
                margin: '1.5rem 0'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: '#f87171',
                  marginBottom: '0.75rem',
                  textAlign: 'center'
                }}>
                  ⚠️ DIE FINSTERNIS BREITET SICH AUS ⚠️
                </div>

                <div style={{ fontSize: '0.9rem', textAlign: 'left' }}>
                  <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Die Finsternis breitet sich <strong style={{ color: '#fca5a5' }}>nach jedem Spielerzug</strong> im Uhrzeigersinn aus
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Befallene Felder sind <strong style={{ color: '#fca5a5' }}>unpassierbar</strong>
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Ressourcen auf befallenen Feldern können <strong style={{ color: '#fca5a5' }}>nicht aufgehoben</strong> werden
                    </li>
                    <li>
                      Nur der <strong style={{ color: '#fbbf24' }}>Krater</strong> und das <strong style={{ color: '#fbbf24' }}>Tor der Weisheit</strong> sind immun
                    </li>
                  </ul>
                </div>
              </div>

              {/* Mini-Map Placeholder */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '1rem',
                margin: '1.5rem 0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                  Das Herz schlägt... die Verderbnis beginnt zu kriechen...
                </div>
                <div style={{
                  fontSize: '2rem',
                  marginTop: '0.5rem',
                  filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.5))'
                }}>
                  ☠️ → 💀 → ☠️
                </div>
              </div>

              {/* Quote */}
              <div style={{
                fontStyle: 'italic',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '0.9rem',
                marginTop: '1.5rem',
                borderLeft: '3px solid #7f1d1d',
                paddingLeft: '1rem'
              }}>
                "Das Licht kämpft gegen die Dunkelheit, doch die Dunkelheit kennt keine Erschöpfung..."
              </div>
            </div>

            {/* Action Button - Different states */}
            {gameState.herzDerFinsternisModal.awaitingCardDraw ? (
              // STATE 1: Button to initiate card draw
              <button
                onClick={handleHerzCardDrawInitiate}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'white',
                  background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #991b1b, #7f1d1d)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #dc2626, #991b1b)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
                }}
              >
                🎴 HIMMELSRICHTUNG ZIEHEN UND HERZ PLATZIEREN
              </button>
            ) : (
              // STATE 2: Button to close modal after placement
              <button
                onClick={() => {
                  setGameState(prev => ({
                    ...prev,
                    herzDerFinsternisModal: { show: false, position: null, chosenDirection: null, awaitingCardDraw: false }
                  }));
                }}
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'white',
                  background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #991b1b, #7f1d1d)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #dc2626, #991b1b)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
                }}
              >
                💀 DIE HERAUSFORDERUNG ANNEHMEN
              </button>
            )}
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
                  width: `${(gameState.light / gameRules.light.maxValue) * 100}%`,
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
                      {isCurrentPlayer && shouldPlayerSkipTurn(player, gameState.round) && (
                        <span style={{ color: '#fbbf24', marginLeft: '6px', fontSize: '0.7rem' }}>
                          (Aussetzen) 😴
                        </span>
                      )}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#d1d5db' }}>
                      AP: {player.ap}/{player.maxAp}
                    </div>
                  </div>
                  
                  {/* Active Effects */}
                  {player.effects && player.effects.filter(e => e.expiresInRound > gameState.round).length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      {(() => {
                        // Deduplicate effects by type to prevent double display
                        const activeEffects = player.effects.filter(e => e.expiresInRound > gameState.round);
                        const uniqueEffects = [];
                        const seen = new Set();

                        activeEffects.forEach(effect => {
                          const key = `${effect.type}-${effect.value || ''}-${effect.expiresInRound}`;
                          if (!seen.has(key)) {
                            seen.add(key);
                            uniqueEffects.push(effect);
                          }
                        });

                        return uniqueEffects.map((effect, index) => {
                          // Check if effect is permanent (expiresInRound = 999999)
                          const isPermanent = effect.expiresInRound === 999999;

                          const effectInfo = {
                            skip_turn: { icon: '😴', title: isPermanent ? 'Muss permanent aussetzen' : 'Muss nächste Runde aussetzen' },
                            prevent_movement: { icon: '⛓️', title: isPermanent ? 'Kann sich permanent nicht bewegen' : 'Kann sich nicht bewegen' },
                            block_skills: { icon: '🚫', title: isPermanent ? 'Spezialfähigkeiten permanent blockiert' : 'Spezialfähigkeiten blockiert' },
                            bonus_ap: { icon: '⚡', title: isPermanent ? `Hat permanent +${effect.value} AP` : `Hat +${effect.value} AP in dieser Runde` },
                            reduce_ap: { icon: '🧊', title: isPermanent ? `Hat permanent -${effect.value} AP` : `Hat -${effect.value} AP in dieser Runde` },
                            set_ap: { icon: '⏸️', title: isPermanent ? `AP permanent auf ${effect.value} gesetzt` : `AP auf ${effect.value} gesetzt` }
                          }[effect.type];

                          if (!effectInfo) return null;

                          return (
                            <div
                              key={`${effect.type}-${effect.value || ''}-${index}`}
                              title={effectInfo.title}
                              style={{
                                backgroundColor: effect.type.includes('bonus') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                border: effect.type.includes('bonus') ? '1px solid #22c55e' : '1px solid #ef4444',
                                color: '#fca5a5',
                                borderRadius: '4px',
                                padding: '2px 4px',
                                fontSize: '0.8rem',
                                display: 'flex',
                                gap: '2px',
                                alignItems: 'center'
                              }}
                            >
                              {effectInfo.icon}
                              {isPermanent && <span style={{ fontSize: '0.7rem' }}>♾️</span>}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                  {/* Action Blockers */}
                  {gameState.actionBlockers && gameState.actionBlockers.filter(b => b.target === player.id || b.target === 'all_players').length > 0 && (
                     <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      {gameState.actionBlockers.filter(b => b.target === player.id || b.target === 'all_players').map((blocker, index) => {
                        const blockerInfo = {
                          discover_and_scout: { icon: '🚫', title: 'Entdecken/Spähen blockiert' },
                          discover: { icon: '🚫', title: 'Entdecken blockiert' },
                          spaehen: { icon: '🚫', title: 'Spähen blockiert' },
                          communication: { icon: '🔇', title: 'Kommunikation nicht erlaubt' },
                          learn_skills: { icon: '📚', title: 'Fähigkeiten lernen blockiert' }
                        }[blocker.action];

                        if (!blockerInfo) return null;

                        return (
                          <div
                            key={`blocker-${index}`}
                            title={blockerInfo.title}
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid #ef4444',
                              borderRadius: '4px',
                              padding: '2px 4px',
                              fontSize: '0.8rem'
                            }}
                          >
                            {blockerInfo.icon}
                          </div>
                        );
                      })}
                    </div>
                  )}

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
                                item === 'artefakt_terra' ? 'Hammer der Erbauerin' :
                                item === 'artefakt_ignis' ? 'Herz des Feuers' :
                                item === 'artefakt_lyra' ? 'Kelch der Reinigung' :
                                item === 'artefakt_corvus' ? 'Auge des Spähers' :
                                item === 'element_fragment_erde' ? 'Erd-Fragment' :
                                item === 'element_fragment_wasser' ? 'Wasser-Fragment' :
                                item === 'element_fragment_feuer' ? 'Feuer-Fragment' :
                                item === 'element_fragment_luft' ? 'Luft-Fragment' :
                                item}
                        >
                          {isEmpty ? (
                            <div style={{ width: '8px', height: '8px', backgroundColor: '#6b7280', borderRadius: '2px' }}></div>
                          ) : (
                            <span style={{ color: 'white', fontWeight: 'bold' }}>
                              {item === 'kristall' ? '💎' :
                               item === 'artefakt_terra' ? '🔨' :
                               item === 'artefakt_ignis' ? '🔥' :
                               item === 'artefakt_lyra' ? '🏺' :
                               item === 'artefakt_corvus' ? '👁️' :
                               item === 'element_fragment_erde' ? '🟩' :
                               item === 'element_fragment_wasser' ? '🟦' :
                               item === 'element_fragment_feuer' ? '🟥' :
                               item === 'element_fragment_luft' ? '🟨' :
                               item.startsWith('bauplan_') ? '📋' : '📦'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Skills indicator - Split into Abilities and Knowledge */}
                  <div style={{ marginTop: '6px' }}>
                    {/* Abilities (Real Skills) */}
                    {(() => {
                      const abilities = player.learnedSkills.filter(skill =>
                        skill !== 'aufdecken' && !skill.startsWith('kenntnis_bauplan_')
                      );

                      if (abilities.length === 0) return null;

                      return (
                        <div style={{ marginBottom: '4px' }}>
                          <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '2px' }}>
                            Fähigkeiten:
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#fbbf24',
                            display: 'flex',
                            gap: '4px',
                            flexWrap: 'wrap'
                          }}>
                            {abilities.map((skill) => {
                              const skillEmojis = {
                                'grundstein_legen': '🧱',
                                'geroell_beseitigen': '⛏️',
                                'spaehen': '👁️',
                                'schnell_bewegen': '💨',
                                'element_aktivieren': '🔥',
                                'dornen_entfernen': '🌿',
                                'reinigen': '💧',
                                'fluss_freimachen': '🌊',
                                'lehren': '🎓'
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
                    })()}

                    {/* Knowledge (Foundation Building) */}
                    {(() => {
                      const knowledge = player.learnedSkills.filter(skill =>
                        skill.startsWith('kenntnis_bauplan_')
                      );

                      if (knowledge.length === 0) return null;

                      return (
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '2px' }}>
                            Wissen:
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#a78bfa',
                            display: 'flex',
                            gap: '4px',
                            flexWrap: 'wrap'
                          }}>
                            {knowledge.map((skill) => {
                              const knowledgeEmojis = {
                                'kenntnis_bauplan_erde': '🗿',
                                'kenntnis_bauplan_feuer': '🔥',
                                'kenntnis_bauplan_wasser': '💧',
                                'kenntnis_bauplan_luft': '💨'
                              };
                              return (
                                <span
                                  key={skill}
                                  style={{
                                    backgroundColor: 'rgba(167, 139, 250, 0.2)',
                                    padding: '2px 4px',
                                    borderRadius: '3px',
                                    fontSize: '0.7rem'
                                  }}
                                  title={skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                >
                                  {knowledgeEmojis[skill] || '📚'}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
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

      {/* CSS Animations for Modals */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 80px rgba(220, 38, 38, 0.6), inset 0 0 40px rgba(220, 38, 38, 0.1);
          }
          50% {
            box-shadow: 0 0 120px rgba(220, 38, 38, 0.8), inset 0 0 60px rgba(220, 38, 38, 0.2);
          }
        }
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          10% {
            transform: scale(1.1);
          }
          20% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.15);
          }
          40% {
            transform: scale(1);
          }
        }
        @keyframes pulseDarkness {
          0%, 100% {
            opacity: 0.85;
            border-color: #7f1d1d;
          }
          50% {
            opacity: 0.95;
            border-color: #991b1b;
          }
        }
        @keyframes pulseGate {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.2);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.7), inset 0 0 30px rgba(59, 130, 246, 0.3);
          }
        }
        @keyframes gateGlow {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(59, 130, 246, 1));
          }
        }
        @keyframes pulseHero {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 16px rgba(255, 255, 255, 0.6);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes victoryPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 100px rgba(234, 179, 8, 0.8), inset 0 0 60px rgba(234, 179, 8, 0.2);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 120px rgba(234, 179, 8, 1), inset 0 0 80px rgba(234, 179, 8, 0.3);
          }
        }
        @keyframes victoryFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.05);
          }
        }
        @keyframes defeatPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 100px rgba(220, 38, 38, 0.7), inset 0 0 60px rgba(220, 38, 38, 0.15);
          }
          50% {
            transform: scale(1.01);
            box-shadow: 0 0 120px rgba(220, 38, 38, 0.9), inset 0 0 80px rgba(220, 38, 38, 0.2);
          }
        }
        @keyframes defeatShake {
          0%, 100% {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(-5px) rotate(-2deg);
          }
          75% {
            transform: translateX(5px) rotate(2deg);
          }
        }
      `}</style>
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