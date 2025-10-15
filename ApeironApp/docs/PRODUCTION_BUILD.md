# Apeiron - Produktions-Build Anleitung

## Übersicht

Diese Dokumentation beschreibt, wie man einen produktionsfähigen Build der Apeiron Web App erstellt und welche Voraussetzungen der Webserver erfüllen muss.

## Build-Prozess

### 1. Voraussetzungen

- Node.js (Version 18 oder höher)
- npm oder yarn
- Git

### 2. Installation der Abhängigkeiten

```bash
cd ApeironApp
npm install
```

### 3. Build ausführen

Für den Produktions-Build stehen zwei Optionen zur Verfügung:

#### Option A: Build ohne TypeScript-Überprüfung (empfohlen)
```bash
npm run build
```

#### Option B: Build mit TypeScript-Überprüfung
```bash
npm run build-ts
```

### 4. Build-Ergebnisse

Nach erfolgreichem Build werden die folgenden Dateien im `dist/` Verzeichnis erstellt:

```
dist/
├── index.html                 (0.63 kB)
├── vite.svg                   (Icon)
└── assets/
    ├── index-BWYaz9El.css     (5.77 kB)
    └── index-Cd2oJRMi.js      (437.53 kB)
```

**Gesamtgröße:** ~444 kB (gzipped: ~121 kB)

### 5. Build testen

```bash
npm run preview
```

Startet einen lokalen Server auf `http://localhost:4173/` zum Testen des Produktions-Builds.

## Webserver-Anforderungen

### 1. Grundlegende Anforderungen

#### Statische Dateien ausliefern
Der Webserver muss in der Lage sein, statische Dateien aus dem `dist/` Verzeichnis auszuliefern.

#### SPA-Routing (Single Page Application)
Da Apeiron eine Single Page Application ist, muss der Server so konfiguriert sein, dass alle Anfragen auf die `index.html` umgeleitet werden, außer für statische Assets.

### 2. Konfiguration für verschiedene Webserver

#### Apache HTTP Server
```apache
<VirtualHost *:80>
    DocumentRoot /path/to/apeiron/dist
    ServerName your-domain.com
    
    # SPA-Routing
    <Directory "/path/to/apeiron/dist">
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

#### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/apeiron/dist;
    index index.html;

    # SPA-Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip-Kompression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Node.js mit Express
```javascript
const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();

// SPA-Routing
app.use(history());
app.use(express.static(path.join(__dirname, 'dist')));

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

#### Vercel (vercel.json)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Netlify (_redirects file)
```
/*    /index.html   200
```

### 3. Sicherheitsanforderungen

#### HTTPS
Für den produktiven Einsatz wird dringend HTTPS empfohlen.

#### Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;">
```

#### X-Frame-Options
```html
<meta http-equiv="X-Frame-Options" content="DENY">
```

### 4. Performance-Optimierungen

#### Gzip-Kompression
Aktivieren Sie Gzip-Kompression auf dem Server, um die Übertragungsgröße zu reduzieren.

#### Caching
Konfigurieren Sie appropriate Caching-Header für statische Assets:
```
Cache-Control: public, max-age=31536000
```

#### CDN
Verwenden Sie ein CDN für die Auslieferung statischer Assets bei hohem Traffic.

## Deployment-Checkliste

### Vor dem Deployment
- [ ] Build mit `npm run build` erfolgreich durchführen
- [ ] Build mit `npm run preview` lokal testen
- [ ] Alle Spielmechanismen testen
- [ ] Mobile Responsiveness überprüfen
- [ ] Performance mit Lighthouse analysieren

### Nach dem Deployment
- [ ] Webseite ist über HTTPS erreichbar
- [ ] Alle Routen funktionieren korrekt
- [ ] 404-Fehler werden korrekt behandelt
- [ ] Ladezeiten sind akzeptabel (< 3 Sekunden)
- [ ] Spiel funktioniert auf mobilen Geräten
- [ ] Konsolenfehler überprüfen

## Fehlersuche

### Häufige Probleme

#### 404-Fehler bei direkten URLs
**Problem:** Direkte URLs wie `your-domain.com/game` zeigen 404-Fehler
**Lösung:** SPA-Routing auf dem Server konfigurieren (siehe oben)

#### Weiße Seite nach Deployment
**Problem:** Die Seite lädt, bleibt aber weiß
**Lösung:** 
1. Browser-Konsole auf Fehler überprüfen
2. Pfad zu statischen Assets überprüfen
3. Server-Logs auf 404-Fehler prüfen

#### Styles werden nicht geladen
**Problem:** Die Seite wird ohne CSS-Styling angezeigt
**Lösung:** Pfad zur CSS-Datei in der index.html überprüfen

#### Spiel funktioniert nicht auf mobilen Geräten
**Problem:** Touch-Gesten funktionieren nicht
**Lösung:** Viewport-Meta-Tag korrekt konfigurieren:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

## Monitoring

### Wichtige Metriken
- Ladezeit der Startseite
- Time to Interactive (TTI)
- Fehlerquote in der Konsole
- Mobile Performance

### Tools
- Google PageSpeed Insights
- GTmetrix
- Chrome DevTools
- Web Vitals Extension

## Support

Bei Problemen mit dem Deployment:
1. Server-Logs überprüfen
2. Browser-Konsole auf Fehler prüfen
3. Netzwerk-Tab auf fehlgeschlagene Anfragen prüfen
4. Diese Dokumentation konsultieren

---

**Hinweis:** Diese Dokumentation bezieht sich auf die aktuelle Version der Apeiron Web App. Bei Updates der Anwendung können sich die Anforderungen ändern.