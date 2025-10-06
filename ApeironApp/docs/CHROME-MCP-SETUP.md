# 🧪 Chrome DevTools MCP - Automatisiertes Testing Setup für Claude Code

**Universelle Anleitung zur Installation und Konfiguration von Chrome DevTools MCP für vollautomatisierte Browser-Tests in Claude Code (VS Code Extension)**

---

## 📋 Voraussetzungen

- ✅ **VS Code** installiert
- ✅ **Claude Code Extension** installiert und aktiviert
- ✅ **Node.js** v20.19 oder neuer (LTS)
- ✅ **Chrome Browser** (stabile Version oder neuer)
- ✅ **Dev Server** läuft (z.B. `npm run dev` auf http://localhost:5173)

---

## 🚀 Installation (5 Minuten)

### Schritt 1: Chrome DevTools MCP Server installieren

Öffne ein Terminal und führe aus:

```bash
claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest
```

**Was passiert:**
- Installiert Chrome DevTools MCP Server in deinem **User-Scope** (global für alle Projekte)
- Konfiguriert `~/.claude.json` automatisch
- Server wird als `chrome-devtools` registriert

**Verifikation:**
```bash
claude mcp list
```

**Erwartete Ausgabe:**
```
Checking MCP server health...

chrome-devtools: npx -y chrome-devtools-mcp@latest - ✓ Connected
```

---

### Schritt 2: Project Permissions konfigurieren

Erstelle (oder editiere) die Datei `.claude/settings.local.json` **im Root deines Projekts**:

```json
{
  "permissions": {
    "allow": [
      "mcp__chrome-devtools__navigate_page",
      "mcp__chrome-devtools__new_page",
      "mcp__chrome-devtools__close_page",
      "mcp__chrome-devtools__select_page",
      "mcp__chrome-devtools__list_pages",
      "mcp__chrome-devtools__navigate_page_history",
      "mcp__chrome-devtools__resize_page",
      "mcp__chrome-devtools__wait_for",
      "mcp__chrome-devtools__click",
      "mcp__chrome-devtools__fill",
      "mcp__chrome-devtools__fill_form",
      "mcp__chrome-devtools__hover",
      "mcp__chrome-devtools__drag",
      "mcp__chrome-devtools__upload_file",
      "mcp__chrome-devtools__handle_dialog",
      "mcp__chrome-devtools__take_screenshot",
      "mcp__chrome-devtools__take_snapshot",
      "mcp__chrome-devtools__evaluate_script",
      "mcp__chrome-devtools__list_console_messages",
      "mcp__chrome-devtools__list_network_requests",
      "mcp__chrome-devtools__get_network_request",
      "mcp__chrome-devtools__performance_start_trace",
      "mcp__chrome-devtools__performance_stop_trace",
      "mcp__chrome-devtools__performance_analyze_insight",
      "mcp__chrome-devtools__emulate_cpu",
      "mcp__chrome-devtools__emulate_network"
    ],
    "deny": [],
    "ask": []
  },
  "enableAllProjectMcpServers": true
}
```

**⚠️ WICHTIG:**
- ❌ **Wildcards funktionieren NICHT!** `"mcp__chrome-devtools__*"` wird NICHT unterstützt
- ✅ Alle 26 Tools müssen **einzeln** gelistet werden
- ✅ `"enableAllProjectMcpServers": true` ist **außerhalb** des `permissions`-Objekts
- ✅ Diese Datei ist **projekt-spezifisch** (kann in `.gitignore` wenn private Permissions)

**Schnell-Copy Template:**
```bash
# Erstelle .claude Ordner falls nicht vorhanden
mkdir -p .claude

# Erstelle settings.local.json mit allen 26 Chrome Tools
cat > .claude/settings.local.json << 'EOF'
{
  "permissions": {
    "allow": [
      "mcp__chrome-devtools__navigate_page",
      "mcp__chrome-devtools__new_page",
      "mcp__chrome-devtools__close_page",
      "mcp__chrome-devtools__select_page",
      "mcp__chrome-devtools__list_pages",
      "mcp__chrome-devtools__navigate_page_history",
      "mcp__chrome-devtools__resize_page",
      "mcp__chrome-devtools__wait_for",
      "mcp__chrome-devtools__click",
      "mcp__chrome-devtools__fill",
      "mcp__chrome-devtools__fill_form",
      "mcp__chrome-devtools__hover",
      "mcp__chrome-devtools__drag",
      "mcp__chrome-devtools__upload_file",
      "mcp__chrome-devtools__handle_dialog",
      "mcp__chrome-devtools__take_screenshot",
      "mcp__chrome-devtools__take_snapshot",
      "mcp__chrome-devtools__evaluate_script",
      "mcp__chrome-devtools__list_console_messages",
      "mcp__chrome-devtools__list_network_requests",
      "mcp__chrome-devtools__get_network_request",
      "mcp__chrome-devtools__performance_start_trace",
      "mcp__chrome-devtools__performance_stop_trace",
      "mcp__chrome-devtools__performance_analyze_insight",
      "mcp__chrome-devtools__emulate_cpu",
      "mcp__chrome-devtools__emulate_network"
    ],
    "deny": [],
    "ask": []
  },
  "enableAllProjectMcpServers": true
}
EOF
```

---

### Schritt 3: VS Code Window Reload

**Kritisch:** Die Permissions werden erst nach einem Window Reload aktiv!

```
1. Command Palette öffnen: Cmd+Shift+P (macOS) oder Ctrl+Shift+P (Windows/Linux)
2. Eingeben: "Developer: Reload Window"
3. Enter drücken
```

**Alternative:** VS Code komplett schließen und neu öffnen

---

## ✅ Verifikation - Funktioniert es?

Öffne Claude Code Chat und schreibe:

```
Bitte navigiere zu http://localhost:5173 und mache einen Screenshot
```

**Erwartetes Verhalten:**
- ✅ **KEINE Rückfragen** für Tool-Approval
- ✅ Browser öffnet automatisch
- ✅ Screenshot wird gemacht
- ✅ Bild wird im Chat angezeigt

**Falls du Rückfragen bekommst:**
1. Prüfe ob `.claude/settings.local.json` korrekt erstellt wurde
2. Prüfe ob alle 26 Tools in der `allow`-Liste sind
3. Prüfe ob `"enableAllProjectMcpServers": true` vorhanden ist
4. **Window Reload** durchführen

---

## 📊 Verfügbare Chrome MCP Tools (26 Tools)

### Navigation & Lifecycle (7 Tools)
| Tool | Beschreibung |
|------|--------------|
| `navigate_page` | URL öffnen |
| `new_page` | Neuen Tab öffnen |
| `close_page` | Tab schließen |
| `select_page` | Tab auswählen |
| `list_pages` | Alle Tabs auflisten |
| `navigate_page_history` | Vor/Zurück navigieren |
| `wait_for` | Auf Text warten |

### UI-Interaktion (7 Tools)
| Tool | Beschreibung |
|------|--------------|
| `click` | Element klicken |
| `fill` | Input ausfüllen |
| `fill_form` | Mehrere Inputs gleichzeitig |
| `hover` | Über Element hovern |
| `drag` | Element ziehen |
| `upload_file` | Datei hochladen |
| `handle_dialog` | Browser-Dialog behandeln |

### Testing & Debugging (4 Tools)
| Tool | Beschreibung |
|------|--------------|
| `take_screenshot` | Screenshot machen |
| `take_snapshot` | DOM-Snapshot (Text) |
| `evaluate_script` | JavaScript ausführen |
| `list_console_messages` | Console-Logs abrufen |

### Performance (3 Tools)
| Tool | Beschreibung |
|------|--------------|
| `performance_start_trace` | Performance-Trace starten |
| `performance_stop_trace` | Trace beenden |
| `performance_analyze_insight` | Core Web Vitals analysieren |

### Network (2 Tools)
| Tool | Beschreibung |
|------|--------------|
| `list_network_requests` | Alle Requests auflisten |
| `get_network_request` | Spezifischen Request holen |

### Emulation (3 Tools)
| Tool | Beschreibung |
|------|--------------|
| `resize_page` | Fenstergröße ändern |
| `emulate_network` | Netzwerk drosseln (3G, 4G) |
| `emulate_cpu` | CPU drosseln (1-20x slower) |

---

## 🎯 Beispiel-Test-Szenarien

### UI-Test mit Screenshot
```
Bitte navigiere zu http://localhost:5173,
klicke auf den "Start Game" Button und
mache einen Screenshot vom Spielfeld.
```

### Performance-Test
```
Starte einen Performance-Trace,
navigiere zu http://localhost:5173,
beende den Trace und analysiere die Core Web Vitals.
```

### Console-Fehler Check
```
Navigiere zu http://localhost:5173 und
liste alle Console-Messages auf.
Gibt es Errors?
```

### Responsive-Test
```
Resize die Seite auf 375x667 (iPhone SE),
navigiere zu http://localhost:5173 und
mache einen Screenshot.
```

---

## 🔧 Troubleshooting

### Problem: "Unknown tool: mcp__chrome-devtools__*"

**Ursache:** MCP Server nicht installiert oder nicht verbunden

**Lösung:**
```bash
claude mcp list  # Prüfen ob chrome-devtools gelistet ist
claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest
```

---

### Problem: "Tool use was rejected" - Rückfragen bei jedem Tool-Call

**Ursache 1:** `.claude/settings.local.json` fehlt oder ist fehlerhaft

**Lösung:**
```bash
# Prüfe ob Datei existiert
cat .claude/settings.local.json

# Prüfe ob alle 26 Tools gelistet sind
grep -c "mcp__chrome-devtools__" .claude/settings.local.json
# Sollte: 26 ausgeben
```

**Ursache 2:** Window Reload fehlt

**Lösung:**
- VS Code Window Reload durchführen (siehe Schritt 3)

**Ursache 3:** Wildcard `"mcp__chrome-devtools__*"` verwendet

**Lösung:**
- ❌ Wildcards funktionieren NICHT in Claude Code
- ✅ Alle 26 Tools einzeln auflisten (siehe Schritt 2)

---

### Problem: "enableAllProjectMcpServers" wird nicht erkannt

**Ursache:** Falsches JSON-Format oder falsche Position

**Lösung:**
```json
{
  "permissions": { ... },  // ← Komma!
  "enableAllProjectMcpServers": true  // ← Außerhalb von permissions!
}
```

---

### Problem: Browser öffnet nicht / weiße Seite

**Ursache:** Dev Server läuft nicht

**Lösung:**
```bash
# Terminal 1: Dev Server starten
npm run dev

# Terminal 2: Claude Code Testing
# Jetzt sollte http://localhost:5173 erreichbar sein
```

---

### Problem: "No such file or directory: .claude/settings.local.json"

**Ursache:** Ordner `.claude` existiert nicht

**Lösung:**
```bash
mkdir -p .claude
# Dann settings.local.json erstellen (siehe Schritt 2)
```

---

## 📁 Datei-Struktur nach Setup

```
your-project/
├── .claude/
│   └── settings.local.json    # ← Project Permissions (26 Chrome Tools)
├── src/
├── package.json
└── ...
```

**User-Scope Config (global für alle Projekte):**
```
~/.claude.json                  # ← MCP Server Config (automatisch erstellt)
```

---

## 🔒 Sicherheits-Hinweise

### .gitignore Empfehlung

Falls `.claude/settings.local.json` **private Permissions** enthält:

```bash
# .gitignore
.claude/settings.local.json
```

### Für Team-Projekte

Falls alle Team-Mitglieder dieselben Permissions nutzen sollen:

```bash
# .gitignore
# .claude/settings.local.json  # ← Nicht ignorieren
```

**Dann kann jeder im Team nach Clone:**
```bash
git clone <repo>
cd <repo>
claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest
# VS Code Reload
# Fertig! Chrome MCP funktioniert automatisch
```

---

## 🎓 Best Practices

### 1. Immer mit Dev Server testen
```bash
# Terminal 1: Dev Server laufen lassen
npm run dev

# Terminal 2: Claude Code für Testing verwenden
```

### 2. Screenshots für visuelle Regression
```
Mache Screenshots nach jedem Feature-Update
Vergleiche mit vorherigen Screenshots
```

### 3. Console-Check in jedem Test
```
Liste Console-Messages nach jeder Aktion auf
Stelle sicher: 0 Errors
```

### 4. Performance-Baselines definieren
```json
// gameRules.json oder separate config
{
  "performanceTargets": {
    "LCP": 2500,  // Largest Contentful Paint < 2.5s
    "TBT": 200,   // Total Blocking Time < 200ms
    "FCP": 1800   // First Contentful Paint < 1.8s
  }
}
```

### 5. Test-Szenarien dokumentieren
```markdown
## Standard-Tests

1. **Game Start Flow**
   - Navigate → Click Setup → Screenshot
   - Expected: Game starts, no console errors

2. **Feature XY**
   - Navigate → Interact → Validate
   - Expected: Feature works as designed
```

---

## 🚀 Erweiterte Konfiguration (Optional)

### Headless Mode (keine Browser-UI)

**~/.claude.json** editieren:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--headless"  // ← Neu
      ]
    }
  }
}
```

### Custom Chrome Binary

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--executablePath",
        "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
      ]
    }
  }
}
```

