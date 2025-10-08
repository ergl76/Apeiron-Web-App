import React from 'react';

/**
 * Dynamisches Radial-Menü für Hero-Aktionen
 * - Zeigt nur ENABLED Aktionen (keine grauen disabled Buttons)
 * - Automatische Winkel-Berechnung basierend auf Anzahl
 * - Location-basierte Aktionen (Fundament bauen, Element aktivieren, Tor durchschreiten)
 *   erscheinen im Menü wenn Held am richtigen Ort steht (Smart Location Detection)
 * - Hindernisse werden NICHT mehr hier entfernt (neue UX: direkter Click auf Hindernis)
 */
const RadialActionMenu = ({ currentPlayer, gameState, handlers, onClose, adjacentDarkness = [], heroesWithNegativeEffects = [] }) => {

  // Helper: Kann Spieler Items aufnehmen?
  const canPickup = () => {
    const currentTile = gameState.board[currentPlayer.position];
    const hasItems = currentTile?.resources?.length > 0;
    const hasSpace = currentPlayer.inventory.length < currentPlayer.maxInventory;
    const notDark = !gameState.herzDerFinsternis.darkTiles?.includes(currentPlayer.position);
    return hasItems && hasSpace && notDark && currentPlayer.ap >= 1;
  };

  // Helper: Kann Spieler Items ablegen?
  const canDrop = () => {
    return currentPlayer.inventory.length > 0 && currentPlayer.ap >= 1;
  };

  // Helper: Kann Spieler lernen?
  const canLearn = () => {
    const blueprints = currentPlayer.inventory.filter(item => item.startsWith('bauplan_'));
    const artifacts = currentPlayer.inventory.filter(item => item.startsWith('artefakt_'));
    return (blueprints.length > 0 || artifacts.length > 0) && currentPlayer.ap >= 1;
  };

  // Helper: Kann Spieler lehren?
  const canTeach = () => {
    const isMaster = currentPlayer.isMaster;
    const hasSkill = currentPlayer.learnedSkills.includes('lehren');
    const hasStudents = gameState.players.some(p =>
      p.position === currentPlayer.position && p.id !== currentPlayer.id
    );
    return isMaster && hasSkill && hasStudents && currentPlayer.ap >= 1;
  };

  // Helper: Kann Spieler heilen?
  const canCleanse = () => {
    const hasSkill = currentPlayer.learnedSkills.includes('reinigen');
    const hasDarkness = adjacentDarkness.length > 0;
    const hasEffects = heroesWithNegativeEffects.length > 0;
    return hasSkill && (hasDarkness || hasEffects) && currentPlayer.ap >= 1;
  };

  // Helper: Kann Spieler Fundament bauen? (LOCATION: Krater Phase 1)
  const canBuildFoundation = () => {
    const isOnKrater = currentPlayer.position === '4,4';
    const isPhase1 = gameState.phase === 1;
    const hasSkill = currentPlayer.learnedSkills.includes('grundstein_legen');
    const hasCrystals = currentPlayer.inventory.filter(i => i === 'kristall').length >= 2;
    const hasBlueprints = currentPlayer.learnedSkills.some(s => s.startsWith('kenntnis_bauplan_'));
    return isOnKrater && isPhase1 && hasSkill && hasCrystals && hasBlueprints && currentPlayer.ap >= 1;
  };

  // Helper: Kann Spieler Element aktivieren? (LOCATION: Krater Phase 2)
  const canActivateElement = () => {
    const isOnKrater = currentPlayer.position === '4,4';
    const isPhase2 = gameState.phase === 2;
    const hasSkill = currentPlayer.learnedSkills.includes('element_aktivieren');
    const hasCrystal = currentPlayer.inventory.includes('kristall');
    const hasFragments = currentPlayer.inventory.some(i => i.startsWith('element_fragment_'));
    return isOnKrater && isPhase2 && hasSkill && hasCrystal && hasFragments && currentPlayer.ap >= 1;
  };

  // Helper: Kann Spieler Tor durchschreiten? (LOCATION: Tor der Weisheit)
  const canPassGate = () => {
    const tile = gameState.board[currentPlayer.position];
    const isOnGate = tile?.id === 'tor_der_weisheit';
    const isMaster = currentPlayer.isMaster;
    const gateTriggered = gameState.torDerWeisheit?.triggered;
    return isOnGate && !isMaster && gateTriggered && currentPlayer.ap >= 1;
  };

  // Sammle alle verfügbaren Aktionen
  const getAvailableActions = () => {
    const actions = [];

    // IMMER verfügbar (auch wenn AP = 0, für "Zug beenden")
    actions.push({
      id: 'endTurn',
      icon: '🏁',
      label: 'Zug beenden',
      color: currentPlayer.ap > 0 ? '#f59e0b' : '#10b981', // Gelb wenn vorzeitig, Grün wenn AP=0
      glowColor: 'rgba(245, 158, 11, 0.6)',
      handler: handlers.onEndTurn
    });

    // Conditional Actions
    if (canPickup()) {
      actions.push({
        id: 'pickup',
        icon: '💰',
        label: 'Aufnehmen',
        color: '#7c3aed',
        glowColor: 'rgba(124, 58, 237, 0.6)',
        handler: handlers.onPickup
      });
    }

    if (canDrop()) {
      actions.push({
        id: 'drop',
        icon: '📦',
        label: 'Ablegen',
        color: '#dc2626',
        glowColor: 'rgba(220, 38, 38, 0.6)',
        handler: handlers.onDrop
      });
    }

    if (canLearn()) {
      actions.push({
        id: 'learn',
        icon: '📚',
        label: 'Lernen',
        color: '#8b5cf6',
        glowColor: 'rgba(139, 92, 246, 0.6)',
        handler: handlers.onLearn
      });
    }

    if (canTeach()) {
      actions.push({
        id: 'teach',
        icon: '🎓',
        label: 'Lehren',
        color: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.6)',
        handler: handlers.onTeach
      });
    }

    if (canCleanse()) {
      actions.push({
        id: 'cleanse',
        icon: '💧',
        label: 'Heilende Reinigung',
        color: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.6)',
        handler: handlers.onCleanse
      });
    }

    // NOTE: "Hindernis entfernen" wurde aus dem Menü entfernt
    // Neue UX: Spieler klickt direkt auf Hindernis am Spielfeld
    // → Radial-Style-Modal erscheint mit Entfernen-Option

    // Location-basierte Aktionen (erscheinen nur am richtigen Ort)
    if (canBuildFoundation()) {
      actions.push({
        id: 'buildFoundation',
        icon: '🏗️',
        label: 'Fundament bauen',
        color: '#ca8a04',
        glowColor: 'rgba(202, 138, 4, 0.6)',
        handler: handlers.onBuildFoundation
      });
    }

    if (canActivateElement()) {
      actions.push({
        id: 'activateElement',
        icon: '🔥',
        label: 'Element aktivieren',
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.6)',
        handler: handlers.onActivateElement
      });
    }

    if (canPassGate()) {
      actions.push({
        id: 'passGate',
        icon: '🚪',
        label: 'Tor durchschreiten',
        color: '#8b5cf6',
        glowColor: 'rgba(139, 92, 246, 0.6)',
        handler: handlers.onPassGate
      });
    }

    return actions;
  };

  const actions = getAvailableActions();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Automatische Winkel-Berechnung basierend auf Anzahl
  const angleStep = 360 / actions.length;
  const radius = isMobile ? 90 : 110; // Mobil etwas kleiner
  const buttonSize = isMobile ? 48 : 56;

  // Berechne Position für jede Aktion
  const getButtonPosition = (index) => {
    const angle = index * angleStep;
    const radian = (angle - 90) * (Math.PI / 180); // -90 damit 0° = Nord ist
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;
    return { x, y };
  };

  const handleActionClick = (action) => {
    // Speichere AP-Stand VOR der Aktion
    const apBefore = currentPlayer.ap;

    // Führe Aktion aus
    action.handler();

    // ========================================
    // PRÜFE OB MENÜ GESCHLOSSEN WERDEN SOLL
    // ========================================
    // a) Wenn Aktion ein Modal/Submenü öffnet (buildFoundation, activateElement, drop mit mehreren Items, learn mit mehreren Items)
    // b) Wenn Aktion ein modales Ereignis triggert (z.B. Tor der Weisheit, Success-Modal)
    // c) Wenn letzter AP verbraucht wurde

    // 1. Aktionen die IMMER Modals öffnen → Menü direkt schließen
    if (['buildFoundation', 'activateElement', 'passGate'].includes(action.id)) {
      onClose();
      return;
    }

    // 2. "Zug beenden" → Menü immer schließen (triggert oft Events am Rundenende)
    if (action.id === 'endTurn') {
      onClose();
      return;
    }

    // 3. Drop/Learn: Prüfe ob Auswahl-Modal geöffnet wird
    if (action.id === 'drop' && currentPlayer.inventory.length > 1) {
      onClose(); // Mehrere Items → Auswahl-Modal wird geöffnet
      return;
    }

    if (action.id === 'learn') {
      const blueprints = currentPlayer.inventory.filter(item => item.startsWith('bauplan_'));
      const artifacts = currentPlayer.inventory.filter(item => item.startsWith('artefakt_'));
      if ((blueprints.length + artifacts.length) > 1) {
        onClose(); // Mehrere lernbare Items → Auswahl-Modal wird geöffnet
        return;
      }
    }

    // 4. AP-verbrauchende Aktionen: Prüfe ob letzter AP verbraucht wurde
    // → Wenn ja, schließe Menü (Player hat keine Aktionen mehr möglich)
    if (['pickup', 'drop', 'learn', 'teach', 'cleanse', 'removeObstacle'].includes(action.id)) {
      // Diese Aktionen kosten 1 AP
      if (apBefore === 1) {
        // Letzter AP wurde verbraucht → Menü schließen
        // (Delay damit State-Update durchläuft & ggf. Events getriggert werden)
        setTimeout(() => {
          onClose();
        }, 50);
        return;
      }
    }

    // 5. Für alle anderen Fälle: Menü bleibt offen
    // → Spieler kann weitere Aktionen ausführen (z.B. mehrmals aufnehmen)
  };

  return (
    <>
      {/* Backdrop mit Click-Away */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          backdropFilter: 'blur(12px)',
          zIndex: 20000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Radial Menu Container */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20001,
          animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Zentrum - Helden-Avatar */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${buttonSize * 0.8}px`,
            height: `${buttonSize * 0.8}px`,
            borderRadius: '50%',
            backgroundColor: '#1f2937',
            border: '3px solid #d1d5db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${buttonSize * 0.5}px`,
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            zIndex: 10000
          }}
        >
          {currentPlayer.element === 'earth' ? '🌿' :
           currentPlayer.element === 'fire' ? '🔥' :
           currentPlayer.element === 'water' ? '💧' : '🦅'}
        </div>

        {/* Action Buttons */}
        {actions.map((action, index) => {
          const { x, y } = getButtonPosition(index);

          return (
            <div key={action.id}>
              {/* Action Button */}
              <button
                onClick={() => handleActionClick(action)}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px - ${buttonSize / 2}px)`,
                  top: `calc(50% + ${y}px - ${buttonSize / 2}px)`,
                  width: `${buttonSize}px`,
                  height: `${buttonSize}px`,
                  minWidth: `${buttonSize}px`, // Prevent shrinking
                  minHeight: `${buttonSize}px`,
                  borderRadius: '50%',
                  backgroundColor: action.color,
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: `${buttonSize * 0.5}px`,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 20px ${action.glowColor}, 0 4px 8px rgba(0, 0, 0, 0.3)`,
                  transition: 'all 0.2s ease',
                  animation: 'pulseButton 2s ease-in-out infinite',
                  zIndex: 9999
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.boxShadow = `0 0 30px ${action.glowColor}, 0 6px 12px rgba(0, 0, 0, 0.4)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = `0 0 20px ${action.glowColor}, 0 4px 8px rgba(0, 0, 0, 0.3)`;
                }}
                title={action.label}
              >
                {action.icon}
              </button>

              {/* Label unterhalb des Buttons */}
              <div
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px + ${buttonSize * 0.7}px)`,
                  transform: 'translateX(-50%)',
                  color: 'white',
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  pointerEvents: 'none',
                  zIndex: 9999
                }}
              >
                {action.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes pulseButton {
          0%, 100% {
            box-shadow: 0 0 20px currentGlowColor, 0 4px 8px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 30px currentGlowColor, 0 6px 12px rgba(0, 0, 0, 0.4);
          }
        }
      `}</style>
    </>
  );
};

export default RadialActionMenu;
