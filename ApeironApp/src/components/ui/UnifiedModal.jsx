import React from 'react';

/**
 * UnifiedModal - Shared Modal Component mit konsistentem Design
 *
 * Mobile-First mit automatischem Theme-Switching basierend auf type
 *
 * Features:
 * - Responsive Design (Mobile < 640px, Desktop ≥ 640px)
 * - Touch-optimierte Buttons (min 44px height)
 * - maxHeight: 90vh + overflowY: auto für lange Inhalte
 * - Safe Area Padding für Mobile (16px outer container)
 */

const UnifiedModal = ({
  type,
  show,
  title,
  subtitle,
  icon,
  children,
  onClose,
  customTheme
}) => {
  if (!show) return null;

  // Theme-Definitionen für alle Modal-Typen
  const themes = {
    success: {
      border: '3px solid #fbbf24',
      background: 'linear-gradient(135deg, #b45309, #d97706)',
      boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)',
      color: '#fff7ed',
      iconColor: '#fbbf24'
    },
    victory: {
      border: '3px solid #10b981',
      background: 'linear-gradient(135deg, #064e3b, #065f46, #047857)',
      boxShadow: '0 0 80px rgba(16, 185, 129, 0.6)',
      color: '#d1fae5',
      iconColor: '#10b981'
    },
    defeat: {
      border: '3px solid #dc2626',
      background: 'linear-gradient(135deg, #0f0f0f, #1a0000, #000000)',
      boxShadow: '0 0 80px rgba(220, 38, 38, 0.6)',
      color: '#fecaca',
      iconColor: '#dc2626'
    },
    positiveEvent: {
      border: '2px solid #059669',
      background: 'linear-gradient(135deg, #064e3b, #065f46)',
      boxShadow: '0 0 20px rgba(5, 150, 105, 0.25)',
      color: '#d1fae5',
      iconColor: '#059669'
    },
    negativeEvent: {
      border: '2px solid #dc2626',
      background: 'linear-gradient(135deg, #450a0a, #7f1d1d)',
      boxShadow: '0 0 20px rgba(220, 38, 38, 0.25)',
      color: '#fecaca',
      iconColor: '#dc2626'
    },
    directionCard: {
      border: '3px solid #3b82f6',
      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
      color: '#dbeafe',
      iconColor: '#3b82f6'
    },
    heroCard: {
      border: '3px solid #b45309',
      background: 'linear-gradient(135deg, #92400e, #b45309)',
      boxShadow: '0 0 20px rgba(180, 83, 9, 0.3)',
      color: '#fff7ed',
      iconColor: '#fbbf24'
    },
    torDerWeisheit: {
      border: '3px solid #d1d5db',
      background: 'linear-gradient(135deg, #f9fafb, #e5e7eb)',
      boxShadow: '0 0 40px rgba(255, 255, 255, 0.4)',
      color: '#1f2937', // Dunkelgrau für Lesbarkeit
      iconColor: '#9ca3af'
    },
    herzDerFinsternis: {
      border: '3px solid #dc2626',
      background: 'linear-gradient(135deg, #0f0f0f, #1a0000, #000000)',
      boxShadow: '0 0 80px rgba(220, 38, 38, 0.6)',
      color: '#fecaca',
      iconColor: '#dc2626'
    }
  };

  const theme = customTheme || themes[type];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Responsive Typography
  const fontSize = {
    title: isMobile ? '1.75rem' : '2.5rem',
    subtitle: isMobile ? '1rem' : '1.3rem',
    body: isMobile ? '0.875rem' : '1rem',
    button: isMobile ? '1rem' : '1.1rem'
  };

  // Outer Container (Backdrop)
  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '16px' // Mobile safe area
  };

  // Inner Container (Modal)
  const modalStyle = {
    maxWidth: type === 'heroCard' || type === 'directionCard' ? '400px' : '600px',
    width: 'calc(100% - 32px)',
    maxHeight: '90vh', // KRITISCH für Mobile!
    overflowY: 'auto', // IMMER scrollbar
    borderRadius: '16px',
    padding: isMobile ? '24px' : '32px',
    border: theme.border,
    background: theme.background,
    boxShadow: theme.boxShadow,
    color: theme.color,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    animation: 'modalFadeIn 0.3s ease-out'
  };

  // Header Style
  const headerStyle = {
    textAlign: 'center',
    marginBottom: '24px'
  };

  const iconStyle = {
    fontSize: '4rem',
    marginBottom: '16px',
    display: icon ? 'block' : 'none',
    filter: type === 'torDerWeisheit' ? 'none' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
  };

  const titleStyle = {
    fontSize: fontSize.title,
    fontWeight: 'bold',
    marginBottom: subtitle ? '8px' : '0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textShadow: type === 'torDerWeisheit' ? 'none' : '0 2px 4px rgba(0,0,0,0.3)'
  };

  const subtitleStyle = {
    fontSize: fontSize.subtitle,
    opacity: 0.9,
    fontStyle: 'italic',
    display: subtitle ? 'block' : 'none'
  };

  // Content Style
  const contentStyle = {
    fontSize: fontSize.body,
    lineHeight: '1.6'
  };

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          {icon && <div style={iconStyle}>{icon}</div>}
          <h2 style={titleStyle}>{title}</h2>
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        </div>

        <div style={contentStyle}>
          {children}
        </div>

        {onClose && (
          <div style={{
            marginTop: '24px',
            textAlign: 'center'
          }}>
            <button
              onClick={onClose}
              style={{
                minHeight: '44px',
                padding: '12px 24px',
                fontSize: fontSize.button,
                fontWeight: 'bold',
                color: theme.color,
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: `2px solid ${theme.iconColor}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0,0,0,0.5)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(0,0,0,0.3)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Schließen
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default UnifiedModal;
