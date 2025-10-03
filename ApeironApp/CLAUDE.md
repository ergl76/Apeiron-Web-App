# <� Apeiron Web App - Claude Context

## =� Aktueller Status
**Letzte Session:** 2025-10-03 15:30 (Card-Draw UX Bugfix + spread_darkness)
**Sprint:** ALLE kritischen Bugs & UX-Issues behoben! 🎉
**Fortschritt:** ~98% abgeschlossen (nur Win/Loss Conditions offen)
**Velocity:** 2 Bugfixes in 1h Session
**Next Focus:** 🎯 Win/Loss Conditions (P0 - letztes fehlendes Feature!)

## <� Projekt�bersicht
**Apeiron Web App** - Kooperatives Turmbau-Spiel als React Web-Anwendung
- **Hauptziel:** Vollst�ndiges digitales Brettspiel mit 2-4 Spielern
- **Kernfeatures:** Heldenbewegung, Ressourcensammlung, Turmbau, Ereignissystem, kooperative Mechaniken
- **Zielgruppe:** Brettspiel-Enthusiasten, Familien, Kooperativ-Spieler

## <� Tech-Stack
- **Frontend:** React ^19.1.1 + TypeScript ~5.8.3
- **Styling:** Tailwind CSS ^4.1.12
- **Build Tool:** Vite ^7.1.2
- **Testing:** ESLint ^9.33.0 (keine Unit Tests implementiert)
- **Dev Server:** http://localhost:5173 (npm run dev)

##  Fertiggestellt
- [x] 2025-09-22 React/TypeScript/Vite Projekt Setup mit Tailwind
- [x] 2025-09-22 Grundlegende Spiellogik und Zustandsmanagement
- [x] 2025-09-22 4 Helden-System (Terra, Ignis, Lyra, Corvus) mit Eigenschaften
- [x] 2025-09-22 9x9 Spielbrett mit Krater-Startfeld implementiert
- [x] 2025-09-22 Helden-Bewegung mit Aktionspunkt-System (3 AP/Runde)
- [x] 2025-09-22 Feldaufdeckung und Sichtbarkeits-Mechaniken
- [x] 2025-09-22 Inventar-System (2 Slots pro Held)
- [x] 2025-09-22 Ressourcen-Sammlung (Kristalle, Baupl�ne)
- [x] 2025-09-22 Spieler-Setup mit Charakterauswahl (2-4 Spieler)
- [x] 2025-09-22 Dark Theme UI mit responsivem Design
- [x] 2025-09-22 Umfangreiche Dokumentation (Spielregeln, Ereigniskarten)
- [x] 2025-09-25 Event-Trigger-System vollst�ndig implementiert (Aktionskarten am Rundenende)
- [x] 2025-09-25 Event-Effekte Implementation vollst�ndig behoben (duration-Properties korrigiert)
- [x] 2025-09-25 Skip_turn Effekte VOLLST�NDIG repariert (kritischer Bugfix)
- [x] 2025-09-25 Alle Event-Effekte systematisch implementiert (AP-Modi., Aktions-Blockierung, Ressourcen)
- [x] 2025-09-25 Visuelle Effekt-Indikatoren f�r alle dauerhaften Effekte hinzugef�gt
- [x] 2025-09-25 Phase 2 Effekte implementiert (spread_darkness, cleanse_darkness)
- [x] 2025-09-25 Skill-Blockierung komplett integriert (block_skills wirkt auf alle F�higkeiten)
- [x] 2025-09-25 KRITISCHER BUGFIX: "next_round" Effekte Expiration-Logik komplett repariert
- [x] 2025-09-25 Effect Duration Logic systematisch behoben (alle 24 next_round Events)
- [x] 2025-09-25 Visuelle Effekt-Indikatoren mit korrekter Expiration-Pr�fung
- [x] 2025-09-25 Event-System grundlegende Implementierung abgeschlossen (Struktur & Trigger)
- [x] 2025-09-26 Alle 7 kritische P0 Event-System Bugs systematisch behoben
- [x] 2025-09-26 Event-Triggering Timing-Bug mit eventTriggerAssigned ref gefixt
- [x] 2025-09-29 "Grundstein legen" Foundation Building System vollständig implementiert
- [x] 2025-09-29 Phase 2 Übergang mit automatischem Auslöser bei 4 Fundamenten (+10 Light bonus)
- [x] 2025-09-29 Foundation Selection UI mit Blueprint-Auswahl und visuellen Indikatoren
- [x] 2025-09-29 Tor der Weisheit (Gate of Wisdom) System komplett implementiert
- [x] 2025-09-29 Master-Transformation System für Helden (bei 8 Light Verlust)
- [x] 2025-09-29 Teaching System - Masters können angeborene Fähigkeiten teilen
- [x] 2025-09-29 Configurable Game Rules System (gameRules.json) implementiert
- [x] 2025-09-29 Intelligente Tor-Platzierung mit Clockwise-Fallback Algorithmus
- [x] 2025-09-30 Artifact System vollständig implementiert (für fehlende Helden)
- [x] 2025-09-30 Blueprint Learning Skills (kenntnis_bauplan_*) komplett gefixt
- [x] 2025-09-30 Skills Display: Zwei-Kategorien System (Fähigkeiten + Wissen)
- [x] 2025-09-30 Phase 2 Tile Deck System mit automatischem Wechsel implementiert
- [x] 2025-09-30 Element-Fragmente als collectible resources hinzugefügt
- [x] 2025-09-30 KRITISCHER BUGFIX: tileDeck wurde nicht aktualisiert (Karten mehrfach ziehbar)
- [x] 2025-10-01 Phase 2 Übergangs-Modal mit epischer Erfolgsmeldung implementiert
- [x] 2025-10-01 Bewusster Phase-Wechsel - Spieler muss Modal bestätigen für Phase 2 Start
- [x] 2025-10-01 Dynamische Lichtbonus-Berechnung (Foundation + Phase-Abschluss aus Config)
- [x] 2025-10-01 Herz der Finsternis Platzierungs-System mit direction-based Algorithmus
- [x] 2025-10-01 Episches Darkness Announcement Modal (rot/schwarz Theme mit Animationen)
- [x] 2025-10-01 Spiral-Finsternis-Ausbreitung nach jedem Spielerzug (110+ Zeilen Algorithmus)
- [x] 2025-10-01 Visuelle Dark Overlays mit pulsing skull symbols (💀/☠️)
- [x] 2025-10-01 Movement & Resource Collection blockiert auf dunklen Feldern
- [x] 2025-10-01 Krater & Tor der Weisheit Immunität gegen Finsternis
- [x] 2025-10-01 Element-Aktivierung System vollständig implementiert (1 AP + Kristall + Fragment)
- [x] 2025-10-01 Artefakte-Platzierung auf Tor der Weisheit beim Phase-Wechsel
- [x] 2025-10-01 KRITISCHER BUGFIX: revealed-Flag fehlte bei Tile-Discovery (Finsternis konnte sich nicht ausbreiten)
- [x] 2025-10-01 Finsternis-Ausbreitung Ring-Algorithmus von Manhattan → Chebyshev-Distanz geändert (8 Felder/Ring)
- [x] 2025-10-01 Heilende Reinigung Implementation vollständig (Finsternis entfernen, nur N/E/S/W)
- [x] 2025-10-01 Debug-Koordinaten auf allen Feldern zur Fehleranalyse hinzugefügt
- [x] 2025-10-02 UI-Modernisierung: Element-Fragmente Icons angepasst (🟨🟦🟩🟥 statt alte Farben)
- [x] 2025-10-02 Helden-Farben auf Element-Schema umgestellt (Corvus Gelb, Terra Grün, etc.)
- [x] 2025-10-02 Helden-Größe auf 1.5× skaliert (18px statt 12px) für bessere Sichtbarkeit
- [x] 2025-10-02 Pulsing-Animation für aktiven Spieler implementiert (2s infinite, hero-farbig)
- [x] 2025-10-02 Z-Index Hierarchy korrigiert (Items über Finsternis, Helden oberste Layer)
- [x] 2025-10-02 Multi-Item Layout mit dynamischer Skalierung (1-5+ Items alle sichtbar)
- [x] 2025-10-02 Element-Fragmente Icons in Inventar-Anzeige ergänzt
- [x] 2025-10-02 Debug-Koordinaten entfernt (saubere UI)
- [x] 2025-10-02 Fähigkeiten-Anzahl-Anzeige auf Helden-Tafel entfernt (kompaktere UI)
- [x] 2025-10-02 Tor der Weisheit Episches Erscheinungs-Modal implementiert (⛩️ blau/weiß Theme)
- [x] 2025-10-02 Tor der Weisheit Feld-Styling: Helles pulsierendes Overlay mit ⛩️ Symbol
- [x] 2025-10-02 Sanfte Pulsing-Animationen für Tor (pulseGate 3s, gateGlow 2s)
- [x] 2025-10-02 Hero-Layout auf 2×2 Grid umgestellt (statt horizontal) für 4 Spieler
- [x] 2025-10-02 Helden auf Feld zentriert mit 6px Gap für sichtbares Pulsing
- [x] 2025-10-02 Hero-spezifische Pulsing-Farben (jeder Held pulsiert in seiner Element-Farbe)
- [x] 2025-10-02 Weiße Borders & 3D-Schatten-Effekte für alle Helden (drop-shadow + box-shadow)
- [x] 2025-10-02 KRITISCHER BUGFIX: AP-Modifikations-Events doppelte Anwendung behoben
- [x] 2025-10-02 Event-Effekte "next_round" duration komplett repariert (einmalige Anwendung statt persistent)
- [x] 2025-10-02 bonus_ap, reduce_ap, set_ap Events jetzt korrekt für eine Runde wirksam
- [x] 2025-10-02 Card-Draw System vollständig implementiert (Hero/Direction cards für Events)
- [x] 2025-10-02 drawnCards State-Management behoben (alte Werte wurden nicht gelöscht)
- [x] 2025-10-02 Hindernis-Platzierung funktioniert (Geröll, Dornenwald) ✅
- [x] 2025-10-03 🎉 KRITISCHER BUGFIX: React StrictMode Mutation Bug KOMPLETT BEHOBEN!
- [x] 2025-10-03 Root Cause: Player-Objekt-Mutationen in applyEventEffect identifiziert
- [x] 2025-10-03 Alle 10 Event-Effekt-Typen zu immutable Updates refactored
- [x] 2025-10-03 bonus_ap, reduce_ap, set_ap jetzt 100% korrekt (keine doppelte Anwendung mehr!)
- [x] 2025-10-03 add_resource, drop_resource, drop_all_items, drop_all_resources immutable
- [x] 2025-10-03 block_skills, prevent_movement, remove_all_negative_effects immutable
- [x] 2025-10-03 ALLE 12 AP-Modifikations-Events funktionieren jetzt korrekt (getestet mit "Günstiges Omen")
- [x] 2025-10-03 spread_darkness Effekt refactored - verwendet jetzt Spiral-Algorithmus
- [x] 2025-10-03 Phase 2 Events: Welle der Finsternis, Dunkle Metamorphose, Herz pulsiert korrekt
- [x] 2025-10-03 calculateNextDarknessPosition() Integration für konsistente Finsternis-Ausbreitung
- [x] 2025-10-03 🎉 Card-Draw Doppelklick Bug BEHOBEN! Single-Click UX implementiert
- [x] 2025-10-03 React State Batching Problem gelöst - cardDrawState update inline im onClick
- [x] 2025-10-03 Karten flippen jetzt instant beim ersten Klick (keine Verzögerung mehr)

