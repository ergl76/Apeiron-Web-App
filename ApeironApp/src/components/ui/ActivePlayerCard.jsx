import React from 'react';

/**
 * ActivePlayerCard - Zeigt den aktiven Spieler mit Tab-Navigation
 *
 * Features:
 * - Fokus auf aktiven Spieler (große Darstellung)
 * - Tab-Navigation für andere Spieler (Info-Ansicht)
 * - Anzeige: Name, AP, Inventar, Skills, Effekte
 *
 * @param {Array} players - Alle Spieler
 * @param {Object} heroes - Heroes-Objekt aus ApeironGame
 * @param {number} currentPlayerIndex - Index des aktiven Spielers
 * @param {number} currentRound - Aktuelle Runde für Effekt-Expiration
 * @param {number} selectedTab - Index des ausgewählten Tabs (null = aktiver Spieler)
 * @param {Function} onTabClick - Callback für Tab-Klick
 * @param {Function} shouldPlayerSkipTurn - Helper-Funktion für Skip-Turn-Check
 * @param {Array} actionBlockers - Array von Action Blockern (z.B. discover_and_scout blocked)
 */
const ActivePlayerCard = ({
  players,
  heroes,
  currentPlayerIndex,
  currentRound,
  selectedTab,
  onTabClick,
  shouldPlayerSkipTurn,
  actionBlockers
}) => {
  // Der anzuzeigende Spieler (entweder aktiver oder aus Tab ausgewählt)
  const displayedPlayerIndex = selectedTab !== null ? selectedTab : currentPlayerIndex;
  const displayedPlayer = players[displayedPlayerIndex];
  const isActivePlayer = displayedPlayerIndex === currentPlayerIndex;

  // Helper: Get effect icon
  const getEffectIcon = (effectType) => {
    const icons = {
      bonus_ap: '⚡',
      reduce_ap: '🐌',
      set_ap: '🔢',
      skip_turn: '😴',
      block_action: '🚫',
      block_skills: '⛔',
      prevent_movement: '🔒',
      disable_communication: '🤐'
    };
    return icons[effectType] || '✨';
  };

  // Helper: Get effect label
  const getEffectLabel = (effect) => {
    const labels = {
      bonus_ap: `+${effect.value} AP`,
      reduce_ap: `-${effect.value} AP`,
      set_ap: `${effect.value} AP fest`,
      skip_turn: 'Aussetzen',
      block_action: 'Aktion blockiert',
      block_skills: 'Skills blockiert',
      prevent_movement: 'Bewegung blockiert',
      disable_communication: 'Kommunikation blockiert'
    };
    return labels[effect.type] || effect.type;
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
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '2px solid #374151',
        paddingBottom: '0.5rem'
      }}>
        {players.map((player, index) => {
          const isSelected = index === displayedPlayerIndex;
          const isCurrent = index === currentPlayerIndex;
          const heroColor = heroes[player.id].color;

          return (
            <button
              key={player.id}
              onClick={() => onTabClick(index)}
              style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: isSelected ? heroColor + '40' : '#374151',
                border: isSelected ? `2px solid ${heroColor}` : '2px solid #4b5563',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: isSelected ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = heroColor + '20';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#374151';
                }
              }}
            >
              {/* Color Indicator */}
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: heroColor,
                border: isCurrent ? '2px solid white' : 'none',
                boxShadow: isCurrent ? '0 0 8px rgba(255,255,255,0.6)' : 'none'
              }} />

              {/* Name */}
              <span>{player.name}</span>

              {/* Active Indicator */}
              {isCurrent && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#22c55e',
                  borderRadius: '50%',
                  border: '2px solid #1f2937',
                  animation: 'pulseActive 2s infinite'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Player Info */}
      <div style={{
        backgroundColor: isActivePlayer ? 'rgba(59, 130, 246, 0.1)' : '#374151',
        border: isActivePlayer ? '2px solid #3b82f6' : '2px solid #4b5563',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: isActivePlayer ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none'
      }}>
        {/* Player Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '1rem'
        }}>
          {/* Hero Circle */}
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: heroes[displayedPlayer.id].color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            border: '3px solid white',
            boxShadow: `0 4px 12px ${heroes[displayedPlayer.id].color}80`
          }}>
            {displayedPlayer.id === 'terra' ? '🌍' :
             displayedPlayer.id === 'ignis' ? '🔥' :
             displayedPlayer.id === 'lyra' ? '💧' : '🦅'}
          </div>

          {/* Name & AP */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '4px'
            }}>
              {displayedPlayer.name}
              {isActivePlayer && shouldPlayerSkipTurn(displayedPlayer, currentRound) && (
                <span style={{ color: '#fbbf24', marginLeft: '8px', fontSize: '1rem' }}>
                  (Aussetzen) 😴
                </span>
              )}
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#d1d5db',
              fontWeight: 'bold'
            }}>
              ⚡ AP: <span style={{ color: '#fbbf24' }}>{displayedPlayer.ap}/{displayedPlayer.maxAp}</span>
            </div>
          </div>

          {/* Active Badge */}
          {isActivePlayer && (
            <div style={{
              backgroundColor: '#22c55e',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              AKTIV
            </div>
          )}
        </div>

        {/* Inventory */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            marginBottom: '6px',
            fontWeight: 'bold'
          }}>
            📦 Inventar:
          </div>
          <div style={{
            display: 'flex',
            gap: '6px'
          }}>
            {[0, 1].map(slotIndex => {
              const item = displayedPlayer.inventory[slotIndex];
              const isEmpty = !item;

              return (
                <div
                  key={slotIndex}
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: isEmpty ? '#4b5563' : '#1f2937',
                    border: isEmpty ? '2px dashed #6b7280' : '2px solid #fbbf24',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    position: 'relative'
                  }}
                  title={
                    isEmpty ? `Slot ${slotIndex + 1} (leer)` :
                    item === 'kristall' ? 'Kristall' :
                    item === 'artefakt_terra' ? 'Hammer der Erbauerin' :
                    item === 'artefakt_ignis' ? 'Herz des Feuers' :
                    item === 'artefakt_lyra' ? 'Kelch der Reinigung' :
                    item === 'artefakt_corvus' ? 'Auge des Spähers' :
                    item === 'element_fragment_erde' ? 'Erd-Fragment' :
                    item === 'element_fragment_wasser' ? 'Wasser-Fragment' :
                    item === 'element_fragment_feuer' ? 'Feuer-Fragment' :
                    item === 'element_fragment_luft' ? 'Luft-Fragment' :
                    item
                  }
                >
                  {isEmpty ? (
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#6b7280',
                      borderRadius: '2px'
                    }} />
                  ) : (
                    <span>
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
        </div>

        {/* Skills */}
        <div style={{ marginBottom: '1rem' }}>
          {/* Abilities */}
          {(() => {
            const abilities = displayedPlayer.learnedSkills.filter(skill =>
              skill !== 'aufdecken' && !skill.startsWith('kenntnis_bauplan_')
            );

            if (abilities.length === 0) return null;

            return (
              <div style={{ marginBottom: '8px' }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginBottom: '6px',
                  fontWeight: 'bold'
                }}>
                  ⚡ Fähigkeiten:
                </div>
                <div style={{
                  display: 'flex',
                  gap: '6px',
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
                          backgroundColor: 'rgba(251, 191, 36, 0.3)',
                          border: '1px solid #fbbf24',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
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

          {/* Knowledge */}
          {(() => {
            const knowledge = displayedPlayer.learnedSkills.filter(skill =>
              skill.startsWith('kenntnis_bauplan_')
            );

            if (knowledge.length === 0) return null;

            return (
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginBottom: '6px',
                  fontWeight: 'bold'
                }}>
                  📚 Wissen:
                </div>
                <div style={{
                  display: 'flex',
                  gap: '6px',
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
                          backgroundColor: 'rgba(167, 139, 250, 0.3)',
                          border: '1px solid #a78bfa',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
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

        {/* Negative Effects Section */}
        {(() => {
          // Collect ALL negative effects: player.effects + actionBlockers targeting this player
          const negativeEffectTypes = ['reduce_ap', 'set_ap', 'skip_turn', 'block_skills', 'prevent_movement', 'disable_communication'];

          const negativePlayerEffects = (displayedPlayer.effects || [])
            .filter(e => e.expiresInRound > currentRound && negativeEffectTypes.includes(e.type));

          const relevantActionBlockers = (actionBlockers || [])
            .filter(blocker =>
              blocker.expiresInRound > currentRound &&
              (blocker.target === displayedPlayer.id || blocker.target === 'all_players')
            );

          const allNegativeEffects = [...negativePlayerEffects, ...relevantActionBlockers];

          if (allNegativeEffects.length === 0) return null;

          return (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#ef4444',
                marginBottom: '6px',
                fontWeight: 'bold'
              }}>
                ⚠️ Negative Effekte:
              </div>
              <div style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                padding: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid #ef4444',
                borderRadius: '8px'
              }}>
                {allNegativeEffects.map((effect, index) => {
                  const isPermanent = effect.expiresInRound === 999999;
                  const isActionBlocker = effect.action !== undefined;

                  const label = isActionBlocker
                    ? `${effect.action === 'discover_and_scout' ? 'Entdecken/Spähen blockiert' : effect.action + ' blockiert'}`
                    : getEffectLabel(effect);

                  const icon = isActionBlocker ? '🚫' : getEffectIcon(effect.type);

                  return (
                    <span
                      key={`neg-${index}`}
                      style={{
                        backgroundColor: 'rgba(127, 29, 29, 0.9)',
                        border: '1px solid #ef4444',
                        color: '#fca5a5',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={`${label} - ${isPermanent ? 'Permanent' : `Endet in Runde ${effect.expiresInRound}`}`}
                    >
                      {icon}
                      {label}
                      {isPermanent && ' ♾️'}
                      <span style={{ color: '#9ca3af', fontSize: '0.625rem', marginLeft: '2px' }}>
                        ({isPermanent ? '∞' : `R${effect.expiresInRound}`})
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Positive Effects (bonus_ap) */}
        {(() => {
          const positiveEffects = (displayedPlayer.effects || [])
            .filter(e => e.expiresInRound > currentRound && e.type === 'bonus_ap');

          if (positiveEffects.length === 0) return null;

          return (
            <div>
              <div style={{
                fontSize: '0.75rem',
                color: '#22c55e',
                marginBottom: '6px',
                fontWeight: 'bold'
              }}>
                ✨ Positive Effekte:
              </div>
              <div style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap'
              }}>
                {positiveEffects.map((effect, index) => {
                  const isPermanent = effect.expiresInRound === 999999;
                  return (
                    <span
                      key={`pos-${index}`}
                      style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid #22c55e',
                        color: '#22c55e',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={`${getEffectLabel(effect)} - ${isPermanent ? 'Permanent' : `Endet in Runde ${effect.expiresInRound}`}`}
                    >
                      {getEffectIcon(effect.type)}
                      {getEffectLabel(effect)}
                      {isPermanent && ' ♾️'}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* CSS Animation for active pulse */}
      <style>{`
        @keyframes pulseActive {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default ActivePlayerCard;
