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
// z.B. wasser: {type: "light", value: 4, darknessReduction: 4}

// Light Bonus anwenden
if (bonusConfig.type === 'light') {
  newState.light = Math.min(
    gameRules.light.maxValue,
    newState.light + bonusConfig.value
  );
}

// AP Bonus anwenden
if (bonusConfig.type === 'permanent_ap') {
  newState.players = newState.players.map(player => ({
    ...player,
    maxAp: player.maxAp + bonusConfig.value
  }));
}

// Finsternis-Zurückdrängung (seit 2025-10-06)
const darknessReduction = bonusConfig.darknessReduction || 0;
if (darknessReduction > 0 && newState.herzDerFinsternis.darkTiles.length > 0) {
  const fieldsToRemove = Math.min(
    darknessReduction,
    newState.herzDerFinsternis.darkTiles.length
  );
  newState.herzDerFinsternis.darkTiles =
    newState.herzDerFinsternis.darkTiles.slice(0, -fieldsToRemove);
}
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
| **gameRules.phase2** | App-Start (Build-Time) | Browser-Refresh | ✅ **Ja** (Runtime-Abfrage) | ✅ Ja (bei jedem Spielerzug) |
| **tiles.json** | App-Start (Build-Time) | Browser-Refresh / Build | ⚠️ Phase 2 Deck ja, Phase 1 nein | ❌ Nein |

---

## 4️⃣ Phase 2 Configuration

### Ladezeitpunkt
```javascript
// ApeironGame.jsx:1959
const darknessSpreadCount = gameRules.phase2?.darknessSpreadPerTurn || 1;
```

**Import-Typ:** Build-Time Import (statisch), Runtime-Abfrage (dynamisch)

### Verwendung im Code

#### Automatische Finsternis-Ausbreitung (Zeile ~1959-1987)
```javascript
// ApeironGame.jsx:1959
const darknessSpreadCount = gameRules.phase2?.darknessSpreadPerTurn || 1;
const darknessSpreads = [];

if (shouldSpreadDarkness) {
  let tempState = { ...prevState };

  for (let i = 0; i < darknessSpreadCount; i++) {
    const nextPos = calculateNextDarknessPosition(tempState);

    if (nextPos) {
      darknessSpreads.push(nextPos);
      tempState = {
        ...tempState,
        herzDerFinsternis: {
          ...tempState.herzDerFinsternis,
          darkTiles: [...tempState.herzDerFinsternis.darkTiles, nextPos]
        }
      };
    } else {
      break; // No more valid positions
    }
  }
}
```

### Config-Parameter

| Parameter | Beschreibung | Default | Beispielwerte |
|-----------|--------------|---------|---------------|
| `darknessSpreadPerTurn` | Anzahl der Felder die pro Spielerzug von Finsternis befallen werden | `1` | `1` (leicht), `2` (normal), `3` (schwer) |

### Schwierigkeitsgrade

```json
// gameRules.json - Leichter Modus (Empfohlen für Einsteiger)
{
  "phase2": {
    "darknessSpreadPerTurn": 1
  }
}

// gameRules.json - Normaler Modus
{
  "phase2": {
    "darknessSpreadPerTurn": 2
  }
}

// gameRules.json - Schwerer Modus (Für Experten)
{
  "phase2": {
    "darknessSpreadPerTurn": 3
  }
}
```

### Wann werden Änderungen wirksam?

| Änderung | Wirksam nach | Bestehendes Spiel betroffen? |
|----------|--------------|----------------------------|
| `darknessSpreadPerTurn` | Browser-Refresh | ✅ Ja - wird bei jedem Spielerzug neu abgefragt |

**✅ Dynamisch:** Der Wert wird zur **Runtime** bei jedem Spielerzug-Ende abgefragt.

**Impact:**
- Wert wird bei jedem `handleAutoTurnTransition` Call neu gelesen
- Änderungen wirken **sofort** nach Browser-Refresh
- Bestehendes Spiel übernimmt neue Geschwindigkeit

### Testing-Beispiel

#### Szenario: Finsternis-Ausbreitung von 1 → 2 ändern

**1. Config ändern:**
```json
// src/config/gameRules.json
{
  "phase2": {
    "darknessSpreadPerTurn": 2  // ← GEÄNDERT von 1
  }
}
```

