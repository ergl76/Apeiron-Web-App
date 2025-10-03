# 📋 Config-System Dokumentation

## Übersicht

Das Apeiron Web App verwendet ein **config-basiertes System** für flexible Spielbalance und Inhalte. Alle Spielparameter sind in JSON-Dateien ausgelagert und werden zur Build-Time importiert.

**Vorteile:**
- ✅ Einfache Balance-Anpassungen ohne Code-Änderungen
- ✅ Neue Events/Tiles ohne Logik-Änderungen hinzufügbar
- ✅ Klare Trennung zwischen Daten und Logik
- ✅ Übersichtliche Wartung durch zentrale Config-Dateien

---

## 1️⃣ events.json

### Ladezeitpunkt
```javascript
// ApeironGame.jsx:2
import eventsConfig from './config/events.json';
```

**Import-Typ:** Build-Time Import (statisch)

### Verwendung im Code

#### Initial Deck-Erstellung
```javascript
// ApeironGame.jsx:945
eventDeck: [...eventsConfig.phase1.positive, ...eventsConfig.phase1.negative]
```
- **Zeitpunkt:** Bei Spielinitialisierung (useState)
- **Scope:** Event Deck wird EINMAL erstellt beim neuen Spiel

#### Event-Effekt Anwendung
```javascript
// ApeironGame.jsx:2071-2073
const newAp = Math.max(0, player.ap - effect.value);
console.log(`⚡ reduce_ap ONE-TIME: ${player.name} AP reduced to ${newAp}`);
return { ...player, ap: newAp };
```
- **Zeitpunkt:** Während des Spiels bei Event-Trigger
- **Quelle:** `effect.value` kommt direkt aus Event-Objekt im Deck

#### Event-Text Generierung
```javascript
// ApeironGame.jsx:2082
resolvedTexts.push(`Schwere Bürde: ${playerNames} haben ${durationText} -${effect.value} AP.`);
```

### Wann werden Änderungen wirksam?

| Szenario | Wirksam nach | Bestehendes Spiel betroffen? |
|----------|--------------|----------------------------|
| **Development** | Browser-Refresh (HMR) | ❌ Nein - Deck bereits erstellt |
| **Production** | Neues Build + Deploy | ❌ Nein - Deck bereits erstellt |
| **Neues Spiel** | Spielstart | ✅ Ja - Neues Deck wird erstellt |

**⚠️ Wichtig:** Event-Deck wird beim Spielstart erstellt. Änderungen betreffen nur **neue Spiele**, nicht laufende Sessions.

---

## 2️⃣ gameRules.json

### Ladezeitpunkt
```javascript
// ApeironGame.jsx:4
import gameRules from './config/gameRules.json';
```

**Import-Typ:** Build-Time Import (statisch)

### Verwendung im Code (15+ Stellen)

#### Initial-Werte (Bei Spielstart)
```javascript
// ApeironGame.jsx:888
light: gameRules.light.startValue  // Initial Light: 30

// ApeironGame.jsx:894-895
ap: gameRules.actionPoints.perTurn,      // AP pro Runde: 3
maxAp: gameRules.actionPoints.maxPerTurn, // Max AP: 5

// ApeironGame.jsx:897
maxInventory: gameRules.inventory.maxSlots  // Inventar-Slots: 2
```

#### Runtime-Checks (Jede Runde)
```javascript
// ApeironGame.jsx:1440
if (lightLoss >= gameRules.light.torDerWeisheitTrigger && !gameState.torDerWeisheit.triggered) {
  // Tor der Weisheit bei 8 Light Verlust (= 22 Light remaining)
}

// ApeironGame.jsx:1964
newState.light = Math.min(gameRules.light.maxValue, newState.light + gainValue);
// Max Light: 50

// ApeironGame.jsx:6536
width: `${(gameState.light / gameRules.light.maxValue) * 100}%`
// Light-Bar Prozent-Berechnung
```

#### Foundation System
```javascript
// ApeironGame.jsx:2628
const foundationBonus = gameRules.foundations.lightBonusPerFoundation; // +4 Light

// ApeironGame.jsx:2639
light: Math.max(0, Math.min(gameRules.light.maxValue, prev.light + totalBonus))
```

