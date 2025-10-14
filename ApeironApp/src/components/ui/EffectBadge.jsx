import React from 'react';

/**
 * EffectBadge - Visuelles Badge-System für Event-Effekte
 *
 * Zeigt Event-Effekte kategorisiert und farbcodiert an:
 * - Icon + Kategorie-Label
 * - Ziel der Wirkung
 * - Konkrete Aktion
 *
 * 9 Effekt-Kategorien mit individuellen Farben & Icons
 */

const EffectBadge = ({ category, icon, target, action }) => {
  // Kategorie-Konfiguration: Farbe + deutsches Label
  const categoryConfig = {
    'ap_modification': {
      color: '#ca8a04',
      bgColor: 'rgba(202, 138, 4, 0.15)',
      label: 'Aktionspunkte ändern',
      borderGlow: 'rgba(202, 138, 4, 0.4)'
    },
    'light_change': {
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.15)',
      label: 'Licht beeinflussen',
      borderGlow: 'rgba(234, 179, 8, 0.4)'
    },
    'obstacle_placement': {
      color: '#92400e',
      bgColor: 'rgba(146, 64, 14, 0.15)',
      label: 'Hindernisse platzieren',
      borderGlow: 'rgba(146, 64, 14, 0.4)'
    },
    'item_drop': {
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.15)',
      label: 'Gegenstände ablegen',
      borderGlow: 'rgba(168, 85, 247, 0.4)'
    },
    'movement_block': {
      color: '#dc2626',
      bgColor: 'rgba(220, 38, 38, 0.15)',
      label: 'Bewegung blockieren',
      borderGlow: 'rgba(220, 38, 38, 0.4)'
    },
    'skill_block': {
      color: '#ea580c',
      bgColor: 'rgba(234, 88, 12, 0.15)',
      label: 'Fähigkeiten blockieren',
      borderGlow: 'rgba(234, 88, 12, 0.4)'
    },
    'action_block': {
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      label: 'Aktionen blockieren',
      borderGlow: 'rgba(239, 68, 68, 0.4)'
    },
    'darkness_spread': {
      color: '#7c3aed',
      bgColor: 'rgba(124, 58, 237, 0.15)',
      label: 'Finsternis ausbreiten',
      borderGlow: 'rgba(124, 58, 237, 0.4)'
    },
    'positive_bonus': {
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      label: 'Bonus erhalten',
      borderGlow: 'rgba(16, 185, 129, 0.4)'
    }
  };

  const config = categoryConfig[category] || categoryConfig['positive_bonus'];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      padding: '16px 20px',
      backgroundColor: config.bgColor,
      border: `2px solid ${config.color}`,
      borderRadius: '12px',
      boxShadow: `0 0 12px ${config.borderGlow}`,
      marginTop: '16px',
      marginBottom: '8px'
    }}>
      {/* Icon (groß & prominent) */}
      <div style={{
        fontSize: '2.5rem',
        lineHeight: 1,
        flexShrink: 0,
        marginTop: '-4px'
      }}>
        {icon}
      </div>

      {/* Content (Kategorie + Ziel + Aktion) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Kategorie-Label */}
        <div style={{
          fontSize: '0.875rem',
          fontWeight: 'bold',
          color: config.color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {config.label}
        </div>

        {/* Ziel (Wer/Was ist betroffen?) */}
        <div style={{
          fontSize: '0.95rem',
          color: '#e5e7eb',
          lineHeight: 1.4
        }}>
          {target}
        </div>

        {/* Aktion (Was passiert konkret?) */}
        {action && (
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: `1px solid ${config.color}40`,
            display: 'inline-block',
            alignSelf: 'flex-start'
          }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default EffectBadge;