### Viewport Size

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--viewport",
        "1920x1080"
      ]
    }
  }
}
```

---

## 📚 Ressourcen

- **Chrome DevTools MCP Docs:** https://developer.chrome.com/blog/chrome-devtools-mcp
- **Tool Reference:** https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md
- **Claude Code Docs:** https://docs.claude.com/en/docs/claude-code
- **MCP Protocol:** https://modelcontextprotocol.io/

---

## ✅ Checkliste für neuen Rechner / neues Projekt

- [ ] Node.js v20+ installiert
- [ ] VS Code + Claude Code Extension installiert
- [ ] Chrome Browser installiert
- [ ] `claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest` ausgeführt
- [ ] `claude mcp list` zeigt "✓ Connected"
- [ ] `.claude/settings.local.json` erstellt mit allen 26 Tools
- [ ] `"enableAllProjectMcpServers": true` hinzugefügt
- [ ] VS Code Window Reload durchgeführt
- [ ] Verifikations-Test erfolgreich (Screenshot ohne Rückfrage)
- [ ] Dev Server läuft auf http://localhost:XXXX

---

**Version:** 1.0
**Letzte Aktualisierung:** 2025-10-05
**Getestet auf:** macOS 14.6, VS Code 1.95, Claude Code Extension
**Projekt:** Apeiron Web App (universell verwendbar)

---

## 💡 Quick Start (TL;DR)

```bash
# 1. MCP Server installieren
claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest

