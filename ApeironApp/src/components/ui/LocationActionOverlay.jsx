import React from 'react';

/**
 * Location-Based Action Overlays
 * - Erscheinen DIREKT auf Spielfeld-Tiles (Krater, Tor)
 * - Nur sichtbar wenn Spieler am richtigen Ort steht
 * - 3 Typen: Grundstein legen, Element aktivieren, Tor durchschreiten
 */

/**
 * Krater Overlay - Phase 1: Fundament bauen
 */
export const FoundationOverlay = ({ currentPlayer, gameState, onBuildFoundation }) => {
  // Prüfe ob auf Krater
  if (currentPlayer.position !== '4,4') return null;

  // Prüfe Phase
  if (gameState.phase !== 1) return null;

  // Prüfe Skill
  if (!currentPlayer.learnedSkills.includes('grundstein_legen')) return null;

  // Prüfe AP
  if (currentPlayer.ap < 1) return null;

  // Prüfe Kristalle (mind. 2)
  const crystalCount = currentPlayer.inventory.filter(item => item === 'kristall').length;
  if (crystalCount < 2) return null;

  // Finde verfügbare Baupläne
  const availableBlueprints = currentPlayer.learnedSkills.filter(skill =>
    skill.startsWith('kenntnis_bauplan_')
  );

  if (availableBlueprints.length === 0) return null;

  // Mapping Bauplan → Element
  const blueprintMapping = {
    'kenntnis_bauplan_erde': { element: 'erde', name: 'Erde', emoji: '🟫', color: '#22c55e' },
    'kenntnis_bauplan_wasser': { element: 'wasser', name: 'Wasser', emoji: '🟦', color: '#3b82f6' },
    'kenntnis_bauplan_feuer': { element: 'feuer', name: 'Feuer', emoji: '🟥', color: '#ef4444' },
    'kenntnis_bauplan_luft': { element: 'luft', name: 'Luft', emoji: '🟪', color: '#a78bfa' }
  };

  const foundations = availableBlueprints.map(bp => ({
    skill: bp,
    ...blueprintMapping[bp],
    built: gameState.tower.foundations.includes(blueprintMapping[bp].element)
  }));

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        alignItems: 'center',
        animation: 'slideDown 0.3s ease-out',
        marginBottom: '20px'
      }}
    >
      <div
        style={{
          fontSize: '0.65rem',
          color: '#fbbf24',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
          marginBottom: '4px'
        }}
      >
        🏗️ FUNDAMENT BAUEN
      </div>

      {foundations.map(foundation => (
        <button
          key={foundation.element}
          onClick={() => onBuildFoundation(foundation.element)}
          disabled={foundation.built}
          style={{
            backgroundColor: foundation.built ? '#4b5563' : foundation.color,
            color: 'white',
            padding: isMobile ? '6px 10px' : '8px 12px',
            borderRadius: '8px',
            border: foundation.built ? '2px solid #6b7280' : `2px solid ${foundation.color}`,
            fontWeight: 'bold',
            fontSize: isMobile ? '0.7rem' : '0.75rem',
            cursor: foundation.built ? 'not-allowed' : 'pointer',
            opacity: foundation.built ? 0.5 : 1,
            boxShadow: foundation.built
              ? 'none'
              : `0 0 12px ${foundation.color}80, 0 2px 4px rgba(0, 0, 0, 0.3)`,
            transition: 'all 0.2s ease',
            minWidth: isMobile ? '140px' : '160px',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            if (!foundation.built) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = `0 0 20px ${foundation.color}, 0 4px 8px rgba(0, 0, 0, 0.4)`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = foundation.built
              ? 'none'
              : `0 0 12px ${foundation.color}80, 0 2px 4px rgba(0, 0, 0, 0.3)`;
          }}
          title={foundation.built ? `${foundation.name}-Fundament bereits gebaut` : `${foundation.name}-Fundament bauen (1 AP + Bauplan + 2 Kristalle)`}
        >
          {foundation.emoji} {foundation.name} {foundation.built ? '✅' : ''}
        </button>
      ))}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Krater Overlay - Phase 2: Element aktivieren
 */