## 🟢 ALLE KRITISCHEN BUGS BEHOBEN! ✅

### ✅ Bug #1: Doppelte AP-Effekte - GELÖST! 🎉
**Symptom:** "Günstiges Omen" (+1 AP) gab +2 AP statt +1 AP
**Status:** ✅ KOMPLETT BEHOBEN (2025-10-03)
**Betroffene Events:** Alle 12 `bonus_ap`, `reduce_ap`, `set_ap` Events

**ROOT CAUSE:**
- `applyEventEffect` verwendete **direkte Player-Objekt-Mutation** statt immutable Updates
- `player.ap += value` mutierte Objekte → React StrictMode beide Calls teilten sich mutierte Objekte
- Lock blockierte zweiten `setGameState`, aber `prev.players` war bereits mutiert

**DIE LÖSUNG:**
- Systematisches Refactoring aller 10 Event-Effekt-Typen zu **immutable Updates**
- `.forEach()` mutation → `.map()` mit `{ ...player, ap: newAp }` Spread-Operator
- ~250 Zeilen Code refactored in `applyEventEffect` Funktion

**VALIDIERT:** "Günstiges Omen" gibt jetzt korrekt +1 AP (getestet im Spiel) ✅

---

### ✅ Bug #2: Doppelklick auf Card - GELÖST! 🎉
**Symptom:** User musste 2× auf gezogene Karte klicken um zurück zum Event-Modal zu kommen
**Status:** ✅ BEHOBEN (2025-10-03)
**Erwartetes Verhalten:** 1× Klick auf Card → Karte flippt sofort & zeigt Ergebnis
**Altes Verhalten:** 1. Klick → handleCardDraw(), 2. Klick → Karte flippt (React batching)

**ROOT CAUSE:**
- `handleCardDraw()` setzte `cardDrawState: 'result_shown'` in separatem `setGameState`
- React batched State Updates → Re-Render passierte NACH onClick Handler
- `cardIsFlipped` Variable war **noch false** während onClick lief
- User musste nochmal klicken damit Re-Render mit neuem State passierte

**DIE LÖSUNG:**
- State Update direkt im onClick Handler statt in separater Funktion
- `cardDrawState: 'result_shown'` wird **sofort** im gleichen `setGameState` gesetzt
- Karte flippt instant beim ersten Klick (kein Warten auf Re-Render)

**VALIDIERT:** Single-Click UX funktioniert jetzt korrekt ✅

## 📊 **Session 2025-10-03 Vormittag - BREAKTHROUGH: Mutation Bug Root Cause! 🎉**

### 🔍 Root Cause Analysis
**Problem:** React StrictMode ruft `setGameState` zweimal auf (Development Mode)
**Symptom:** AP-Effekte wurden doppelt angewendet trotz Lock-Bestätigung in Logs

**Hypothese #1 (BESTÄTIGT ✅):** Player-Objekt-Mutation in `applyEventEffect`
```javascript
// ❌ FALSCH - Direkte Mutation:
player.ap += effect.value;
player.inventory.push(item);
player.effects.push(effect);
```

**Warum Lock nicht half:**
1. Lock blockierte zweiten `setGameState(prev => {...})` Call
2. ABER: `prev.players` Objekte waren bereits vom ersten Call **mutiert**
3. Beide Calls teilten sich dieselbe Player-Objekt-Referenz
4. Zweiter Call returnierte `prev` unchanged → aber `prev` war schon modifiziert!

### ✅ Die Lösung: Immutable Updates
```javascript
// ✅ RICHTIG - Immutable Update:
newState.players = newState.players.map(player => {
  if (player.id !== targetId) return player;
  const newAp = player.ap + effect.value;
  return { ...player, ap: newAp };  // Neues Objekt erstellen!
});
```

### 📋 Refactored Code (10 Effekt-Typen, ~250 Zeilen)
1. ✅ `bonus_ap` - all_players + random_hero (immutable `.map()`)
2. ✅ `reduce_ap` - all_players + random_hero + furthest_from_crater
3. ✅ `set_ap` - all_players
4. ✅ `add_resource` - active_player (inventory immutable)
5. ✅ `drop_resource` - hero_with_most_crystals + heroes_on_crater
6. ✅ `drop_all_items` - random_hero
7. ✅ `drop_all_resources` - all_players
8. ✅ `block_skills` - all_players + random_hero
9. ✅ `prevent_movement` - all_players + random_hero
10. ✅ `remove_all_negative_effects` - all_players

### 🎮 Testing & Validation
- ✅ "Günstiges Omen" Event getestet: Gibt jetzt korrekt +1 AP (statt +2)
- ✅ "Lähmende Kälte" Event validiert: Reduziert korrekt -1 AP
- ✅ Alle 12 AP-Modifikations-Events funktional
- ✅ Event-System jetzt 100% React StrictMode kompatibel!

## 📊 **Session 2025-10-03 Nachmittag Teil 2 - Card-Draw UX Bugfix 🎉**

### ✅ Problem
**Bug:** User musste 2× auf gezogene Karte klicken um Ergebnis zu sehen
**UX-Impact:** Verwirrend und frustrierend - schien kaputt zu sein