#### Element-Aktivierung
```javascript
// ApeironGame.jsx:2843
const bonusConfig = gameRules.elementActivation.bonuses[element];
// z.B. water: {light: 4}, air: {permanentAp: 1}
```

### Wann werden Änderungen wirksam?

| Typ | Beispiel | Wirksam nach | Bestehendes Spiel? |
|-----|----------|--------------|-------------------|
| **Initial-Werte** | `light.startValue` | Browser-Refresh | ❌ Nein (State bereits initialisiert) |
| **Runtime-Checks** | `light.maxValue` | Browser-Refresh | ✅ Ja (wird bei jedem Check neu gelesen) |
| **Trigger-Werte** | `torDerWeisheitTrigger` | Browser-Refresh | ✅ Ja (Check passiert jede Runde) |
| **Bonus-Werte** | `lightBonusPerFoundation` | Browser-Refresh | ✅ Ja (beim nächsten Foundation-Build) |

**✅ Dynamisch:** Viele gameRules-Werte werden zur **Runtime** abgefragt und wirken sofort nach Refresh.

**❌ Statisch:** Initial-Werte (startValue, perTurn) nur bei **Spielstart** wirksam.

---

## 3️⃣ tiles.json

### Ladezeitpunkt
```javascript
// ApeironGame.jsx:3
import tilesConfig from './config/tiles.json';
```

**Import-Typ:** Build-Time Import (statisch)

### Verwendung im Code

#### Phase 1 Deck-Erstellung (Bei Spielstart)
```javascript
// ApeironGame.jsx:868-887
const phase1TileDeck = Object.entries(tilesConfig.phase1).flatMap(([tileId, config]) => {
  // Erstellt Array mit count-Wiederholungen
  // z.B. "fluss": {count: 5} → 5× fluss im Deck
  return Array(config.count).fill(null).map(() => ({
    ...config,
    id: tileId
  }));
});

// ApeironGame.jsx:947
tileDeck: completeDeck.sort(() => Math.random() - 0.5)
```
- **Zeitpunkt:** Bei Spielinitialisierung
- **Shuffle:** Deck wird einmal gemischt

#### Phase 2 Deck-Erstellung (Bei Phase-Übergang)
```javascript
// ApeironGame.jsx:2691-2715
const phase2TileDeck = Object.entries(tilesConfig.phase2).flatMap(
  ([tileId, config]) =>
    Array(config.count).fill(null).map(() => ({
      ...config,
      id: tileId
    }))
);
```
- **Zeitpunkt:** Beim Übergang von Phase 1 → Phase 2 (4 Fundamente gebaut)
- **Trigger:** User bestätigt Phase Transition Modal

### Tile-Eigenschaften Verwendung
```javascript
// getTileResources() - Ressourcen auf Feld
config.resources?.forEach(r => { /* ... */ });

// getTileName() - Feld-Name
return config.name || 'Unbekannt';

// getTileSymbol() - Feld-Symbol
return config.symbol || '❓';

// getTileColor() - Feld-Farbe
return config.color || '#6b7280';
```

### Wann werden Änderungen wirksam?

| Deck | Erstellung | Wirksam nach | Bestehendes Spiel? |
|------|-----------|--------------|-------------------|
| **Phase 1** | Spielstart | Browser-Refresh | ❌ Nein (Deck bereits erstellt) |
| **Phase 2** | Phase-Übergang | Browser-Refresh | ✅ Ja (wenn Phase-Wechsel NACH Refresh) |

**⚠️ Wichtig:**
- Phase 1 Deck wird bei **Spielstart** erstellt → Nur neue Spiele betroffen
- Phase 2 Deck wird bei **Phase-Übergang** erstellt → Betroffen wenn Übergang nach Config-Änderung

---

## 📊 Vergleichstabelle: Alle Config-Dateien

