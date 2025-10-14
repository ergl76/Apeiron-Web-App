import React, { useState, useEffect } from 'react';

/**
 * EventCardAnimation - Radial-Style Card Draw Animation
 *
 * Animation Sequence (total: ~3.5s):
 * 1. Show card stack in circular formation (0.5s fade-in)
 * 2. Spin 360° with slow-down (2s cubic-bezier)
 * 3. Land on result card (0.5s scale)
 * 4. Reveal with glow effect (0.5s)
 * 5. Call onComplete callback
 *
 * Design inspiriert von RadialActionMenu:
 * - Direction Cards: Blau (#3b82f6) mit Kompass-Icon
 * - Hero Cards: Gold (#ca8a04) mit Element-Icons
 */

const EventCardAnimation = ({ type, options, result, onComplete }) => {
  const [phase, setPhase] = useState('spinning'); // 'spinning' | 'landed' | 'revealed'

  // Animation Sequence
  useEffect(() => {
    // Phase 1: Spin für 2 Sekunden
    const spinTimer = setTimeout(() => {
      setPhase('landed');
    }, 2000);

    // Phase 2: Land + Scale für 0.5s
    const landTimer = setTimeout(() => {
      setPhase('revealed');
    }, 2500);

    // Phase 3: Reveal + Glow für 0.5s, dann Complete
    const revealTimer = setTimeout(() => {
      if (onComplete) {
        onComplete(result);
      }
    }, 3000);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(landTimer);
      clearTimeout(revealTimer);
    };
  }, [result, onComplete]);

  // Color Coding basierend auf Card Type
  const isDirection = type === 'direction';
  const primaryColor = isDirection ? '#3b82f6' : '#ca8a04';
  const bgColor = isDirection ? '#1e3a8a' : '#92400e';
  const glowColor = isDirection ? 'rgba(59, 130, 246, 0.6)' : 'rgba(202, 138, 4, 0.6)';

  // Result Card Content (abhängig vom Type)
  const getResultContent = () => {
    if (isDirection) {
      // Himmelsrichtung: Kompass mit Richtungs-Icon
      const directionIcons = {
        north: '⬆️',
        east: '➡️',
        south: '⬇️',
        west: '⬅️'
      };
      const directionNames = {
        north: 'Norden',
        east: 'Osten',
        south: 'Süden',
        west: 'Westen'
      };

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '4rem' }}>
            {directionIcons[result]}
          </div>
          <div style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            {directionNames[result]}
          </div>
        </div>
      );
    } else {
      // Hero Card: Element-Icons + Name
      const heroData = {
        terra: { icon: '🌿', name: 'Terra', color: '#22c55e' },
        ignis: { icon: '🔥', name: 'Ignis', color: '#ef4444' },
        lyra: { icon: '💧', name: 'Lyra', color: '#3b82f6' },
        corvus: { icon: '🦅', name: 'Corvus', color: '#eab308' }
      };

      const hero = heroData[result] || { icon: '❓', name: result, color: '#9ca3af' };

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '4rem' }}>
            {hero.icon}
          </div>
          <div style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            color: hero.color,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textShadow: `0 0 12px ${hero.color}80`
          }}>
            {hero.name}
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px',
      padding: '32px',
      minHeight: '400px',
      justifyContent: 'center'
    }}>
      {/* Instruction Text (während Spin) */}
      {phase === 'spinning' && (
        <div style={{
          fontSize: '1.1rem',
          color: primaryColor,
          fontWeight: 'bold',
          textAlign: 'center',
          animation: 'pulse 1.5s infinite'
        }}>
          {isDirection ? '🧭 Ermittle Himmelsrichtung...' : '🎴 Ziehe Heldenkarte...'}
        </div>
      )}

      {/* Card Container */}
      <div style={{
        position: 'relative',
        width: '240px',
        height: '320px',
        perspective: '1000px'
      }}>
        {/* Card Stack (nur während Spinning) */}
        {phase === 'spinning' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            animation: 'spinCard 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute',
                top: `${i * 6}px`,
                left: `${i * 6}px`,
                width: '240px',
                height: '320px',
                backgroundColor: bgColor,
                borderRadius: '16px',
                border: `3px solid ${primaryColor}`,
                boxShadow: `0 4px 12px rgba(0, 0, 0, 0.4)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '5rem'
              }}>
                {i === 2 && (
                  isDirection ? '🎴' : (
                    // Hero Card: 2×2 Grid mit Element-Icons
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      fontSize: '3rem'
                    }}>
                      <div>🌿</div>
                      <div>🔥</div>
                      <div>💧</div>
                      <div>🦅</div>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}

        {/* Result Card (nach Spin) */}
        {(phase === 'landed' || phase === 'revealed') && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '240px',
            height: '320px',
            backgroundColor: bgColor,
            borderRadius: '16px',
            border: `4px solid ${primaryColor}`,
            boxShadow: phase === 'revealed'
              ? `0 0 40px ${glowColor}, 0 8px 24px rgba(0, 0, 0, 0.5)`
              : `0 4px 12px rgba(0, 0, 0, 0.4)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: phase === 'landed'
              ? 'landCard 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
              : 'revealCard 0.5s ease-out forwards',
            transform: phase === 'revealed' ? 'scale(1.1)' : 'scale(1)'
          }}>
            {getResultContent()}
          </div>
        )}
      </div>

      {/* Result Text (nach Reveal) */}
      {phase === 'revealed' && (
        <div style={{
          fontSize: '1.2rem',
          color: '#10b981',
          fontWeight: 'bold',
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          ✓ Ergebnis gezogen!
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spinCard {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(720deg);
          }
        }

        @keyframes landCard {
          0% {
            transform: scale(0.8) rotateY(720deg);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.15) rotateY(0deg);
          }
          100% {
            transform: scale(1) rotateY(0deg);
            opacity: 1;
          }
        }

        @keyframes revealCard {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1.1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default EventCardAnimation;