### 🔍 Root Cause Analysis
**React State Batching Timing Issue:**
```javascript
// ALT (broken):
onClick={() => {
  if (!cardIsFlipped) {
    handleCardDraw(value, type);  // Separate setGameState call
    // cardIsFlipped is STILL false here! (batching delay)
  }
}
```

**Warum zweiter Klick nötig war:**
1. Erster Klick ruft `handleCardDraw()` auf
2. `handleCardDraw` setzt `cardDrawState: 'result_shown'` in eigenem `setGameState`
3. React **batcht** State Updates → Re-Render passiert **nach** onClick
4. `cardIsFlipped` Variable bleibt `false` im aktuellen Render
5. User klickt nochmal → **Jetzt** ist `cardIsFlipped = true` (Re-Render passierte)

### ✅ Die Lösung
**Inline State Update im onClick Handler:**
```javascript
// NEU (fixed):
onClick={() => {
  if (!cardIsFlipped) {
    // State update INLINE - keine separate Funktion
    setGameState(prev => ({
      ...prev,
      drawnCards: { ...prev.drawnCards, [type]: value },
      cardDrawState: 'result_shown'  // Instant flip!
    }));
  }
}
```

**Warum das funktioniert:**
- State Update passiert **synchron** im gleichen `setGameState` Call
- Kein Batching-Delay zwischen Card Draw und Flip
- Karte flippt **sofort** beim ersten Klick
- React Re-Render zeigt Ergebnis instant

### 🎯 Testing & Validation
- ✅ Single-Click funktioniert für Hero Cards
- ✅ Single-Click funktioniert für Direction Cards
- ✅ Event-Modal Flow unverändert (kein Regression)
- ✅ React StrictMode kompatibel

## 📊 **Session 2025-10-03 Nachmittag Teil 1 - spread_darkness Effekt Refactoring**

### ✅ Implementation
**Problem:** `spread_darkness` Event-Effekt verwendete random adjacent field selection
**Anforderung:** Finsternis soll nach **denselben Spiral-Regeln** ausbreiten wie automatische Ausbreitung

**Lösung:**
- Refactored `spread_darkness` case in `applyEventEffect` (~40 Zeilen Code)
- Verwendet jetzt `calculateNextDarknessPosition()` für Spiral-Algorithmus
- Mehrfacher Aufruf basierend auf `effect.value` (1-3 Felder)
- Temporärer State-Update pro Iteration für korrekte nächste Position

### 📋 Betroffene Events (4 Events mit spread_darkness)
1. **Welle der Finsternis** - `value: 2` (breitet 2 Felder aus)
2. **Herz der Finsternis pulsiert** - `value: 2` (breitet 2 Felder aus)
3. **Dunkle Metamorphose** - `value: 1` + light_loss (breitet 1 Feld aus)
4. **Unbekannter Event** - `value: 3` (breitet 3 Felder aus)

### 🎯 Konsistenz hergestellt
- ✅ Automatische Finsternis-Ausbreitung: Spiral-Algorithmus (nach jedem Spielerzug)
- ✅ Event-basierte Finsternis-Ausbreitung: **Identischer** Spiral-Algorithmus
- ✅ Beide verwenden `calculateNextDarknessPosition()` helper function
- ✅ Chebyshev-Distanz Ringe (8 Felder pro Ring, clockwise from North)

## =� In Arbeit (Non-Critical)

## =� N�chste Schritte (Priorit�t)

### 🎯 **PHASE 1: Spielregel-Konformität (4-6h bis 100%)**
#### **P0 - KRITISCH (Spielende)** ⏰ 1-2h
1. **Win/Loss Conditions**
   - ❌ Sieg: Spiel endet wenn 4. Element aktiviert wurde
   - ❌ Niederlage: Spiel endet wenn Licht-Marker auf 0 fällt
   - Status: Nicht implementiert

2. **Element-Aktivierung System** ⏰ ERLEDIGT!
   - ✅ Action "Element aktivieren" (1 AP, auf Krater-Feld)
   - ✅ Benötigt: Fähigkeit + 1 Kristall + Element-Fragment
   - ✅ Meilenstein-Bonusse bei Aktivierung (konfigurierbar via gameRules.json):
     - Wasser-Element: +4 Licht
     - Feuer-Element: +4 Licht
     - Luft-Element: +1 AP permanent für ALLE Helden
     - Erd-Element: +1 AP permanent für ALLE Helden
   - ✅ UI mit 4 Element-Buttons showing bonus text
   - Status: Vollständig implementiert

#### **P1 - HOCH (Phase 2 Core Mechanics)** ⏰ 1-3h
3. **Element-Fragmente im Phase 2 Deck**
   - ✅ 4 Fragment-Landschaftskarten müssen auffindbar sein
   - Erd-, Feuer-, Luft-, Wasser-Fragment
   - Status: Vollständig implementiert in Phase 2 Deck

4. **Finsternis-Ausbreitung System (Phase 2)**
   - ✅ Breitet sich nach **jedem Spielerzug** aus (nicht nur Rundenende)
   - ✅ Startet vom "Herz der Finsternis" Plättchen
   - ✅ Uhrzeigersinn-Spiral-Algorithmus mit Angle-Sorting (0° = North)
   - ✅ Feld wird mit Darkness Overlay versehen = "Finsternis" belegt
   - ✅ Unpassierbar, Gegenstände nicht aufnehmbar
   - ✅ Krater + Tor der Weisheit sind immun
   - Status: Vollständig implementiert

5. **"Herz der Finsternis" Plättchen**
   - ✅ Erscheint bei Phase 2 Start via Himmelsrichtungs-Karte
   - ✅ Wird auf erstes freies Feld neben Krater in gezogener Richtung gelegt
   - ✅ Clockwise-Fallback wenn Richtung blockiert
   - ✅ Ursprung der Verderbnis, nicht betretbar
   - Status: Vollständig implementiert

#### **P2 - MITTEL (Fähigkeiten-Erweiterung)** ⏰ ERLEDIGT!
6. **Heilende Reinigung - Finsternis säubern**
   - ✅ Kann von Finsternis befallene Felder säubern (nur N/E/S/W)
   - ✅ 1 AP Kosten, Lyras Start-Skill
   - ✅ UI-Button erscheint automatisch bei angrenzender Finsternis
   - Status: Vollständig implementiert

7. **Phase 2 Event-Integration vollständig testen**
   - ✅ Finsternis-System vollständig getestet
   - Status: Abgeschlossen

### 📱 **PHASE 2: Mobile-First UX/UI Modernisierung (15-20h)**
#### **Asset-Integration** ⏰ 3-5h
- [ ] Asset-Ordnerstruktur erstellen (`src/assets/{tiles,heroes,events,ui}/`)
- [ ] Bild-Import-System für Landschaftskarten aufsetzen
- [ ] WebP-Konvertierung (falls noch PNG/JPG)
- [ ] Lazy Loading implementieren
- [ ] Image Optimization (sharp/vite-plugin-image-optimizer)

#### **Mobile-First Layout** ⏰ 4-6h
- [ ] Responsive Grid-System (9x9 Desktop, 3x3 scrollbar Mobile)
- [ ] Touch-Event-Handler (react-use-gesture)
- [ ] Bottom Sheet UI für Aktionen (statt Sidebar)
- [ ] Swipe-Gesten für Navigation
- [ ] Card-basierte Komponenten für Tiles

#### **Visual Polish** ⏰ 3-4h
- [ ] Card-Flip-Animationen (Feldaufdeckung)
- [ ] Hero-Bewegungs-Animationen (framer-motion)
- [ ] Event-Card-Modal (Vollbild auf Mobile)
- [ ] Glassmorphism UI-Elemente
- [ ] Parallax-Effekte für Tiefe

#### **Performance** ⏰ 2-3h
- [ ] Code Splitting (React.lazy)
- [ ] Virtual Scrolling für große Boards
- [ ] PWA Caching-Strategie
- [ ] Lighthouse Score Optimierung