| Config-Datei | Ladezeitpunkt | Änderung wirksam nach | Bestehendes Spiel betroffen? | Dynamische Runtime-Checks? |
|--------------|---------------|----------------------|----------------------------|---------------------------|
| **events.json** | App-Start (Build-Time) | Browser-Refresh / Build | ❌ Nein (Deck bereits erstellt) | ❌ Nein |
| **gameRules.json** | App-Start (Build-Time) | Browser-Refresh / Build | ⚠️ Teilweise (Runtime ja, Initial nein) | ✅ Ja (viele Checks) |
| **tiles.json** | App-Start (Build-Time) | Browser-Refresh / Build | ⚠️ Phase 2 Deck ja, Phase 1 nein | ❌ Nein |

---

## 🔧 Testing-Workflow für Config-Änderungen

### Schritt 1: Config-Datei bearbeiten
```bash
# Beispiel: events.json
vim src/config/events.json
```

### Schritt 2: Dev-Server erkennt Änderung automatisch
```bash
# npm run dev läuft bereits
# Vite HMR (Hot Module Replacement) erkennt Änderung
# Browser refresht automatisch
```

**✅ Automatisch:** Bei `npm run dev` werden Config-Änderungen automatisch erkannt.

### Schritt 3: Neues Spiel starten
```
1. Browser öffnen (localhost:5173)
2. "Neues Spiel starten" klicken
3. Spieler-Setup durchführen
4. Spiel beginnt mit neuen Config-Werten
```

### Schritt 4: Testing
```
- Event triggern (Runde abschließen bis Event erscheint)
- Werte validieren (Console-Logs prüfen)
- UI-Feedback checken (Resolved-Texte, Icons)
```

---

## 💡 Beispiel: "schwere_buerde" Value-Änderung

### Ausgangssituation
```json
// src/config/events.json (ALT)
{
  "id": "schwere_buerde",
  "effects": [
    {
      "type": "reduce_ap",
      "value": 1,  // ← ÄNDERN zu 2
      "target": "furthest_from_crater",
      "duration": "next_round"
    }
  ]
}
```

### Änderung durchführen
```json
// src/config/events.json (NEU)
{
  "id": "schwere_buerde",
  "effects": [
    {
      "type": "reduce_ap",
      "value": 2,  // ← GEÄNDERT!
      "target": "furthest_from_crater",
      "duration": "next_round"
    }
  ]
}
```

### Code-Auswirkung

#### 1. Event-Effekt Anwendung
```javascript
// ApeironGame.jsx:2071 - VORHER
const newAp = Math.max(0, player.ap - 1);  // effect.value = 1

// ApeironGame.jsx:2071 - NACHHER
const newAp = Math.max(0, player.ap - 2);  // effect.value = 2
```

#### 2. Console-Log
```javascript
// VORHER
⚡ reduce_ap ONE-TIME: Terra AP reduced to 2 (no persistent effect)

// NACHHER
⚡ reduce_ap ONE-TIME: Terra AP reduced to 1 (no persistent effect)
```

#### 3. Resolved-Text
```javascript
// VORHER
Schwere Bürde: Terra (am weitesten vom Krater entfernt) haben in der nächsten Runde -1 AP.

// NACHHER
Schwere Bürde: Terra (am weitesten vom Krater entfernt) haben in der nächsten Runde -2 AP.
```

### Testing-Schritte

1. **Config ändern:** `value: 1` → `value: 2` in events.json
2. **Browser refresht** automatisch (HMR)
3. **Neues Spiel starten** (Setup durchführen)
4. **Event triggern:**
   - Held vom Krater wegbewegen (z.B. Terra zu Position 8,8)
   - Runde abschließen bis "Schwere Bürde" Event erscheint
5. **Validieren:**
   - ✅ Console-Log zeigt `-2 AP`
   - ✅ Resolved-Text zeigt `-2 AP`
   - ✅ Held hat tatsächlich 2 AP weniger (3 → 1 statt 3 → 2)

**⚠️ Bestehendes Spiel:** Laufendes Spiel hat Event-Deck bereits erstellt → **Nicht betroffen!**

---

## 🎯 Best Practices

### Config-Änderungen testen
1. ✅ **Immer neues Spiel starten** nach Config-Änderung
2. ✅ **Console-Logs prüfen** für Effekt-Anwendung
3. ✅ **Resolved-Texte validieren** im Event-Modal
4. ✅ **Gameplay-Impact testen** (AP-Werte, Light-Counter, etc.)

