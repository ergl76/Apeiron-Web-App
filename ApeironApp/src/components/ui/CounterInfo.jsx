import React from 'react';

/**
 * CounterInfo - Integrierte Konter-Informationen für Events
 *
 * Zeigt mögliche Konter-Strategien als natürlichen Story-Text an:
 * - Hero-Icon visuell integriert
 * - Fähigkeits-Name als hervorgehobenes Badge
 * - Markdown Bold Support (**text** → <strong>)
 * - Fließt natürlich in die Event-Story ein
 *
 * Design: Blau-grünes Theme (positiv, Lösung)
 */

const CounterInfo = ({ possible, text, heroIcon, abilityName }) => {
  // Kein Konter verfügbar → nichts anzeigen
  if (!possible || !text) {
    return null;
  }

  // Markdown Bold zu <strong> konvertieren
  // Beispiel: "Terra kann das Hindernis mit ihrer Fähigkeit **Geröll beseitigen** entfernen."
  // → "Terra kann das Hindernis mit ihrer Fähigkeit <strong>Geröll beseitigen</strong> entfernen."
  const renderTextWithBold = (rawText) => {
    const parts = rawText.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold-Text extrahieren
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} style={{
            color: '#10b981',
            fontWeight: 'bold'
          }}>
            {boldText}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      padding: '14px 18px',
      backgroundColor: 'rgba(5, 150, 105, 0.12)',
      border: '2px solid #059669',
      borderRadius: '12px',
      marginTop: '12px',
      boxShadow: '0 0 10px rgba(5, 150, 105, 0.2)'
    }}>
      {/* Hero Icon (falls vorhanden) */}
      {heroIcon && (
        <div style={{
          fontSize: '1.8rem',
          lineHeight: 1,
          flexShrink: 0,
          marginTop: '2px'
        }}>
          {heroIcon}
        </div>
      )}

      {/* Content Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Konter-Text mit Markdown Bold Support */}
        <div style={{
          fontSize: '0.9rem',
          color: '#d1fae5',
          lineHeight: 1.5
        }}>
          {renderTextWithBold(text)}
        </div>

        {/* Fähigkeits-Badge (falls vorhanden) */}
        {abilityName && (
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#059669',
            padding: '5px 12px',
            borderRadius: '6px',
            display: 'inline-block',
            alignSelf: 'flex-start',
            border: '1px solid #10b981',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            🛡️ {abilityName}
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterInfo;
