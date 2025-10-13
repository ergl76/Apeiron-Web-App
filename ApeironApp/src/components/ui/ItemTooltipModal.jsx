import React from 'react';
import { createPortal } from 'react-dom';

/**
 * ItemTooltipModal - Simple tooltip for inventory items
 *
 * Features:
 * - Shows item name on click
 * - Mobile-friendly (no hover required)
 * - Small, unobtrusive design
 * - Renders via Portal (outside PlayerCard)
 *
 * @param {string} itemName - Name of the item
 * @param {string} itemIcon - Emoji icon of the item
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Close handler
 */
const ItemTooltipModal = ({ itemName, itemIcon, isOpen, onClose }) => {
  if (!isOpen || !itemName) return null;

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    animation: 'fadeIn 0.15s ease-out'
  };

  const tooltipStyle = {
    backgroundColor: '#1f2937',
    border: '2px solid #fbbf24',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(251, 191, 36, 0.3)',
    animation: 'fadeSlideIn 0.2s ease-out',
    maxWidth: '300px',
    textAlign: 'center'
  };

  const iconStyle = {
    fontSize: '2.5rem',
    marginBottom: '8px',
    display: 'block'
  };

  const nameStyle = {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  };

  const modalContent = (
    <>
      <div style={backdropStyle} onClick={onClose}>
        <div style={tooltipStyle} onClick={(e) => e.stopPropagation()}>
          <span style={iconStyle}>{itemIcon}</span>
          <p style={nameStyle}>{itemName}</p>
        </div>
      </div>

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
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default ItemTooltipModal;