### Mehrere Änderungen gleichzeitig
```bash
# Batch-Änderungen in einem Go
1. events.json: 3 Events anpassen
2. gameRules.json: Light-Werte ändern
3. tiles.json: Phase 2 Deck erweitern
4. Browser-Refresh
5. Neues Spiel starten → Alle Änderungen aktiv
```

### Production Deployment
```bash
npm run build       # Erstellt optimiertes Build mit neuen Configs
npm run preview     # Lokales Testing des Production-Builds
# Deploy to Server → Neue Configs live
```

---

## 🔍 Debugging-Tipps

### Event-Deck inspizieren
```javascript
// In Browser Console
console.log(gameState.eventDeck);
// Zeigt alle Events im aktuellen Deck
```

### Tile-Deck inspizieren
```javascript
// In Browser Console
console.log(gameState.tileDeck);
console.log('Tiles remaining:', gameState.tileDeck.length);
```

### Game Rules zur Runtime prüfen
```javascript
// In Browser Console
console.log(gameRules.light.startValue);      // 30
console.log(gameRules.actionPoints.perTurn);  // 3
console.log(gameRules.elementActivation.bonuses);
```

---

## 🆕 Neues Event hinzufügen

### Übersicht aller 20 implementierten Effekt-Typen

Das Event-System unterstützt **20 verschiedene Effekt-Typen**, die vollautomatisch funktionieren wenn sie in `events.json` verwendet werden:

#### Phase 1 Effekte (18 Typen)

| Effekt-Typ | Beschreibung | Unterstützte Targets | Benötigt duration? |
|------------|--------------|---------------------|-------------------|
| `light_gain` | Erhöht Licht | - | ❌ Nein (instant) |
| `light_loss` | Reduziert Licht | - | ❌ Nein (instant) |
| `bonus_ap` | AP erhöhen | `all_players`, `random_hero` | ✅ Ja (`next_round` / `permanent`) |
| `reduce_ap` | AP reduzieren | `all_players`, `random_hero`, `furthest_from_crater` | ✅ Ja (`next_round` / `permanent`) |
| `set_ap` | AP auf festen Wert setzen | `all_players` | ✅ Ja (`next_round` / `permanent`) |
| `add_resource` | Ressourcen hinzufügen | `active_player`, `crater`, `all_adjacent_to_crater` | ❌ Nein (instant) |
| `drop_resource` | Ressourcen ablegen | `hero_with_most_crystals`, `heroes_on_crater` | ❌ Nein (instant) |
| `drop_all_items` | Alle Items ablegen | `random_hero` | ❌ Nein (instant) |
| `drop_all_resources` | Alle Ressourcen eines Typs ablegen | `all_players` | ❌ Nein (instant) |
| `add_obstacle` | Hindernis platzieren | 8+ verschiedene Targets (siehe unten) | ❌ Nein (instant) |
| `skip_turn` | Spieler muss aussetzen | `random_hero` | ✅ Ja (`next_round` / `permanent`) |
| `block_action` | Aktion blockieren | `all_players`, `random_hero` | ✅ Ja (`next_round` / `permanent`) |
| `block_skills` | Fähigkeiten blockieren | `all_players`, `random_hero` | ✅ Ja (`next_round` / `permanent`) |
| `prevent_movement` | Bewegung blockieren | `all_players`, `random_hero` | ✅ Ja (`next_round` / `permanent`) |
| `disable_communication` | Kommunikation blockieren | `all_players` | ✅ Ja (`next_round` / `permanent`) |
| `remove_obstacles` | Hindernisse entfernen (spezifischer Typ) | - | ❌ Nein (instant) |
| `remove_all_obstacles` | Alle Hindernisse entfernen | - | ❌ Nein (instant) |
| `remove_all_negative_effects` | Negative Effekte aufheben | `all_players` | ❌ Nein (instant) |

#### Phase 2 Effekte (2 Typen)

| Effekt-Typ | Beschreibung | Parameter | Benötigt duration? |
|------------|--------------|-----------|-------------------|
| `spread_darkness` | Finsternis ausbreiten | `value` (Anzahl Felder) | ❌ Nein (instant) |
| `cleanse_darkness` | Finsternis entfernen | `value` (Anzahl Felder) | ❌ Nein (instant) |