**2. Browser refresht** automatisch (HMR)

**3. Im bestehenden Spiel:**
- Phase 2 bereits aktiv? ✅ Neue Geschwindigkeit gilt sofort!
- Spielerzug beenden → Console-Log: `☠️ darkness spreads to 4,5 (1/2)` + `☠️ darkness spreads to 4,6 (2/2)`

**4. Validierung:**
- ✅ Console zeigt 2× spread statt 1×
- ✅ Board hat 2 neue dunkle Felder (statt 1)
- ✅ Spiral-Algorithmus funktioniert korrekt für mehrere Felder

### Event-basierte Finsternis vs. Automatische Ausbreitung

**Wichtig:** `darknessSpreadPerTurn` gilt nur für **automatische Ausbreitung nach jedem Spielerzug**.

**Event-basierte Ausbreitung** (`spread_darkness` Events) verwenden **eigene** `value`-Parameter:

```json
// events.json - Event-basierte Ausbreitung
{
  "id": "welle_der_finsternis",
  "effects": [
    {
      "type": "spread_darkness",
      "value": 2  // ← Event-spezifischer Wert (unabhängig von darknessSpreadPerTurn)
    }
  ]
}
```

**Unterschied:**
- **Automatisch** (jeder Spielerzug): `gameRules.phase2.darknessSpreadPerTurn`
- **Event-basiert** (nur bei Event): `effect.value` aus events.json

**Kombiniert:** Wenn Event mit `spread_darkness: 2` getriggert wird UND Spielerzug endet → Insgesamt 2 (Event) + 1 (Auto) = **3 Felder** werden dunkel!

---

## 5️⃣ Element-Aktivierung Bonusse (darknessReduction)

### Übersicht

Das **Element-Aktivierung System** (Phase 2) bietet konfigurierbare Boni wenn Spieler Elemente aktivieren. Seit Session 2025-10-06 gibt es zusätzlich das **Finsternis-Zurückdrängung Feature** (`darknessReduction`).

### Ladezeitpunkt
```javascript
// ApeironGame.jsx:4
import gameRules from './config/gameRules.json';
```

**Import-Typ:** Build-Time Import (statisch), Runtime-Abfrage (dynamisch)

### Config-Struktur

```json
{
  "elementActivation": {
    "bonuses": {
      "wasser": {
        "type": "light",           // Art des Bonus (light/permanent_ap)
        "value": 4,                // Bonus-Wert
        "darknessReduction": 4     // 🆕 Anzahl Finsternis-Felder zurückdrängen
      },
      "feuer": {
        "type": "light",
        "value": 4,
        "darknessReduction": 4
      },
      "luft": {
        "type": "permanent_ap",
        "value": 1,
        "darknessReduction": 4
      },
      "erde": {
        "type": "permanent_ap",
        "value": 1,
        "darknessReduction": 4
      }
    }
  }
}
```

### Verwendung im Code

#### Element-Aktivierung Handler (Zeile ~2843-2900)

```javascript
// ApeironGame.jsx:2843
const bonusConfig = gameRules.elementActivation.bonuses[element];

// Haupt-Bonus anwenden (Light oder AP)
if (bonusConfig.type === 'light') {
  newState.light = Math.min(
    gameRules.light.maxValue,
    newState.light + bonusConfig.value
  );
}

// 🆕 Finsternis-Zurückdrängung (LIFO-Prinzip)
const darknessReduction = bonusConfig.darknessReduction || 0;
let fieldsRemoved = 0;

if (darknessReduction > 0 && newState.herzDerFinsternis.darkTiles.length > 0) {
  const currentDarkCount = newState.herzDerFinsternis.darkTiles.length;
  const fieldsToRemove = Math.min(darknessReduction, currentDarkCount);

  // LIFO: Entfernt zuletzt erfasste Finsternis-Felder zuerst
  newState.herzDerFinsternis.darkTiles =
    newState.herzDerFinsternis.darkTiles.slice(0, -fieldsToRemove);

  fieldsRemoved = fieldsToRemove;

  console.log(
    `🌟 ${element.toUpperCase()}-Element aktiviert: ` +
    `${fieldsRemoved} Finsternis-Felder zurückgedrängt! ` +
    `(${currentDarkCount} → ${newState.herzDerFinsternis.darkTiles.length})`
  );
}
```