export const ElementOverlay = ({ currentPlayer, gameState, onActivateElement, gameRules }) => {
  // Prüfe ob auf Krater
  if (currentPlayer.position !== '4,4') return null;

  // Prüfe Phase
  if (gameState.phase !== 2) return null;

  // Prüfe Skill
  if (!currentPlayer.learnedSkills.includes('element_aktivieren')) return null;

  // Prüfe AP
  if (currentPlayer.ap < 1) return null;

  // Prüfe ob mindestens 1 Kristall
  const hasKristall = currentPlayer.inventory.includes('kristall');
  if (!hasKristall) return null;

  // Element-Mapping
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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2, 1fr)',
        gap: '6px',
        alignItems: 'center',
        animation: 'slideDown 0.3s ease-out',
        marginBottom: '20px'
      }}
    >
      <div
        style={{
          gridColumn: '1 / -1',
          fontSize: '0.65rem',
          color: '#fbbf24',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
          marginBottom: '4px',
          textAlign: 'center'
        }}
      >
        🔥 ELEMENT AKTIVIEREN
      </div>

      {elements.map(element => {
        const canActivate = element.hasFragment && !element.activated;

        return (
          <button
            key={element.element}
            onClick={() => canActivate && onActivateElement(element.type)}
            disabled={!canActivate}
            style={{
              backgroundColor: element.activated ? '#4b5563' : !element.hasFragment ? '#6b7280' : element.color,
              color: 'white',
              padding: isMobile ? '6px 8px' : '8px 10px',
              borderRadius: '8px',
              border: `2px solid ${element.activated ? '#6b7280' : element.color}`,
              fontWeight: 'bold',
              fontSize: isMobile ? '0.65rem' : '0.7rem',
              cursor: canActivate ? 'pointer' : 'not-allowed',
              opacity: canActivate ? 1 : 0.5,
              boxShadow: canActivate
                ? `0 0 12px ${element.color}80, 0 2px 4px rgba(0, 0, 0, 0.3)`
                : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
            onMouseEnter={(e) => {
              if (canActivate) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 0 20px ${element.color}, 0 4px 8px rgba(0, 0, 0, 0.4)`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = canActivate
                ? `0 0 12px ${element.color}80, 0 2px 4px rgba(0, 0, 0, 0.3)`
                : 'none';
            }}
            title={
              element.activated ? `${element.name}-Element bereits aktiviert` :
              !element.hasFragment ? `${element.name}-Fragment benötigt` :
              `${element.name}-Element aktivieren (${element.bonusText})`
            }
          >
            <div>{element.emoji} {element.name}</div>
            <div style={{ fontSize: '0.6rem', opacity: 0.9 }}>
              {element.activated ? '✅' : element.bonusText}
            </div>
          </button>
        );
      })}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Tor der Weisheit Overlay - Durchschreiten
 */
export const GateOverlay = ({ currentPlayer, gameState, onPassGate }) => {
  // Prüfe ob Tor existiert
  if (!gameState.torDerWeisheit.triggered) return null;

  // Prüfe ob auf Tor
  if (currentPlayer.position !== gameState.torDerWeisheit.position) return null;

  // Prüfe ob bereits Master
  if (currentPlayer.isMaster) return null;

  // Prüfe AP
  if (currentPlayer.ap < 1) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div
      style={{
        animation: 'slideDown 0.3s ease-out',
        marginBottom: '20px'
      }}
    >
      <button
        onClick={onPassGate}
        style={{
          backgroundColor: '#8b5cf6',
          color: 'white',
          padding: isMobile ? '8px 12px' : '10px 16px',
          borderRadius: '8px',
          border: '2px solid #a78bfa',
          fontWeight: 'bold',
          fontSize: isMobile ? '0.75rem' : '0.85rem',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 4px 8px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
          animation: 'pulsateGlow 2s ease-in-out infinite'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(139, 92, 246, 1), 0 6px 12px rgba(0, 0, 0, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.8), 0 4px 8px rgba(0, 0, 0, 0.3)';
        }}
        title="Durchschreite das Tor der Weisheit und werde Meister deines Elements"
      >
        🚪 TOR DURCHSCHREITEN
      </button>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes pulsateGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.8), 0 4px 8px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(139, 92, 246, 1), 0 6px 12px rgba(0, 0, 0, 0.4);
          }
        }
      `}</style>
    </div>
  );
};
