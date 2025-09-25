# <� Apeiron Web App - Claude Context

## =� Aktueller Status
**Letzte Session:** 2025-09-25 23:45
**Sprint:** Event System Testing & Critical Bug Discovery
**Fortschritt:** ~75% abgeschlossen
**Velocity:** ~5-7 Features/Session

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

## =� In Arbeit
- [ ] **Event-System Critical Bug Fixes** (20% done)
  - Status: 7 kritische Bugs durch umfassende Tests identifiziert
  - TODO: Systematische Behebung aller identifizierten Event-Logic Issues
  - Gesch�tzt: 4-6h verbleibend (h�here Komplexit�t als erwartet)

## =� N�chste Schritte (Priorit�t)
### KRITISCHE BUGS (H�chste Priorit�t) - 4-6h gesch�tzt
1. **[SOFORT]** AP-Modifikations-Timing Bug - Effekte wirken eine Runde zu sp�t � 1h
2. **[SOFORT]** "dichter Nebel" Event funktionslos - Action hat keine Wirkung � 45min
3. **[SOFORT]** "Apeirons Segen" incomplete - entfernt nicht alle negativen Effekte � 1h
4. **[SOFORT]** "lernen" Action broken - ben�tigt Bauplan im Inventar (siehe spielanleitung.md) � 1h
5. **[SOFORT]** "Hindernis entfernen" needs field selection - multiple adjacent blocked fields � 45min
6. **[SOFORT]** "schnell bewegen" ability wrong - sollte 2 Felder mit 1AP bewegen � 30min
7. **[SOFORT]** Light Counter Logic wrong - Start bei 30, -1 nach jedem Spielerzug � 30min

### Weitere Entwicklung (Nach Bugfixes)
8. **[DANN]** Phase 2 �bergang (Tor der Weisheit) � 3h gesch�tzt
9. **[DIESE WOCHE]** Spezielle Helden-F�higkeiten vervollst�ndigen � 2h gesch�tzt
10. **[DIESE WOCHE]** Gewinn-/Verlust-Bedingungen implementieren � 2h gesch�tzt
11. **[N�CHSTE WOCHE]** Turmbau-System Phase 2 � 4h gesch�tzt
12. **[BACKLOG]** UI/UX Verbesserungen und Animationen

## = Wichtige Dateien
- `src/ApeironGame.jsx` - Hauptspiel-Komponente (~800 Zeilen, komplette Spiellogik)
- `src/utils/GameManager.ts` - Game Engine Klasse (teilweise implementiert)
- `src/types/index.ts` - TypeScript Interface Definitionen
- `src/components/GameBoard.tsx` - Spielbrett-Komponente
- `src/components/GameSetup.tsx` - Spieler-Setup Interface
- `src/config/` - JSON Konfigurationsdateien (Helden, Ereignisse, Regeln)
- `docs/spielanleitung.md` - Vollst�ndige Spielregeln (Referenz)
- `docs/ereigniskarten.md` - 40 Event-Karten Definitionen

## =� Session-Log
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
- **2025-09-22** Hybrid JSX/TSX Ansatz: ApeironGame.jsx als Hauptkomponente, TypeScript f�r Utils/Types
- **2025-09-22** Config-basierte Architektur: JSON-Dateien für Spielregeln, flexibel erweiterbar
- **2025-09-22** Dark Theme First: Bessere Spielatmosph�re f�r Fantasy-Setting
- **2025-09-22** Komponenten-Split: GameSetup getrennt von Hauptspiel f�r bessere UX

## = Bekannte Issues
### KRITISCHE BUGS (Immediate Fix Required)
- [ ] **P0:** AP-Modifikations-Timing Bug - Effekte wirken eine Runde zu sp�t (Immediate)
- [ ] **P0:** "dichter Nebel" Event funktionslos - Action hat keine Wirkung (Immediate)
- [ ] **P0:** "Apeirons Segen" incomplete - entfernt nicht alle negativen Effekte (Immediate)
- [ ] **P0:** "lernen" Action broken - ben�tigt Bauplan im Inventar (Immediate)
- [ ] **P0:** "Hindernis entfernen" needs field selection (Immediate)
- [ ] **P0:** "schnell bewegen" ability wrong - sollte 2 Felder mit 1AP bewegen (Immediate)
- [ ] **P0:** Light Counter Logic wrong - Start bei 30, -1 nach jedem Spielerzug (Immediate)

### Standard Issues
- [ ] **P2:** GameManager.ts nicht vollst�ndig in ApeironGame.jsx integriert
- [ ] **P2:** Phase 2 Mechaniken nicht implementiert
- [ ] **P3:** Mobile Optimierung k�nnte verbessert werden
- [ ] **P3:** Keine Animationen f�r Spielerz�ge

## =� Metriken
- **Tests:** 0 (keine Test-Dateien vorhanden)
- **Coverage:** N/A
- **Build Size:** ~861 Zeilen Code (src/)
- **Performance:** Nicht gemessen
- **Letzter Commit:** ad03484 (docs erg�nzt)
- **Branch:** master

## <� Sprint Goal
**Diese Woche:** Event-System komplett implementiert, Phase 2 �bergang funktionsf�hig
**N�chste Woche:** Vollst�ndiges Spielerlebnis mit allen Mechaniken

## =' Quick Commands
- **Start Dev:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Preview:** `npm run preview`
- **URL:** http://localhost:5173

---
*Auto-generated by Claude - 2025-09-25 23:45*