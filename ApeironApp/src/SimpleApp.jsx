import React from 'react';

function SimpleApp() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a202c', 
      color: '#e2e8f0',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          color: '#f59e0b', 
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          Apeiron
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#9ca3af' }}>
          Das Spiel wird geladen...
        </p>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#374151',
          borderRadius: '0.5rem',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <h2>✅ React App läuft!</h2>
          <p>Die Basic-App funktioniert. Jetzt können wir die Spiel-Features hinzufügen.</p>
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;