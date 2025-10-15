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

  // Responsive Helper-Funktion für multimodale Darstellung
  const getResponsiveValues = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Drei Stufen: Mobile, Tablet/Notebook, Desktop
    if (width < 640) {
      // Mobile - unverändert
      return {
        padding: '16px 12px',
        headerMargin: '1rem',
        sectionMargin: '1rem',
        elementHeight: '56px',
        elementGap: '8px',
        symbolSize: '1.75rem',
        nameSize: '0.875rem',
        badgeSize: '0.65rem',
        badgePadding: '3px 8px',
        statPadding: '10px',
        statNumberSize: '1.5rem',
        statLabelSize: '0.75rem',
        footerMargin: '0.75rem',
        maxHeight: '90vh', // Mehr Platz auf Mobile
        iconSize: '2rem',
        titleSize: '1.25rem',
        titleSpacing: '1px',
        phasePadding: '4px 12px',
        phaseSize: '0.75rem',
        progressPadding: '8px',
        progressHeight: '12px'
      };
    } else if (width < 1024 || height < 800) {
      // Tablet/Notebook - kompakte Variante
      return {
        padding: '20px 16px',
        headerMargin: '1rem',
        sectionMargin: '1rem',
        elementHeight: '60px',
        elementGap: '8px',
        symbolSize: '2rem',
        nameSize: '1rem',
        badgeSize: '0.7rem',
        badgePadding: '3px 8px',
        statPadding: '12px',
        statNumberSize: '1.75rem',
        statLabelSize: '0.8rem',
        footerMargin: '0.75rem',
        maxHeight: '88vh', // Etwas mehr Platz für Notebooks
        iconSize: '2.5rem',
        titleSize: '1.5rem',
        titleSpacing: '1.5px',
        phasePadding: '5px 14px',
        phaseSize: '0.8rem',
        progressPadding: '10px',
        progressHeight: '12px'
      };
    } else {
      // Desktop - aktuelle Werte
      return {
        padding: '32px',
        headerMargin: '1.5rem',
        sectionMargin: '1.5rem',
        elementHeight: '72px',
        elementGap: '12px',
        symbolSize: '2.5rem',
        nameSize: '1.125rem',
        badgeSize: '0.75rem',
        badgePadding: '4px 10px',
        statPadding: '16px',
        statNumberSize: '2rem',
        statLabelSize: '0.875rem',
        footerMargin: '1rem',
        maxHeight: '85vh',
        iconSize: '3rem',
        titleSize: '1.75rem',
        titleSpacing: '2px',
        phasePadding: '6px 16px',
        phaseSize: '0.85rem',
        progressPadding: '12px',
        progressHeight: '12px'
      };
    }
  };

  const responsive = getResponsiveValues();

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
          padding: responsive.padding,
          maxWidth: '600px',
          maxHeight: responsive.maxHeight,
          overflowY: 'auto',
          width: 'calc(100% - 32px)',
          border: '3px solid #fbbf24',
          boxShadow: '0 0 80px rgba(251, 191, 36, 0.6)',
          animation: 'towerModalIn 0.4s ease-out',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 10
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

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: responsive.headerMargin
        }}>
          <div style={{
            fontSize: responsive.iconSize,
            marginBottom: '0.25rem'
          }}>
            🏛️
          </div>
          <h2 style={{
            fontSize: responsive.titleSize,
            fontWeight: 'bold',
            color: '#fbbf24',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: responsive.titleSpacing
          }}>
            TURM DER ELEMENTE
          </h2>

          {/* Phase Indicator */}
          <div style={{
            display: 'inline-block',
            backgroundColor: phase === 1 ? 'rgba(202, 138, 4, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `2px solid ${phase === 1 ? '#fbbf24' : '#ef4444'}`,
            borderRadius: '20px',
            padding: responsive.phasePadding,
            fontSize: responsive.phaseSize,
            color: phase === 1 ? '#fbbf24' : '#fca5a5',
            fontWeight: 'bold'
          }}>
            {phase === 1 ? '🏗️ Fundamentbau-Phase' : '⚡ Element-Aktivierungs-Phase'}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          marginBottom: responsive.sectionMargin,
          backgroundColor: '#374151',
          borderRadius: '12px',
          padding: responsive.progressPadding,
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
            height: responsive.progressHeight,
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
          gap: responsive.elementGap,
          alignItems: 'center',
          marginBottom: responsive.sectionMargin
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
                  height: responsive.elementHeight,
                  borderRadius: '8px',
                  border: window.innerWidth < 640 ? '2px solid' : '3px solid',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: responsive.elementGap,
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
                  fontSize: responsive.symbolSize,
                  filter: isActivated ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none',
                  animation: isActivated ? 'glow 2s infinite' : 'none'
                }}>
                  {config.symbol}
                </div>

                {/* Element Name */}
                <div style={{
                  fontSize: responsive.nameSize,
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
                  fontSize: responsive.badgeSize,
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
                  padding: responsive.badgePadding,
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
          gap: responsive.elementGap,
          marginBottom: responsive.footerMargin
        }}>
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '8px',
            border: '2px solid #4b5563',
            padding: responsive.statPadding,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: responsive.statNumberSize,
              fontWeight: 'bold',
              color: '#fbbf24',
              marginBottom: '2px'
            }}>
              {tower?.foundations?.length || 0}/4
            </div>
            <div style={{
              fontSize: responsive.statLabelSize,
              color: '#9ca3af'
            }}>
              Fundamente
            </div>
          </div>
          <div style={{
            backgroundColor: '#374151',
            borderRadius: '8px',
            border: '2px solid #4b5563',
            padding: responsive.statPadding,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: responsive.statNumberSize,
              fontWeight: 'bold',
              color: '#22c55e',
              marginBottom: '2px'
            }}>
              {tower?.activatedElements?.length || 0}/4
            </div>
            <div style={{
              fontSize: responsive.statLabelSize,
              color: '#9ca3af'
            }}>
              Aktiviert
            </div>
          </div>
        </div>


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