### Obstacle Placement Targets

Für `add_obstacle` Effekt-Typ:
- `random_direction_from_crater` - Zufällige Richtung vom Krater (N/E/S/W) via Card-Draw
- `north_of_crater`, `east_of_crater`, `south_of_crater`, `west_of_crater` - Spezifische Richtung
- `all_adjacent_to_crater` - Alle 4 angrenzenden Felder
- `diagonal_to_crater` - Alle 4 diagonalen Felder
- `ring_around_crater` - Ring mit 2 Feldern Distanz (16 Felder)
- `gate_and_adjacent` - Tor der Weisheit + angrenzende Felder
- `all_apeiron_sources_random_direction` - Alle Kristallquellen in gezogener Richtung
- `all_apeiron_sources_east` - Alle Kristallquellen im Osten
- `random_revealed_tile` - Zufälliges aufgedecktes Feld

---

## 📜 Duration-Werte Referenz

### ✅ Unterstützte Duration-Werte

| Duration-Wert | Bedeutung | Verwendung | expiresInRound | Entfernbar? |
|---------------|-----------|------------|----------------|-------------|
| **`"next_round"`** | Wirkt in nächster Runde | AP-Effekte: Sofortige Anwendung<br>Status-Effekte: Dauerhafter Effekt | `currentRound + 1` | ✅ Automatisch |
| **`"permanent"`** | Bleibt bis Spielende | Dauerhafter Effekt | `999999` | ✅ Via Lyra's Reinigung |
| *Kein duration* | Sofortige Anwendung | Instant Effects (Light, Resources, Obstacles) | - | ❌ Nicht persistent |

### 🎯 Wann welche Duration verwenden?

**`"next_round"` verwenden für:**
- Temporäre AP-Boni/Mali (1 Runde wirksam)
- Kurzzeitige Blockierungen (Entdecken, Spähen)
- Einmalige Aussetzeffekte

**`"permanent"` verwenden für:**
- Langanhaltende Flüche (z.B. dauerhafte AP-Reduktion)
- Permanente Blockierungen (z.B. Spieler kann sich nie mehr bewegen)
- Boss-Fähigkeiten in Phase 2

**Kein duration verwenden für:**
- Sofortige Licht-Änderungen
- Ressourcen hinzufügen/entfernen
- Hindernisse platzieren/entfernen
- Finsternis-Operationen

---

## 🔧 Schritt-für-Schritt: Neues Event erstellen

### 1. Event in events.json hinzufügen

```json
{
  "id": "ewige_schw_che",
  "name": "Ewige Schwäche",
  "symbol": "💀",
  "type": "negative",
  "effectText": "Ein zufälliger Held verliert permanent 1 AP pro Runde.",
  "description": "Eine dunkle Macht raubt einem Helden dauerhaft die Kraft.",
  "effects": [
    {
      "type": "reduce_ap",
      "value": 1,
      "target": "random_hero",
      "duration": "permanent"  // ← Permanenter Effekt!
    }
  ]
}
```

### 2. Mehrere Effekte kombinieren

Events können **mehrere Effekte** gleichzeitig haben:

```json
{
  "id": "katastrophale_wende",
  "name": "Katastrophale Wende",
  "symbol": "💥",
  "type": "negative",
  "effectText": "Das Licht sinkt um 3, alle Helden haben permanent -1 AP, und die Finsternis breitet sich aus.",
  "description": "Ein verheerender Schlag gegen die Hoffnung.",
  "effects": [
    {
      "type": "light_loss",
      "value": 3
    },
    {
      "type": "reduce_ap",
      "value": 1,
      "target": "all_players",
      "duration": "permanent"
    },
    {
      "type": "spread_darkness",
      "value": 2
    }
  ]
}
```

### 3. Card-Draw Events (mit Richtungskarten)

Manche Effekte erfordern dass der Spieler eine Karte zieht:

