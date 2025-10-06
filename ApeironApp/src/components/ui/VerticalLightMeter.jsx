import React from 'react';

/**
 * VerticalLightMeter - Mobile-First vertical light bar
 *
 * Displays light level as a thin vertical bar on the right edge:
 * - Full height (100vh)
 * - Gradient color: White (safe) → Gray (warning) → Red (critical)
 * - Fills from bottom to top based on light percentage
 * - Optional glow effect when critical (< 33%)
 *
 * @param {number} light - Current light value
 * @param {number} maxLight - Maximum light value
 * @param {number} round - Current round (for tooltip)
 */
const VerticalLightMeter = ({ light, maxLight, round }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Calculate percentage
  const percentage = (light / maxLight) * 100;

  // Dynamic color based on light level
  const getLightColor = (pct) => {
    if (pct > 66) return '#ffffff';      // White - safe
    if (pct > 33) return '#9ca3af';      // Gray - warning
    return '#ef4444';                    // Red - critical
  };

  const lightColor = getLightColor(percentage);
  const isCritical = percentage <= 33;

  // Shared bar style generator
  const getBarStyle = (side) => ({
    position: 'fixed',
    top: 0,
    [side]: 0,                              // Dynamic: left or right
    width: '10px',                          // ✅ Schmäler: 10px
    height: '100vh',
    zIndex: 999,
    cursor: 'pointer',
    borderRadius: side === 'left' ? '0 8px 8px 0' : '8px 0 0 8px',
    background: `linear-gradient(
      to top,
      #1a0000 0%,
      #1a0000 ${100 - percentage}%,
      ${lightColor} ${100 - percentage}%,
      ${lightColor} 100%
    )`,
    boxShadow: `
      inset ${side === 'left' ? '3px' : '-3px'} 0 8px rgba(0, 0, 0, 0.6),
      0 0 20px ${lightColor}70,
      0 0 40px ${lightColor}30
    `,
  });

  const getGlowStyle = (side) => ({
    position: 'absolute',
    top: `${100 - percentage}%`,
    [side === 'left' ? 'right' : 'left']: '-12px',
    width: '34px',
    height: '100%',
    background: `radial-gradient(ellipse at center, ${lightColor}50, ${lightColor}20 40%, transparent 70%)`,
    animation: 'strongPulse 2s ease-in-out infinite',
    pointerEvents: 'none'
  });

  return (
    <>
      {/* Left Light Bar */}
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(true)}
        onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
        style={getBarStyle('left')}
      >
        <div style={getGlowStyle('left')} />
        {isCritical && (
          <div
            style={{
              position: 'absolute',
              top: `${100 - percentage}%`,
              right: '-3px',
              width: '12px',
              height: '30px',
              background: 'radial-gradient(ellipse, rgba(239, 68, 68, 0.8), transparent)',
              animation: 'criticalPulse 1.5s ease-in-out infinite',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {/* Right Light Bar */}
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(true)}
        onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
        style={getBarStyle('right')}
      >
        <div style={getGlowStyle('right')} />
        {isCritical && (
          <div
            style={{
              position: 'absolute',
              top: `${100 - percentage}%`,
              left: '-3px',
              width: '12px',
              height: '30px',
              background: 'radial-gradient(ellipse, rgba(239, 68, 68, 0.8), transparent)',
              animation: 'criticalPulse 1.5s ease-in-out infinite',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      {/* Hover/Tap Tooltip - Centered */}
      {showTooltip && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',                                // ✅ Zentriert horizontal
            transform: 'translate(-50%, -50%)',         // ✅ Perfect centering
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: `2px solid ${lightColor}`,
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 20px ${lightColor}40`,
            zIndex: 1000,
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: lightColor,
            textAlign: 'center',
            marginBottom: '4px',
            textShadow: `0 0 10px ${lightColor}`
          }}>
            💡 {light}/{maxLight}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#d1d5db',
            textAlign: 'center',
            marginBottom: '6px'
          }}>
            Runde {round}
          </div>
          <div style={{
            fontSize: '11px',
            fontWeight: 'bold',
            color: lightColor,
            textAlign: 'center'
          }}>
            {percentage > 66 && '✨ Licht strahlt hell'}
            {percentage <= 66 && percentage > 33 && '⚠️ Licht schwindet'}
            {percentage <= 33 && '🔥 KRITISCH!'}
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes strongPulse {
          0%, 100% {
            opacity: 0.4;
            transform: scaleX(0.8);
          }
          50% {
            opacity: 0.9;
            transform: scaleX(1.3);
          }
        }

        @keyframes criticalPulse {
          0%, 100% {
            opacity: 0.6;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-5px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default VerticalLightMeter;
