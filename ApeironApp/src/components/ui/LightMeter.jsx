import React from 'react';

/**
 * LightMeter - Eigenständige Lichtleisten-Komponente
 *
 * Zeigt den aktuellen Licht-Wert prominent an mit:
 * - Dynamischer Farbe basierend auf Licht-Level
 * - Progress Bar mit Animation
 * - Rundenanzeige
 *
 * @param {number} light - Aktueller Licht-Wert
 * @param {number} maxLight - Maximaler Licht-Wert (aus gameRules)
 * @param {number} round - Aktuelle Runde
 */
const LightMeter = ({ light, maxLight, round }) => {
  // Berechne Prozentsatz für Progress Bar
  const percentage = (light / maxLight) * 100;

  // Dynamische Farbe basierend auf Licht-Level
  const getLightColor = () => {
    if (percentage > 66) return '#22c55e'; // Grün - sicher
    if (percentage > 33) return '#fbbf24'; // Gelb - Warnung
    return '#ef4444'; // Rot - kritisch
  };

  const lightColor = getLightColor();

  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      border: '2px solid #374151',
      marginBottom: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#fbbf24',
          margin: 0
        }}>
          💡 Licht-Marker
        </h3>
        <div style={{
          fontSize: '1rem',
          fontWeight: 'bold',
          color: '#d1d5db'
        }}>
          Runde {round}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '32px',
        backgroundColor: '#111827',
        borderRadius: '9999px',
        overflow: 'hidden',
        border: '3px solid #374151',
        position: 'relative',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Fill */}
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: lightColor,
            transition: 'all 0.5s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '12px',
            boxShadow: `0 0 20px ${lightColor}80`
          }}
        >
          {/* Light Value Display */}
          <span style={{
            fontWeight: 'bold',
            color: percentage > 50 ? '#111827' : '#ffffff',
            fontSize: '1rem',
            textShadow: percentage > 50 ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.8)'
          }}>
            {light}
          </span>
        </div>

        {/* Max Value (outside bar on right) */}
        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.875rem',
          color: '#9ca3af',
          fontWeight: 'bold'
        }}>
          /{maxLight}
        </div>
      </div>

      {/* Status Text */}
      <div style={{
        marginTop: '0.75rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: lightColor,
        fontWeight: 'bold',
        transition: 'color 0.5s ease'
      }}>
        {percentage > 66 && '✨ Das Licht strahlt hell'}
        {percentage <= 66 && percentage > 33 && '⚠️ Das Licht schwindet'}
        {percentage <= 33 && '🔥 Kritisch - Das Licht erlischt!'}
      </div>
    </div>
  );
};

export default LightMeter;