```json
{
  "id": "finstere_blockade",
  "name": "Finstere Blockade",
  "symbol": "🪨",
  "type": "negative",
  "effectText": "Platziere ein permanentes Hindernis in einer zufälligen Richtung vom Krater.",
  "description": "**Ziehe jetzt eine Himmelsrichtungskarte, um die betroffene Richtung zu bestimmen!**",
  "effects": [
    {
      "type": "add_obstacle",
      "obstacle": "geroell",
      "target": "random_direction_from_crater"  // ← Triggert Card-Draw
    }
  ]
}
```

---

## ✅ Was automatisch funktioniert

Wenn du ein neues Event mit **bekannten Effekt-Typen** hinzufügst:

1. ✅ **Event-Deck Loading** - Event wird beim Spielstart ins Deck geladen
2. ✅ **Event-Triggering** - Event wird am Rundenende zufällig gezogen
3. ✅ **Effekt-Anwendung** - Alle Effekte werden korrekt angewendet
4. ✅ **Console-Logs** - Debug-Ausgaben zeigen Effekt-Anwendung
5. ✅ **Visual Indicators** - Effekt-Icons erscheinen automatisch auf Helden-Tafel
6. ✅ **Permanente Effekte** - ♾️ Symbol wird angezeigt bei `"duration": "permanent"`
7. ✅ **Resolved-Texte** - Event-Beschreibungen werden im Modal angezeigt

---

## ⚠️ Was manuelle Anpassung braucht

### ❌ Fall 1: Neuer Effekt-Typ

```json
{
  "effects": [
    {
      "type": "teleport_hero",  // ← UNBEKANNTER TYP!
      "target": "random_hero"
    }
  ]
}
```

**Problem:** Switch-case in `applyEventEffect()` kennt `teleport_hero` nicht
**Lösung:** Code-Änderung erforderlich - neuen `case` hinzufügen (Line ~1956)

### ❌ Fall 2: Neues Target

```json
{
  "effects": [
    {
      "type": "bonus_ap",
      "target": "hero_with_least_ap"  // ← UNBEKANNTES TARGET!
    }
  ]
}
```

**Problem:** `bonus_ap` kennt nur `all_players` und `random_hero`
**Lösung:** Code-Änderung erforderlich - Target-Logik erweitern

### ⚠️ Fall 3: Custom Resolved-Texte

```json
{
  "id": "mein_neues_event",
  "effects": [...]
}
```

**Problem:** Resolved-Text ist teilweise hardcoded (23 Stellen)
**Beispiel:** `resolvedTexts.push("Schwere Bürde: ...")` (Line 2082)
**Workaround:** Generic-Text wird verwendet - funktioniert aber nicht perfekt

---

## 🔬 Permanente Effekte entfernen

### Via Event: `remove_all_negative_effects`

```json
{
  "id": "apeirons_segen",
  "effects": [
    {
      "type": "remove_all_negative_effects",
      "target": "all_players"
    }
  ]
}
```

Entfernt **ALLE** negativen Effekte inkl. permanente:
- `skip_turn`
- `reduce_ap`
- `set_ap`
- `prevent_movement`
- `block_skills`
- Action Blockers

### Via Lyra's Fähigkeit: "Heilende Reinigung"

**Automatisch:** Lyra's "Heilende Reinigung" Skill kann:
1. ✅ Finsternis von Feldern entfernen (Phase 2)
2. ✅ Negative Effekte von Spielern entfernen (via `remove_all_negative_effects` Event)

**Hinweis:** Aktuell gibt es keinen separaten Skill-Button um Player-Effekte zu entfernen - nur via Events.

---

## 💡 Praktische Beispiele

### Beispiel 1: Permanente AP-Erhöhung

```json
{
  "id": "segen_der_urkraft",
  "name": "Segen der Urkraft",
  "symbol": "✨",
  "type": "positive",
  "effectText": "Alle Helden erhalten permanent +1 AP pro Runde.",
  "description": "Die Ursubstanz stärkt euch dauerhaft.",
  "effects": [
    {
      "type": "bonus_ap",
      "value": 1,
      "target": "all_players",
      "duration": "permanent"
    }
  ]
}
```