### LIFO-Prinzip (Last-In-First-Out)

**Warum LIFO?**
- Finsternis breitet sich **spiral-förmig** vom Herz aus
- Neueste Finsternis-Felder sind am **weitesten** vom Herz entfernt
- Zurückdrängung sollte **äußeren Ring** zuerst entfernen (nicht Zentrum)

**Implementierung:**
```javascript
// Array: [älteste, ..., neueste]
// .slice(0, -N) entfernt N Elemente vom ENDE
darkTiles.slice(0, -2)  // Entfernt 2 neueste Felder
```

**Beispiel:**
```javascript
// Vor Aktivierung (5 dunkle Felder):
darkTiles = ['4,5', '5,5', '4,6', '5,6', '6,6']
           // Ring 1  Ring 1  Ring 2  Ring 2  Ring 2

// Element-Aktivierung mit darknessReduction: 2
darkTiles = ['4,5', '5,5', '4,6']  // ← '5,6' und '6,6' entfernt
           // Ring 1  Ring 1  Ring 2
```

### UI-Integration (Element Success Modal)

```javascript
// ApeironGame.jsx:~5950-5970
{fieldsRemoved > 0 && (
  <div className="border-t border-yellow-300/30 pt-3 mt-3">
    <div className="text-yellow-300 font-semibold text-base">
      ☀️ {fieldsRemoved} Finsternis-Feld{fieldsRemoved > 1 ? 'er' : ''}
      zurückgedrängt!
    </div>
    <div className="text-yellow-100 text-sm mt-1">
      Die Macht des Elements vertreibt die Dunkelheit.
    </div>
  </div>
)}
```

