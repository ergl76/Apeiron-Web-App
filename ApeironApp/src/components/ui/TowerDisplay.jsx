import React from 'react';

/**
 * TowerDisplay - Vertikal gestapelter Turm der Elemente
 *
 * Features:
 * - Elemente ÜBEREINANDER gestapelt (wie echter Turm)
 * - Von unten nach oben: Fundamente → Aktivierte Elemente
 * - Visuelle Unterscheidung zwischen Status (5 Stufen)
 * - Animationen beim Hinzufügen
 *
 * @param {Object} tower - Tower-Objekt mit foundations & activatedElements
 * @param {Array} players - Spieler-Array zum Prüfen von Bauplan-Status
 */
const TowerDisplay = ({ tower, players }) => {
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

  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      border: '2px solid #374151',
      marginBottom: '1rem'
    }}>
      {/* Header */}
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#fbbf24',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        🏛️ Turm der Elemente
      </h3>

      {/* Vertical Tower Stack */}
      <div style={{
        display: 'flex',
        flexDirection: 'column-reverse', // Von unten nach oben
        gap: '0.5rem',
        alignItems: 'center'
      }}>
        {elements.map((element) => {
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
                height: '64px',
                borderRadius: '8px',
                border: '3px solid',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.5s ease',
                position: 'relative',
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
                fontSize: '2rem',
                filter: isActivated ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none',
                animation: isActivated ? 'glow 2s infinite' : 'none'
              }}>
                {config.symbol}
              </div>

              {/* Element Name */}
              <div style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {config.name}
              </div>

              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                right: '8px',
                fontSize: '0.75rem',
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
                padding: '2px 8px',
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

      {/* Tower Progress Info */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#374151',
        borderRadius: '8px',
        border: '1px solid #4b5563'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#d1d5db'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>
              {tower?.foundations?.length || 0}/4
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Fundamente
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#22c55e', fontWeight: 'bold' }}>
              {tower?.activatedElements?.length || 0}/4
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              Aktiviert
            </div>
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
      `}</style>
    </div>
  );
};

export default TowerDisplay;
