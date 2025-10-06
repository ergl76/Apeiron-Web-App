# 🧪 Automated Testing mit Chrome DevTools MCP

**Projektübergreifendes Testing-Framework für React/Vite Web-Apps**

---

## 📋 Quick Start

### 1. MCP Setup (einmalig)

**⚠️ WICHTIG:** Für vollständige Installation und Auto-Approve Konfiguration siehe:

👉 **[CHROME-MCP-SETUP.md](CHROME-MCP-SETUP.md)** - Komplette Setup-Anleitung für neuen Rechner/Projekt

**Kurz-Version:**
```bash
# 1. Chrome DevTools MCP installieren
claude mcp add chrome-devtools --scope user -- npx -y chrome-devtools-mcp@latest

# 2. Project Permissions konfigurieren
# Siehe CHROME-MCP-SETUP.md für vollständige .claude/settings.local.json

# 3. VS Code Window Reload
# Cmd+Shift+P → "Developer: Reload Window"

# 4. Dev Server starten
npm run dev
```

**Nach Setup:**
- ✅ Alle Chrome MCP Tools laufen **automatisch ohne Rückfragen**
- ✅ Screenshots, Clicks, Navigation - alles vollautomatisch
- ✅ Siehe [CHROME-MCP-SETUP.md](CHROME-MCP-SETUP.md) für Troubleshooting

---

## 🎯 Standard Test-Workflow

**Nach jedem neuen Feature führe ich diesen 4-Schritte-Test durch:**

### ✅ Schritt 1: Navigation & Screenshot
```
1. navigate_page → http://localhost:5173 (oder Feature-URL)
2. take_screenshot → Visuell validieren
3. Prüfen: UI rendert korrekt, keine Layout-Breaks
```

### ✅ Schritt 2: Console-Check
```
1. list_console_messages → Alle Logs abrufen
2. Prüfen: Keine Errors (rot), max. Warnings (gelb)
3. Bei Errors: Root Cause identifizieren
```

### ✅ Schritt 3: Feature-Interaktion
```
1. click / fill / hover → Feature ausführen
2. evaluate_script → State validieren (z.B. gameState.round === 1)
3. take_screenshot → Nach-Zustand dokumentieren
```

### ✅ Schritt 4: Performance-Check (bei größeren Features)
```
1. performance_start_trace
2. Feature mehrfach ausführen
3. performance_stop_trace
4. performance_analyze_insight → LCP, TBT, FCP prüfen
```

---

## 🛠️ Chrome MCP Tool-Referenz

### Navigation & Setup
| Tool | Beschreibung | Beispiel |
|------|-------------|----------|
| `navigate_page` | URL öffnen | `navigate_page("http://localhost:5173")` |
| `new_page` | Neuen Tab öffnen | `new_page()` |
| `list_pages` | Alle offenen Tabs auflisten | `list_pages()` |
| `wait_for` | Auf Text warten | `wait_for("SIEG!")` |

### UI-Interaktion
| Tool | Beschreibung | Beispiel |
|------|-------------|----------|
| `click` | Element anklicken | `click("button#start-game")` |
| `fill` | Input ausfüllen | `fill("input[name='heroName']", "Terra")` |
| `hover` | Über Element hovern | `hover(".hero-card")` |
| `fill_form` | Mehrere Inputs | `fill_form({name: "Terra", ap: 3})` |

### Testing & Debugging
| Tool | Beschreibung | Beispiel |
|------|-------------|----------|
| `take_screenshot` | Screenshot machen | `take_screenshot()` |
| `evaluate_script` | JS ausführen | `evaluate_script("document.querySelector('h1').textContent")` |
| `list_console_messages` | Console-Logs abrufen | `list_console_messages()` |
| `take_snapshot` | DOM-Snapshot (Text) | `take_snapshot()` |

### Performance
| Tool | Beschreibung | Beispiel |
|------|-------------|----------|
| `performance_start_trace` | Trace starten | `performance_start_trace()` |
| `performance_stop_trace` | Trace beenden | `performance_stop_trace()` |
| `performance_analyze_insight` | Metriken analysieren | `performance_analyze_insight()` |

### Network
| Tool | Beschreibung | Beispiel |
|------|-------------|----------|
| `list_network_requests` | Alle Requests auflisten | `list_network_requests()` |
| `get_network_request` | Spezifischen Request holen | `get_network_request("main.js")` |

### Emulation
| Tool | Beschreibung | Beispiel |
|------|-------------|----------|
| `resize_page` | Fenstergröße ändern | `resize_page(375, 667)` (iPhone SE) |
| `emulate_network` | Netzwerk drosseln | `emulate_network("Slow 3G")` |
| `emulate_cpu` | CPU drosseln | `emulate_cpu(4)` (4x slower) |

---