**Resultat:**
- Alle Spieler haben ab sofort 4 AP statt 3 AP pro Runde
- Effekt bleibt bis Spielende (expiresInRound: 999999)
- ♾️ Symbol erscheint neben ⚡ Icon auf Helden-Tafel
- Kann via "Apeirons Segen" Event entfernt werden

### Beispiel 2: Permanente Bewegungsblockierung

```json
{
  "id": "versteinerung",
  "name": "Versteinerung",
  "symbol": "🗿",
  "type": "negative",
  "effectText": "Ein zufälliger Held kann sich permanent nicht mehr bewegen.",
  "description": "Dunkle Magie versteinert einen Helden für immer.",
  "effects": [
    {
      "type": "prevent_movement",
      "target": "random_hero",
      "duration": "permanent"
    }
  ]
}
```

**Resultat:**
- Random Held kann sich NIE mehr bewegen
- Andere Aktionen (Sammeln, Skills, Bauen) noch möglich
- ⛓️♾️ Symbole erscheinen auf Helden-Tafel
- Nur via "Apeirons Segen" oder Lyra entfernbar

### Beispiel 3: Multi-Effekt Permanent Event (Phase 2 Boss)

```json
{
  "id": "zorn_der_sphaere_erwacht",
  "name": "Zorn der Sphäre erwacht",
  "symbol": "👁️",
  "type": "negative",
  "effectText": "Das Licht sinkt um 5, alle Helden haben permanent -2 AP, und die Finsternis breitet sich auf 3 Felder aus.",
  "description": "Die Sphäre entfesselt ihre volle Macht in einem verzweifelten Akt.",
  "effects": [
    {
      "type": "light_loss",
      "value": 5
    },
    {
      "type": "reduce_ap",
      "value": 2,
      "target": "all_players",
      "duration": "permanent"
    },
    {
      "type": "spread_darkness",
      "value": 3
    },
    {
      "type": "block_skills",
      "target": "random_hero",
      "duration": "permanent"
    }
  ]
}
```

**Resultat:**
- 4 verschiedene Effekte gleichzeitig
- 2 permanente Effekte (AP + Skills) + 2 instant Effekte (Light + Darkness)
- Dramatischer Boss-Moment in Phase 2
- Spieler müssen "Apeirons Segen" Event ziehen um zu überleben

---

## 🎯 Testing-Checklist

Nach Hinzufügen eines neuen Events:

1. ✅ **JSON-Syntax validieren** - `npm run lint` (falls ESLint JSON prüft)
2. ✅ **Browser Refresh** - Dev-Server erkennt Änderung automatisch
3. ✅ **Neues Spiel starten** - Event Deck wird neu erstellt
4. ✅ **Event triggern** - Runde abschließen bis Event erscheint
5. ✅ **Console-Logs prüfen** - Debug-Ausgaben validieren
6. ✅ **Effekt-Werte testen** - AP, Light, Ressourcen prüfen
7. ✅ **Visual Indicators checken** - Icons auf Helden-Tafel
8. ✅ **Permanente Effekte** - ♾️ Symbol sichtbar?
9. ✅ **Mehrere Runden testen** - Permanente Effekte bleiben aktiv?
10. ✅ **Entfernung testen** - "Apeirons Segen" entfernt Effekte?

---

## 📊 Statistiken

**Aktueller Stand (2025-10-03):**
- 58 implementierte Event-Karten (Phase 1 + Phase 2)
- 20 verschiedene Effekt-Typen vollautomatisch
- 15+ verschiedene Target-Varianten
- 3 Duration-Werte (`next_round`, `permanent`, instant)
- ♾️ Visual Indicators für permanente Effekte

---

## 📚 Weitere Ressourcen

- [spielanleitung.md](./spielanleitung.md) - Vollständige Spielregeln
- [ereigniskarten.md](./ereigniskarten.md) - Alle 58 Event-Karten mit Effekten
- [events.json](../src/config/events.json) - Event-Definitionen
- [gameRules.json](../src/config/gameRules.json) - Balance-Parameter
- [tiles.json](../src/config/tiles.json) - Landschaftskarten-Definitionen

---

*Zuletzt aktualisiert: 2025-10-03 - Permanent Effects Implementation*
