# Apeiron - Turmbau-Spiel

## Schnellstart für Produktions-Build

### 1. Build erstellen
```bash
cd ApeironApp
npm install
npm run build
```

### 2. Build testen
```bash
npm run preview
```
Besuchen Sie `http://localhost:4173/`

### 3. Deployment
Kopieren Sie den Inhalt des `dist/` Ordners auf Ihren Webserver.

## Wichtige Webserver-Anforderungen

- **SPA-Routing:** Alle Anfragen müssen auf `index.html` umleiten
- **HTTPS:** Wird für den produktiven Einsatz dringend empfohlen
- **Statische Dateien:** CSS, JS und Assets müssen korrekt ausgeliefert werden

## Build-Größe

- **Gesamt:** ~444 kB
- **Gzipped:** ~121 kB
- **Hauptdateien:**
  - `index.html` (0.63 kB)
  - `index-BWYaz9El.css` (5.77 kB)
  - `index-Cd2oJRMi.js` (437.53 kB)

## Browser-Unterstützung

- Chrome (neueste Version)
- Firefox (neueste Version)
- Safari (neueste Version)
- Edge (neueste Version)
- Mobile Browser (iOS Safari, Android Chrome)

## Hilfe bei Problemen

Siehe `docs/PRODUCTION_BUILD.md` für detaillierte Anleitungen und Fehlersuchhinweise.

---

**Version:** 1.0.0  
**Letztes Update:** 2025-10-15