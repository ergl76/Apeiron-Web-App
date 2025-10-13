import React, { useState } from 'react';
import SkillTooltipModal from './SkillTooltipModal';
import skillDescriptions from '../../config/skillDescriptions.json';

/**
 * PlayerCard - Single Player Card for Swipeable Carousel
 *
 * Features:
 * - Shows ALL player information (Name, AP, Inventory, Skills, Effects)
 * - Active State: Bright colors, border glow, pulsing animation
 * - Inactive State: Dimmed (opacity 0.7, slight grayscale)
 * - Mobile-First responsive design
 *
 * @param {Object} player - Player object
 * @param {Object} hero - Hero data (element, color, icon)
 * @param {boolean} isActive - Is this the currently viewed player in carousel?
 * @param {boolean} isCurrentPlayer - Is this the active player in game?
 * @param {number} currentRound - Current game round for effect expiration
 * @param {Array} actionBlockers - Action blockers array
 * @param {Function} shouldPlayerSkipTurn - Helper function for skip turn check
 */
const PlayerCard = ({
  player,
  hero,
  isActive,
  isCurrentPlayer,
  currentRound,
  actionBlockers,
  shouldPlayerSkipTurn
}) => {
  if (!player || !hero) return null;

  // State for skill tooltip modal
  const [selectedSkill, setSelectedSkill] = useState(null);

  const heroColor = hero.color;

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

  // Card Style based on active/inactive state
  const cardStyle = {
    width: '100%',  // Changed from 90% - take full wrapper width
    margin: '0 auto',
    backgroundColor: '#1f2937',
    border: isActive ? `3px solid ${heroColor}` : '2px solid #4b5563',
    borderRadius: '16px',
    padding: '12px',  // Reduced from 16px
    boxShadow: isActive
      ? `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 40px ${heroColor}60, inset 0 1px 2px rgba(255, 255, 255, 0.1)`
      : '0 4px 12px rgba(0, 0, 0, 0.3)',
    transform: isActive ? 'scale(1)' : 'scale(0.95)',
    opacity: isActive ? 1 : 0.7,
    filter: isActive ? 'none' : 'grayscale(10%)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: isActive ? 'activeCardPulse 3s ease-in-out infinite' : 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    maxHeight: '450px',  // Changed from minHeight to maxHeight
    overflowY: 'auto'   // Make content scrollable if too tall
  };

  return (
    <>
      <div style={cardStyle}>
        {/* Player Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px'
        }}>
          {/* Hero Circle */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${heroColor}dd, ${heroColor}66)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            border: '2px solid white',
            boxShadow: `0 4px 12px ${heroColor}80`,
            flexShrink: 0
          }}>
            {player.id === 'terra' ? '🌿' :
             player.id === 'ignis' ? '🔥' :
             player.id === 'lyra' ? '💧' : '🦅'}
          </div>

          {/* Name & AP */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '4px',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
            }}>
              {player.name}
              {isCurrentPlayer && shouldPlayerSkipTurn(player, currentRound) && (
                <span style={{ color: '#fbbf24', marginLeft: '8px', fontSize: '0.875rem' }}>
                  (Aussetzen) 😴
                </span>
              )}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#d1d5db',
              fontWeight: 'bold'
            }}>
              ⚡ AP: <span style={{ color: '#fbbf24' }}>{player.ap}/{player.maxAp}</span>
            </div>
          </div>

          {/* Active Badge */}
          {isCurrentPlayer && (
            <div style={{
              backgroundColor: '#22c55e',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.625rem',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)'
            }}>
              AKTIV
            </div>
          )}
        </div>

        {/* Inventory */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            marginBottom: '8px',
            fontWeight: 'bold'
          }}>
            📦 Inventar:
          </div>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {[0, 1].map(slotIndex => {
              const item = player.inventory[slotIndex];
              const isEmpty = !item;

              return (
                <div
                  key={slotIndex}
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: isEmpty ? '#4b5563' : '#1f2937',
                    border: isEmpty ? '2px dashed #6b7280' : '2px solid #fbbf24',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
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
                      width: '10px',
                      height: '10px',
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
        <div style={{ marginBottom: '12px' }}>
          {/* Abilities */}
          {(() => {
            const abilities = player.learnedSkills.filter(skill =>
              skill !== 'aufdecken' && !skill.startsWith('kenntnis_bauplan_')
            );

            if (abilities.length === 0) return null;

            return (
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginBottom: '8px',
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
                      'schnell_bewegen': '🦅',
                      'element_aktivieren': '🔥',
                      'dornen_entfernen': '🌵',
                      'reinigen': '💧',
                      'fluss_freimachen': '🌊',
                      'lehren': '🎓'
                    };
                    return (
                      <span
                        key={skill}
                        onClick={() => setSelectedSkill(skill)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        style={{
                          backgroundColor: 'rgba(251, 191, 36, 0.3)',
                          border: '1px solid #fbbf24',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
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
            const knowledge = player.learnedSkills.filter(skill =>
              skill.startsWith('kenntnis_bauplan_')
            );

            if (knowledge.length === 0) return null;

            return (
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginBottom: '8px',
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
                        onClick={() => setSelectedSkill(skill)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        style={{
                          backgroundColor: 'rgba(167, 139, 250, 0.3)',
                          border: '1px solid #a78bfa',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
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
          const negativeEffectTypes = ['reduce_ap', 'set_ap', 'skip_turn', 'block_skills', 'prevent_movement', 'disable_communication'];

          const negativePlayerEffects = (player.effects || [])
            .filter(e => e.expiresInRound > currentRound && negativeEffectTypes.includes(e.type));

          const relevantActionBlockers = (actionBlockers || [])
            .filter(blocker =>
              blocker.expiresInRound > currentRound &&
              (blocker.target === player.id || blocker.target === 'all_players')
            );

          const allNegativeEffects = [...negativePlayerEffects, ...relevantActionBlockers];

          if (allNegativeEffects.length === 0) return null;

          return (
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#ef4444',
                marginBottom: '8px',
                fontWeight: 'bold'
              }}>
                ⚠️ Negative Effekte:
              </div>
              <div style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                padding: '10px',
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
                        fontSize: '0.625rem',
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
                      <span style={{ color: '#9ca3af', fontSize: '0.5rem', marginLeft: '2px' }}>
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
          const positiveEffects = (player.effects || [])
            .filter(e => e.expiresInRound > currentRound && e.type === 'bonus_ap');

          if (positiveEffects.length === 0) return null;

          return (
            <div>
              <div style={{
                fontSize: '0.75rem',
                color: '#22c55e',
                marginBottom: '8px',
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
                        fontSize: '0.625rem',
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

      {/* Active Card Pulse Animation */}
      {isActive && (
        <style>{`
          @keyframes activeCardPulse {
            0%, 100% {
              box-shadow:
                0 8px 24px rgba(0, 0, 0, 0.4),
                0 0 30px ${heroColor}40,
                inset 0 1px 2px rgba(255, 255, 255, 0.1);
            }
            50% {
              box-shadow:
                0 8px 24px rgba(0, 0, 0, 0.4),
                0 0 50px ${heroColor}80,
                inset 0 1px 2px rgba(255, 255, 255, 0.1);
            }
          }
        `}</style>
      )}

      {/* Skill Tooltip Modal */}
      {selectedSkill && skillDescriptions[selectedSkill] && (
        <SkillTooltipModal
          skillData={skillDescriptions[selectedSkill]}
          isOpen={!!selectedSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </>
  );
};

export default PlayerCard;