## ✅ Testing-Checkliste

### Nach jeder Feature-Implementation

#### UI/UX
- [ ] Feature rendert korrekt (Screenshot validiert)
- [ ] Responsive Design funktioniert (resize_page 375px, 768px, 1920px)
- [ ] Hover-States funktionieren
- [ ] Animationen laufen flüssig

#### Funktionalität
- [ ] Feature-Logic funktioniert (evaluate_script State-Check)
- [ ] Edge Cases getestet (leere Inputs, null values, etc.)
- [ ] Error Handling funktioniert
- [ ] Keine Console Errors (list_console_messages)

#### Performance
- [ ] LCP < 2.5s (performance_analyze_insight)
- [ ] TBT < 200ms (Total Blocking Time)
- [ ] FCP < 1.8s (First Contentful Paint)
- [ ] Keine Memory Leaks (bei größeren Features)

#### Network
- [ ] Keine 404/500 Errors (list_network_requests)
- [ ] Bundle Size < 500kb (bei neuen Dependencies)
- [ ] Lazy Loading funktioniert (bei Code Splitting)

#### Security
- [ ] Keine XSS-Warnings in Console
- [ ] Keine Secrets in Network-Requests/Console
- [ ] CSP-Violations prüfen

---

## 🎯 Test-Szenarien für verschiedene Feature-Typen

### UI-Komponente (z.B. Modal)
```
1. navigate_page → Feature-Route
2. click → Modal öffnen
3. take_screenshot → Modal sichtbar?
4. click → Modal schließen
5. evaluate_script → "document.querySelector('.modal') === null"
```

### User-Flow (z.B. Form-Submit)
```
1. navigate_page → Form-Seite
2. fill_form → Alle Inputs ausfüllen
3. click → Submit-Button
4. wait_for → Success-Message
5. list_console_messages → Keine Errors
```

### Performance-kritisches Feature (z.B. Animation)
```
1. performance_start_trace
2. click → Animation triggern
3. performance_stop_trace
4. performance_analyze_insight → FPS > 60, TBT < 50ms
```

### Responsive Design
```
1. resize_page → 375x667 (Mobile)
2. take_screenshot → Layout OK?
3. resize_page → 768x1024 (Tablet)
4. take_screenshot → Layout OK?
5. resize_page → 1920x1080 (Desktop)
```

---

## 🚀 Automation-Strategie

### Test-Driven Development (TDD)
1. **Feature-Anforderung** → Test-Szenario definieren
2. **Test schreiben** → Erwartetes Verhalten festlegen
3. **Feature implementieren** → Bis Test erfolgreich
4. **Refactor** → Performance optimieren

### Post-Implementation
1. **Sofort nach Feature-Commit** → Standard 4-Schritte-Test
2. **Regression-Prevention** → Screenshots + Performance-Baselines
3. **Dokumentation** → Test-Ergebnisse in Session-Log

### Kontinuierliche Verbesserung
- **Performance-Baselines** → In `gameRules.json` oder separate config
- **Visual Regression** → Screenshots vergleichen (manuell oder automatisiert)
- **Test-Coverage** → Welche Features wurden getestet?

---

## 📊 Performance-Baselines (Projekt-spezifisch)

**Apeiron Web App - Targets:**
- **LCP:** < 2.5s (Game Start)
- **TBT:** < 200ms (Event-Trigger)
- **FCP:** < 1.8s (Initial Render)
- **Bundle Size:** < 500kb (Main Bundle)
- **Memory:** < 50MB Heap (nach 10min Gameplay)

**Bei Überschreitung:**
1. Performance-Trace analysieren
2. Bottleneck identifizieren (lange Tasks, große Bundles)
3. Optimieren (Code Splitting, Lazy Loading, Memoization)
4. Re-Test bis Baseline erreicht

---

## 🔗 Ressourcen

- **Chrome DevTools MCP Docs:** https://developer.chrome.com/blog/chrome-devtools-mcp
- **Tool Reference:** https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md
- **Web Vitals:** https://web.dev/vitals/
- **MCP Protocol:** https://modelcontextprotocol.io/

---

## 💡 Best Practices

1. **Test nach jedem Feature** - Nicht stapeln, sofort validieren
2. **Screenshots dokumentieren** - Visuelle Regression früh erkennen
3. **Console-Logs ernst nehmen** - Auch Warnings können Probleme sein
4. **Performance-Baselines einhalten** - Kein "später optimieren"
5. **Reale Bedingungen emulieren** - Mobile + Slow 3G testen
6. **Automatisierung ausbauen** - Wiederholbare Test-Szenarien definieren

---

**Version:** 1.0
**Letzte Aktualisierung:** 2025-10-04
**Projekt:** Apeiron Web App (aber wiederverwendbar für alle React/Vite Projekte)