**Design:**
- Separator-Line mit Border-Top
- Goldener Text (#fbbf24) matching Element-Farbe
- Dynamische Pluralisierung ("Feld" vs "Felder")
- Conditional Rendering (nur wenn `fieldsRemoved > 0`)

### Wann werden Änderungen wirksam?

| Änderung | Wirksam nach | Bestehendes Spiel betroffen? |
|----------|--------------|----------------------------|
| `value` (Light/AP Bonus) | Browser-Refresh | ✅ Ja - Runtime-Abfrage bei Aktivierung |
| `darknessReduction` | Browser-Refresh | ✅ Ja - Runtime-Abfrage bei Aktivierung |
| `type` (light/permanent_ap) | Browser-Refresh | ✅ Ja - Runtime-Check |

**✅ Dynamisch:** Alle Element-Aktivierung Werte werden zur **Runtime** abgefragt.

**Impact:**
- Änderungen wirken **sofort** nach Browser-Refresh
- Bestehendes Spiel übernimmt neue Werte bei nächster Element-Aktivierung
- Keine Notwendigkeit für neues Spiel

### Balance-Konfiguration

#### Standard-Werte (Aktuell)
```json
{
  "wasser": {"darknessReduction": 4},  // Wasser heilt am meisten
  "feuer": {"darknessReduction": 4},   // Feuer verbrennt Finsternis
  "luft": {"darknessReduction": 4},    // Luft vertreibt Schatten
  "erde": {"darknessReduction": 4}     // Erde festigt Licht
}
```

#### Schwierigkeitsgrade-Beispiele

**Leichter Modus** (mehr Finsternis-Zurückdrängung):
```json
{
  "wasser": {"darknessReduction": 5},
  "feuer": {"darknessReduction": 6},
  "luft": {"darknessReduction": 4},
  "erde": {"darknessReduction": 3}
}
```

**Normaler Modus** (ausgewogen):
```json
{
  "wasser": {"darknessReduction": 4},
  "feuer": {"darknessReduction": 4},
  "luft": {"darknessReduction": 4},
  "erde": {"darknessReduction": 4}
}
```

**Schwerer Modus** (weniger Zurückdrängung):
```json
{
  "wasser": {"darknessReduction": 2},
  "feuer": {"darknessReduction": 3},
  "luft": {"darknessReduction": 1},
  "erde": {"darknessReduction": 0}  // Erde gibt keinen Finsternis-Schutz
}
```

### Kombination mit automatischer Ausbreitung

**Wichtig:** Finsternis-Zurückdrängung passiert **VOR** automatischer Ausbreitung!

**Szenario:** Spieler aktiviert Feuer-Element (`darknessReduction: 3`)

1. **Element-Aktivierung:** 3 Finsternis-Felder entfernt (LIFO)
2. **AP verbraucht → Spielerzug endet**
3. **Automatische Ausbreitung:** `darknessSpreadPerTurn` Felder werden dunkel

**Beispiel:**
```javascript
// Vor Element-Aktivierung: 10 dunkle Felder
// Nach Element-Aktivierung: 7 dunkle Felder (-3)
// Nach Turn-Transition: 9 dunkle Felder (+2 von darknessSpreadPerTurn)

// Netto-Effekt: -1 Feld (3 entfernt, 2 hinzugefügt)
```

### Testing-Beispiel

#### Szenario: Feuer-Element darknessReduction von 4 → 6 ändern

**1. Config ändern:**
```json
// src/config/gameRules.json
{
  "elementActivation": {
    "bonuses": {
      "feuer": {
        "type": "light",
        "value": 4,
        "darknessReduction": 6  // ← GEÄNDERT von 4
      }
    }
  }
}
```

**2. Browser refresht** automatisch (HMR)

**3. Im bestehenden Spiel:**
- Phase 2 aktiv mit 10 dunklen Feldern
- Spieler aktiviert Feuer-Element (1 AP + Kristall + Fragment)

**4. Validierung:**
- ✅ Console: `🌟 FEUER-Element aktiviert: 6 Finsternis-Felder zurückgedrängt! (10 → 4)`
- ✅ Element Success Modal zeigt: "☀️ 6 Finsternis-Felder zurückgedrängt!"
- ✅ Board hat 6 weniger dunkle Felder (visuell geprüft)
- ✅ LIFO funktioniert: Äußerster Ring entfernt (nicht Zentrum)

### Console-Logging

```javascript
// Bei darknessReduction > 0 UND dunkle Felder vorhanden:
🌟 FEUER-Element aktiviert: 3 Finsternis-Felder zurückgedrängt! (8 → 5)

// Bei darknessReduction > 0 ABER keine Finsternis vorhanden:
🌟 WASSER-Element aktiviert: Keine Finsternis vorhanden zum Zurückdrängen

// Bei darknessReduction === 0:
(Kein Log - Feature nicht aktiv für dieses Element)
```

### Edge Cases

**Fall 1: Mehr Reduktion als Finsternis**
```javascript
// darknessReduction: 5, aber nur 2 dunkle Felder
fieldsToRemove = Math.min(5, 2);  // → 2
// Resultat: Alle 2 Felder entfernt, keine Fehler
```

**Fall 2: Keine Finsternis vorhanden**
```javascript
if (darknessReduction > 0 && darkTiles.length > 0) {
  // Code wird NICHT ausgeführt
}
// Modal zeigt NICHT die darknessReduction Sektion
```

**Fall 3: Phase 1 (kein Herz der Finsternis)**
```javascript
// herzDerFinsternis.triggered === false
// darkTiles Array existiert nicht → Feature inaktiv
```

### Best Practices

1. ✅ **Ausgewogene Werte:** `darknessReduction` sollte < `darknessSpreadPerTurn × 3` sein
2. ✅ **Element-Thematik:** Feuer/Wasser höhere Werte, Erde/Luft moderate Werte
3. ✅ **Difficulty Scaling:** Schwerer Modus = niedrigere darknessReduction
4. ✅ **Testing:** Immer mit verschiedenen darkTiles.length testen (0, 1, 5, 10+)

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

### Beispiel 4: Element-Aktivierung Balance-Anpassung (darknessReduction)

**Szenario:** Feuer-Element soll stärker gegen Finsternis wirken

```json
// gameRules.json - VORHER (Standard)
{
  "elementActivation": {
    "bonuses": {
      "feuer": {
        "type": "light",
        "value": 4,
        "darknessReduction": 4
      }
    }
  }
}

// gameRules.json - NACHHER (Buff)
{
  "elementActivation": {
    "bonuses": {
      "feuer": {
        "type": "light",
        "value": 4,
        "darknessReduction": 7  // ← ERHÖHT von 4 auf 7
      }
    }
  }
}
```

**Impact:**
- Feuer-Element aktivieren entfernt jetzt 7 Finsternis-Felder (statt 4)
- Strategische Entscheidung: Feuer priorisieren in Phase 2
- Balance: `darknessSpreadPerTurn: 2` → Netto-Gewinn: 7 - 2 = 5 Felder pro Aktivierung

**Testing:**
```javascript
// Vor Änderung (darknessReduction: 4):
🌟 FEUER-Element aktiviert: 4 Finsternis-Felder zurückgedrängt! (10 → 6)

// Nach Änderung (darknessReduction: 7):
🌟 FEUER-Element aktiviert: 7 Finsternis-Felder zurückgedrängt! (10 → 3)
```

### Beispiel 5: Schwierigkeitsgrad-Anpassung (alle 4 Elemente)

**Szenario:** Leichteren Modus erstellen durch höhere darknessReduction

```json
// gameRules.json - Leichter Modus
{
  "elementActivation": {
    "bonuses": {
      "wasser": {
        "type": "light",
        "value": 5,              // +1 Light (statt 4)
        "darknessReduction": 6   // +2 Felder (statt 4)
      },
      "feuer": {
        "type": "light",
        "value": 5,
        "darknessReduction": 8   // +4 Felder (statt 4) - STÄRKSTER EFFEKT
      },
      "luft": {
        "type": "permanent_ap",
        "value": 1,
        "darknessReduction": 5   // +1 Feld (statt 4)
      },
      "erde": {
        "type": "permanent_ap",
        "value": 1,
        "darknessReduction": 4   // UNVERÄNDERT
      }
    }
  },
  "phase2": {
    "darknessSpreadPerTurn": 2  // Gleichbleibend
  }
}
```

**Resultat:**
- Durchschnittliche darknessReduction: 5.75 Felder (statt 4)
- Netto-Effekt pro Aktivierung: +3.75 Felder (statt +2)
- Strategische Vielfalt: Feuer am stärksten, Erde am schwächsten
- Spieler können mit 4 Element-Aktivierungen ~23 Finsternis-Felder entfernen

**Gameplay-Impact:**
- Phase 2 deutlich einfacher → Mehr Raum für Fehler
- Finsternis-Bedrohung weniger kritisch
- Empfohlen für: Anfänger, Story-Fokus, Casual-Spieler

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

**Aktueller Stand (2025-10-06):**
- 58 implementierte Event-Karten (Phase 1 + Phase 2)
- 20 verschiedene Effekt-Typen vollautomatisch
- 15+ verschiedene Target-Varianten
- 3 Duration-Werte (`next_round`, `permanent`, instant)
- ♾️ Visual Indicators für permanente Effekte
- 🆕 **Element-Aktivierung Bonusse:** 4 Elemente mit individuellen darknessReduction Werten
- 🆕 **Finsternis-Zurückdrängung:** LIFO-Prinzip für strategische Gameplay-Balance
- 🆕 **Multi-Obstacles System:** Mehrere verschiedene Obstacle-Typen pro Feld möglich

**Config-Dateien:**
- `events.json`: ~1500 Zeilen, 58 Events
- `gameRules.json`: 60 Zeilen, 6 Haupt-Kategorien (light, actionPoints, inventory, foundations, elementActivation, phase2)
- `tiles.json`: ~300 Zeilen, 24 Phase 1 + 24 Phase 2 Karten

**Features dokumentiert:**
- ✅ Event-System (20 Effekt-Typen)
- ✅ Game Rules (Runtime-Checks + Initial-Values)
- ✅ Tile-Deck System (Phase 1 + Phase 2)
- ✅ Phase 2 Configuration (darknessSpreadPerTurn)
- ✅ Element-Aktivierung Bonusse (darknessReduction) 🆕

---

## 📚 Weitere Ressourcen

- [spielanleitung.md](./spielanleitung.md) - Vollständige Spielregeln
- [ereigniskarten.md](./ereigniskarten.md) - Alle 58 Event-Karten mit Effekten
- [events.json](../src/config/events.json) - Event-Definitionen
- [gameRules.json](../src/config/gameRules.json) - Balance-Parameter
- [tiles.json](../src/config/tiles.json) - Landschaftskarten-Definitionen

---

*Zuletzt aktualisiert: 2025-10-06 - Finsternis-Zurückdrängung Feature (darknessReduction)*
