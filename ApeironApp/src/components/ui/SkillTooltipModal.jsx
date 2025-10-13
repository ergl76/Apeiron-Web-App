import React from 'react';
import { createPortal } from 'react-dom';

/**
 * SkillTooltipModal - Displays detailed skill/knowledge information
 *
 * Features:
 * - Glassmorphism design (blur backdrop, transparent)
 * - Mobile-first responsive
 * - Category-based border colors (gold for abilities, purple for knowledge)
 * - Markdown-style text formatting (bold, line breaks)
 * - Scrollable content with max-height
 * - Close on backdrop or X button
 * - Renders via React Portal (outside PlayerCard DOM hierarchy)
 *
 * @param {Object} skillData - Skill data from skillDescriptions.json
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Close handler
 */
const SkillTooltipModal = ({ skillData, isOpen, onClose }) => {
  if (!isOpen || !skillData) return null;

  const borderColor = skillData.category === 'ability' ? '#fbbf24' : '#a78bfa';
  const accentColor = skillData.category === 'ability' ? '#fbbf24' : '#a78bfa';

  // Helper: Parse markdown-style formatting (**bold**, \n\n for paragraphs)
  const formatText = (text) => {
    if (!text) return null;

    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      // Split paragraph by single newlines
      const lines = para.split('\n');

      return (
        <div key={pIdx} style={{ marginBottom: pIdx < paragraphs.length - 1 ? '12px' : '0' }}>
          {lines.map((line, lIdx) => {
            // Parse bold text (**text**)
            const parts = line.split(/(\*\*[^*]+\*\*)/g);

            return (
              <div key={lIdx} style={{ marginBottom: lIdx < lines.length - 1 ? '6px' : '0' }}>
                {parts.map((part, partIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={partIdx} style={{ color: accentColor }}>
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return <span key={partIdx}>{part}</span>;
                })}
              </div>
            );
          })}
        </div>
      );
    });
  };

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    animation: 'fadeIn 0.2s ease-out'
  };

  const modalCardStyle = {
    backgroundColor: '#1f2937',
    border: `3px solid ${borderColor}`,
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '78vh',
    overflowY: 'auto',
    boxShadow: `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px ${borderColor}40`,
    animation: 'fadeSlideIn 0.3s ease-out',
    position: 'relative'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    position: 'relative'
  };

  const iconStyle = {
    fontSize: '2rem',
    lineHeight: 1,
    flexShrink: 0
  };

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
    flex: 1
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#374151',
    border: '2px solid #6b7280',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    lineHeight: 1,
    padding: 0
  };

  const costBadgeStyle = {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    border: '2px solid #fbbf24',
    borderRadius: '8px',
    padding: '8px 16px',
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    marginBottom: '16px',
    display: 'inline-block'
  };

  const prereqBoxStyle = {
    backgroundColor: '#374151',
    border: `4px solid transparent`,
    borderLeftColor: accentColor,
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px'
  };

  const prereqTitleStyle = {
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: '8px'
  };

  const prereqListStyle = {
    margin: 0,
    paddingLeft: '20px',
    listStyle: 'none'
  };

  const prereqItemStyle = {
    fontSize: '0.875rem',
    color: '#d1d5db',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px'
  };

  const descriptionStyle = {
    color: '#d1d5db',
    fontSize: '0.9375rem',
    lineHeight: '1.6',
    marginBottom: '16px'
  };

  const whyBoxStyle = {
    backgroundColor: '#374151',
    border: `4px solid transparent`,
    borderLeftColor: accentColor,
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px'
  };

  const whyTitleStyle = {
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: accentColor,
    marginBottom: '8px'
  };

  const whyContentStyle = {
    fontSize: '0.875rem',
    color: '#d1d5db',
    lineHeight: '1.5'
  };

  const usageBoxStyle = {
    backgroundColor: '#2d3748',
    border: `2px solid ${accentColor}40`,
    borderRadius: '8px',
    padding: '12px 16px'
  };

  const usageTitleStyle = {
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: accentColor,
    marginBottom: '10px'
  };

  const usageContentStyle = {
    fontSize: '0.8125rem',
    color: '#d1d5db',
    lineHeight: '1.6',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  };

  // Render modal via Portal (outside of PlayerCard DOM hierarchy)
  const modalContent = (
    <>
      <div style={backdropStyle} onClick={onClose}>
        <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={headerStyle}>
            <span style={iconStyle}>{skillData.icon}</span>
            <h2 style={titleStyle}>{skillData.name}</h2>
            <button
              onClick={onClose}
              style={closeButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4b5563';
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.borderColor = '#6b7280';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>
          </div>

          {/* Cost Badge */}
          <div style={costBadgeStyle}>
            ⚡ {skillData.cost}
          </div>

          {/* Prerequisites */}
          <div style={prereqBoxStyle}>
            <div style={prereqTitleStyle}>📋 Voraussetzungen:</div>
            <ul style={prereqListStyle}>
              {skillData.prerequisites.map((prereq, idx) => (
                <li key={idx} style={prereqItemStyle}>
                  <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                  <span>{prereq}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Description */}
          <p style={descriptionStyle}>
            {skillData.description}
          </p>

          {/* Why Important */}
          <div style={whyBoxStyle}>
            <div style={whyTitleStyle}>💡 Warum wichtig:</div>
            <div style={whyContentStyle}>
              {skillData.why}
            </div>
          </div>

          {/* Usage Instructions */}
          <div style={usageBoxStyle}>
            <div style={usageTitleStyle}>🎮 Verwendung:</div>
            <div style={usageContentStyle}>
              {formatText(skillData.usage)}
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Custom scrollbar for modal content */
        div[style*="overflowY: auto"]::-webkit-scrollbar {
          width: 8px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
          background: ${accentColor};
          border-radius: 4px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
          background: ${accentColor}dd;
        }
      `}</style>
    </>
  );

  // Use React Portal to render outside of parent component's DOM
  return createPortal(modalContent, document.body);
};

export default SkillTooltipModal;