# 2. Project Config erstellen
mkdir -p .claude
cat > .claude/settings.local.json << 'EOF'
{
  "permissions": {
    "allow": [
      "mcp__chrome-devtools__navigate_page",
      "mcp__chrome-devtools__new_page",
      "mcp__chrome-devtools__close_page",
      "mcp__chrome-devtools__select_page",
      "mcp__chrome-devtools__list_pages",
      "mcp__chrome-devtools__navigate_page_history",
      "mcp__chrome-devtools__resize_page",
      "mcp__chrome-devtools__wait_for",
      "mcp__chrome-devtools__click",
      "mcp__chrome-devtools__fill",
      "mcp__chrome-devtools__fill_form",
      "mcp__chrome-devtools__hover",
      "mcp__chrome-devtools__drag",
      "mcp__chrome-devtools__upload_file",
      "mcp__chrome-devtools__handle_dialog",
      "mcp__chrome-devtools__take_screenshot",
      "mcp__chrome-devtools__take_snapshot",
      "mcp__chrome-devtools__evaluate_script",
      "mcp__chrome-devtools__list_console_messages",
      "mcp__chrome-devtools__list_network_requests",
      "mcp__chrome-devtools__get_network_request",
      "mcp__chrome-devtools__performance_start_trace",
      "mcp__chrome-devtools__performance_stop_trace",
      "mcp__chrome-devtools__performance_analyze_insight",
      "mcp__chrome-devtools__emulate_cpu",
      "mcp__chrome-devtools__emulate_network"
    ],
    "deny": [],
    "ask": []
  },
  "enableAllProjectMcpServers": true
}
EOF

# 3. VS Code Window Reload
# Cmd+Shift+P → "Developer: Reload Window"

# 4. Dev Server starten
npm run dev

# 5. Testen in Claude Code Chat:
# "Navigiere zu http://localhost:5173 und mache einen Screenshot"
```

**Fertig! 🎉 Chrome MCP läuft jetzt vollautomatisch ohne Rückfragen!**
