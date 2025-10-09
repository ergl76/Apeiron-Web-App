import React from 'react';
import PlayerCarousel from './PlayerCarousel';

/**
 * HeroAvatar - Compact Always-On Hero Display (Mobile-First)
 *
 * Shows active player info in a floating top-left card:
 * - Circular hero avatar (tap-to-expand)
 * - Name, AP, Inventory icons
 * - Glassmorphism dark theme
 * - Expandable to show PlayerCarousel with all players
 *
 * @param {Object} player - Current active player
 * @param {Object} hero - Hero data (element, icon, color)
 * @param {boolean} isExpanded - Expand state
 * @param {Function} onToggle - Toggle expand/collapse
 * @param {Array} players - All players in game
 * @param {Object} heroes - Heroes object from ApeironGame
 * @param {number} currentPlayerIndex - Index of active player
 * @param {number} currentRound - Current game round
 * @param {Array} actionBlockers - Action blockers array
 * @param {Function} shouldPlayerSkipTurn - Helper function
 * @param {boolean} isMobile - Is viewport mobile-sized?
 * @param {Function} onNewGame - Callback for new game action
 */
const HeroAvatar = ({
  player,
  hero,
  isExpanded,
  onToggle,
  players,
  heroes,
  currentPlayerIndex,
  currentRound,
  actionBlockers,
  shouldPlayerSkipTurn,
  isMobile,
  onNewGame
}) => {
  if (!player || !hero) return null;

  // Hero color based on element
  const getHeroColor = (element) => {
    const colors = {
      earth: '#22c55e',     // Green (Terra)
      fire: '#ef4444',      // Red (Ignis)
      water: '#3b82f6',     // Blue (Lyra)
      air: '#eab308'        // Yellow (Corvus)
    };
    return colors[element] || '#ffffff';
  };

  // Hero emoji based on element
  const getHeroEmoji = (element) => {
    const emojis = {
      earth: '🌿',
      fire: '🔥',
      water: '💧',
      air: '🦅'
    };
    return emojis[element] || '⭐';
  };

  const heroColor = getHeroColor(hero.element);
  const heroEmoji = getHeroEmoji(hero.element);

  // Get inventory icons (max 3 shown, then "+X")
  const getInventoryDisplay = () => {
    if (player.inventory.length === 0) return '—';

    const iconMap = {
      'kristall': '💎',
      'bauplan_erde': '📜🟩',
      'bauplan_wasser': '📜🟦',
      'bauplan_feuer': '📜🟥',
      'bauplan_luft': '📜🟪',
      'element_fragment_erde': '🟫',
      'element_fragment_wasser': '🟦',
      'element_fragment_feuer': '🟥',
      'element_fragment_luft': '🟪',
      'artefakt_terra': '🔨',
      'artefakt_lyra': '💧',
      'artefakt_ignis': '🔥',
      'artefakt_corvus': '👁️'
    };

    const items = player.inventory.slice(0, 3).map(item => {
      return iconMap[item] || '📦';
    });

    if (player.inventory.length > 3) {
      items.push(`+${player.inventory.length - 3}`);
    }

    return items.join(' ');
  };

  return (
    <>
      {/* Wrapper: Avatar + Spielabbruch-Punkt - horizontal zentriert */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '40px',
        zIndex: 1000
      }}>
        {/* Compact Hero Avatar Bar - Always visible */}
        <div
          onClick={onToggle}
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(15px)',
            borderRadius: '30px',
            padding: '8px 16px 8px 8px',
            border: `2px solid ${heroColor}`,
            boxShadow: `
              0 4px 20px rgba(0, 0, 0, 0.5),
              0 0 30px ${heroColor}40,
              inset 0 1px 1px rgba(255, 255, 255, 0.1)
            `,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            animation: 'heroPulse 2s ease-in-out infinite',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `
              0 6px 25px rgba(0, 0, 0, 0.6),
              0 0 40px ${heroColor}60,
              inset 0 1px 1px rgba(255, 255, 255, 0.1)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `
              0 4px 20px rgba(0, 0, 0, 0.5),
              0 0 30px ${heroColor}40,
              inset 0 1px 1px rgba(255, 255, 255, 0.1)
            `;
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
        {/* Hero Avatar Circle */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${heroColor}dd, ${heroColor}66)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            border: '3px solid white',
            boxShadow: `
              0 0 15px ${heroColor}80,
              inset 0 0 10px rgba(255, 255, 255, 0.2)
            `,
            flexShrink: 0
          }}
        >
          {heroEmoji}
        </div>

        {/* Hero Info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          minWidth: '100px'
        }}>
          {/* Name */}
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
          }}>
            {player.name}
          </div>

          {/* AP + Inventory */}
          <div style={{
            fontSize: '12px',
            color: '#d1d5db',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <span style={{
              color: heroColor,
              fontWeight: 'bold',
              textShadow: `0 0 8px ${heroColor}80`
            }}>
              ⚡ {player.ap}
            </span>
            <span style={{ fontSize: '11px' }}>
              {getInventoryDisplay()}
            </span>
          </div>
        </div>

        {/* Expand Indicator */}
        <div style={{
          fontSize: '10px',
          color: '#9ca3af',
          marginLeft: '4px',
          transition: 'transform 0.3s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </div>
        </div>

        {/* Spielabbruch-Punkt - immer rechts neben Avatar */}
        <button
          onClick={() => {
            if (window.confirm('Neues Abenteuer beginnen?\n\n⚠️ Das aktuelle Spiel geht verloren!')) {
              onNewGame();
            }
          }}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(220, 38, 38, 0.6)',
            transition: 'all 0.3s ease',
            animation: 'pulseNewGameDot 2.5s ease-in-out infinite',
            padding: 0,
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(220, 38, 38, 0.6)';
          }}
          title="Neues Spiel starten"
        />
      </div>

      {/* Expanded Details Panel */}
      {isExpanded && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 55px)',
            maxWidth: '480px',
            maxHeight: '70vh',
            overflowY: 'auto',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '20px',
            zIndex: 999,
            border: `2px solid ${heroColor}`,
            boxShadow: `
              0 10px 40px rgba(0, 0, 0, 0.7),
              0 0 60px ${heroColor}30,
              inset 0 1px 1px rgba(255, 255, 255, 0.1)
            `,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onToggle}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>

          {/* Player Carousel */}
          <PlayerCarousel
            players={players}
            heroes={heroes}
            currentPlayerIndex={currentPlayerIndex}
            currentRound={currentRound}
            actionBlockers={actionBlockers}
            shouldPlayerSkipTurn={shouldPlayerSkipTurn}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Backdrop (tap to close) */}
      {isExpanded && (
        <div
          onClick={onToggle}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 998,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* Animations */}
      <style>{`
        @keyframes heroPulse {
          0%, 100% {
            box-shadow:
              0 4px 20px rgba(0, 0, 0, 0.5),
              0 0 20px ${heroColor}30,
              inset 0 1px 1px rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow:
              0 4px 20px rgba(0, 0, 0, 0.5),
              0 0 40px ${heroColor}60,
              inset 0 1px 1px rgba(255, 255, 255, 0.1);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulseNewGameDot {
          0%, 100% {
            box-shadow: 0 0 12px rgba(220, 38, 38, 0.6);
          }
          50% {
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.9);
          }
        }
      `}</style>
    </>
  );
};

export default HeroAvatar;
