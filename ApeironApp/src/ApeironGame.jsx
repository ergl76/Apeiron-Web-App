import React, { useState, useEffect, useRef } from 'react';
import eventsConfig from './config/events.json';
import tilesConfig from './config/tiles.json';
import gameRules from './config/gameRules.json';
import VerticalLightMeter from './components/ui/VerticalLightMeter';
import HeroAvatar from './components/ui/HeroAvatar';
import UnifiedModal from './components/ui/UnifiedModal';
import RadialActionMenu from './components/ui/RadialActionMenu';
import TowerStatusModal from './components/ui/TowerStatusModal';

// MODULE-LEVEL LOCKS: Prevent React StrictMode from executing handlers twice
// These MUST be outside the component to work across simultaneous calls
let currentlyApplyingEventId = null;
let currentlyConfirmingCardDraw = false;
let phaseTransitionInProgress = false;
let isGameActive = false; // Track if game is running (for browser navigation protection)
let obstacleRemovalHandler = null; // Handler for obstacle removal (set in component)
let darknessRemovalHandler = null; // Handler for darkness cleansing (set in component)

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
  const [showStartModal, setShowStartModal] = useState(false);

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
            onClick={() => canStartGame && setShowStartModal(true)}
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

      {/* Game Start Modal */}
      {showStartModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0f0f0f, #1a1200, #1a0f00)',
              borderRadius: '16px',
              padding: '48px',
              maxWidth: '600px',
              border: '3px solid #eab308',
              boxShadow: '0 0 80px rgba(234, 179, 8, 0.6)',
              animation: 'fadeInScale 0.4s ease-out',
              textAlign: 'center'
            }}
          >
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#eab308',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '3px'
              }}>
                APEIRON
              </div>
              <div style={{
                fontSize: '1.3rem',
                color: '#fbbf24',
                marginBottom: '4px'
              }}>
                Der Turm der Elemente
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#fbbf24',
                fontStyle: 'italic',
                opacity: 0.8
              }}>
                Eine Welt am Rande der Finsternis
              </div>
            </div>

            {/* Story Section 1 - Die Ursubstanz */}
            <div style={{
              background: 'rgba(234, 179, 8, 0.1)',
              border: '2px solid #eab308',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '0.95rem',
                color: '#fde047',
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                Apeiron – die Ursubstanz, aus der alle vier Elemente entstanden: Erde, Wasser, Feuer und Luft. Aus den Elementen erwuchsen die großen Völker: Minotauren, Sirenen, Drachen und Aviari.
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#fbbf24',
                lineHeight: '1.5'
              }}>
                Doch Krieg entbrannte. Unzählige Jahre, unzählige Opfer, unbeschreibbares Leid.
              </div>
            </div>

            {/* Story Section 2 - Die Sphäre */}
            <div style={{
              background: 'rgba(234, 179, 8, 0.1)',
              border: '2px solid #eab308',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '0.95rem',
                color: '#fde047',
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                Und auf einmal war sie da – die Sphäre der Dunkelheit. Mit jeder feindseligen Tat nährte sie sich, wurde größer und mächtiger, verdunkelte die Welt immer weiter.
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#fbbf24',
                lineHeight: '1.5'
              }}>
                Ein greller Lichtstrahl blitzte am Firmament auf, als ein Himmelskörper aus reiner Apeiron-Ursubstanz die Sphäre durchdrang. Mit mächtiger Explosion schlug er auf der Insel Elyria ein.
              </div>
            </div>

            {/* Story Section 3 - Die Hoffnung */}
            <div style={{
              background: 'rgba(234, 179, 8, 0.1)',
              border: '2px solid #eab308',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '0.95rem',
                color: '#fde047',
                lineHeight: '1.6'
              }}>
                Die Fragmente des Sterns warten auf euch – die Helden der vier Völker – um daraus den Turm der Elemente zu errichten und die Dunkelheit zu beenden.
              </div>
            </div>

            {/* Selected Heroes */}
            <div style={{
              background: 'rgba(234, 179, 8, 0.15)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '1rem',
                color: '#fde047',
                marginBottom: '12px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                Eure Helden ({playerCount})
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                {selectedCharacters.map(heroId => {
                  const hero = heroes[heroId];
                  const raceMap = {
                    'terra': '🐂 Minotaurin',
                    'lyra': '🧜‍♀️ Sirene',
                    'ignis': '🐉 Drache',
                    'corvus': '🦅 Aviari'
                  };
                  return (
                    <div key={heroId} style={{
                      background: 'rgba(234, 179, 8, 0.2)',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: `2px solid ${hero.color}`,
                      textAlign: 'center'
                    }}>
                      <div style={{
                        color: hero.color,
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        marginBottom: '4px'
                      }}>
                        {hero.name}
                      </div>
                      <div style={{
                        color: '#fbbf24',
                        fontSize: '0.85rem'
                      }}>
                        {raceMap[heroId]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Objective */}
            <div style={{
              background: 'rgba(234, 179, 8, 0.1)',
              border: '2px solid #eab308',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontWeight: 'bold',
                color: '#fde047',
                marginBottom: '12px',
                fontSize: '1rem',
                textAlign: 'center'
              }}>
                Euer Ziel
              </div>
              <div style={{ fontSize: '0.95rem', color: '#fbbf24', lineHeight: '1.8' }}>
                <div>• Baut alle 4 Fundamente auf dem Krater</div>
                <div>• Findet die 4 Element-Fragmente in Phase 2</div>
                <div>• Aktiviert alle 4 Elemente am Krater</div>
                <div>• Bevor das Licht erlischt!</div>
              </div>
            </div>

            {/* Quote */}
            <div style={{
              fontSize: '1rem',
              color: '#fbbf24',
              fontStyle: 'italic',
              marginBottom: '32px',
              textAlign: 'center',
              lineHeight: '1.6'
            }}>
              "Nur durch die Vielen kann das Eine zum Höchsten emporgehoben werden und Licht zurück in die Welt gebracht werden."
            </div>

            {/* Button */}
            <button
              onClick={() => {
                setShowStartModal(false);
                onStartGame(playerCount, difficulty, selectedCharacters);
              }}
              style={{
                background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                color: 'white',
                padding: '16px 48px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234, 179, 8, 0.4)',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(234, 179, 8, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(234, 179, 8, 0.4)';
              }}
            >
              ⭐ DIE REISE BEGINNT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Game Board Component
function GameBoard({ gameState, onTileClick, onHeroClick, boardContainerRef }) {
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

    // Check if this is the first discovery field (Smart Scouting UC1/UC2 indicator)
    const isFirstDiscoveryField = tile && position === gameState.discoveryTracking.firstDiscoveryPosition;

    const tileStyle = {
      position: 'relative',
      border: isFirstDiscoveryField ? '3px solid #3b82f6' : 'none',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      fontSize: '10px',
      lineHeight: '1.2',
      width: '70px',
      height: '70px',
      borderRadius: '4px',
      cursor: (isDiscoverable || isMovable) ? 'pointer' : 'default',
      background: isKrater ? '#78716c' :
                  tile ? getTileColor(tile.id) :
                  isDiscoverable ? '#374151' : '',
      outline: isMovable ? '3px solid #10b981' : 'none',
      outlineOffset: isMovable ? '-3px' : '0',
      transition: 'all 0.2s ease-in-out',
      boxShadow: isFirstDiscoveryField ? '0 0 8px rgba(59, 130, 246, 0.6)' : 'none'
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

        {/* Items & Obstacles Container - Side by Side */}
        {(tile?.resources?.length > 0 || tile?.obstacles?.length > 0) && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'row',
            gap: '6px',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '90%',
            zIndex: 10 // Above darkness overlay (z-index: 5)
          }}>
            {/* Obstacles (left side) */}
            {tile?.obstacles?.map((obstacle, idx) => {
              // Check if current player is ADJACENT (not on same tile)
              const currentPlayer = gameState.players[gameState.currentPlayerIndex];
              const [tileX, tileY] = position.split(',').map(Number);
              const [playerX, playerY] = currentPlayer.position.split(',').map(Number);
              const manhattanDist = Math.abs(tileX - playerX) + Math.abs(tileY - playerY);
              const isAdjacent = manhattanDist === 1;

              // Check if player has required skill and AP
              const skillMap = {
                'geroell': 'geroell_beseitigen',
                'dornenwald': 'dornen_entfernen',
                'ueberflutung': 'fluss_freimachen'
              };
              const requiredSkill = skillMap[obstacle];
              const hasSkill = currentPlayer.learnedSkills.includes(requiredSkill);
              const hasAp = currentPlayer.ap >= 1;
              const canRemove = isAdjacent && hasSkill && hasAp;

              return (
                <div
                  key={`obstacle-${idx}`}
                  onClick={(e) => {
                    if (canRemove) {
                      e.stopPropagation();
                      if (obstacleRemovalHandler) {
                        obstacleRemovalHandler(position, obstacle);
                      }
                    }
                  }}
                  style={{
                    fontSize: '22px',
                    lineHeight: '1',
                    filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))',
                    cursor: canRemove ? 'pointer' : 'default',
                    opacity: canRemove ? 1 : 0.7,
                    transition: 'transform 0.2s ease, opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (canRemove) {
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title={
                    obstacle === 'geroell' ? 'Geröll' :
                    obstacle === 'dornenwald' ? 'Dornenwald' :
                    obstacle === 'ueberflutung' ? 'Überflutung' : obstacle
                  }
                >
                  {obstacle === 'geroell' ? '🪨' : obstacle === 'dornenwald' ? '🌿' : obstacle === 'ueberflutung' ? '🌊' : '🚧'}
                </div>
              );
            })}

            {/* Items (right side) */}
            {tile?.resources?.map((resource, index) => {
              // Dynamic sizing based on total item count
              const itemCount = tile.resources.length;
              const fontSize = itemCount === 1 ? '20px' :
                              itemCount === 2 ? '16px' :
                              itemCount <= 4 ? '14px' : '12px';

              return (
                <div key={`resource-${index}`} style={{
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
            gridTemplateColumns: 'repeat(2, 22px)', // Max 2 columns (22px hero size)
            gap: '8px', // More space for pulse animation & no overlap
            zIndex: 20,
            pointerEvents: 'none' // Container blockiert keine Events - nur einzelne Heroes
          }}>
            {heroesOnTile.map(hero => {
              const isActivePlayer = gameState.currentPlayerIndex === gameState.players.indexOf(hero);
              const heroColor = heroes[hero.id].color;

              return (
                <div
                  key={hero.id}
                  style={{
                    width: '22px', // 1.83× larger (was 12px)
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: heroColor,
                    border: '2px solid white',
                    fontSize: '11px', // Larger for better readability
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
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
                    cursor: isActivePlayer ? 'pointer' : 'default',
                    pointerEvents: isActivePlayer ? 'auto' : 'none' // Explizit Click-Events erlauben
                  }}
                  title={hero.name}
                  onClick={(e) => {
                    console.log('🎯 Hero clicked!', hero.name, 'isActive:', isActivePlayer);
                    // Nur aktiver Spieler ist klickbar → Öffne Action-Menü
                    if (isActivePlayer && onHeroClick) {
                      e.stopPropagation(); // Verhindere Tile-Click
                      console.log('✅ Opening radial menu for active player:', hero.name);
                      onHeroClick(hero.id);
                    }
                  }}
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


        {/* Darkness Overlay (Phase 2) - Clickable for Heilende Reinigung */}
        {gameState.herzDerFinsternis.darkTiles?.includes(position) && (() => {
          // Check if current player is ADJACENT and has "reinigen" skill
          const currentPlayer = gameState.players[gameState.currentPlayerIndex];
          const [tileX, tileY] = position.split(',').map(Number);
          const [playerX, playerY] = currentPlayer.position.split(',').map(Number);
          const manhattanDist = Math.abs(tileX - playerX) + Math.abs(tileY - playerY);
          const isAdjacent = manhattanDist === 1;
          const hasSkill = currentPlayer.learnedSkills.includes('reinigen');
          const hasAp = currentPlayer.ap >= 1;
          const canCleanse = isAdjacent && hasSkill && hasAp;

          return (
            <div
              onClick={(e) => {
                if (canCleanse) {
                  e.stopPropagation();
                  // Call darknessRemovalHandler (module-level handler)
                  darknessRemovalHandler?.(position);
                }
              }}
              style={{
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
                cursor: canCleanse ? 'pointer' : 'default',
                opacity: canCleanse ? 1 : 0.9,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (canCleanse) {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.borderColor = '#06b6d4'; // Cyan für Heilende Reinigung
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = canCleanse ? '1' : '0.9';
                e.currentTarget.style.borderColor = '#7f1d1d';
              }}
            >
              <div style={{
                fontSize: '32px',
                filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.8))',
                opacity: 0.9,
                pointerEvents: 'none'
              }}>
                ☠️
              </div>
              {canCleanse && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  fontSize: '16px',
                  pointerEvents: 'none'
                }}>
                  💧
                </div>
              )}
            </div>
          );
        })()}

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
            zIndex: 6, // Below items (z-index: 10) so items are visible
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


  const tileSize = 70; // Fixed 70px per tile
  const gap = 2;

  // Detect mobile
  const isMobile = window.innerWidth < 768;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      paddingTop: isMobile ? '0.1rem' : '1rem',
      paddingBottom: isMobile ? '5.5rem' : '1rem',
    }}>
      <div
        ref={boardContainerRef}
        style={{
          width: isMobile ? '100%' : 'min(95vw, 95vh, 900px)',
          height: isMobile ? '100%' : 'min(95vw, 95vh, 900px)',
          maxWidth: '100%',
          maxHeight: '100%',
          backgroundColor: '#1a202c',
          borderRadius: isMobile ? '0' : '8px',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${boardSize}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${boardSize}, ${tileSize}px)`,
            gap: `${gap}px`,
            padding: '8px',
            margin: 'auto',
            width: 'fit-content',
            height: 'fit-content'
          }}
        >
          {Array.from({ length: boardSize }, (_, y) =>
            Array.from({ length: boardSize }, (_, x) =>
              renderTile(x, y)
            )
          )}
        </div>
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
  // Board container ref for auto-centering
  const boardContainerRef = useRef(null);
  // Global flag to prevent multiple simultaneous triggerRandomEvent calls
  const isTriggeringEvent = useRef(false);

  // Mobile-First: Detect mobile viewport
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Browser Navigation Protection: Prevent accidental refresh/back during active game
  useEffect(() => {
    // Mark game as active when component mounts
    isGameActive = true;

    // Desktop: Prevent refresh (F5, Ctrl+R, Cmd+R)
    const handleBeforeUnload = (e) => {
      if (isGameActive) {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
        return '';
      }
    };

    // Desktop/Mobile: Prevent browser back button
    const handlePopState = () => {
      if (isGameActive) {
        // Push current state again to prevent navigation
        window.history.pushState(null, '', window.location.href);
        console.log('🔒 Browser-Zurück blockiert - Spiel läuft');
      }
    };

    // Mobile: Prevent Pull-to-Refresh (iOS Safari, Chrome Mobile, Firefox Mobile)
    // Detects touch at top of screen and prevents downward swipe
    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e) => {
      if (!isGameActive) return;

      touchStartY = e.touches[0].pageY;
      touchStartX = e.touches[0].pageX;

      // Prevent pull-to-refresh if touch starts at top of screen
      if (window.scrollY <= 0 && touchStartY < 100) {
        console.log('📱 Touch am oberen Bildschirmrand erkannt - Pull-to-Refresh blockiert');
      }

      // Prevent swipe-back gesture if touch starts at left edge (iOS Safari)
      if (touchStartX < 30) {
        console.log('📱 Touch am linken Rand erkannt - Swipe-Back blockiert');
      }
    };

    const handleTouchMove = (e) => {
      if (!isGameActive) return;

      const touchY = e.touches[0].pageY;
      const touchX = e.touches[0].pageX;
      const deltaY = touchY - touchStartY;
      const deltaX = touchX - touchStartX;

      // Prevent pull-to-refresh: Block ONLY if:
      // 1. Touch started at TOP of screen (< 100px from top)
      // 2. Page is at scroll position 0
      // 3. Swipe is downward (deltaY > 0)
      // 4. Swipe is significant (> 10px to avoid blocking small movements)
      const isAtTopOfPage = window.scrollY <= 0;
      const touchStartedAtTop = touchStartY < 100;
      const isDownwardSwipe = deltaY > 10;

      if (isAtTopOfPage && touchStartedAtTop && isDownwardSwipe) {
        e.preventDefault();
        console.log('🔒 Pull-to-Refresh blockiert (Touch-Start: ' + touchStartY + 'px, deltaY: ' + deltaY + ')');
        return false;
      }

      // Prevent swipe-back gesture: Block rightward swipe from left edge
      if (touchStartX < 30 && deltaX > 30) {
        e.preventDefault();
        console.log('🔒 Swipe-Back-Geste blockiert (deltaX: ' + deltaX + ')');
        return false;
      }
    };

    // Mobile: Prevent scroll-bounce and overscroll on document
    const handleTouchEnd = (e) => {
      if (!isGameActive) return;

      // Reset if we're at top of page to prevent bounce-back refresh
      if (window.scrollY < 0) {
        window.scrollTo(0, 0);
      }
    };

    // Add initial history entry to intercept back button
    window.history.pushState(null, '', window.location.href);

    // Register event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Touch events must use passive: false to allow preventDefault()
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    console.log('🛡️ Browser-Schutz aktiviert (Desktop + Mobile)');
    console.log('  ✅ Refresh blockiert (F5, Ctrl+R, Cmd+R)');
    console.log('  ✅ Zurück-Button blockiert (Browser Back)');
    console.log('  ✅ Pull-to-Refresh blockiert (iOS, Chrome, Firefox Mobile)');
    console.log('  ✅ Swipe-Back-Geste blockiert (iOS Safari)');

    // Cleanup when component unmounts
    return () => {
      isGameActive = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      console.log('🛡️ Browser-Schutz deaktiviert');
    };
  }, []);

  // Hero Avatar expanded state
  const [heroAvatarExpanded, setHeroAvatarExpanded] = useState(false);

  // Radial Action Menu state
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [showTowerModal, setShowTowerModal] = useState(false);

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
      victoryModal: {
        show: false,
        stats: null
      },
      defeatModal: {
        show: false,
        stats: null
      },
      foundationSuccessModal: {
        show: false,
        foundationType: null,
        count: 0,
        lightBonus: 0
      },
      elementSuccessModal: {
        show: false,
        elementType: null,
        count: 0,
        bonus: null
      },
      foundationSelectionModal: {
        show: false
      },
      elementSelectionModal: {
        show: false
      },
      teachSkillSelectionModal: {
        show: false
      },
      isTransitioning: false,
      currentEvent: null,
      eventDeck: [...eventsConfig.phase1.positive, ...eventsConfig.phase1.negative],
      // Smart Scouting: Erste Discovery ohne AP, zweite Aktion triggert AP-Verbrauch
      discoveryTracking: {
        firstDiscoveryPosition: null,   // Position der ersten Discovery (ohne AP-Verbrauch)
        firstDiscoveryActive: false     // Ist erste Discovery aktiv (wartet auf zweite Aktion)?
      },
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
      cardDrawState: 'none', // 'none' | 'event_shown' | 'drawing' | 'result_shown'
      gameStartTime: Date.now(), // Track game start for duration calculation
      totalMoves: 0, // Track total number of moves (DEPRECATED - use totalTurns)
      totalApSpent: 0, // Track total AP spent
      // NEW: Phase-separated statistics for Victory/Defeat modals
      totalTurns: 0, // Total number of complete hero turns (Turn = all APs of one hero)
      phase1TotalTurns: 0, // Turns completed in Phase 1
      phase2TotalTurns: 0, // Turns completed in Phase 2
      phase1TotalApSpent: 0, // AP spent in Phase 1
      phase2TotalApSpent: 0, // AP spent in Phase 2
      phase1Stats: null // Snapshot of Phase 1 stats when transitioning to Phase 2
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

      const gameDurationMs = Date.now() - gameState.gameStartTime;
      const gameStats = {
        rounds: gameState.round,
        playerCount: gameState.players.length,
        phase: gameState.phase,
        activatedElements: gameState.tower.activatedElements || [],
        remainingLight: 0,
        playerNames: gameState.players.map(p => p.name),
        totalMoves: gameState.totalMoves, // DEPRECATED - use totalTurns
        totalApSpent: gameState.totalApSpent,
        durationMinutes: Math.floor(gameDurationMs / 60000),
        durationSeconds: Math.floor((gameDurationMs % 60000) / 1000),
        // NEW: Phase-separated statistics
        totalTurns: gameState.totalTurns,
        phase1: gameState.phase1Stats || {
          foundations: gameState.tower.foundations.length,
          totalTurns: gameState.phase1TotalTurns,
          totalApSpent: gameState.phase1TotalApSpent,
          roundsInPhase1: gameState.phase === 1 ? gameState.round : 0
        },
        phase2: {
          elements: (gameState.tower.activatedElements || []).length,
          totalTurns: gameState.phase2TotalTurns,
          totalApSpent: gameState.phase2TotalApSpent,
          roundsInPhase2: gameState.phase === 2 ? gameState.round - (gameState.phase1Stats?.roundsInPhase1 || 0) : 0
        }
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

  // ========================================
  // HELPER: Reset Discovery Tracking
  // ========================================
  // Wird aufgerufen wenn eine nicht-Discovery-Aktion durchgeführt wird
  // → Unterbricht Scouting-Chain
  const getResetDiscoveryTracking = () => ({
    firstDiscoveryPosition: null,
    firstDiscoveryActive: false
  });

  // ========================================
  // HELPER: Calculate AP Cost with UC2 penalty
  // ========================================
  // Wenn erste Discovery aktiv war, muss 1 AP nachträglich verbraucht werden
  const calculateApCostWithUC2Penalty = (baseApCost, discoveryTracking) => {
    const firstDiscoveryPenalty = discoveryTracking.firstDiscoveryActive ? 1 : 0;
    if (firstDiscoveryPenalty > 0) {
      console.log(`🔍 UC2: Erste Discovery wurde unterbrochen → +${firstDiscoveryPenalty} AP Penalty`);
    }
    return baseApCost + firstDiscoveryPenalty;
  };

  // Auto-center board on active player
  const centerOnActivePlayer = () => {
    if (!boardContainerRef.current) return;

    const activePlayer = gameState.players[gameState.currentPlayerIndex];
    if (!activePlayer) return;

    const [x, y] = activePlayer.position.split(',').map(Number);
    const container = boardContainerRef.current;
    const tileSize = 70;
    const gap = 2;

    // Calculate position of tile in grid
    const targetX = x * (tileSize + gap) + tileSize / 2;
    const targetY = y * (tileSize + gap) + tileSize / 2;

    // Center in viewport
    const scrollX = targetX - container.offsetWidth / 2;
    const scrollY = targetY - container.offsetHeight / 2;

    container.scrollTo({
      left: Math.max(0, scrollX),
      top: Math.max(0, scrollY),
      behavior: 'instant'
    });
  };

  // useEffect for auto-centering on player change
  useEffect(() => {
    setTimeout(() => centerOnActivePlayer(), 100);
  }, [gameState?.currentPlayerIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTileClick = (position) => {
    // Prevent actions if current player should skip turn
    if (shouldPlayerSkipTurn(gameState.players[gameState.currentPlayerIndex], gameState.round)) {
      console.log('Player cannot perform actions - must skip turn due to effect');
      return;
    }

    // Scouting mode check REMOVED - smart scouting via consecutive discovery clicks

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

    if (!tile && gameState.tileDeck.length > 0 && isAdjacentToPlayer && !isDiscoverBlocked) {
      // ========================================
      // SMART SCOUTING: Erste Discovery OHNE AP, zweite Aktion MIT AP
      // ========================================
      // UC1: Spieler mit "spaehen" skill klickt erstes Feld → KEIN AP, blaue Border
      //      Klickt zweites Feld → 1 AP für BEIDE Felder, Reset
      // UC2: Spieler mit "spaehen" skill klickt erstes Feld → KEIN AP, blaue Border
      //      Wählt andere Aktion → 1 AP für erstes Feld + normale Aktion, Reset

      const hasSpaehen = currentPlayer.learnedSkills.includes('spaehen');
      const areSkillsBlocked = currentPlayer.effects?.some(e => e.type === 'block_skills' && e.expiresInRound > gameState.round);
      const isFirstDiscovery = gameState.discoveryTracking.firstDiscoveryActive;

      // Discover new tile
      setGameState(prev => {
        // Draw tile from deck
        const newTileDeck = [...prev.tileDeck];
        const newTileId = newTileDeck.pop();
        const [x, y] = position.split(',').map(Number);

        // *** SMART SCOUTING LOGIC ***
        let apCost = 0;
        let newDiscoveryTracking;
        let newPlayers;

        if (hasSpaehen && !areSkillsBlocked && !isFirstDiscovery && currentPlayer.ap > 0) {
          // **UC1/UC2 START:** Erste Discovery - KEIN AP-Verbrauch, aktiviere Tracking
          apCost = 0;
          newPlayers = prev.players; // Keine AP-Änderung
          newDiscoveryTracking = {
            firstDiscoveryPosition: position,
            firstDiscoveryActive: true
          };
          console.log(`🔍 SCOUTING 1/2: Erstes Feld aufgedeckt (0 AP). Klicke zweites Feld oder wähle andere Aktion (${newTileId} at ${position}). Deck: ${newTileDeck.length}`);
        } else if (hasSpaehen && !areSkillsBlocked && isFirstDiscovery && currentPlayer.ap > 0) {
          // **UC1 COMPLETE:** Zweite Discovery - 1 AP für BEIDE Felder
          apCost = 1;
          newPlayers = prev.players.map((player, index) =>
            index === prev.currentPlayerIndex ? { ...player, ap: player.ap - 1 } : player
          );
          newDiscoveryTracking = getResetDiscoveryTracking();
          console.log(`🔍 SCOUTING 2/2 COMPLETE: Zweites Feld aufgedeckt (1 AP für beide) ✨ (${newTileId} at ${position}). Deck: ${newTileDeck.length}`);
        } else {
          // Normale Discovery (kein spaehen skill ODER skills blockiert)
          apCost = currentPlayer.ap > 0 ? 1 : 0;
          newPlayers = prev.players.map((player, index) =>
            index === prev.currentPlayerIndex ? { ...player, ap: Math.max(0, player.ap - apCost) } : player
          );
          newDiscoveryTracking = getResetDiscoveryTracking();
          console.log(`📝 handleTileClick DISCOVERED: ${newTileId} at ${position}. Deck: ${newTileDeck.length}. AP cost: ${apCost}`);
        }

        // Handle automatic turn transition (nur wenn AP verbraucht wurde)
        const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads, completedTurn } =
          apCost > 0 ? handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev)
                      : { nextPlayerIndex: prev.currentPlayerIndex, newRound: prev.round, actionBlockers: prev.actionBlockers,
                          lightDecrement: 0, roundCompleted: false, updatedPlayers: newPlayers, darknessSpreads: [], completedTurn: false };

        // Apply darkness spread if needed (can be multiple positions)
        const updatedDarkTiles = darknessSpreads.length > 0
          ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
          : prev.herzDerFinsternis.darkTiles || [];

        // Update turn statistics (Phase-separated)
        const newStats = apCost > 0 ? calculateStatsUpdate(prev, completedTurn, apCost) : {};

        return {
          ...prev,
          totalMoves: prev.totalMoves + 1,
          totalApSpent: prev.totalApSpent + apCost,
          ...newStats,
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
          roundCompleted: roundCompleted || false,
          discoveryTracking: newDiscoveryTracking
        };
      });
    } else if (tile && currentPlayer.ap > 0 && canMoveToPosition(currentPlayer.position, position, currentPlayer.id, gameState.players)) {
      // Prevent moving if player has 'prevent_movement' effect
      if (currentPlayer.effects?.some(e => e.type === 'prevent_movement' && e.expiresInRound > gameState.round)) {
        console.log(`Movement for ${currentPlayer.name} blocked by an effect.`);
        // Optional: Add visual feedback for the user
        return;
      }

      // Check if this is quick movement (2 fields) - requires schnell_bewegen skill
      const [fromX, fromY] = currentPlayer.position.split(',').map(Number);
      const [toX, toY] = position.split(',').map(Number);
      const manhattanDistance = Math.abs(toX - fromX) + Math.abs(toY - fromY);
      const isQuickMovement = manhattanDistance === 2;

      // BUGFIX: Block quick movement if skills are blocked (schnell_bewegen is a special skill)
      if (isQuickMovement) {
        const areSkillsBlocked = currentPlayer.effects?.some(e => e.type === 'block_skills' && e.expiresInRound > gameState.round);
        if (areSkillsBlocked) {
          console.log(`Quick movement for ${currentPlayer.name} blocked - skills are blocked!`);
          return;
        }
      }

      // Prevent moving to a tile with obstacles
      if (tile.obstacles && tile.obstacles.length > 0) {
        console.log(`Movement to ${position} blocked by obstacles: ${tile.obstacles.join(', ')}`);
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
        // **UC2:** Wenn erste Discovery aktiv war, verbrauche 1 AP nachträglich
        const firstDiscoveryPenalty = prev.discoveryTracking.firstDiscoveryActive ? 1 : 0;
        const totalApCost = 1 + firstDiscoveryPenalty;

        if (firstDiscoveryPenalty > 0) {
          console.log(`🔍 UC2: Erste Discovery wurde unterbrochen → ${firstDiscoveryPenalty} AP nachträglich verbraucht`);
        }

        const newPlayers = prev.players.map((player, index) =>
          index === prev.currentPlayerIndex
            ? { ...player, position, ap: player.ap - totalApCost }
            : player
        );

        // Handle automatic turn transition
        const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads, completedTurn } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

        // Apply darkness spread if needed (can be multiple positions)
        const updatedDarkTiles = darknessSpreads.length > 0
          ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
          : prev.herzDerFinsternis.darkTiles || [];

        // Update turn statistics (Phase-separated)
        const newStats = calculateStatsUpdate(prev, completedTurn, totalApCost);

        return {
          ...prev,
          totalMoves: prev.totalMoves + 1,
          totalApSpent: prev.totalApSpent + totalApCost,
          ...newStats,
          players: updatedPlayers || newPlayers,
          currentPlayerIndex: nextPlayerIndex,
          round: newRound,
          actionBlockers: actionBlockers,
          light: Math.max(0, prev.light - lightDecrement),
          roundCompleted: roundCompleted || false,
          herzDerFinsternis: {
            ...prev.herzDerFinsternis,
            darkTiles: updatedDarkTiles
          },
          discoveryTracking: getResetDiscoveryTracking() // Movement unterbricht Scouting (UC2)
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

      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed (can be multiple positions)
      const updatedDarkTiles = darknessSpreads.length > 0
        ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
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
        },
        discoveryTracking: getResetDiscoveryTracking() // Drop unterbricht Scouting
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

      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed (can be multiple positions)
      const updatedDarkTiles = darknessSpreads.length > 0
        ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
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
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed (can be multiple positions)
      const updatedDarkTiles = darknessSpreads.length > 0
        ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
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
        },
        discoveryTracking: getResetDiscoveryTracking() // Collect unterbricht Scouting
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

  // Helper function to calculate phase-separated statistics updates
  const calculateStatsUpdate = (prevState, completedTurn, apCost = 1) => {
    const newStats = {};

    if (completedTurn?.turnCompleted) {
      // Full turn completed
      newStats.totalTurns = prevState.totalTurns + 1;
      if (completedTurn.phase === 1) {
        newStats.phase1TotalTurns = prevState.phase1TotalTurns + 1;
        newStats.phase1TotalApSpent = prevState.phase1TotalApSpent + apCost;
      } else {
        newStats.phase2TotalTurns = prevState.phase2TotalTurns + 1;
        newStats.phase2TotalApSpent = prevState.phase2TotalApSpent + apCost;
      }
    } else {
      // Just AP spent, no turn completed
      if (prevState.phase === 1) {
        newStats.phase1TotalApSpent = prevState.phase1TotalApSpent + apCost;
      } else {
        newStats.phase2TotalApSpent = prevState.phase2TotalApSpent + apCost;
      }
    }

    return newStats;
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
        darknessSpreads: [],
        completedTurn: null
      };
    }
    let lightDecrement = 0;

    // Only transition if current player has no AP left
    if (updatedCurrentPlayer.ap <= 0) {
      // Player completed their turn - decrease light by 1
      lightDecrement = 1;

      // Track completed turn (Phase-separated)
      const completedTurn = {
        turnCompleted: true,
        phase: prevState.phase
      };

      // Phase 2: Calculate darkness spread positions (configurable count)
      const shouldSpreadDarkness = prevState.phase === 2 && prevState.herzDerFinsternis.triggered;
      const darknessSpreadCount = gameRules.phase2?.darknessSpreadPerTurn || 1;
      const darknessSpreads = [];

      if (shouldSpreadDarkness) {
        // Use same loop pattern as spread_darkness event (line 2815-2839)
        let tempState = { ...prevState };

        for (let i = 0; i < darknessSpreadCount; i++) {
          const nextPos = calculateNextDarknessPosition(tempState);

          if (nextPos) {
            darknessSpreads.push(nextPos);

            // Update tempState to include this new dark tile for next iteration
            tempState = {
              ...tempState,
              herzDerFinsternis: {
                ...tempState.herzDerFinsternis,
                darkTiles: [...(tempState.herzDerFinsternis.darkTiles || []), nextPos]
              }
            };

            console.log(`☠️ Player turn completed in Phase 2 - darkness spreads to ${nextPos} (${i+1}/${darknessSpreadCount})`);
          } else {
            console.log(`☠️ No more valid positions available for darkness spread (${i}/${darknessSpreadCount})`);
            break;
          }
        }
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
          darknessSpreads: darknessSpreads,
          completedTurn: completedTurn // NEW: Track turn completion for stats
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
              return { nextPlayerIndex: skipNextIndex, newRound: round, actionBlockers: (prevState.actionBlockers || []).filter(b => b.expiresInRound > round), roundCompleted: false, lightDecrement, updatedPlayers: players, darknessSpreads, completedTurn };
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
        return { nextPlayerIndex: nextPlayerIndex, newRound: round, actionBlockers: (prevState.actionBlockers || []).filter(b => b.expiresInRound > round), roundCompleted: false, lightDecrement, updatedPlayers: players, darknessSpreads, completedTurn };
      }
    }

    // Current player still has AP, no transition needed
    return { nextPlayerIndex: currentPlayerIndex, newRound: round, actionBlockers: (prevState.actionBlockers || []).filter(b => b.expiresInRound > round), roundCompleted: false, lightDecrement, updatedPlayers: players, darknessSpreads: [], completedTurn: null };
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

                // ✅ BUGFIX: Immutable board update to prevent duplication in React StrictMode
                const pos = player.position;
                newState.board = {
                  ...newState.board,
                  [pos]: {
                    ...newState.board[pos],
                    resources: [
                      ...(newState.board[pos]?.resources || []),
                      'kristall'
                    ]
                  }
                };

                // Remove crystal from inventory immutably
                return { ...player, inventory: player.inventory.filter((_, idx) => idx !== crystalIndex) };
              });
            } else if (effect.target === 'heroes_on_crater') {
              // IMMUTABLE UPDATE: Map over players to drop crystal from heroes on crater
              newState.players = newState.players.map(player => {
                if (player.position !== '4,4') return player;

                const crystalIndex = player.inventory.findIndex(item => item === 'kristall');
                if (crystalIndex === -1) return player;

                // ✅ BUGFIX: Immutable board update to prevent duplication in React StrictMode
                newState.board = {
                  ...newState.board,
                  '4,4': {
                    ...newState.board['4,4'],
                    resources: [
                      ...(newState.board['4,4']?.resources || []),
                      'kristall'
                    ]
                  }
                };

                // Remove crystal from inventory immutably
                return { ...player, inventory: player.inventory.filter((_, idx) => idx !== crystalIndex) };
              });
            } else if (effect.target === 'heroes_with_fragments') {
              // BUGFIX: "Verrat der Elemente" - Drop element fragments from heroes who have them
              const fragmentTypes = ['element_fragment_erde', 'element_fragment_wasser', 'element_fragment_feuer', 'element_fragment_luft'];
              const dropCount = effect.value || 1; // How many fragments to drop per hero

              // IMMUTABLE UPDATE: Map over players to drop fragments from heroes who have them
              newState.players = newState.players.map(player => {
                // Check if player has any fragments
                const playerFragments = player.inventory.filter(item => fragmentTypes.includes(item));
                if (playerFragments.length === 0) return player; // No fragments, skip

                // Drop up to 'dropCount' fragments
                const toDrop = Math.min(dropCount, playerFragments.length);
                const pos = player.position;

                // Drop fragments to current field
                let newInventory = [...player.inventory];
                let droppedFragments = [];
                let droppedCount = 0;
                for (let i = 0; i < newInventory.length && droppedCount < toDrop; i++) {
                  if (fragmentTypes.includes(newInventory[i])) {
                    droppedFragments.push(newInventory[i]);
                    newInventory.splice(i, 1); // Remove from inventory
                    i--; // Adjust index after removal
                    droppedCount++;
                  }
                }

                // ✅ BUGFIX: Immutable board update to prevent duplication in React StrictMode
                if (droppedFragments.length > 0) {
                  newState.board = {
                    ...newState.board,
                    [pos]: {
                      ...newState.board[pos],
                      resources: [
                        ...(newState.board[pos]?.resources || []),
                        ...droppedFragments
                      ]
                    }
                  };
                }

                console.log(`💔 ${player.name} dropped ${droppedCount} element fragment(s) at ${pos}`);
                return { ...player, inventory: newInventory };
              });

              resolvedTexts.push(`Verrat der Elemente: Alle Helden mit Element-Fragmenten haben eines abgelegt.`);
            }
            break;
          case 'drop_all_items':
            if (effect.target === 'random_hero' && randomHero) {
              // IMMUTABLE UPDATE: Map over players to drop all items from random hero
              newState.players = newState.players.map(player => {
                if (player.id !== randomHero.id) return player;

                const pos = player.position;
                // ✅ BUGFIX: Immutable board update to prevent duplication in React StrictMode
                newState.board = {
                  ...newState.board,
                  [pos]: {
                    ...newState.board[pos],
                    resources: [
                      ...(newState.board[pos]?.resources || []),
                      ...player.inventory
                    ]
                  }
                };

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

                // ✅ BUGFIX: Immutable board update to prevent duplication in React StrictMode
                newState.board = {
                  ...newState.board,
                  [pos]: {
                    ...newState.board[pos],
                    resources: [
                      ...(newState.board[pos]?.resources || []),
                      ...resourcesToDrop
                    ]
                  }
                };

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
                // Check 2: Tile must have revealed flag set to true OR be Tor der Weisheit
                const tile = newBoard[pos];
                const isTorDerWeisheit = tile?.id === 'tor_der_weisheit';

                if (tile && (tile.revealed === true || isTorDerWeisheit)) {
                  // Add obstacle to array (max 1 of each type)
                  const currentObstacles = tile.obstacles || [];
                  if (!currentObstacles.includes(obstacle)) {
                    newBoard[pos] = {
                      ...tile,
                      obstacles: [...currentObstacles, obstacle]
                    };
                    console.log(`🪨 Obstacle "${obstacle}" placed on ${isTorDerWeisheit ? 'Tor der Weisheit' : 'revealed tile'} at ${pos} (tile: ${tile.id})`);
                  } else {
                    console.log(`⚠️ Skipped obstacle placement at ${pos} - "${obstacle}" already exists on this tile`);
                  }
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
              if (newBoard[pos]?.obstacles?.includes(obstacleType)) {
                // Remove specific obstacle type from array
                newBoard[pos] = {
                  ...newBoard[pos],
                  obstacles: newBoard[pos].obstacles.filter(o => o !== obstacleType)
                };
              }
            });
            newState.board = newBoard;
            resolvedTexts.push(`Reinigendes Feuer: Alle ${obstacleType}-Hindernisse wurden entfernt.`);
            break;
          }
          case 'remove_all_obstacles': {
            const newBoard = { ...newState.board };
            Object.keys(newBoard).forEach(pos => {
              if (newBoard[pos]?.obstacles && newBoard[pos].obstacles.length > 0) {
                // Remove obstacles array completely
                const { obstacles, ...rest } = newBoard[pos];
                newBoard[pos] = rest;
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
            let fieldsCleansed = 0;

            if (effect.target === 'closest_to_crater') {
              // Find dark fields closest to crater and cleanse them
              const currentDarkTiles = newState.herzDerFinsternis.darkTiles || [];

              if (currentDarkTiles.length > 0) {
                const darkFieldsWithDistance = currentDarkTiles
                  .map(pos => {
                    const [x, y] = pos.split(',').map(Number);
                    const distance = Math.abs(x - 4) + Math.abs(y - 4); // Manhattan distance to crater
                    return { pos, distance };
                  })
                  .sort((a, b) => a.distance - b.distance)
                  .slice(0, cleanseCount);

                // Remove these positions from darkTiles array
                const positionsToRemove = darkFieldsWithDistance.map(f => f.pos);
                newState.herzDerFinsternis = {
                  ...newState.herzDerFinsternis,
                  darkTiles: currentDarkTiles.filter(pos => !positionsToRemove.includes(pos))
                };

                fieldsCleansed = positionsToRemove.length;
                console.log(`🔥 Reinigendes Feuer (cleanse_darkness): ${fieldsCleansed} Finsternis-Felder gereinigt (nächste zum Krater):`, positionsToRemove);
              }
            } else if (effect.target === 'all_adjacent_to_crater') {
              // Cleanse all dark fields adjacent to crater
              const adjacentToCrater = ['3,4', '5,4', '4,3', '4,5'];
              const currentDarkTiles = newState.herzDerFinsternis.darkTiles || [];

              const cleansedPositions = currentDarkTiles.filter(pos => adjacentToCrater.includes(pos));

              if (cleansedPositions.length > 0) {
                newState.herzDerFinsternis = {
                  ...newState.herzDerFinsternis,
                  darkTiles: currentDarkTiles.filter(pos => !adjacentToCrater.includes(pos))
                };

                fieldsCleansed = cleansedPositions.length;
                console.log(`🔥 Cleanse Darkness: ${fieldsCleansed} angrenzende Finsternis-Felder gereinigt:`, cleansedPositions);
              }
            }

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
      const foundationCount = Object.keys(newTower.foundations).length;
      console.log(`🏗️ Foundation built! +${lightBonus} Light bonus (${foundationCount}/4)`);

      // Handle automatic turn transition
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed (can be multiple positions)
      const updatedDarkTiles = darknessSpreads.length > 0
        ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
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
        },
        foundationSuccessModal: {
          show: true,
          foundationType: foundationType,
          count: foundationCount,
          lightBonus: lightBonus
        },
        discoveryTracking: getResetDiscoveryTracking() // Foundation building unterbricht Scouting
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

      // Create Phase 1 stats snapshot for Victory/Defeat modals
      const phase1Stats = {
        foundations: prev.tower.foundations.length, // Should be 4
        totalTurns: prev.phase1TotalTurns,
        totalApSpent: prev.phase1TotalApSpent,
        roundsInPhase1: prev.round
      };
      console.log(`📊 Phase 1 Stats Snapshot:`, phase1Stats);

      return {
        ...prev,
        phase: 2,
        tileDeck: shuffledTileDeck,  // Phase 2 deck replaces Phase 1 deck completely
        eventDeck: phase2EventDeck,
        board: updatedBoard,
        phase1Stats: phase1Stats, // Save Phase 1 snapshot
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
        // maxAp increases for everyone, but current ap only for players who haven't finished their turn yet
        finalPlayers = newPlayers.map(player => ({
          ...player,
          maxAp: player.maxAp + apBonus,
          ap: player.ap > 0 ? player.ap + apBonus : player.ap  // Only increase current AP if player has AP left
        }));
      }

      // Finsternis-Zurückdrängung (LIFO: zuletzt erfasste Felder zuerst)
      const darknessReduction = bonusConfig.darknessReduction || 0;
      let updatedDarkTilesAfterElementActivation = prev.herzDerFinsternis.darkTiles || [];

      if (darknessReduction > 0 && updatedDarkTilesAfterElementActivation.length > 0) {
        const fieldsToRemove = Math.min(darknessReduction, updatedDarkTilesAfterElementActivation.length);

        // Entferne die LETZTEN N Felder (LIFO: zuletzt hinzugefügt = zuerst entfernt)
        updatedDarkTilesAfterElementActivation = updatedDarkTilesAfterElementActivation.slice(0, -fieldsToRemove);

        console.log(`🌟 ${element.toUpperCase()}-Element aktiviert: ${fieldsToRemove} Finsternis-Felder zurückgedrängt! (${prev.herzDerFinsternis.darkTiles.length} → ${updatedDarkTilesAfterElementActivation.length})`);
      } else if (darknessReduction > 0) {
        console.log(`🌟 ${element.toUpperCase()}-Element aktiviert: Keine Finsternis vorhanden zum Zurückdrängen`);
      }

      console.log(`🔥 ${element.toUpperCase()}-Element aktiviert!`);
      console.log(`✨ Bonus: ${bonusText}`);

      // Check for VICTORY condition (4th element activated!)
      if (newTower.activatedElements.length === 4) {
        console.log('🎉 VICTORY! All 4 elements activated - Tower of Elements is complete!');

        // Calculate game statistics (Phase-separated)
        const gameDurationMs = Date.now() - prev.gameStartTime;
        const gameStats = {
          rounds: prev.round,
          playerCount: prev.players.length,
          phase: prev.phase,
          activatedElements: newTower.activatedElements,
          remainingLight: prev.light + lightBonus,
          playerNames: prev.players.map(p => p.name),
          totalMoves: prev.totalMoves, // DEPRECATED - use totalTurns
          totalApSpent: prev.totalApSpent,
          durationMinutes: Math.floor(gameDurationMs / 60000),
          durationSeconds: Math.floor((gameDurationMs % 60000) / 1000),
          // NEW: Phase-separated statistics
          totalTurns: prev.totalTurns,
          phase1: prev.phase1Stats || {
            foundations: newTower.foundations.length,
            totalTurns: prev.phase1TotalTurns,
            totalApSpent: prev.phase1TotalApSpent,
            roundsInPhase1: 0 // Fallback if phase1Stats missing
          },
          phase2: {
            elements: newTower.activatedElements.length,
            totalTurns: prev.phase2TotalTurns,
            totalApSpent: prev.phase2TotalApSpent,
            roundsInPhase2: prev.round - (prev.phase1Stats?.roundsInPhase1 || 0)
          }
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
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } =
        handleAutoTurnTransition(finalPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed (can be multiple positions)
      // WICHTIG: Kombiniere Element-Reduktion MIT automatischer Ausbreitung
      const updatedDarkTiles = darknessSpreads.length > 0
        ? [...updatedDarkTilesAfterElementActivation, ...darknessSpreads]
        : updatedDarkTilesAfterElementActivation;

      const newLight = Math.max(0, Math.min(gameRules.light.maxValue, prev.light - lightDecrement + lightBonus));
      const elementCount = newTower.activatedElements.length;

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
        },
        elementSuccessModal: {
          show: true,
          elementType: element,
          count: elementCount,
          bonus: {
            type: bonusConfig.type,
            value: bonusConfig.value,
            text: bonusText,
            darknessReduction: darknessReduction,
            fieldsRemoved: darknessReduction > 0 ? Math.min(darknessReduction, (prev.herzDerFinsternis.darkTiles || []).length) : 0
          }
        },
        discoveryTracking: getResetDiscoveryTracking() // Element activation unterbricht Scouting
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
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed (can be multiple positions)
      const updatedDarkTiles = darknessSpreads.length > 0
        ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
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

  // ========================================
  // OLD SCOUTING FUNCTIONS REMOVED
  // ========================================
  // handleScout, handleScoutingSelection, confirmScouting, cancelScouting
  // wurden entfernt - Smart Scouting via consecutive discovery clicks implementiert

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
    if (targetTile.obstacles && targetTile.obstacles.length > 0) return; // Target field has obstacles

    // Check if path is clear (both intermediate and target fields)
    const [midX, midY] = direction === 'north' ? [x, y-1] :
                        direction === 'east' ? [x+1, y] :
                        direction === 'south' ? [x, y+1] :
                        [x-1, y]; // west
    const midPosition = `${midX},${midY}`;
    const midTile = gameState.board[midPosition];
    if (!midTile || (midTile.obstacles && midTile.obstacles.length > 0)) return; // Path blocked

    // Perform the fast movement
    setGameState(prev => {
      const newPlayers = prev.players.map((player, index) =>
        index === prev.currentPlayerIndex
          ? { ...player, position: newPosition, ap: player.ap - 1 }
          : player
      );

      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed (can be multiple positions)
      const updatedDarkTiles = darknessSpreads.length > 0
        ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
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

  const handleLearnCombined = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Find ALL learnable items (blueprints + artifacts)
    const availableBlueprints = currentPlayer.inventory.filter(item => item.startsWith('bauplan_'));
    const availableArtifacts = currentPlayer.inventory.filter(item => item.startsWith('artefakt_'));
    const allLearnableItems = [...availableBlueprints, ...availableArtifacts];

    if (allLearnableItems.length === 0 || currentPlayer.ap < 1) return;

    // If multiple learnable items, show selection modal
    if (allLearnableItems.length > 1) {
      setGameState(prev => ({
        ...prev,
        currentEvent: {
          type: 'learn_item_selection',
          title: 'Item zum Lernen wählen',
          description: 'Wähle einen Bauplan oder ein Artefakt zum Lernen (1 AP):',
          availableItems: allLearnableItems,
          itemType: 'combined' // Indicates mixed selection
        }
      }));
      return;
    }

    // Only one learnable item, learn it directly
    const singleItem = allLearnableItems[0];
    if (singleItem.startsWith('bauplan_')) {
      learnSelectedItem(singleItem);
    } else if (singleItem.startsWith('artefakt_')) {
      learnSelectedArtifact(singleItem);
    }
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
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed (can be multiple positions)
      const updatedDarkTiles = darknessSpreads.length > 0
        ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
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
        },
        discoveryTracking: getResetDiscoveryTracking() // Learn unterbricht Scouting
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
      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

      // Apply darkness spread if needed (can be multiple positions)
      const updatedDarkTiles = darknessSpreads.length > 0
        ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
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

    if (isAdjacent && currentPlayer.ap > 0 && targetTile?.obstacles?.includes(obstacleType) && currentPlayer.learnedSkills.includes(requiredSkill)) {
      setGameState(prev => {
        const newBoard = { ...prev.board };
        const tileToUpdate = newBoard[obstaclePosition];

        // Remove the specific obstacle type from the obstacles array
        const updatedObstacles = tileToUpdate.obstacles.filter(o => o !== obstacleType);
        newBoard[obstaclePosition] = {
          ...tileToUpdate,
          obstacles: updatedObstacles.length > 0 ? updatedObstacles : undefined
        };
        // Clean up undefined obstacles property
        if (!newBoard[obstaclePosition].obstacles) {
          const { obstacles, ...rest } = newBoard[obstaclePosition];
          newBoard[obstaclePosition] = rest;
        }

        const newPlayers = prev.players.map((player, index) =>
          index === prev.currentPlayerIndex ? { ...player, ap: player.ap - 1 } : player
        );

        const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

        // Apply darkness spread if needed (can be multiple positions)
        const updatedDarkTiles = darknessSpreads.length > 0
          ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
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
          },
          discoveryTracking: getResetDiscoveryTracking() // Remove obstacle unterbricht Scouting
        };
      });
    }
  };

  // Set module-level handler for obstacle removal (accessible in GameBoard rendering)
  obstacleRemovalHandler = handleRemoveObstacle;

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

        const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } = handleAutoTurnTransition(newPlayers, prev.currentPlayerIndex, prev.round, prev);

        // Apply darkness spread if needed (but AFTER we removed one)
        const updatedDarkTiles = darknessSpreads.length > 0
          ? [...updatedDarkTilesAfterRemoval, ...darknessSpreads]
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
          },
          discoveryTracking: getResetDiscoveryTracking() // Heilende Reinigung unterbricht Scouting
        };
      });
    } else {
      if (!isAdjacent) console.log('❌ Not adjacent to darkness field');
      if (!isDark) console.log('❌ Target position is not dark');
      if (currentPlayer.ap <= 0) console.log('❌ No AP left');
    }
  };

  // Set module-level handler for darkness removal (accessible in GameBoard rendering)
  darknessRemovalHandler = handleHeilendeReinigung;

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
      // Special handling for 'all_players' blockers: Replace with individual blockers for non-healed players
      const newActionBlockers = [];
      (prev.actionBlockers || []).forEach(blocker => {
        if (blocker.target === 'all_players') {
          // Create individual blockers for players NOT at same position
          prev.players.forEach(player => {
            if (!affectedPlayerIds.includes(player.id)) {
              newActionBlockers.push({
                ...blocker,
                target: player.id
              });
            }
          });
        } else if (!affectedPlayerIds.includes(blocker.target)) {
          // Keep blockers for other players
          newActionBlockers.push(blocker);
        }
        // If blocker.target is in affectedPlayerIds, it's removed (not added to newActionBlockers)
      });

      // Reduce AP for current player
      const playersAfterAp = newPlayers.map((player, index) =>
        index === prev.currentPlayerIndex ? { ...player, ap: player.ap - 1 } : player
      );

      const { nextPlayerIndex, newRound, actionBlockers, lightDecrement, roundCompleted, updatedPlayers, darknessSpreads } =
        handleAutoTurnTransition(playersAfterAp, prev.currentPlayerIndex, prev.round, prev);

      const affectedNames = prev.players.filter(p => affectedPlayerIds.includes(p.id)).map(p => p.name).join(', ');
      const unaffectedNames = prev.players.filter(p => !affectedPlayerIds.includes(p.id)).map(p => p.name).join(', ');
      console.log(`💧 Heilende Reinigung: Removed negative effects + action blockers from ${affectedNames}`);
      if (unaffectedNames) {
        console.log(`   → Other heroes (${unaffectedNames}) still affected by global blockers (converted to individual)`);
      }

      // Apply darkness spread if needed (can be multiple positions)
      const updatedDarkTiles = darknessSpreads.length > 0
        ? [...(prev.herzDerFinsternis.darkTiles || []), ...darknessSpreads]
        : prev.herzDerFinsternis.darkTiles || [];

      return {
        ...prev,
        players: updatedPlayers || playersAfterAp,
        currentPlayerIndex: nextPlayerIndex,
        round: newRound,
        actionBlockers: newActionBlockers.filter(b => b.expiresInRound > newRound), // Filter expired blockers
        light: Math.max(0, prev.light - lightDecrement),
        herzDerFinsternis: {
          ...prev.herzDerFinsternis,
          darkTiles: updatedDarkTiles
        },
        discoveryTracking: getResetDiscoveryTracking() // Heilende Reinigung (Effekte) unterbricht Scouting
      };
    });
  };

  // Helper: Get adjacent obstacles
  const getAdjacentObstacles = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const adjacentObstacles = [];

    if (currentPlayer.ap > 0) {
      const [x, y] = currentPlayer.position.split(',').map(Number);
      const adjacentPositions = {
        'Norden': `${x},${y-1}`,
        'Osten': `${x+1},${y}`,
        'Süden': `${x},${y+1}`,
        'Westen': `${x-1},${y}`
      };

      const areSkillsBlocked = currentPlayer.effects?.some(e =>
        e.type === 'block_skills' && e.expiresInRound > gameState.round
      );

      for (const [direction, pos] of Object.entries(adjacentPositions)) {
        const adjacentTile = gameState.board[pos];

        if (adjacentTile?.obstacles && adjacentTile.obstacles.length > 0) {
          const skillMap = {
            'geroell': 'geroell_beseitigen',
            'dornenwald': 'dornen_entfernen',
            'ueberflutung': 'fluss_freimachen'
          };

          const uniqueObstacleTypes = [...new Set(adjacentTile.obstacles)];

          uniqueObstacleTypes.forEach(obstacleType => {
            if (currentPlayer.learnedSkills.includes(skillMap[obstacleType]) && !areSkillsBlocked) {
              adjacentObstacles.push({
                position: pos,
                type: obstacleType,
                direction: direction
              });
            }
          });
        }
      }
    }

    return adjacentObstacles;
  };

  // Helper: Get adjacent darkness
  const getAdjacentDarkness = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const adjacentDarkness = [];

    if (currentPlayer.ap > 0) {
      const [x, y] = currentPlayer.position.split(',').map(Number);
      const adjacentPositions = {
        'Norden': `${x},${y-1}`,
        'Osten': `${x+1},${y}`,
        'Süden': `${x},${y+1}`,
        'Westen': `${x-1},${y}`
      };

      const areSkillsBlocked = currentPlayer.effects?.some(e =>
        e.type === 'block_skills' && e.expiresInRound > gameState.round
      );

      for (const [direction, pos] of Object.entries(adjacentPositions)) {
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

    return adjacentDarkness;
  };

  // Helper: Get heroes with negative effects on same tile
  const getHeroesWithNegativeEffects = () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const heroesWithNegativeEffects = [];

    const areSkillsBlocked = currentPlayer.effects?.some(e =>
      e.type === 'block_skills' && e.expiresInRound > gameState.round
    );

    if (currentPlayer.learnedSkills.includes('reinigen') && !areSkillsBlocked && currentPlayer.ap > 0) {
      gameState.players.forEach(player => {
        if (player.position === currentPlayer.position) {
          const hasNegativeEffects = player.effects?.some(e =>
            ['skip_turn', 'reduce_ap', 'set_ap', 'prevent_movement', 'block_skills'].includes(e.type) &&
            e.expiresInRound > gameState.round
          );

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

    return heroesWithNegativeEffects;
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
        roundCompleted: roundCompleted || false, // Make sure to pass the flag
        discoveryTracking: getResetDiscoveryTracking() // End turn unterbricht Scouting
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

      {/* Card Draw Modal - only show when in 'drawing' or 'result_shown' state */}
      {gameState.cardDrawQueue && gameState.cardDrawQueue.length > 0 && (gameState.cardDrawState === 'drawing' || gameState.cardDrawState === 'result_shown') && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          backdropFilter: 'blur(12px)',
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
                            // BUGFIX: Capture purpose BEFORE applying effect (for Tor/Herz placement)
                            const currentPurpose = prev.cardDrawQueue[0]?.purpose;

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

                              // BUGFIX: Only clear drawnCards for EVENT purposes, not for Tor/Herz special placements
                              // Events need cleared drawnCards, but Tor/Herz useEffect needs direction card preserved
                              const shouldClearDrawnCards = currentPurpose !== 'tor_der_weisheit' &&
                                                             currentPurpose !== 'herz_der_finsternis';

                              console.log(`🎴 drawnCards ${shouldClearDrawnCards ? 'CLEARED' : 'KEPT'} (purpose: ${currentPurpose || 'event'})`);

                              // Return state with effect applied AND modal closed
                              return {
                                ...stateAfterEffect,
                                cardDrawQueue: newQueue,
                                cardDrawState: 'none',
                                drawnCards: shouldClearDrawnCards ? {} : prev.drawnCards, // ✅ Keep for Tor/Herz!
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
                              {i === 3 && (
                                isDirection ? '🎴' : (
                                  // Hero Card: 4 Element-Symbole im 2×2 Grid (EXAKT wie HeroAvatar.jsx)
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '12px',
                                    fontSize: '2.5rem'
                                  }}>
                                    <div>🌿</div> {/* Terra/Erde */}
                                    <div>🔥</div> {/* Ignis/Feuer */}
                                    <div>💧</div> {/* Lyra/Wasser */}
                                    <div>🦅</div> {/* Corvus/Luft */}
                                  </div>
                                )
                              )}
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
          backgroundColor: 'transparent',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: gameState.currentEvent.type === 'negative'
              ? 'linear-gradient(135deg, #450a0a, #7f1d1d)' // Dezentes Dunkelrot
              : 'linear-gradient(135deg, #064e3b, #065f46)', // Dezentes Waldgrün
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            maxHeight: '90vh', // Mobile Fix!
            overflowY: 'auto', // Mobile Fix!
            width: '90%',
            boxShadow: `0 0 20px ${gameState.currentEvent.type === 'negative' ? 'rgba(220, 38, 38, 0.25)' : 'rgba(5, 150, 105, 0.25)'}`, // Subtiler Glow
            border: gameState.currentEvent.type === 'negative'
              ? '2px solid #dc2626' : '2px solid #059669'
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
                color: gameState.currentEvent.type === 'negative' ? '#fecaca' : '#d1fae5',
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
                      if (gameState.currentEvent.itemType === 'blueprint' || item.startsWith('bauplan_')) {
                        learnSelectedItem(item);
                      } else if (gameState.currentEvent.itemType === 'artifact' || item.startsWith('artefakt_')) {
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

      {/* Foundation Selection Modal */}
      {gameState.foundationSelectionModal.show && (() => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];

        // Get available blueprints
        const blueprintMapping = {
          'kenntnis_bauplan_erde': { element: 'erde', name: 'Erde', emoji: '🟫', color: '#22c55e' },
          'kenntnis_bauplan_wasser': { element: 'wasser', name: 'Wasser', emoji: '🟦', color: '#3b82f6' },
          'kenntnis_bauplan_feuer': { element: 'feuer', name: 'Feuer', emoji: '🟥', color: '#ef4444' },
          'kenntnis_bauplan_luft': { element: 'luft', name: 'Luft', emoji: '🟪', color: '#a78bfa' }
        };

        const availableBlueprints = currentPlayer.learnedSkills
          .filter(skill => skill.startsWith('kenntnis_bauplan_'))
          .map(skill => ({
            skill,
            ...blueprintMapping[skill],
            built: gameState.tower.foundations.includes(blueprintMapping[skill].element)
          }));

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000
            }}
            onClick={() => setGameState(prev => ({ ...prev, foundationSelectionModal: { show: false } }))}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1e293b, #334155)',
                border: '3px solid #ca8a04',
                borderRadius: '16px',
                maxWidth: '500px',
                width: '90%',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(202, 138, 4, 0.4)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  🏗️
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  FUNDAMENT BAUEN
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#9ca3af',
                  marginTop: '0.5rem'
                }}>
                  Wähle ein Element-Fundament (2 Kristalle + 1 AP)
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {availableBlueprints.map(foundation => (
                  <button
                    key={foundation.element}
                    onClick={() => {
                      if (!foundation.built) {
                        handleBuildFoundation(foundation.element);
                        setGameState(prev => ({ ...prev, foundationSelectionModal: { show: false } }));
                      }
                    }}
                    disabled={foundation.built}
                    style={{
                      backgroundColor: foundation.built ? '#4b5563' : foundation.color,
                      border: `2px solid ${foundation.built ? '#6b7280' : foundation.color}`,
                      color: 'white',
                      padding: '1rem',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: foundation.built ? 'not-allowed' : 'pointer',
                      opacity: foundation.built ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!foundation.built) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = `0 0 20px ${foundation.color}80`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{foundation.emoji}</span>
                    <span>{foundation.name}-Fundament</span>
                    {foundation.built && <span>✅</span>}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setGameState(prev => ({ ...prev, foundationSelectionModal: { show: false } }))}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#374151',
                  border: '2px solid #4b5563',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        );
      })()}

      {/* Element Selection Modal */}
      {gameState.elementSelectionModal.show && (() => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];

        const elements = [
          {
            type: 'element_fragment_erde',
            element: 'erde',
            name: 'Erde',
            emoji: '🟫',
            color: '#22c55e',
            hasFragment: currentPlayer.inventory.includes('element_fragment_erde'),
            activated: gameState.tower?.activatedElements?.includes('erde'),
            bonusText: gameRules?.elementActivation?.bonuses?.erde?.type === 'permanent_ap'
              ? `+${gameRules.elementActivation.bonuses.erde.value} AP`
              : `+${gameRules.elementActivation.bonuses.erde.value} 💡`
          },
          {
            type: 'element_fragment_wasser',
            element: 'wasser',
            name: 'Wasser',
            emoji: '🟦',
            color: '#3b82f6',
            hasFragment: currentPlayer.inventory.includes('element_fragment_wasser'),
            activated: gameState.tower?.activatedElements?.includes('wasser'),
            bonusText: gameRules?.elementActivation?.bonuses?.wasser?.type === 'permanent_ap'
              ? `+${gameRules.elementActivation.bonuses.wasser.value} AP`
              : `+${gameRules.elementActivation.bonuses.wasser.value} 💡`
          },
          {
            type: 'element_fragment_feuer',
            element: 'feuer',
            name: 'Feuer',
            emoji: '🟥',
            color: '#ef4444',
            hasFragment: currentPlayer.inventory.includes('element_fragment_feuer'),
            activated: gameState.tower?.activatedElements?.includes('feuer'),
            bonusText: gameRules?.elementActivation?.bonuses?.feuer?.type === 'permanent_ap'
              ? `+${gameRules.elementActivation.bonuses.feuer.value} AP`
              : `+${gameRules.elementActivation.bonuses.feuer.value} 💡`
          },
          {
            type: 'element_fragment_luft',
            element: 'luft',
            name: 'Luft',
            emoji: '🟪',
            color: '#a78bfa',
            hasFragment: currentPlayer.inventory.includes('element_fragment_luft'),
            activated: gameState.tower?.activatedElements?.includes('luft'),
            bonusText: gameRules?.elementActivation?.bonuses?.luft?.type === 'permanent_ap'
              ? `+${gameRules.elementActivation.bonuses.luft.value} AP`
              : `+${gameRules.elementActivation.bonuses.luft.value} 💡`
          }
        ];

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000
            }}
            onClick={() => setGameState(prev => ({ ...prev, elementSelectionModal: { show: false } }))}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1e293b, #334155)',
                border: '3px solid #ef4444',
                borderRadius: '16px',
                maxWidth: '500px',
                width: '90%',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(239, 68, 68, 0.4)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  🔥
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  ELEMENT AKTIVIEREN
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#9ca3af',
                  marginTop: '0.5rem'
                }}>
                  Wähle ein Element-Fragment (1 Kristall + 1 Fragment + 1 AP)
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem'
              }}>
                {elements.map(element => {
                  const canActivate = element.hasFragment && !element.activated;

                  return (
                    <button
                      key={element.element}
                      onClick={() => {
                        if (canActivate) {
                          handleActivateElement(element.type);
                          setGameState(prev => ({ ...prev, elementSelectionModal: { show: false } }));
                        }
                      }}
                      disabled={!canActivate}
                      style={{
                        backgroundColor: element.activated ? '#4b5563' : !element.hasFragment ? '#6b7280' : element.color,
                        border: `2px solid ${element.color}`,
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: canActivate ? 'pointer' : 'not-allowed',
                        opacity: canActivate ? 1 : 0.5,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        if (canActivate) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = `0 0 20px ${element.color}80`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ fontSize: '2rem' }}>{element.emoji}</div>
                      <div>{element.name}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                        {element.activated ? '✅ Aktiviert' : element.bonusText}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setGameState(prev => ({ ...prev, elementSelectionModal: { show: false } }))}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#374151',
                  border: '2px solid #4b5563',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        );
      })()}

      {/* Teach Skill Selection Modal */}
      {gameState.teachSkillSelectionModal.show && (() => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];

        // Get innate skills for current player's element
        const innateSkills = {
          earth: [
            { skill: 'grundstein_legen', name: 'Grundstein legen', emoji: '🧱' },
            { skill: 'geroell_beseitigen', name: 'Geröll beseitigen', emoji: '⛏️' }
          ],
          fire: [
            { skill: 'element_aktivieren', name: 'Element aktivieren', emoji: '🔥' },
            { skill: 'dornen_entfernen', name: 'Dornenwald entfernen', emoji: '🌿' }
          ],
          water: [
            { skill: 'reinigen', name: 'Heilende Reinigung', emoji: '💧' },
            { skill: 'fluss_freimachen', name: 'Überflutung trockenlegen', emoji: '🌊' }
          ],
          air: [
            { skill: 'spaehen', name: 'Spähen', emoji: '👁️' },
            { skill: 'schnell_bewegen', name: 'Schnell bewegen', emoji: '💨' }
          ]
        };

        const availableSkills = innateSkills[currentPlayer.element] || [];

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000
            }}
            onClick={() => setGameState(prev => ({ ...prev, teachSkillSelectionModal: { show: false } }))}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1e293b, #334155)',
                border: '3px solid #10b981',
                borderRadius: '16px',
                maxWidth: '500px',
                width: '90%',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  🎓
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  FÄHIGKEIT LEHREN
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#9ca3af',
                  marginTop: '0.5rem'
                }}>
                  Wähle eine Fähigkeit zum Lehren (1 AP)
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {availableSkills.map(({ skill, name, emoji }) => (
                  <button
                    key={skill}
                    onClick={() => {
                      handleMasterLehren(skill);
                      setGameState(prev => ({ ...prev, teachSkillSelectionModal: { show: false } }));
                    }}
                    style={{
                      backgroundColor: '#10b981',
                      border: '2px solid #10b981',
                      color: 'white',
                      padding: '1rem',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                    <span>{name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setGameState(prev => ({ ...prev, teachSkillSelectionModal: { show: false } }))}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#374151',
                  border: '2px solid #4b5563',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        );
      })()}

      {/* Phase 2 Transition Modal */}
      {gameState.phaseTransitionModal.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            backdropFilter: 'blur(12px)',
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

      {/* Foundation Success Modal (Phase 1 - Fundamente 1-3) */}
      {gameState.foundationSuccessModal.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0f0f0f, #1a1200, #1a0f00)',
              borderRadius: '16px',
              padding: window.innerWidth < 640 ? '32px 24px' : '48px',
              maxWidth: '600px',
              maxHeight: '90vh', // Mobile Fix!
              overflowY: 'auto', // Mobile Fix!
              width: 'calc(100% - 32px)', // Mobile safe area
              border: '3px solid #eab308',
              boxShadow: '0 0 80px rgba(234, 179, 8, 0.6)',
              animation: 'fadeInScale 0.4s ease-out',
              textAlign: 'center'
            }}
          >
            {/* Icon with pulsing animation */}
            <div style={{
              fontSize: '4rem',
              marginBottom: '24px',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              🏗️ {gameState.foundationSuccessModal.foundationType === 'erde' ? '🟫' :
                   gameState.foundationSuccessModal.foundationType === 'wasser' ? '🟦' :
                   gameState.foundationSuccessModal.foundationType === 'feuer' ? '🟥' : '🟪'}
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#eab308',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              FUNDAMENT ERRICHTET!
            </h2>

            {/* Subtitle */}
            <div style={{
              fontSize: '1.2rem',
              color: '#fbbf24',
              marginBottom: '24px'
            }}>
              {gameState.foundationSuccessModal.foundationType === 'erde' ? 'Erde' :
               gameState.foundationSuccessModal.foundationType === 'wasser' ? 'Wasser' :
               gameState.foundationSuccessModal.foundationType === 'feuer' ? 'Feuer' : 'Luft'}-Fundament steht fest
            </div>

            {/* Progress */}
            <div style={{
              fontSize: '1rem',
              color: '#d1d5db',
              marginBottom: '24px'
            }}>
              Fundament <strong style={{ color: '#eab308' }}>{gameState.foundationSuccessModal.count}/4</strong> gebaut
            </div>

            {/* Light Bonus */}
            <div style={{
              background: 'rgba(234, 179, 8, 0.1)',
              border: '2px solid #eab308',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>💡</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#eab308' }}>
                +{gameState.foundationSuccessModal.lightBonus} LICHT
              </div>
            </div>

            {/* Motivational Text */}
            <div style={{
              fontSize: '1rem',
              color: '#9ca3af',
              fontStyle: 'italic',
              marginBottom: '32px'
            }}>
              {['Das Fundament des Turms wächst! Die Hoffnung steigt.',
                'Stein auf Stein erhebt sich das Licht über die Finsternis.',
                'Ein weiterer Schritt zur Rettung von Apeiron!',
                'Die Elemente beginnen, ihre Macht zu zeigen.'][gameState.foundationSuccessModal.count - 1]}
            </div>

            {/* Button */}
            <button
              onClick={() => {
                setGameState(prev => ({
                  ...prev,
                  foundationSuccessModal: { show: false, foundationType: null, count: 0, lightBonus: 0 }
                }));
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '16px 48px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
            >
              ✅ WEITER
            </button>
          </div>
        </div>
      )}

      {/* Element Success Modal (Phase 2 - Elemente 1-3) */}
      {gameState.elementSuccessModal.show && (() => {
        const elementType = gameState.elementSuccessModal.elementType;
        const elementInfo = {
          'erde': { name: 'Erde', emoji: '🟫', color: '#22c55e', text: 'Die Kraft der Erde stärkt euch! Fester Stand, unerschütterlich.' },
          'wasser': { name: 'Wasser', emoji: '🟦', color: '#3b82f6', text: 'Die Quelle des Lebens leuchtet hell! Heilung und Hoffnung.' },
          'feuer': { name: 'Feuer', emoji: '🟥', color: '#ef4444', text: 'Die Flammen der Entschlossenheit brennen! Nichts kann euch aufhalten.' },
          'luft': { name: 'Luft', emoji: '🟪', color: '#a78bfa', text: 'Der Wind des Wandels trägt euch! Schneller und wendiger.' }
        };
        const element = elementInfo[elementType];

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(8px)'
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, #0f0f0f, rgba(${element?.color === '#22c55e' ? '34, 197, 94' : element?.color === '#3b82f6' ? '59, 130, 246' : element?.color === '#ef4444' ? '239, 68, 68' : '167, 139, 250'}, 0.1), #0f0f0f)`,
                borderRadius: '16px',
                padding: window.innerWidth < 640 ? '32px 24px' : '48px',
                maxWidth: '650px',
                maxHeight: '90vh', // Mobile Fix!
                overflowY: 'auto', // Mobile Fix!
                width: 'calc(100% - 32px)', // Mobile safe area
                border: `3px solid ${element?.color || '#eab308'}`,
                boxShadow: `0 0 80px ${element?.color || '#eab308'}66`,
                animation: 'fadeInScale 0.4s ease-out',
                textAlign: 'center'
              }}
            >
              {/* Icon with pulsing animation */}
              <div style={{
                fontSize: '5rem',
                marginBottom: '24px',
                animation: 'pulse 2s ease-in-out infinite',
                filter: `drop-shadow(0 0 20px ${element?.color || '#eab308'})`
              }}>
                ✨ {element?.emoji}
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: '2.2rem',
                fontWeight: 'bold',
                color: element?.color || '#eab308',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: `0 0 20px ${element?.color || '#eab308'}66`
              }}>
                {element?.name}-ELEMENT AKTIVIERT!
              </h2>

              {/* Subtitle */}
              <div style={{
                fontSize: '1.2rem',
                color: '#d1d5db',
                marginBottom: '24px',
                fontStyle: 'italic'
              }}>
                Die Macht von {element?.name} durchströmt den Turm
              </div>

              {/* Progress */}
              <div style={{
                fontSize: '1rem',
                color: '#9ca3af',
                marginBottom: '24px'
              }}>
                Element <strong style={{ color: element?.color }}>{gameState.elementSuccessModal.count}/4</strong> aktiviert
              </div>

              {/* Bonus Box */}
              <div style={{
                background: `rgba(${element?.color === '#22c55e' ? '34, 197, 94' : element?.color === '#3b82f6' ? '59, 130, 246' : element?.color === '#ef4444' ? '239, 68, 68' : '167, 139, 250'}, 0.15)`,
                border: `2px solid ${element?.color}`,
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
                  {gameState.elementSuccessModal.bonus?.type === 'light' ? '💡' : '⚡'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: element?.color }}>
                  {gameState.elementSuccessModal.bonus?.text}
                </div>

                {/* Finsternis-Zurückdrängung */}
                {gameState.elementSuccessModal.bonus?.fieldsRemoved > 0 && (
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: `1px solid ${element?.color}44`,
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '1.8rem' }}>☀️</span>
                    <span>
                      {gameState.elementSuccessModal.bonus.fieldsRemoved} Finsternis-Feld{gameState.elementSuccessModal.bonus.fieldsRemoved > 1 ? 'er' : ''} zurückgedrängt!
                    </span>
                  </div>
                )}
              </div>

              {/* Motivational Text */}
              <div style={{
                fontSize: '1.1rem',
                color: '#d1d5db',
                fontStyle: 'italic',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                {element?.text}
              </div>

              {/* Button */}
              <button
                onClick={() => {
                  setGameState(prev => ({
                    ...prev,
                    elementSuccessModal: { show: false, elementType: null, count: 0, bonus: null }
                  }));
                }}
                style={{
                  background: `linear-gradient(135deg, ${element?.color}, ${element?.color}dd)`,
                  color: 'white',
                  padding: '16px 48px',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${element?.color}66`,
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 6px 16px ${element?.color}99`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 4px 12px ${element?.color}66`;
                }}
              >
                ⚔️ WEITER ZUM KAMPF
              </button>
            </div>
          </div>
        );
      })()}

      {/* Tor der Weisheit Modal */}
      {gameState.torDerWeisheitModal.show && (
        <UnifiedModal
          type="torDerWeisheit"
          show={true}
          title="DAS TOR DER WEISHEIT ERSCHEINT"
          icon="⛩️"
        >
          {/* Position/Direction Info - Different states based on awaitingCardDraw */}
          {gameState.torDerWeisheitModal.awaitingCardDraw ? (
            // STATE 1: Awaiting card draw - explain what will happen
            <div style={{
              background: 'rgba(209, 213, 219, 0.2)',
              border: '2px solid #9ca3af',
              borderRadius: '8px',
              padding: '1.25rem',
              margin: '1.5rem 0',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1rem',
                color: '#1f2937',
                lineHeight: '1.7',
                marginBottom: '0.75rem'
              }}>
                Das Tor materialisiert sich an einem freien Feld neben dem Krater.
              </div>
              <div style={{
                fontSize: '1rem',
                color: '#374151',
                fontWeight: 'bold',
                lineHeight: '1.7'
              }}>
                🎴 Ziehe eine Himmelsrichtungskarte, um zu bestimmen, in welcher Richtung das Tor erscheinen soll.
              </div>
            </div>
          ) : gameState.torDerWeisheitModal.chosenDirection ? (
            // STATE 2: Card drawn - show direction-based placement
            <div style={{
              background: 'rgba(209, 213, 219, 0.2)',
              border: '2px solid #9ca3af',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1.5rem 0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '0.75rem' }}>
                ⛩️ Das Tor der Weisheit erscheint
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#1f2937',
                lineHeight: '1.6'
              }}>
                am ersten freien Platz vom Krater aus in Richtung <strong style={{
                  fontSize: '1.4rem',
                  color: '#111827',
                  letterSpacing: '0.05em'
                }}>{directionNames[gameState.torDerWeisheitModal.chosenDirection]}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.75rem' }}>
                (Ein Ort des Lichts und der Transformation)
              </div>
            </div>
          ) : null}

          {/* Description */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              fontSize: '1rem',
              color: '#1f2937',
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}>
              Als das Licht zu schwinden drohte, öffnete sich ein Portal zwischen den Welten.
              Das <strong>Tor der Weisheit</strong> - ein uraltes Artefakt der Götter - gewährt denjenigen,
              die es durchschreiten, die Erleuchtung der Meisterschaft.
            </div>

            {/* Benefits */}
            <div style={{
              background: 'rgba(209, 213, 219, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <div style={{
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '0.75rem',
                fontSize: '1.1rem'
              }}>
                ✨ Was euch erwartet:
              </div>

              <div style={{ fontSize: '0.95rem', color: '#1f2937', lineHeight: '1.8' }}>
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
            color: '#6b7280',
            fontSize: '0.95rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(107, 114, 128, 0.1)',
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
                minHeight: '44px',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#1f2937',
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                border: '2px solid #9ca3af',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(156, 163, 175, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(156, 163, 175, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(156, 163, 175, 0.3)';
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
                minHeight: '44px',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#1f2937',
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                border: '2px solid #9ca3af',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(156, 163, 175, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(156, 163, 175, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(156, 163, 175, 0.3)';
              }}
            >
              ⛩️ VERSTANDEN - WEITER SPIELEN
            </button>
          )}
        </UnifiedModal>
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10002,
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #064e3b, #065f46, #047857)',
              borderRadius: '16px',
              padding: window.innerWidth < 640 ? '32px 24px' : '48px',
              maxWidth: '600px',
              maxHeight: '90vh', // Mobile Fix!
              overflowY: 'auto', // Mobile Fix!
              width: 'calc(100% - 32px)', // Mobile safe area
              border: '3px solid #10b981',
              boxShadow: '0 0 80px rgba(16, 185, 129, 0.6)',
              animation: 'fadeInScale 0.4s ease-out',
              textAlign: 'center'
            }}
          >
            {/* Icon with pulsing animation */}
            <div style={{
              fontSize: '5rem',
              marginBottom: '24px',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              ⭐🏛️⭐
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#10b981',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              DER TURM IST VOLLENDET
            </h2>

            {/* Subtitle */}
            <div style={{
              fontSize: '1.3rem',
              color: '#6ee7b7',
              marginBottom: '32px'
            }}>
              Die vier Elemente erstrahlen in Einheit
            </div>

            {/* Story */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              textAlign: 'left'
            }}>
              <div style={{
                fontSize: '1rem',
                color: '#d1fae5',
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                In glorreicher Vollendung erhebt sich der Turm der Elemente. Die Macht der Apeiron-Ursubstanz durchströmt seine Fundamente.
              </div>
              <div style={{
                fontSize: '0.95rem',
                color: '#a7f3d0',
                lineHeight: '1.5',
                marginBottom: '12px'
              }}>
                Minotauren, Sirenen, Drachen und Aviari – einst getrennt durch Krieg und Missgunst – haben das Unmögliche vollbracht. Durch Zusammenarbeit wurde aus den Vielen wieder das Eine.
              </div>
              <div style={{
                fontSize: '0.95rem',
                color: '#a7f3d0',
                lineHeight: '1.5'
              }}>
                Die Sphäre der Dunkelheit weicht zurück. Das Licht kehrt nach Elyria zurück. Der Frieden ist wiederhergestellt.
              </div>
            </div>

            {/* Statistics - Phase-separated */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              {/* Phase-separated Stats Grid - Responsive! */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', // Mobile: 1 column
                gap: '24px',
                marginBottom: '20px'
              }}>
                {/* Phase 1 Stats */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#10b981',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    🏗️ Phase 1: Fundamentbau
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#a7f3d0', marginBottom: '4px' }}>
                    Fundamente: <span style={{ fontWeight: 'bold', color: '#d1fae5' }}>{gameState.victoryModal.stats.phase1.foundations} / 4</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#a7f3d0', marginBottom: '4px' }}>
                    🎯 Spielzüge: <span style={{ fontWeight: 'bold', color: '#d1fae5' }}>{gameState.victoryModal.stats.phase1.totalTurns}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>
                    ⚡ AP Verbraucht: <span style={{ fontWeight: 'bold', color: '#d1fae5' }}>{gameState.victoryModal.stats.phase1.totalApSpent}</span>
                  </div>
                </div>

                {/* Phase 2 Stats */}
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#10b981',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    🔥 Phase 2: Elemente
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#a7f3d0', marginBottom: '4px' }}>
                    Elemente: <span style={{ fontWeight: 'bold', color: '#d1fae5' }}>{gameState.victoryModal.stats.phase2.elements} / 4</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#a7f3d0', marginBottom: '4px' }}>
                    🎯 Spielzüge: <span style={{ fontWeight: 'bold', color: '#d1fae5' }}>{gameState.victoryModal.stats.phase2.totalTurns}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>
                    ⚡ AP Verbraucht: <span style={{ fontWeight: 'bold', color: '#d1fae5' }}>{gameState.victoryModal.stats.phase2.totalApSpent}</span>
                  </div>
                </div>
              </div>

              {/* Overall Stats - Responsive! */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 640 ? '1fr' : 'repeat(4, 1fr)', // Mobile: 1 column
                gap: '12px',
                paddingTop: '16px',
                borderTop: '2px solid rgba(16, 185, 129, 0.3)',
                marginBottom: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#a7f3d0', fontSize: '0.75rem', marginBottom: '4px' }}>⏱️ Runden</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {gameState.victoryModal.stats.rounds}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#a7f3d0', fontSize: '0.75rem', marginBottom: '4px' }}>🎯 Spielzüge</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {gameState.victoryModal.stats.totalTurns}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#a7f3d0', fontSize: '0.75rem', marginBottom: '4px' }}>⚡ AP Gesamt</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {gameState.victoryModal.stats.totalApSpent}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#a7f3d0', fontSize: '0.75rem', marginBottom: '4px' }}>🕐 Dauer</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {gameState.victoryModal.stats.durationMinutes}:{String(gameState.victoryModal.stats.durationSeconds).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Player Info */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#a7f3d0', fontSize: '0.85rem', marginBottom: '4px' }}>Die Helden von Elyria</div>
                    <div style={{ color: '#d1fae5', fontSize: '1rem', fontWeight: 'bold' }}>
                      {gameState.victoryModal.stats.playerNames.join(', ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#a7f3d0', fontSize: '0.85rem', marginBottom: '4px' }}>👥 Helden</div>
                    <div style={{ color: '#d1fae5', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {gameState.victoryModal.stats.playerCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div style={{
              fontStyle: 'italic',
              textAlign: 'center',
              color: '#a7f3d0',
              fontSize: '1rem',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              "Durch die Vielen wurde das Eine zum Höchsten emporgehoben. Das Licht hat über die Finsternis triumphiert."
            </div>

            {/* Button */}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: 'white',
                padding: '16px 48px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
            >
              🎮 NEUES SPIEL
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10002,
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #0f0f0f, #1a0000, #000000)',
              borderRadius: '16px',
              padding: window.innerWidth < 640 ? '32px 24px' : '48px',
              maxWidth: '600px',
              maxHeight: '90vh', // Mobile Fix!
              overflowY: 'auto', // Mobile Fix!
              width: 'calc(100% - 32px)', // Mobile safe area
              border: '3px solid #dc2626',
              boxShadow: '0 0 80px rgba(220, 38, 38, 0.6)',
              animation: 'fadeInScale 0.4s ease-out',
              textAlign: 'center'
            }}
          >
            {/* Icon with pulsing animation */}
            <div style={{
              fontSize: '5rem',
              marginBottom: '24px',
              animation: 'heartbeat 1.5s ease-in-out infinite'
            }}>
              🌑⚫🌑
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              DIE FINSTERNIS TRIUMPHIERT
            </h2>

            {/* Subtitle */}
            <div style={{
              fontSize: '1.3rem',
              color: '#fca5a5',
              marginBottom: '32px'
            }}>
              Das Licht ist für immer erloschen
            </div>

            {/* Story */}
            <div style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '2px solid #dc2626',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              textAlign: 'left'
            }}>
              <div style={{
                fontSize: '1rem',
                color: '#fecaca',
                lineHeight: '1.6',
                marginBottom: '12px'
              }}>
                Das Licht konnte nicht bewahrt werden. Der Licht-Marker ist auf Null gefallen.
              </div>
              <div style={{
                fontSize: '0.95rem',
                color: '#fca5a5',
                lineHeight: '1.5',
                marginBottom: '12px'
              }}>
                Die Sphäre der Dunkelheit hat gesiegt. Ewige Nacht senkt sich über Elyria. Immerwährende Hoffnungslosigkeit legt sich über die Welt. Der Turm bleibt unvollendet – ein Monument des Scheiterns.
              </div>
              <div style={{
                fontSize: '0.95rem',
                color: '#fca5a5',
                lineHeight: '1.5'
              }}>
                Die vier Völker – Minotauren, Sirenen, Drachen und Aviari – konnten ihre Unterschiede nicht überwinden. Die Vielen haben das Eine nicht erreicht.
              </div>
            </div>

            {/* Statistics - Phase-separated */}
            <div style={{
              background: 'rgba(220, 38, 38, 0.15)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              {/* Phase-separated Stats Grid - Responsive! */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', // Mobile: 1 column
                gap: '24px',
                marginBottom: '20px'
              }}>
                {/* Phase 1 Stats */}
                <div style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#dc2626',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    🏗️ Phase 1: Fundamentbau
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '4px' }}>
                    Fundamente: <span style={{ fontWeight: 'bold', color: '#fecaca' }}>{gameState.defeatModal.stats.phase1.foundations} / 4</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '4px' }}>
                    🎯 Spielzüge: <span style={{ fontWeight: 'bold', color: '#fecaca' }}>{gameState.defeatModal.stats.phase1.totalTurns}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                    ⚡ AP Verbraucht: <span style={{ fontWeight: 'bold', color: '#fecaca' }}>{gameState.defeatModal.stats.phase1.totalApSpent}</span>
                  </div>
                </div>

                {/* Phase 2 Stats */}
                <div style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid rgba(220, 38, 38, 0.3)'
                }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#dc2626',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    🔥 Phase 2: Elemente
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '4px' }}>
                    Elemente: <span style={{ fontWeight: 'bold', color: '#fecaca' }}>{gameState.defeatModal.stats.phase2.elements} / 4</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '4px' }}>
                    🎯 Spielzüge: <span style={{ fontWeight: 'bold', color: '#fecaca' }}>{gameState.defeatModal.stats.phase2.totalTurns}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                    ⚡ AP Verbraucht: <span style={{ fontWeight: 'bold', color: '#fecaca' }}>{gameState.defeatModal.stats.phase2.totalApSpent}</span>
                  </div>
                </div>
              </div>

              {/* Overall Stats - Responsive! */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 640 ? '1fr' : 'repeat(4, 1fr)', // Mobile: 1 column
                gap: '12px',
                paddingTop: '16px',
                borderTop: '2px solid rgba(220, 38, 38, 0.3)',
                marginBottom: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginBottom: '4px' }}>⏱️ Runden</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                    {gameState.defeatModal.stats.rounds}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginBottom: '4px' }}>🎯 Spielzüge</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                    {gameState.defeatModal.stats.totalTurns}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginBottom: '4px' }}>⚡ AP Gesamt</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                    {gameState.defeatModal.stats.totalApSpent}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#fca5a5', fontSize: '0.75rem', marginBottom: '4px' }}>🕐 Dauer</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                    {gameState.defeatModal.stats.durationMinutes}:{String(gameState.defeatModal.stats.durationSeconds).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Player Info */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(220, 38, 38, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: '4px' }}>Die Helden von Elyria</div>
                    <div style={{ color: '#fecaca', fontSize: '1rem', fontWeight: 'bold' }}>
                      {gameState.defeatModal.stats.playerNames.join(', ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: '4px' }}>👥 Helden</div>
                    <div style={{ color: '#fecaca', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {gameState.defeatModal.stats.playerCount}
                    </div>
                  </div>
                </div>

                {/* Erreichte Elemente */}
                {gameState.defeatModal.stats.activatedElements.length > 0 && (
                  <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(220, 38, 38, 0.3)' }}>
                    <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: '8px' }}>Erreichte Elemente</div>
                    <div style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold' }}>
                      {gameState.defeatModal.stats.activatedElements.map(el =>
                        el === 'erde' ? '🟫 Erde' :
                        el === 'wasser' ? '🟦 Wasser' :
                        el === 'feuer' ? '🟥 Feuer' :
                        '🟪 Luft'
                      ).join('  ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quote */}
            <div style={{
              fontStyle: 'italic',
              textAlign: 'center',
              color: '#fca5a5',
              fontSize: '1rem',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              "Als die Einheit zerbrach, nährte sich die Finsternis. Nun herrscht ewige Nacht."
            </div>

            {/* Button */}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
                color: 'white',
                padding: '16px 48px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
              }}
            >
              ⚔️ ERNEUT VERSUCHEN
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

      {/* Fullscreen Game Board Layout */}
      <div style={{
        minHeight: '100vh',
        padding: isMobile ? '0.5rem' : '1rem',
        maxWidth: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>

        {/* Game Board Container */}
        <div style={{
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          paddingTop: isMobile ? '80px' : '90px',
          paddingBottom: isMobile ? '100px' : '120px'
        }}>
          {/* VerticalLightMeter ist fixed, kein Platz nötig */}
          <VerticalLightMeter
            light={gameState.light}
            maxLight={gameRules.light.maxValue}
            round={gameState.round}
          />

          {/* Hero Avatar - Mobile-First Always-On (fixed top-left) */}
          <HeroAvatar
            player={gameState.players[gameState.currentPlayerIndex]}
            hero={heroes[gameState.players[gameState.currentPlayerIndex]?.id]}
            isExpanded={heroAvatarExpanded}
            onToggle={() => setHeroAvatarExpanded(!heroAvatarExpanded)}
            players={gameState.players}
            heroes={heroes}
            currentPlayerIndex={gameState.currentPlayerIndex}
            currentRound={gameState.round}
            actionBlockers={gameState.actionBlockers}
            shouldPlayerSkipTurn={shouldPlayerSkipTurn}
            isMobile={isMobile}
            onNewGame={onNewGame}
          />


          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <GameBoard
              gameState={gameState}
              onTileClick={handleTileClick}
              onHeroClick={(heroId) => {
                console.log('🎮 onHeroClick called with heroId:', heroId);
                setShowRadialMenu(true);
              }}
              boardContainerRef={boardContainerRef}
            />

            {/* Tower Status Button - FIXED position unten-mitte */}
            <button
              onClick={() => setShowTowerModal(true)}
              style={{
                position: 'fixed',
                bottom: isMobile ? '16px' : '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: isMobile ? '72px' : '80px',
                height: isMobile ? '72px' : '80px',
                borderRadius: '12px',
                background: (() => {
                  const foundations = gameState.tower?.foundations?.length || 0;
                  const elements = gameState.tower?.activatedElements?.length || 0;

                  // VICTORY: Alle 4 Elemente aktiviert - Regenbogen!
                  if (elements === 4) {
                    return 'linear-gradient(135deg, #22c55e 0%, #3b82f6 25%, #ef4444 50%, #a78bfa 75%, #22c55e 100%)';
                  }
                  // Phase 2: Multi-Color-Hints
                  if (foundations === 4 && elements > 0) {
                    const activated = gameState.tower.activatedElements;
                    const colors = [];
                    if (activated.includes('erde')) colors.push('#22c55e');
                    if (activated.includes('wasser')) colors.push('#3b82f6');
                    if (activated.includes('feuer')) colors.push('#ef4444');
                    if (activated.includes('luft')) colors.push('#a78bfa');
                    return `linear-gradient(135deg, #ca8a04, ${colors.join(', ')})`;
                  }
                  // Phase 2 Start: Gold → Rot
                  if (foundations === 4) {
                    return 'linear-gradient(135deg, #ca8a04, #ef4444)';
                  }
                  // Phase 1: Gold (1-3 Fundamente)
                  if (foundations > 0) {
                    return 'linear-gradient(135deg, #ca8a04, #fbbf24)';
                  }
                  // Leer: Grau
                  return 'linear-gradient(135deg, #78716c, #a8a29e)';
                })(),
                border: '3px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                boxShadow: (() => {
                  const elements = gameState.tower?.activatedElements?.length || 0;
                  if (elements === 4) {
                    return '0 4px 20px rgba(34, 197, 94, 0.8), 0 0 30px rgba(59, 130, 246, 0.6)';
                  }
                  return '0 4px 12px rgba(202, 138, 4, 0.6), 0 0 20px rgba(251, 191, 36, 0.4)';
                })(),
                transition: 'all 0.3s ease',
                zIndex: 1000,
                animation: (() => {
                  const foundations = gameState.tower?.foundations?.length || 0;
                  const elements = gameState.tower?.activatedElements?.length || 0;
                  if (elements === 4) return 'pulseTowerButton 1s ease-in-out infinite';
                  if (foundations === 4) return 'pulseTowerButton 1.5s ease-in-out infinite';
                  if (foundations > 0) return 'pulseTowerButton 2s ease-in-out infinite';
                  return 'pulseTowerButton 2.5s ease-in-out infinite';
                })()
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
              }}
              title="Turm-Status anzeigen"
            >
              <div style={{ fontSize: isMobile ? '20px' : '24px' }}>🏛️</div>
              <div style={{
                fontSize: isMobile ? '9px' : '10px',
                lineHeight: '1',
                display: 'flex',
                flexDirection: 'column',
                gap: '1px'
              }}>
                <div>🏗️ {gameState.tower?.foundations?.length || 0}/4</div>
                <div>⚡ {gameState.tower?.activatedElements?.length || 0}/4</div>
              </div>
            </button>
          </div>
        </div>


      </div>

      {/* Radial Action Menu */}
      {showRadialMenu && (
        <RadialActionMenu
          currentPlayer={gameState.players[gameState.currentPlayerIndex]}
          gameState={gameState}
          handlers={{
            onEndTurn: handleEndTurn,
            onPickup: () => {
              // Prüfe ob mehrere Items verfügbar sind
              const currentPlayer = gameState.players[gameState.currentPlayerIndex];
              const currentTile = gameState.board[currentPlayer.position];

              // Schließe Action-Menü wenn Item-Auswahl-Modal erscheinen wird
              if (currentTile?.resources?.length > 1) {
                setShowRadialMenu(false);
              }

              handleCollectResources();
            },
            onDrop: handleDropItem,
            onLearn: handleLearnCombined,
            onTeach: () => {
              // Öffne Skill-Auswahl Modal für Lehren + schließe Action-Menü
              setShowRadialMenu(false);
              setGameState(prev => ({
                ...prev,
                teachSkillSelectionModal: { show: true }
              }));
            },
            onCleanse: () => {
              // Heilende Reinigung - Prüfe ob Finsternis oder Effekte
              const adjacentDarkness = getAdjacentDarkness();
              const heroesWithEffects = getHeroesWithNegativeEffects();

              if (adjacentDarkness.length > 0) {
                // Erste Finsternis entfernen
                handleHeilendeReinigung(adjacentDarkness[0].position);
              } else if (heroesWithEffects.length > 0) {
                // Effekte von Helden entfernen
                handleHeilendeReinigungEffekte();
              }
            },
            // NOTE: onRemoveObstacle entfernt - Neue UX: direkter Click auf Hindernis am Spielfeld
            // Location-basierte Aktionen (öffnen Selection-Modals)
            onBuildFoundation: () => {
              setGameState(prev => ({
                ...prev,
                foundationSelectionModal: { show: true }
              }));
            },
            onActivateElement: () => {
              setGameState(prev => ({
                ...prev,
                elementSelectionModal: { show: true }
              }));
            },
            onPassGate: handleTorDurchschreiten
          }}
          adjacentDarkness={getAdjacentDarkness()}
          heroesWithNegativeEffects={getHeroesWithNegativeEffects()}
          onClose={() => setShowRadialMenu(false)}
        />
      )}

      {/* Tower Status Modal */}
      {showTowerModal && (
        <TowerStatusModal
          tower={gameState.tower}
          players={gameState.players}
          phase={gameState.phase}
          onClose={() => setShowTowerModal(false)}
        />
      )}

      {/* CSS Animations for Modals */}
      <style>{`
        @keyframes pulseTowerButton {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(202, 138, 4, 0.6), 0 0 20px rgba(251, 191, 36, 0.4);
          }
          50% {
            box-shadow: 0 6px 16px rgba(202, 138, 4, 0.8), 0 0 30px rgba(251, 191, 36, 0.6);
          }
        }
      `}</style>
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
            box-shadow: 0 0 140px rgba(234, 179, 8, 1), inset 0 0 80px rgba(234, 179, 8, 0.3);
          }
        }
        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default GameScreen;