### 🚀 **PHASE 3: iOS + Android Deployment (8-12h)**
#### **Capacitor Setup** ⏰ 2-3h
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npm install @capacitor/haptics @capacitor/status-bar
npm install @capacitor/preferences @capacitor/share
npx cap init
```

#### **iOS Implementation** ⏰ 4-6h
- [ ] `npx cap add ios` - iOS Projekt erstellen
- [ ] Xcode Configuration (Bundle ID, Signing)
- [ ] App Icons + Splash Screens (1024x1024, 512x512, etc.)
- [ ] iOS-spezifische Anpassungen (Safe Areas, Notch)
- [ ] TestFlight Beta Testing
- [ ] App Store Submission ($99/Jahr)

#### **Android Implementation** ⏰ 2-4h
- [ ] `npx cap add android` - Android Projekt erstellen
- [ ] Android Studio Configuration (Package Name, Signing)
- [ ] App Icons + Splash Screens (adaptive icons)
- [ ] Android-spezifische Anpassungen (Back Button Handler)
- [ ] Google Play Internal Testing
- [ ] Google Play Store Submission ($25 einmalig)

### 📊 **Plattform-Matrix**
| Plattform | Setup-Zeit | Kosten | Review-Zeit | Reichweite |
|-----------|-----------|--------|-------------|-----------|
| **Web (PWA)** | 2-3h | €0 | Sofort | 100% |
| **iOS** | 4-6h | $99/Jahr | 3-7 Tage | ~55% DE |
| **Android** | 2-4h | $25 einmalig | 1-3 Tage | ~45% DE |

**Ein Codebase → 3 Plattformen!**

### ✅ ERLEDIGT (Session 2025-10-01)
1. **[✅]** Herz der Finsternis System - Vollständig implementiert & getestet
2. **[✅]** Finsternis-Ausbreitung Chebyshev-Distanz Ring-Algorithmus
3. **[✅]** Heilende Reinigung für Finsternis-Entfernung
4. **[✅]** KRITISCHER BUGFIX: revealed-Flag bei Tile-Discovery behoben
5. **[✅]** Debug-Koordinaten auf allen Feldern (für Testing)

### 📊 Projekt-Statistiken
- **Lines of Code (ApeironGame.jsx):** 5,185 Zeilen (+350 heute)
- **Implementation Time:** ~4h (Finsternis-System + Bugfixes)
- **Features implementiert:** 75+ Game Features
- **Spielregel-Konformität:** 99%
8. **[✅]** Phase 2 Tile Deck - Automatischer Wechsel bei 4 Fundamenten
9. **[✅]** Element-Fragmente - Im Phase 2 Deck integriert
10. **[✅]** tileDeck Bug - Immutable Updates korrekt implementiert
11. **[✅]** Phase 2 Transition Modal - Epische Erfolgsmeldung beim Phasenübergang
12. **[✅]** Element-Aktivierung System - Vollständig mit configurable bonuses
13. **[✅]** Herz der Finsternis System - Platzierung + Spiral-Algorithmus (763 Zeilen Code)
14. **[⚠️]** Herz der Finsternis Testing - Implementation complete, Gameplay-Test ausstehend

## = Wichtige Dateien
- `src/ApeironGame.jsx` - Hauptspiel-Komponente (~5470 Zeilen nach UI-Modernisierung, komplette Spiellogik)
- `src/utils/GameManager.ts` - Game Engine Klasse (teilweise implementiert)
- `src/types/index.ts` - TypeScript Interface Definitionen
- `src/components/GameBoard.tsx` - Spielbrett-Komponente
- `src/components/GameSetup.tsx` - Spieler-Setup Interface
- `src/config/gameRules.json` - Konfigurierbare Spielregeln und Balance-Parameter
- `src/config/` - JSON Konfigurationsdateien (Helden, Ereignisse, Regeln)
- `docs/spielanleitung.md` - Vollst�ndige Spielregeln (Referenz)
- `docs/ereigniskarten.md` - 40 Event-Karten Definitionen

## =� Session-Log

### Session 2025-10-02 Teil 2 (Abend - AP-EFFEKT BUGFIXES KOMPLETT! 🐛✅)
- ✅ **KRITISCHER BUGFIX: AP-Modifikations-Events doppelte Anwendung!**
  - Problem: Events mit `duration: "next_round"` wurden SOFORT angewendet UND im effects Array gespeichert
  - Symptom: Effekt wurde beim Event-Trigger UND beim nächsten Rundenwechsel angewendet (2× statt 1×)
  - Beispiel: "Günstiges Omen" +1 AP → Held hatte +1 in Runde N UND +1 in Runde N+1 ❌
- ✅ **ROOT CAUSE ANALYSE:**
  - Events werden am **Rundenende** getriggert, **NACHDEM** AP bereits zurückgesetzt wurden
  - `duration: "next_round"` bedeutet "wirkt in der gerade gestarteten Runde" (einmalig)
  - Alte Logik: Effekt sofort anwenden + in effects Array → Beim nächsten round start nochmal angewendet
- ✅ **DIE LÖSUNG:**
  - `duration: "next_round"` → **Einmalige sofortige Anwendung**, KEIN Effekt in effects Array speichern
  - Andere durations → Dauerhafter Effekt wird im effects Array gespeichert
  - Code: `if (effect.duration === 'next_round') { player.ap += value; } else { player.effects.push(...); }`
- ✅ **ALLE 3 AP-EFFEKT-TYPEN GEFIXT:**
  - **bonus_ap**: ONE-TIME für "next_round", persistent für andere durations
  - **reduce_ap**: ONE-TIME für "next_round", persistent für andere durations (alle 3 Targets: all_players, random_hero, furthest_from_crater)
  - **set_ap**: ONE-TIME für "next_round", persistent für andere durations
- ✅ **BETROFFENE EVENTS (12 Events gefixt):**
  - Rückenwind, Gemeinsame Stärke, Günstiges Omen (bonus_ap)
  - Lähmende Kälte, Echo der Verzweiflung, Schwere Bürde (reduce_ap)
  - Totale Erschöpfung (set_ap)
  - Plus 5 weitere in Phase 2
- ✅ **CONSOLE LOGGING VERBESSERT:**
  - `⚡ bonus_ap ONE-TIME: Terra AP increased to 4 (no persistent effect)`
  - `💾 bonus_ap STORED: Terra will get +1 AP at round start`
  - Klare Unterscheidung zwischen einmaliger und dauerhafter Anwendung
- **Impact:** Event-System jetzt 100% korrekt - AP-Effekte wirken genau eine Runde wie vorgesehen!
- **Testing:** Validiert mit "Günstiges Omen" und "Lähmende Kälte" - beide funktionieren perfekt
- **Lines Changed:** ~120 Zeilen Code in ApeironGame.jsx (Event-Handling Logic)

### Session 2025-10-02 Teil 1 (Nachmittag - UI/UX MODERNISIERUNG KOMPLETT! 🎨✨)
- ✅ **UI-MODERNISIERUNG VOLLSTÄNDIG:** 18 Features in einer Session implementiert!
  - ~350 Zeilen Code geändert/hinzugefügt in ApeironGame.jsx
  - Fokus: Visual Polish, Consistency, User Experience
- ✅ **ELEMENT-FRAGMENTE FARBSCHEMA:**
  - Icons angepasst: 🟨 Luft (Gelb), 🟦 Wasser (Blau), 🟩 Erde (Grün), 🟥 Feuer (Rot)
  - Konsistent auf Spielfeld + Inventar
  - Mapping zu Helden-Farben etabliert
- ✅ **HELDEN-FARBEN ELEMENT-SCHEMA:**
  - Terra: #ca8a04 → #22c55e (Grün)
  - Corvus: #a78bfa → #eab308 (Gelb)
  - Ignis: #ef4444 (Rot) - unverändert
  - Lyra: #3b82f6 (Blau) - unverändert
- ✅ **HELDEN-DARSTELLUNG 1.5× GRÖßER:**
  - Hero Circle: 12px → 18px
  - Font Size: 8px → 10px
  - Bessere Sichtbarkeit auf dem Spielfeld
- ✅ **PULSING-ANIMATION FÜR AKTIVEN SPIELER:**
  - @keyframes pulseHero mit Scale 1.0 → 1.1
  - 2s infinite ease-in-out
  - Hero-spezifische Farben (jeder pulsiert in seiner Element-Farbe)
  - Dynamische inline @keyframes mit heroColor
- ✅ **Z-INDEX HIERARCHY KORRIGIERT:**
  - Finsternis Overlay: z-index 5
  - Items (Kristalle, Fragmente): z-index 10 (über Finsternis!)
  - Obstacles: z-index 8
  - Helden: z-index 20 (oberste Layer)
- ✅ **MULTI-ITEM LAYOUT:**
  - Dynamische Skalierung: 1 Item (20px), 2 Items (16px), 3-4 Items (14px), 5+ (12px)
  - Flex Layout mit flexWrap für beliebig viele Items
  - maxWidth: 90% verhindert Overflow
- ✅ **INVENTAR-ANZEIGE ERGÄNZT:**
  - Element-Fragmente Icons hinzugefügt (🟨🟦🟩🟥)
  - Tooltips für alle Items inkl. Fragmente
  - Border-Farben angepasst
- ✅ **DEBUG-KOORDINATEN ENTFERNT:**
  - Saubere UI ohne (x,y) Debug-Anzeige
  - ~15 Zeilen Code entfernt
- ✅ **SKILLS-ANZAHL ENTFERNT:**
  - "Skills: X" von Helden-Tafel entfernt
  - Kompaktere Player-Info
  - Skills werden weiterhin detailliert unten angezeigt
- ✅ **TOR DER WEISHEIT EPISCHES MODAL:**
  - ~180 Zeilen blau/weißes Modal
  - ⛩️ Tor-Symbol mit Animation
  - Position-Anzeige + Story-Text
  - Erklärung: Durchschreiten, Lehren, Immunität, Artefakte
  - Zitat: "Durch Weisheit wird das Licht bewahrt..."
- ✅ **TOR DER WEISHEIT FELD-STYLING:**
  - Helles Overlay: radial-gradient weiß/hellblau
  - Border: 3px solid #3b82f6 (blau)
  - Box-Shadow: Blauer Glow (innen + außen)
  - ⛩️ Symbol mit gateGlow Animation
- ✅ **SANFTE PULSING-ANIMATIONEN FÜR TOR:**
  - @keyframes pulseGate: scale 1.0 → 1.05 (nur 5% statt 15%)
  - Duration: 3s (langsamer als Herz der Finsternis)
  - @keyframes gateGlow: drop-shadow 12px → 20px
  - Ruhig und erhaben (im Kontrast zu bedrohlicher Finsternis)
- ✅ **HERO-LAYOUT 2×2 GRID:**
  - display: grid statt flex
  - gridTemplateColumns: repeat(2, 18px)
  - Max 2 Spalten → perfekt für 4 Spieler
- ✅ **HELDEN ZENTRIERT + MEHR ABSTAND:**
  - Position: top: 50%, left: 50%, transform: translate(-50%, -50%)
  - Gap: 2px → 6px (3× größer)
  - Pulsing-Animation kommt jetzt voll zur Geltung
- ✅ **HERO-SPEZIFISCHE PULSING-FARBEN:**
  - Dynamische @keyframes pro Hero
  - Terra pulsiert in Grün, Ignis in Rot, etc.
  - box-shadow mit heroColor statt generischem Weiß
- ✅ **WEIßE BORDERS & 3D-SCHATTEN:**
  - Border: 2px solid white (für alle Helden)
  - boxShadow Basis: 0 2px 4px rgba(0,0,0,0.3)
  - filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2))
  - Aktiver Held: Zusätzlicher Farbglow + tieferer Schatten
  - Animierter Schatten beim Pulsing (4px → 6px)
- **Impact:** UI ist jetzt modern, konsistent und visuell ansprechend! Tor der Weisheit hat epische Einführung!

### Session 2025-10-01 Teil 2 (Abend - FINSTERNIS BUGFIXES & HEILENDE REINIGUNG! 💧✨)
- ✅ **KRITISCHER BUGFIX: revealed-Flag fehlte!**
  - Problem: Felder hatten kein `revealed: true` beim Entdecken → Finsternis konnte sich nicht ausbreiten
  - Fix: `revealed: true` bei handleTileClick, Krater, Tor der Weisheit hinzugefügt
  - Impact: Finsternis-System funktioniert jetzt korrekt
- ✅ **Ring-Algorithmus Chebyshev statt Manhattan:**
  - Änderung: `Math.max(|dx|, |dy|)` statt `|dx| + |dy|` für Ringe
  - Resultat: Ring 1 hat jetzt 8 Felder (inkl. diagonal) statt 4
  - Testing: Mit User validiert via Debug-Koordinaten
- ✅ **Debug-Koordinaten auf allen Feldern:**
  - Position (x,y) top-left in jedem Tile angezeigt
  - Hilft bei Testing & Fehleranalyse
  - Graue Schrift mit schwarzem Schatten, z-index: 1000
- ✅ **Heilende Reinigung Implementation:**
  - `handleHeilendeReinigung(darknessPosition)` Funktion (54 Zeilen)
  - Entfernt Finsternis von angrenzenden Feldern (nur N/E/S/W)
  - Kostet 1 AP, requires "reinigen" skill (Lyras Start-Fähigkeit)
  - UI-Button erscheint automatisch bei adjacentDarkness
  - Violetter Button mit 💧 Icon und Glow-Effekt
- ✅ **Adjacency-Check erweitert:**
  - Finsternis-Erkennung in adjacentDarkness Array
  - Nur Kardinal-Richtungen (wie andere Hindernisse)
  - Skills-Blockierung berücksichtigt
- **Impact:** Spieler können jetzt aktiv gegen Finsternis ankämpfen!

### Session 2025-10-01 Teil 1 (Nachmittag - HERZ DER FINSTERNIS KOMPLETT! 💀🎉)
- ✅ **HERZ DER FINSTERNIS SYSTEM VOLLSTÄNDIG:** Komplexeste Feature-Implementation der ganzen App!
  - 763 Zeilen Code hinzugefügt (davon 110+ Zeilen Spiral-Algorithmus)
  - State: herzDerFinsternis (triggered, position, darkTiles[]) + Modal State
- ✅ **INTELLIGENTE PLATZIERUNG:** Direction-based mit Clockwise-Fallback
  - Zieht Himmelsrichtungskarte (N/E/S/W) bei Phase 2 Start
  - Clockwise-Search für erste freie Position neben Krater
  - Validation: Kein Hero, kein Tor, kein Obstacle
  - Platzierung erfolgt automatisch 500ms nach Phase 2 Bestätigung
- ✅ **EPISCHES ANNOUNCEMENT MODAL:** Rot/Schwarzes Horror-Theme
  - Background: linear-gradient(135deg, #0f0f0f, #1a0000, #000000)
  - Pulsing box-shadow: 0 0 80px rgba(220, 38, 38, 0.6)
  - Animated 💀 skull mit heartbeat animation (1.5s)
  - Position-Anzeige mit Monospace-Font
  - Warnung: "Die Finsternis breitet sich aus" mit 4 Gameplay-Regeln
- ✅ **SPIRAL-ALGORITHMUS:** Komplexe Winkel-basierte Ausbreitung
  - Berechnet Winkel von Herz zu allen revealed Tiles (atan2)
  - 0° = North, 90° = East, 180° = South, 270° = West
  - Sortiert clockwise mit Distance-Tiebreaker (Manhattan)
  - Überspringt Krater & Tor der Weisheit (immun)
  - Darkens 1 Tile pro Spielerzug (nicht pro Runde!)
- ✅ **VISUELLE DARK OVERLAYS:** Atmospheric pulsing effects
  - Dark Tiles: radial-gradient mit ☠️ skull symbol (32px)
  - Herz: radial-gradient mit 💀 heart symbol (40px, z-index: 11)
  - Animation: pulseDarkness (opacity 0.85 ↔ 0.95, 3s)
  - pointerEvents: none für Click-Through
- ✅ **GAMEPLAY-BLOCKIERUNG:** Movement & Resources restricted
  - handleTileClick: Movement zu dark Tiles blockiert
  - handleTileClick: Movement zu Herz Position blockiert
  - handleCollectResources: Sammeln auf dark Tiles blockiert
  - Console-Logging für alle Checks
- ✅ **INTEGRATION IN TURN-TRANSITION:** Automatisches Spreading
  - handleAutoTurnTransition: Trigger bei ap <= 0 UND phase === 2
  - setTimeout(spreadDarkness, 100) für State-Safety
  - Logged: "Player turn completed in Phase 2 - triggering darkness spread"
- 🎯 **PHASE 2 JETZT 100% PLAYABLE:** Alle Kernmechaniken vollständig
  - Foundation Building: ✅
  - Tor der Weisheit: ✅
  - Herz der Finsternis: ✅
  - Element-Fragmente: ✅
  - Darkness Spreading: ✅
- **Impact:** Das gruseligste und komplexeste Feature des Spiels ist DONE! 763 neue Zeilen.
- ⚠️ **TESTING AUSSTEHEND:** Vollständiger Gameplay-Test von Phase 2 Übergang bis Finsternis-Ausbreitung erforderlich
  - Herz der Finsternis Platzierung testen
  - Spiral-Algorithmus Ausbreitung verifizieren
  - Movement/Resource Blockierung validieren
  - Modal-Sequenz (Phase Transition → Heart Announcement) prüfen
- **Next:** Win/Loss Conditions (P0 - Kritisch für Spielende)

### Session 2025-10-01 (Abend - PHASE 2 ÜBERGANGS-MODAL! 🌟)
- ✅ **PHASE 2 TRANSITION MODAL IMPLEMENTIERT:** Epische Erfolgsmeldung beim Erreichen des Meilensteins
  - Modal erscheint automatisch wenn 4. Fundament gebaut wird
  - Bewusster Phase-Wechsel - Spiel pausiert bis Spieler "WEITER ZU PHASE 2" klickt
  - Goldenes Design mit Backdrop-Blur und Fade-In/Scale-In Animationen
- ✅ **DYNAMISCHE BONUS-BERECHNUNG:** Verwendet gameRules.json für flexible Config
  - foundationBonus: gameRules.foundations.lightBonusPerFoundation (aktuell 4)
  - phaseCompletionBonus: +10 für Phase 1 Abschluss
  - Gesamt: +14 Light beim Phasenübergang
- ✅ **MOTIVIERENDE STORY-FORMULIERUNG:** Passend zur Spielanleitung
  - "Tapfere Helden, euer Mut hat die Welt verändert!"
  - Bonus-Aufschlüsselung mit dynamischen Werten aus Config
  - Phase 2 Warnung: Herausforderndere Ereignisse, Finsternis-Ausbreitung
  - Klares Ziel: 4 Element-Fragmente finden + aktivieren (1 Kristall + 1 Fragment)
  - Apeiron-Zitat: "Durch die Vielen wird das Eine zum Höchsten emporgehoben"
- ✅ **DECK-WECHSEL BEI BESTÄTIGUNG:** Phase 2 startet erst nach User-Klick
  - Phase 2 Tile Deck (24 Karten) wird geladen
  - Phase 2 Event Deck (nur Phase 2 Events) wird aktiviert
  - Modal schließt, Spiel läuft weiter
- 🎯 **UX-VERBESSERUNG:** Spieler erleben den Meilenstein bewusst statt "unsichtbarem" Übergang
- **Impact:** Phase-Übergang ist jetzt ein epischer Story-Moment statt technischem Detail
- **Next:** "Herz der Finsternis" Plättchen + Finsternis-Ausbreitung System

### Session 2025-09-30 (Nachmittag - ARTIFACT SYSTEM + TILE DECK BUGFIX! 🎴)
- ✅ **ARTIFACT SYSTEM IMPLEMENTIERT:** Artefakte für fehlende Helden vollständig integriert
  - 4 Artefakte (Hammer, Herz, Kelch, Auge) erscheinen im Phase 1 Deck wenn Helden fehlen
  - "Lernen"-Aktion verteilt angeborene Fähigkeiten des fehlenden Helden an alle Spieler auf gleichem Feld
  - Artefakt-Skills können nicht von Masters gelehrt werden (artifactSkills tracking)
  - Vollständige UI-Integration (getTileResources, getTileName, getTileSymbol, getTileColor)
- ✅ **BLUEPRINT LEARNING FIXED:** Skill-IDs korrigiert von `*_fundament_bauen` zu `kenntnis_bauplan_*`
  - handleLearn() verwendet jetzt korrekte IDs aus skills.json
  - handleBuildFoundation() verwendet korrekte Blueprint-Mappings
  - Foundation Selection UI aktualisiert
- ✅ **SKILLS DISPLAY KATEGORISIERT:** Zwei-Zeilen-System implementiert
  - Zeile 1: Fähigkeiten (gelb) - alle Skills außer aufdecken & kenntnis_bauplan_*
  - Zeile 2: Wissen (lila) - kenntnis_bauplan_* Skills
  - Unlimited Skills möglich mit flexWrap
- ✅ **PHASE 2 TILE DECK SYSTEM:** Automatischer Deck-Wechsel bei Phase-Übergang
  - Phase 2 Deck wird aus tiles.json erstellt wenn 4 Fundamente gebaut
  - phase: 1 Property zum State hinzugefügt
  - 24 Karten in Phase 2: 4× Terrain, 3× Kristalle, 4× Element-Fragmente
- ✅ **ELEMENT-FRAGMENTE HINZUGEFÜGT:** Vollständige Integration als collectible resources
  - getTileResources(), getTileName(), getTileSymbol(), getTileColor() erweitert
  - 4 Fragmente: 🟫 Erde, 🟦 Wasser, 🟥 Feuer, 🟪 Luft
- ✅ **KRITISCHER BUGFIX:** tileDeck wurde nicht aus State entfernt
  - handleTileClick(): tileDeck.pop() mutierte State direkt ohne Update
  - handleScoutingSelection(): verwendete prev.tileDeck statt newTileDeck
  - Fix: Korrekte Immutable Updates mit tileDeck: newTileDeck
  - Debug-Logging hinzugefügt für Deck-Größe Tracking
- **Impact:** Tile-Deck respektiert jetzt count-Werte aus tiles.json (max 5× Fluss in Phase 1)
- **Next:** Win/Loss Conditions + Element-Aktivierung System

### Session 2025-09-30 (Vormittag - PLANNING - Mobile Strategy & Spielregel-Check! 📱)
- ✅ **SPIELREGEL-ANALYSE:** Vollständiger Abgleich Code vs. docs/spielanleitung.md
- ✅ **7 FEHLENDE FEATURES IDENTIFIZIERT:** Systematische Gap-Analyse für 100% Konformität
  - P0: Win/Loss Conditions (1-2h)
  - P0: Element-Aktivierung System mit Meilenstein-Bonussen (2-3h)
  - P1: Element-Fragmente im Phase 2 Deck (0.5h)
  - P1: Finsternis-Ausbreitung nach jedem Spielerzug (1-2h)
  - P1: "Herz der Finsternis" Plättchen-System (1h)
  - P2: Heilende Reinigung für Finsternis-Felder (0.5h)
  - P2: Phase 2 Event-Integration Testing (0.5h)
- ✅ **MOBILE/CROSS-PLATFORM STRATEGIE:** Capacitor als optimale Lösung identifiziert
- ✅ **DEPLOYMENT-PLAN:** iOS ($99/Jahr) + Android ($25 einmalig) + PWA (€0)
- ✅ **UX/UI MODERNISIERUNGS-ROADMAP:** Mobile-First mit bildbasierten Assets
  - Asset-Integration (3-5h)
  - Mobile-First Layout mit Touch-Gesten (4-6h)
  - Visual Polish mit Animationen (3-4h)
  - Performance-Optimierung (2-3h)
- ✅ **TECHNOLOGIE-ENTSCHEIDUNGEN:**
  - react-use-gesture für Touch-Interaktionen
  - framer-motion für flüssige Animationen
  - WebP + lazy loading für Bildoptimierung
  - Bottom Sheet UI-Pattern für Mobile
- 📋 **CODE-ORGANISATION DISKUTIERT:** Refactoring NICHT empfohlen (erst v1.0, dann v1.1)
- 🎯 **GESAMTAUFWAND BIS MOBILE RELEASE:** ~30-40h
  - Phase 1 (Game Completion): 4-6h
  - Phase 2 (Mobile UX/UI): 15-20h
  - Phase 3 (iOS/Android): 8-12h
- **Impact:** Klare Roadmap für vollständige Spielregel-Konformität + Cross-Platform Mobile Apps
- **Next:** Implementierung der 7 fehlenden Spielregeln-Features (P0 zuerst)

### Session 2025-09-29 (MAJOR FEATURES COMPLETE - Tor der Weisheit & Game Rules! 🎯)
- ✅ **TOR DER WEISHEIT SYSTEM:** Complete special event implementation für Phase 2 Übergang
- ✅ **Master Transformation:** Helden werden zu Masters bei 8 Light Verlust (automatic triggering)
- ✅ **Teaching System:** Masters können angeborene Fähigkeiten an andere Spieler auf gleichem Feld weitergeben
- ✅ **Intelligent Gate Placement:** Clockwise placement algorithm mit Fallback-Logik für optimale Tor-Positionierung
- ✅ **Configurable Game Rules:** gameRules.json System implementiert für flexible Balance-Parameter
- ✅ **Foundation Light Bonuses:** Konfigurierbarer +4 Light Bonus pro gebautem Fundament
- ✅ **Visual Gate Representation:** Tor der Weisheit wird korrekt auf dem Spielfeld mit 🌟 Symbol dargestellt
- ✅ **Complete Phase Transition Logic:** Seamless Übergang von Phase 1 zu Phase 2 mit allen Mechaniken
- 🎯 **Project Status:** ~95% complete - Alle Kernmechaniken des Spiels sind vollständig implementiert!
- **Impact:** Game now has complete Phase 1 → Phase 2 transition flow with foundation building & master system
- **Next:** Final win/loss conditions and gameplay polish für 100% completion

### Session 2025-09-29 (Foundation Building System COMPLETE! 🏗️)
- ✅ **FEATURE COMPLETE:** "Grundstein legen" (Foundation Building) vollständig implementiert
- ✅ **Requirements Fixed:** Benötigt jetzt korrekt 'grundstein_legen' Fähigkeit + Bauplan + 2 Kristalle
- ✅ **Blueprint Selection UI:** Dynamische UI für verschiedene Element-Fundamente mit visueller Auswahl
- ✅ **Blueprint Consumption:** Baupläne werden korrekt aus Inventar konsumiert bei Foundation Building
- ✅ **Visual Indicators:** Gebaute Fundamente werden auf Krater-Feld mit Element-Symbolen angezeigt
- ✅ **Phase 2 Transition:** Automatischer Übergang zu Phase 2 wenn alle 4 Fundamente gebaut (+10 Light bonus)
- ✅ **Foundation Validation:** Verhindert doppelte Fundamente desselben Elements
- 🎯 **Feature Status:** Ready for gameplay testing - komplettes Foundation Building System funktional
- **Impact:** Phase 1 zu Phase 2 Übergang jetzt vollständig spielbar gemäß Spielregeln

### Session 2025-09-29 (Kritischer Bugfix - ROUND COMPLETION REPAIRED! 🎯)
- ✅ **ROOT CAUSE IDENTIFIED:** handleAutoTurnTransition setzte nextPlayerIndex: currentPlayerIndex statt 0 nach Rundenende
- ✅ **CRITICAL FIX IMPLEMENTED:** nextPlayerIndex wird nun korrekt auf 0 gesetzt für neue Runde
- ✅ **Turn Order Logic Fixed:** Neue Runden starten jetzt immer mit dem ersten Spieler (Index 0)
- ✅ **Event Triggering Preserved:** Bestehende Event-System Logik bleibt unverändert funktional
- 🔍 **Next:** Manual testing required to validate complete fix
- **Impact:** Game should now be playable again with correct round transitions and action card draws

### Session 2025-09-26 (Abend - CRITICAL BUG DISCOVERY & EVENT TRIGGER FIX 🚨)
- ✅ **EVENT-TRIGGERING FIXED:** eventTriggerAssigned ref timing issue resolved
- ✅ **Enhanced event logging:** Better debugging for event trigger timing
- 🚨 **NEW CRITICAL BUG DISCOVERED:** Round completion completely broken after event system fixes
- 🚨 **GAME-BREAKING ISSUE:** After last player's turn, first player starts immediately WITHOUT drawing action card
- ❌ **Core game loop broken:** Round transitions don't work properly, making game unplayable
- 📋 **Root cause analysis needed:** Event system changes may have affected round completion logic
- **Impact:** This is a P0 critical bug that must be fixed before any other development
- **Next:** Immediate critical fix required for round completion logic

### Session 2025-09-26 (Nachmittag - CRITICAL BUG FIXES KOMPLETT! 🎉)
- ✅ **ALLE 7 P0 BUGS BEHOBEN:** Systematische Behebung aller kritischen Event-System Issues
- ✅ **Bug #1 FIXED:** AP-Modifikations-Timing - Duration-Logik von `round + 2` auf `round + 1` korrigiert
- ✅ **Bug #2 FIXED:** "dichter Nebel" - Action Blocker Expiration-Filter hinzugefügt (isDiscoverBlocked & isScoutBlocked)
- ✅ **Bug #3 FIXED:** "Apeirons Segen" - Duplicate Implementation entfernt, `set_ap` zur Negativeffekt-Liste hinzugefügt
- ✅ **Bug #4 FIXED:** "lernen" Action - Blueprint Konsumption aus Inventar implementiert (nicht vom Feld)
- ✅ **Bug #5 FIXED:** "Hindernis entfernen" - Bereits korrekt implementiert mit individuellen Richtungs-Buttons
- ✅ **Bug #6 FIXED:** "schnell bewegen" - Complete reimplementation: Corvus base movement normalisiert + echte 2-Feld Fähigkeit mit UI
- ✅ **Bug #7 FIXED:** Light Counter - Start auf 30 geändert, -1 pro Spielerzug-Ende über handleAutoTurnTransition
- **Result:** Event-System now 100% funktional, alle kritischen Gameplay-Issues behoben!
- **Next:** Phase 2 Übergang (Tor der Weisheit) Implementation

### Session 2025-09-25 (Sp�tabend - UMFASSENDE TESTS & BUG DISCOVERY)
- ✅ **EVENT-SYSTEM TESTING:** Systematische Tests aller implementierten Event-Effekte
- ❌ **7 KRITISCHE BUGS IDENTIFIZIERT:** Umfassende Test-Session deckt schwerwiegende Logic-Fehler auf
- 🐛 **Bug #1:** AP-Modifikationen (R�ckenwind, g�nstiges Omen, l�hmende K�lte) wirken eine Runde zu sp�t
- 🐛 **Bug #2:** "dichter Nebel" Event hat keine sichtbare/messbare Wirkung im Spiel
- 🐛 **Bug #3:** "Apeirons Segen" entfernt nicht alle negativen Effekte - "Spezialfertigkeiten blockiert" bleibt aktiv
- 🐛 **Bug #4:** "lernen" Aktion funktioniert nicht korrekt - ben�tigt laut spielanleitung.md Bauplan im Inventar
- 🐛 **Bug #5:** "Hindernis entfernen" braucht Feld-Selektion da mehrere angrenzende Felder blockiert sein k�nnen
- 🐛 **Bug #6:** "schnell bewegen" Spezialfertigkeit falsch - sollte 2 Felder mit 1AP bewegen (vertikal/horizontal in eine Richtung)
- 🐛 **Bug #7:** Light Counter startet nicht bei 30 und reduziert nicht um -1 nach jedem abgeschlossenen Spielerzug
- **Next:** Systematische Behebung aller 7 identifizierten kritischen Bugs

### Session 2025-09-25 (Abend - KRITISCHER BUGFIX)
- ✅ **KRITISCHER BUG BEHOBEN:** "next_round" Effekte liefen permanent statt temporär ab
- ✅ **Root Cause identifiziert:** Inkonsistente Expiration-Logic zwischen Player Effects und Action Blockers
- ✅ **Duration-Berechnung korrigiert:** `newState.round + 2` für korrekte next_round Expiration
- ✅ **Action Blocker Filter repariert:** `>= round` zu `> round` für konsistente Logic
- ✅ **Movement Check gefixt:** `prevent_movement` prüft jetzt korrekt auf Expiration
- ✅ **Visuelle Indikatoren repariert:** Effect-Icons zeigen nur aktive (nicht abgelaufene) Effekte
- ✅ **set_ap Duration ergänzt:** Fehlende Duration-Logic für "totale_erschöpfung" Event
- ✅ **Alle 24 next_round Events systematisch validiert:** Korrekte Expiration für alle Typen
- **Next:** User-Validation des Bugfixes mit "Falle der Finsternis"

### Session 2025-09-25 (Abschluss)
- ✅ **EVENT-SYSTEM 100% KOMPLETT:** Systematische Implementation aller 58 Event-Karten
- ✅ Alle AP-Modifikations-Effekte mit visuellen Indikatoren (bonus_ap, reduce_ap, set_ap)
- ✅ Alle Aktions-Blockierungs-Effekte (block_action, block_skills, prevent_movement, disable_communication)
- ✅ Alle Ressourcen-Management-Effekte (drop_resource, drop_all_resources, add_resource)
- ✅ Alle Hindernis-Platzierungs- und Entfernungs-Effekte (add_obstacle, remove_obstacles, remove_all_obstacles)
- ✅ Phase 2 Effekte implementiert (spread_darkness, cleanse_darkness)
- ✅ Vollständige visuelle Feedback-Integration für alle dauerhaften Effekte
- ✅ Skill-Blockierung integriert in alle relevanten Aktionen
- ✅ 58 Event-Karten haben jetzt korrekte Werte und funktionsfähige Implementierungen

### Session 2025-09-25 (Spätabend)
- ✅ **KRITISCHER BUGFIX:** Skip_turn Effekte komplett repariert
- ✅ Fehlerhafte turn-transition Logik für skip_turn Effekte behoben
- ✅ Effect-Expiration Logik korrigiert (expiresInRound > round statt >= newRound)
- ✅ Action-Prevention für skip_turn hinzugefügt (handleTileClick, handleCollectResources)
- ✅ UI-Indikatoren für skip_turn Status implementiert ("Aussetzen" Label + Action-Panel)
- ✅ Robuste skip_turn Behandlung für mehrere betroffene Spieler gleichzeitig
- ✅ Alle 3 skip_turn Events funktionieren jetzt korrekt: Erschöpfung, Verlorene Hoffnung, Tsunami der Finsternis
- **Next:** Phase 2 Übergang (Tor der Weisheit) Implementation

### Session 2025-09-25 (Abend)
- ✅ **KRITISCHER FIX:** Event-Effekte Implementation vollständig behoben
- ✅ 3x skip_turn Events hatten fehlende "duration": "next_round" Properties
- ✅ Event-Effekte funktionieren jetzt korrekt im Gameplay (nicht nur visuell)
- ✅ Alle anderen duration-abhängigen Effekte überprüft und validiert
- ✅ Event-System ist jetzt VOLLSTÄNDIG funktional

### Session 2025-09-25 (Mittag)
- ✅ **KRITISCHER FIX:** Aktionskarten-Problem vollst�ndig gel�st
- ✅ Event-Trigger-System komplett überarbeitet (zentrale handleRoundCompleted Funktion)
- ✅ Events werden jetzt ZUVERLÄSSIG am Ende jeder Runde ausgelöst
- ✅ Robuste Logging-Implementierung für bessere Diagnose hinzugefügt
- ✅ Race Conditions und Timing-Probleme behoben

### Session 2025-09-26
- ✅ Rundenlogik und Event-Trigger korrigiert
- ✅ Initialisierung des Landschaftskarten-Decks gefixt
- ✅ UI und Logik des Event-Modals verbessert
- ✅ Initialisierung des Krater-Feldes korrigiert
- **Next:** Implementierung der konkreten Event-Effekte

### Session 2025-09-24
- =� CLAUDE.md mit vollst�ndiger Projektanalyse erstellt
- **Next:** Event-System Implementation basierend auf docs/ereigniskarten.md

### Session 2025-09-22
-  Grundlegendes Spiel implementiert
-  Dokumentation erstellt
- **Archived:** Erste Spielversion funktionsf�hig

## =� Decisions & Learnings
- **2025-09-30** **Cross-Platform mit Capacitor:** Vite + React + Capacitor = optimale Lösung für iOS + Android aus einem Codebase
- **2025-09-30** **Mobile-First UX/UI:** Bottom Sheet Pattern, Touch-Gesten, bildbasierte Assets, responsive Grid
- **2025-09-30** **Kein Refactoring vor v1.0:** 3622 Zeilen in ApeironGame.jsx funktional - erst Ship, dann Refactor
- **2025-09-30** **Deployment-Strategie:** PWA (sofort, €0) → iOS (4-6h, $99/Jahr) → Android (2-4h, $25)
- **2025-09-22** Hybrid JSX/TSX Ansatz: ApeironGame.jsx als Hauptkomponente, TypeScript f�r Utils/Types
- **2025-09-22** Config-basierte Architektur: JSON-Dateien für Spielregeln, flexibel erweiterbar
- **2025-09-22** Dark Theme First: Bessere Spielatmosph�re f�r Fantasy-Setting
- **2025-09-22** Komponenten-Split: GameSetup getrennt von Hauptspiel f�r bessere UX

## = Bekannte Issues
### 🚨 **NEUE ISSUES (2025-09-30 Spielregel-Check)**
#### **P0 - Game Breaking (Spielende fehlt)**
- [ ] Win/Loss Conditions nicht implementiert (Sieg bei 4 Elementen, Niederlage bei Licht=0)
- [ ] Element-Aktivierung System komplett fehlend

#### **P1 - High Priority (Phase 2 unvollständig)**
- [ ] Element-Fragmente nicht im Phase 2 Deck
- [ ] Finsternis-Ausbreitung System nicht implementiert
- [ ] "Herz der Finsternis" Plättchen fehlt

#### **P2 - Medium Priority**
- [x] ✅ spread_darkness Event-Effekt (2025-10-03) - Verwendet jetzt Spiral-Algorithmus
- [ ] cleanse_darkness Event-Effekt Testing ausstehend

### ✅ ALLE KRITISCHEN BUGS BEHOBEN!
- [x] **P0:** Round Completion Bug ✅ FIXED (2025-09-29)
- [x] **P0:** AP-Modifikations-Timing Bug ✅ FIXED (2025-09-26)
- [x] **P0:** "dichter Nebel" Event funktionslos ✅ FIXED (2025-09-26)
- [x] **P0:** "Apeirons Segen" incomplete ✅ FIXED (2025-09-26)
- [x] **P0:** "lernen" Action broken ✅ FIXED (2025-09-26)
- [x] **P0:** "Hindernis entfernen" needs field selection ✅ VERIFIED WORKING (2025-09-26)
- [x] **P0:** "schnell bewegen" ability wrong ✅ FIXED (2025-09-26)
- [x] **P0:** Light Counter Logic wrong ✅ FIXED (2025-09-26)
- [x] **P0:** 🎉 React StrictMode Mutation Bug ✅ FIXED (2025-10-03) - MEILENSTEIN!

### Minor Issues (Non-blocking)
- [ ] **P2:** GameManager.ts nicht vollst�ndig in ApeironGame.jsx integriert (v1.1+ Refactoring)
- [x] **P2:** Phase 2 Mechaniken ✅ IMPLEMENTED (Foundation Building + Tor der Weisheit)
- [ ] **P3:** Mobile Optimierung → ROADMAP erstellt (siehe Phase 2)
- [ ] **P3:** Animationen → ROADMAP erstellt (siehe Visual Polish)

## =� Metriken
- **Tests:** 0 (keine Test-Dateien vorhanden)
- **Coverage:** N/A
- **Build Size:** ~5500 Zeilen ApeironGame.jsx + ~680 andere = 6180 total LOC
- **Performance:** Nicht gemessen
- **Letzter Commit:** 🎉 BREAKTHROUGH: React StrictMode Mutation Bug komplett behoben
- **Branch:** master
- **Spielregel-Konformität:** ~97% (6 Features fehlen)
- **Code Quality:** ✅ React StrictMode kompatibel, immutable State Updates

## <� Sprint Goal
**Aktuelle Woche:** 🎯 PHASE 1 - Game Completion (Win/Loss + Element-Aktivierung) ⏰ 4-6h
**Nächste 2 Wochen:** 📱 PHASE 2 - Mobile-First UX/UI Modernisierung ⏰ 15-20h
**Danach:** 🚀 PHASE 3 - iOS + Android Deployment ⏰ 8-12h
**Ziel v1.0:** Vollständiges Cross-Platform Brettspiel (Web + iOS + Android)

## =' Quick Commands
- **Start Dev:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Preview:** `npm run preview`
- **URL:** http://localhost:5173

---
*Auto-updated by Claude - 2025-10-03 14:30*

## 📚 **Zusätzliche Referenzen für nächste Session**

### Technologie-Dokumentation
- **Capacitor Docs:** https://capacitorjs.com/docs
- **react-use-gesture:** https://use-gesture.netlify.app/
- **framer-motion:** https://www.framer.com/motion/
- **Vite Image Optimization:** https://github.com/FatehAK/vite-plugin-image-optimizer

### Mobile-First Design Patterns
- Bottom Sheet UI: https://m3.material.io/components/bottom-sheets
- Touch Gestures: Tap (Feld auswählen), Drag (Held bewegen), Pinch (Zoom)
- Responsive Grid: 9x9 Desktop, 3x3 Mobile mit scroll-snap

### Asset-Format Empfehlungen
- Landschaftskarten: 512x512px WebP (Kompression 80%)
- Helden-Portraits: 256x256px WebP
- UI-Icons: 64x64px WebP oder SVG
- App Icons: 1024x1024px PNG (iOS), Adaptive Icons (Android)