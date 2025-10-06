import React from 'react';

/**
 * ActionPanel - Aktionsbereich für den aktiven Spieler
 *
 * Zeigt alle verfügbaren Aktionen gruppiert nach Typ:
 * - Basis-Aktionen (Sammeln, Ablegen)
 * - Skill-Aktionen (Fundament, Element-Aktivierung, Spähen, Lernen)
 * - Hindernis-Aktionen (Geröll, Dornen, Finsternis entfernen)
 * - Spezial-Aktionen (Tor durchschreiten, Master lehren)
 *
 * WICHTIG: Diese Komponente ist ein Wrapper für die existierende renderActionButtons Funktion
 *          Vorerst wird die komplette Logik in ApeironGame.jsx belassen
 *
 * @param {Function} renderActionButtons - Die render-Funktion aus ApeironGame.jsx
 */
const ActionPanel = ({ renderActionButtons }) => {
  return (
    <div style={{
      backgroundColor: '#1f2937',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      border: '2px solid #374151'
    }}>
      {/* Header */}
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#fbbf24',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        ⚡ Aktionen
      </h3>

      {/* Action Buttons Container */}
      <div>
        {renderActionButtons()}
      </div>
    </div>
  );
};

export default ActionPanel;
