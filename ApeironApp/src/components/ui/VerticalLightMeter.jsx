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

  // Mystisch-epische Farbpalette: Vom Licht zur weinroten Finsternis
  const getGradientColors = (pct) => {
    if (pct >= 80) {
      // Strahlende Hoffnung 🌟 - Reines weißes Licht
      return {
        top: '#ffffff',
        bottom: '#f8f8f8',
        glow: '#ffffff',        // Weißer Glow
        opacity: 1.0
      };
    } else if (pct >= 65) {
      // Schwindende Hoffnung 🌤️ - Warmes Dämmerlicht
      return {
        top: '#f8f8f8',
        bottom: '#f0e6d2',
        glow: '#fff5cc',        // Warmes Goldgelb
        opacity: 1.0
      };
    } else if (pct >= 50) {
      // Zwielicht 🌆 - Erste Blutnote
      return {
        top: '#f0e6d2',
        bottom: '#b8a8a8',
        glow: '#d4a5a5',        // Rosa-Grau (Blut beginnt)
        opacity: 0.95
      };
    } else if (pct >= 35) {
      // Erste Blutschatten 🩸 - Kräftiges Blutrot
      return {
        top: '#b8a8a8',
        bottom: '#6b2c2c',
        glow: '#a84444',        // Kräftiges Blutrot
        opacity: 0.9
      };
    } else if (pct >= 15) {
      // Todeshauch 💀 - Intensives Blutrot
      return {
        top: '#6b2c2c',
        bottom: '#3d0a0a',
        glow: '#8b2020',        // Intensives dunkles Blutrot
        opacity: 0.95
      };
    } else {
      // Letzter Herzschlag ⚰️ - Leuchtendes Blutrot
      return {
        top: '#3d0a0a',
        bottom: '#1a0000',
        glow: '#cc0000',        // Leuchtendes pures Blutrot (maximale Intensität!)
        opacity: 1.0
      };
    }
  };

  const colors = getGradientColors(percentage);
  const lightColor = colors.glow; // For tooltip compatibility
  const isCritical = percentage <= 33;

  // Shared bar style generator - always full height, color changes
  const getBarStyle = (side) => {
    // Finsternis "frisst" das Licht ab 50% - wachsende dunkle Inner-Shadow
    const darknessIntensity = percentage < 50 ? (50 - percentage) / 50 : 0; // 0.0 bis 1.0
    const darknessSize = 20 + (darknessIntensity * 20); // 20px → 40px

    // Bei Weinrot (<35%): Zusätzlicher roter Inner-Glow für "glühenden" Effekt
    const redGlow = percentage < 35 ? `inset 0 0 ${10 + (35 - percentage)}px ${colors.glow}40,` : '';

    return {
      position: 'fixed',
      top: 0,
      [side]: 0,                              // Dynamic: left or right
      width: '9px',                           // ✅ Schmäler: 9px
      height: '100vh',                        // Always full height
      zIndex: 999,
      cursor: 'pointer',
      borderRadius: side === 'left' ? '0 6px 6px 0' : '6px 0 0 6px',
      background: `linear-gradient(
        to bottom,
        ${colors.top},
        ${colors.bottom}
      )`,
      opacity: colors.opacity,
      boxShadow: `
        inset ${side === 'left' ? '3px' : '-3px'} 0 8px rgba(0, 0, 0, 0.6),
        ${redGlow}
        inset 0 0 ${darknessSize}px rgba(0, 0, 0, ${darknessIntensity * 0.8}),
        0 0 40px ${colors.glow}C0,
        0 0 70px ${colors.glow}90,
        0 0 110px ${colors.glow}50,
        0 0 140px ${colors.glow}20
      `,
      transition: 'background 0.5s ease, opacity 0.5s ease, box-shadow 0.5s ease'
    };
  };

  // Heartbeat animation based on light level - starts at 50%
  const getHeartbeatAnimation = (pct) => {
    if (pct >= 50) {
      return 'strongPulse 2s ease-in-out infinite'; // Normal slow pulse
    } else if (pct >= 30) {
      return 'heartbeat 1.8s ease-in-out infinite'; // Beginning heartbeat
    } else if (pct >= 20) {
      return 'heartbeat 1.4s ease-in-out infinite'; // Faster heartbeat
    } else if (pct >= 10) {
      return 'heartbeat 1s ease-in-out infinite'; // Very fast heartbeat
    } else {
      return 'heartbeat 0.7s ease-in-out infinite'; // Panic heartbeat
    }
  };

  const getGlowStyle = (side) => {
    // Gradueller, stetiger Anstieg von 100% → 0%
    // Width: 40px (bei 100%) → 120px (bei 0%)
    const glowWidth = 40 + ((100 - percentage) * 0.8); // Linear: +0.8px pro 1% Light-Verlust

    // Offset: -15px (bei 100%) → -55px (bei 0%)
    const glowOffset = -15 - ((100 - percentage) * 0.4); // Linear: -0.4px pro 1% Light-Verlust

    // Mystischer "Adern"-Gradient mit 8 Stufen für dramatischen Effekt
    // Opacity-Werte: schwach (bei 100%) → maximal FF (bei 0%)
    const intensity1 = Math.min(255, 40 + ((100 - percentage) * 2.15)).toString(16).padStart(2, '0').toUpperCase();
    const intensity2 = Math.min(240, 30 + ((100 - percentage) * 2.1)).toString(16).padStart(2, '0').toUpperCase();
    const intensity3 = Math.min(208, 20 + ((100 - percentage) * 1.88)).toString(16).padStart(2, '0').toUpperCase();
    const intensity4 = Math.min(160, 15 + ((100 - percentage) * 1.45)).toString(16).padStart(2, '0').toUpperCase();
    const intensity5 = Math.min(96, 10 + ((100 - percentage) * 0.86)).toString(16).padStart(2, '0').toUpperCase();
    const intensity6 = Math.min(48, 5 + ((100 - percentage) * 0.43)).toString(16).padStart(2, '0').toUpperCase();
    const intensity7 = Math.min(16, 2 + ((100 - percentage) * 0.14)).toString(16).padStart(2, '0').toUpperCase();

    // Längliche Ellipse wie pulsierend Adern (120% × 100%)
    const glowIntensity = `radial-gradient(
      ellipse 120% 100% at center,
      ${colors.glow}${intensity1} 0%,
      ${colors.glow}${intensity2} 15%,
      ${colors.glow}${intensity3} 30%,
      ${colors.glow}${intensity4} 45%,
      ${colors.glow}${intensity5} 60%,
      ${colors.glow}${intensity6} 75%,
      ${colors.glow}${intensity7} 88%,
      transparent 100%
    )`;

    return {
      position: 'absolute',
      top: 0,
      [side === 'left' ? 'right' : 'left']: `${glowOffset}px`,
      width: `${glowWidth}px`,
      height: '100%',
      background: glowIntensity,
      animation: getHeartbeatAnimation(percentage),
      pointerEvents: 'none',
      opacity: colors.opacity,
      transition: 'width 0.3s ease, background 0.5s ease, opacity 0.5s ease'
    };
  };

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

        @keyframes heartbeat {
          0% {
            opacity: 0.5;
            transform: scaleX(1);
          }
          15% {
            opacity: 1;
            transform: scaleX(1.6);
          }
          30% {
            opacity: 0.6;
            transform: scaleX(1.1);
          }
          45% {
            opacity: 1;
            transform: scaleX(1.8);
          }
          60% {
            opacity: 0.5;
            transform: scaleX(1);
          }
          100% {
            opacity: 0.5;
            transform: scaleX(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default VerticalLightMeter;
