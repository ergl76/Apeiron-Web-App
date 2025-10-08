import React from 'react';

/**
 * TowerStatusModal - Episches Modal für Turm-Status
 *
 * Features:
 * - Full-screen Modal mit backdrop blur
 * - Vertikaler Turm-Stack (identisch zu TowerDisplay)
 * - Staggered Animation beim Öffnen
 * - Progress Bar & Phase Indicator
 * - Interactive Tooltips
 *
 * @param {Object} tower - Tower-Objekt mit foundations & activatedElements
 * @param {Array} players - Spieler-Array zum Prüfen von Bauplan-Status
 * @param {Number} phase - Aktuelle Spiel-Phase (1 oder 2)
 * @param {Function} onClose - Handler zum Schließen des Modals
 */
const TowerStatusModal = ({ tower, players, phase, onClose }) => {
  const elements = ['erde', 'wasser', 'feuer', 'luft'];

  // Element-Konfiguration
  const elementConfig = {
    erde: {
      symbol: '⛰️',
      name: 'Erde',
      color: '#22c55e',
      bgColor: '#16a34a'
    },
    wasser: {
      symbol: '💧',
      name: 'Wasser',
      color: '#3b82f6',
      bgColor: '#2563eb'
    },
    feuer: {
      symbol: '🔥',
      name: 'Feuer',
      color: '#ef4444',
      bgColor: '#dc2626'
    },
    luft: {
      symbol: '💨',
      name: 'Luft',
      color: '#a78bfa',
      bgColor: '#8b5cf6'
    }
  };

  // Gesamtfortschritt berechnen (0-8)
  const totalProgress = (tower?.foundations?.length || 0) + (tower?.activatedElements?.length || 0);
  const progressPercentage = (totalProgress / 8) * 100;

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
        zIndex: 10000,
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #0f0f0f, #1a1200, #1a0f00)',
          borderRadius: '16px',
          padding: window.innerWidth < 640 ? '16px 12px' : '32px',
          maxWidth: '600px',
          maxHeight: '85vh',
          overflowY: 'auto',
          width: 'calc(100% - 32px)',
          border: '3px solid #fbbf24',
          boxShadow: '0 0 80px rgba(251, 191, 36, 0.6)',
          animation: 'towerModalIn 0.4s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: window.innerWidth < 640 ? '1rem' : '1.5rem'
        }}>
          <div style={{
            fontSize: window.innerWidth < 640 ? '2rem' : '3rem',
            marginBottom: '0.25rem'
          }}>
            🏛️
          </div>
          <h2 style={{
            fontSize: window.innerWidth < 640 ? '1.25rem' : '1.75rem',
            fontWeight: 'bold',
            color: '#fbbf24',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: window.innerWidth < 640 ? '1px' : '2px'
          }}>
            TURM DER ELEMENTE
          </h2>

          {/* Phase Indicator */}
          <div style={{
            display: 'inline-block',
            backgroundColor: phase === 1 ? 'rgba(202, 138, 4, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `2px solid ${phase === 1 ? '#fbbf24' : '#ef4444'}`,
            borderRadius: '20px',
            padding: window.innerWidth < 640 ? '4px 12px' : '6px 16px',
            fontSize: window.innerWidth < 640 ? '0.75rem' : '0.85rem',
            color: phase === 1 ? '#fbbf24' : '#fca5a5',
            fontWeight: 'bold'
          }}>
            {phase === 1 ? '🏗️ Fundamentbau-Phase' : '⚡ Element-Aktivierungs-Phase'}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          marginBottom: window.innerWidth < 640 ? '1rem' : '1.5rem',
          backgroundColor: '#374151',
          borderRadius: '12px',
          padding: window.innerWidth < 640 ? '8px' : '12px',
          border: '2px solid #4b5563'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            fontSize: '0.875rem',
            color: '#d1d5db'
          }}>
            <span>Gesamtfortschritt</span>
            <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>{totalProgress}/8</span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#1f2937',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid #4b5563'
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: '100%',
              background: totalProgress === 8
                ? 'linear-gradient(90deg, #22c55e, #3b82f6, #ef4444, #a78bfa)'
                : 'linear-gradient(90deg, #ca8a04, #fbbf24)',
              transition: 'width 0.5s ease',
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)'
            }} />
          </div>
        </div>

        {/* Vertical Tower Stack (reverse order - bottom to top) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: window.innerWidth < 640 ? '8px' : '12px',
          alignItems: 'center',
          marginBottom: window.innerWidth < 640 ? '1rem' : '1.5rem'
        }}>
          {elements.map((element, index) => {
            const hasFoundation = tower?.foundations?.includes(element);
            const isActivated = tower?.activatedElements?.includes(element);
            const config = elementConfig[element];

            // Check blueprint status from player inventories and learned skills
            const blueprintDiscovered = players?.some(p =>
              p.inventory?.includes(`bauplan_${element}`)
            );
            const blueprintLearned = players?.some(p =>
              p.learnedSkills?.includes(`kenntnis_bauplan_${element}`)
            );

            // Status-basierte Styles (5 Stufen)
            const getStyles = () => {
              if (isActivated) {
                // Stufe 5: Element aktiviert
                return {
                  backgroundColor: config.bgColor,
                  borderColor: config.color,
                  color: 'white',
                  boxShadow: `0 0 20px ${config.color}80, inset 0 0 20px ${config.color}40`,
                  transform: 'scale(1)',
                  opacity: 1
                };
              } else if (hasFoundation) {
                // Stufe 4: Fundament gebaut
                return {
                  backgroundColor: '#ca8a04',
                  borderColor: '#fbbf24',
                  color: 'white',
                  boxShadow: '0 4px 8px rgba(251, 191, 36, 0.3)',
                  transform: 'scale(0.95)',
                  opacity: 0.9
                };
              } else if (blueprintLearned) {
                // Stufe 3: Bauplan gelernt
                return {
                  backgroundColor: '#78716c',
                  borderColor: '#a8a29e',
                  color: '#e7e5e4',
                  boxShadow: '0 2px 6px rgba(120, 113, 108, 0.4)',
                  transform: 'scale(0.92)',
                  opacity: 0.8
                };
              } else if (blueprintDiscovered) {
                // Stufe 2: Bauplan entdeckt
                return {
                  backgroundColor: '#4b5563',
                  borderColor: '#6b7280',
                  color: '#9ca3af',
                  boxShadow: '0 2px 4px rgba(75, 85, 99, 0.3)',
                  transform: 'scale(0.9)',
                  opacity: 0.6
                };
              } else {
                // Stufe 1: Nicht entdeckt
                return {
                  backgroundColor: '#374151',
                  borderColor: '#4b5563',
                  color: '#6b7280',
                  boxShadow: 'none',
                  transform: 'scale(0.9)',
                  opacity: 0.5
                };
              }
            };

            const styles = getStyles();

            return (
              <div
                key={element}
                style={{
                  width: '100%',
                  height: window.innerWidth < 640 ? '56px' : '72px',
                  borderRadius: '8px',
                  border: window.innerWidth < 640 ? '2px solid' : '3px solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: window.innerWidth < 640 ? '8px' : '12px',
                  transition: 'all 0.5s ease',
                  position: 'relative',
                  animation: `towerRise 0.5s ease-out ${index * 0.1}s both`,
                  ...styles
                }}
                title={`${config.name}: ${
                  isActivated ? 'Aktiviert ✅' :
                  hasFoundation ? 'Fundament gebaut 🏗️' :
                  blueprintLearned ? 'Bauplan gelernt ✅' :
                  blueprintDiscovered ? 'Bauplan entdeckt 📋' :
                  'Nicht entdeckt ❌'
                }`}
              >
                {/* Element Symbol */}
                <div style={{
                  fontSize: window.innerWidth < 640 ? '1.75rem' : '2.5rem',
                  filter: isActivated ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none',
                  animation: isActivated ? 'glow 2s infinite' : 'none'
                }}>
                  {config.symbol}
                </div>

                {/* Element Name */}
                <div style={{
                  fontSize: window.innerWidth < 640 ? '0.875rem' : '1.125rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: window.innerWidth < 640 ? '0.5px' : '1px'
                }}>
                  {config.name}
                </div>

                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  right: window.innerWidth < 640 ? '8px' : '12px',
                  fontSize: window.innerWidth < 640 ? '0.65rem' : '0.75rem',
                  fontWeight: 'bold',
                  backgroundColor:
                    isActivated ? '#22c55e' :
                    hasFoundation ? '#fbbf24' :
                    blueprintLearned ? '#a8a29e' :
                    blueprintDiscovered ? '#6b7280' :
                    '#4b5563',
                  color:
                    isActivated || hasFoundation || blueprintLearned ? '#1f2937' :
                    blueprintDiscovered ? '#d1d5db' :
                    'white',
                  padding: window.innerWidth < 640 ? '3px 8px' : '4px 10px',
                  borderRadius: '12px'
                }}>
                  {isActivated ? '✅ AKTIV' :
                   hasFoundation ? '🏗️ FUNDAMENT' :
                   blueprintLearned ? '✅ GELERNT' :
                   blueprintDiscovered ? '📋 ENTDECKT' :
                   '❌'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: window.innerWidth < 640 ? '8px' : '12px',
          marginBottom: window.innerWidth < 640 ? '0.75rem' : '1rem'
        }}>
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '8px',
            border: '2px solid #4b5563',
            padding: window.innerWidth < 640 ? '10px' : '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: window.innerWidth < 640 ? '1.5rem' : '2rem',
              fontWeight: 'bold',
              color: '#fbbf24',
              marginBottom: '2px'
            }}>
              {tower?.foundations?.length || 0}/4
            </div>
            <div style={{
              fontSize: window.innerWidth < 640 ? '0.75rem' : '0.875rem',
              color: '#9ca3af'
            }}>
              Fundamente
            </div>
          </div>
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '8px',
            border: '2px solid #4b5563',
            padding: window.innerWidth < 640 ? '10px' : '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: window.innerWidth < 640 ? '1.5rem' : '2rem',
              fontWeight: 'bold',
              color: '#22c55e',
              marginBottom: '2px'
            }}>
              {tower?.activatedElements?.length || 0}/4
            </div>
            <div style={{
              fontSize: window.innerWidth < 640 ? '0.75rem' : '0.875rem',
              color: '#9ca3af'
            }}>
              Aktiviert
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: window.innerWidth < 640 ? '10px' : '12px',
            backgroundColor: '#374151',
            border: '2px solid #4b5563',
            borderRadius: '8px',
            color: 'white',
            fontSize: window.innerWidth < 640 ? '0.9rem' : '1rem',
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
          Schließen
        </button>

        {/* CSS Animations */}
        <style>{`
          @keyframes glow {
            0%, 100% {
              filter: drop-shadow(0 0 8px rgba(255,255,255,0.8));
            }
            50% {
              filter: drop-shadow(0 0 16px rgba(255,255,255,1));
            }
          }

          @keyframes towerRise {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes towerModalIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
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
        `}</style>
      </div>
    </div>
  );
};

export default TowerStatusModal;
