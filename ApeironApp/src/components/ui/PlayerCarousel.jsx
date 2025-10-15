import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useCustomSwipeable } from '../../hooks/useCustomSwipeable';
import PlayerCard from './PlayerCard';

// Error boundary component for handling swipe errors
const SwipeErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error) => {
      console.error('Swipeable error:', error);
      setHasError(true);
    };
    
    // Add global error listener for swipeable errors
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  if (hasError) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#ef4444',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '10px',
        margin: '20px 0'
      }}>
        <p>Swipe-Funktion vorübergehend nicht verfügbar.</p>
        <p>Bitte verwenden Sie die Pfeilbuttons zur Navigation.</p>
      </div>
    );
  }
  
  return children;
};

/**
 * PlayerCarousel - Swipeable Player Navigation Carousel
 *
 * Features:
 * - Horizontal swipe navigation through all players
 * - Peek-preview (10% of next/previous card)
 * - Pagination dots with jump-to functionality
 * - Arrow buttons for desktop fallback
 * - Smooth transitions with cubic-bezier easing
 * - Mobile-First responsive design
 *
 * @param {Array} players - All players in game
 * @param {Object} heroes - Heroes object from ApeironGame
 * @param {number} currentPlayerIndex - Index of active player in game
 * @param {number} currentRound - Current game round
 * @param {Array} actionBlockers - Action blockers array
 * @param {Function} shouldPlayerSkipTurn - Helper function
 * @param {boolean} isMobile - Is viewport mobile-sized?
 */
const PlayerCarousel = ({
  players,
  heroes,
  currentPlayerIndex,
  currentRound,
  actionBlockers,
  shouldPlayerSkipTurn,
  isMobile
}) => {
  // Start with current player selected
  const [selectedIndex, setSelectedIndex] = useState(currentPlayerIndex);
  const [isDragging, setIsDragging] = useState(false);

  // Update selected index when current player changes
  useEffect(() => {
    setSelectedIndex(currentPlayerIndex);
  }, [currentPlayerIndex]);

  // Navigation functions
  const handleNext = () => {
    if (selectedIndex < players.length - 1) {
      setSelectedIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(prev => prev - 1);
    }
  };

  const handleDotClick = (index) => {
    setSelectedIndex(index);
  };

  // Swipe handlers with error handling and fallback
  let swipeHandlers = {};
  let customSwipeHandlers = {};
  let useCustomSwipe = false;

  try {
    swipeHandlers = useSwipeable({
      onSwipedLeft: () => handleNext(),
      onSwipedRight: () => handlePrev(),
      onSwiping: () => setIsDragging(true),
      onSwiped: () => setIsDragging(false),
      preventScrollOnSwipe: true,
      trackMouse: true,  // Enable mouse drag on desktop
      delta: 10,
      swipeDuration: 500,
      touchEventOptions: { passive: false }
    });
  } catch (error) {
    console.error('Error initializing react-swipeable, using custom implementation:', error);
    useCustomSwipe = true;
    customSwipeHandlers = useCustomSwipeable({
      onSwipedLeft: () => handleNext(),
      onSwipedRight: () => handlePrev(),
      onSwiping: () => setIsDragging(true),
      onSwiped: () => setIsDragging(false),
      preventScrollOnSwipe: true,
      delta: 10
    });
  }

  if (!players || players.length === 0) return null;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      padding: '20px 0',
      overflow: 'visible'  // Allow peek-preview to show
    }}>
      {/* Swipeable Container */}
      <SwipeErrorBoundary>
        <div {...(useCustomSwipe ? customSwipeHandlers : swipeHandlers)} style={{
          position: 'relative',
          width: '100%',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}>
          {/* Cards Track - each card wrapper is 95% wide for peek-preview */}
          <div style={{
            display: 'flex',
            transform: `translateX(calc(-2.5% - ${selectedIndex * 95}%))`,  // Center first card with -2.5% offset
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform'
          }}>
            {players.map((player, index) => {
              const hero = heroes[player.id];
              const isActive = index === selectedIndex;
              const isCurrentPlayer = index === currentPlayerIndex;

              return (
                <div
                  key={player.id}
                  style={{
                    flex: '0 0 95%',  // Each wrapper is 95% wide - creates 5% peek
                    display: 'flex',
                    justifyContent: 'center',  // Center the card
                    alignItems: 'flex-start',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Card at 90% of wrapper width */}
                  <div style={{ width: '90%' }}>
                    <PlayerCard
                      player={player}
                      hero={hero}
                      isActive={isActive}
                      isCurrentPlayer={isCurrentPlayer}
                      currentRound={currentRound}
                      actionBlockers={actionBlockers}
                      shouldPlayerSkipTurn={shouldPlayerSkipTurn}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SwipeErrorBoundary>

      {/* Arrow Buttons (Desktop) */}
      {!isMobile && players.length > 1 && (
        <>
          {/* Left Arrow */}
          {selectedIndex > 0 && (
            <button
              onClick={handlePrev}
              style={{
                position: 'absolute',
                top: '50%',
                left: '10px',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ◀
            </button>
          )}

          {/* Right Arrow */}
          {selectedIndex < players.length - 1 && (
            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                top: '50%',
                right: '10px',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ▶
            </button>
          )}
        </>
      )}

      {/* Pagination Dots */}
      {players.length > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '20px',
          padding: '10px 0'
        }}>
          {players.map((player, index) => {
            const hero = heroes[player.id];
            const isActive = index === selectedIndex;
            const heroColor = hero.color;

            return (
              <div
                key={player.id}
                onClick={() => handleDotClick(index)}
                style={{
                  width: isActive ? '12px' : '8px',
                  height: isActive ? '12px' : '8px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? heroColor : 'transparent',
                  border: isActive ? '2px solid white' : '2px solid #6b7280',
                  boxShadow: isActive ? `0 0 12px ${heroColor}80` : 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = `${heroColor}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={player.name}
              />
            );
          })}
        </div>
      )}

      {/* Swipe Indicator (Mobile Only) */}
      {isMobile && players.length > 1 && (
        <div style={{
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '0.75rem',
          marginTop: '10px',
          userSelect: 'none'
        }}>
          ← Swipe für andere Spieler →
        </div>
      )}
    </div>
  );
};

export default PlayerCarousel;
