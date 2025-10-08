# 🎨 **Unified Modal Design System - Mobile-First (Implementation Plan)**

**Erstellt:** 2025-10-07
**Status:** Ready for Implementation
**Geschätzter Aufwand:** 6-7 Stunden

---

## 📋 **Problem-Analyse**

### **Aktuelle Probleme**
1. **10+ verschiedene Modal-Typen** mit inkonsistentem Design
2. **Card-Draw Modals**: Hero-Card soll 4 Element-Symbole zeigen (🌿🔥💧🦅)
3. **Event Modals**: Positive (grün) vs Negative (rot) - KEINE neutralen Events
4. **Tor der Weisheit**: Hell/Weiß (nicht blau) + Button außerhalb Viewport
5. **Dezente Farben** passend zur Story gefordert
6. **Scrolling fehlt** bei langen Inhalten auf Mobile
7. **Game Start Modal fehlt** (wurde entfernt, soll zurückkehren)

### **Betroffene Modals**
- Game Start Modal (NEU)
- Phase Transition Modal (6082-6267)
- Foundation Success Modal (~5750+)
- Element Success Modal (~5880+)
- Tor der Weisheit Modal (6573-6833) - **KRITISCH: Button nicht erreichbar!**
- Herz der Finsternis Modal (7367-7500+)
- Victory Modal (6836-7091)
- Defeat Modal (7094-7364)
- Event Card Modal (5758-6079)
- Card Draw Modal (5449-5755)

---

## 🎨 **Design-Prinzipien (Unified System)**

### **1. Basis-Container-Struktur**

```jsx
// Outer Container (Backdrop)
{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.85)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000+,
  padding: '16px' // Mobile safe area!
}

// Inner Container (Modal)
{
  maxWidth: '600px', // Desktop (400px für Card-Draw)
  width: 'calc(100% - 32px)', // Mobile mit Padding
  maxHeight: '90vh', // Viewport-basiert - KRITISCH!
  overflowY: 'auto', // IMMER scrollbar - KRITISCH!
  borderRadius: '16px',
  padding: '32px' // Desktop: 32px, Mobile: 24px
}
```

### **2. Theme-basierte Varianten**

| Modal-Typ | Border | Background | BoxShadow | Verwendung |
|-----------|--------|------------|-----------|------------|
| **Success** (Foundation/Element) | `3px solid #fbbf24` | `linear-gradient(135deg, #b45309, #d97706)` | `0 0 30px rgba(251, 191, 36, 0.4)` | Fundamente/Elemente |
| **Victory** | `3px solid #10b981` | `linear-gradient(135deg, #064e3b, #065f46, #047857)` | `0 0 80px rgba(16, 185, 129, 0.6)` | Spielgewinn |
| **Defeat** | `3px solid #dc2626` | `linear-gradient(135deg, #0f0f0f, #1a0000, #000000)` | `0 0 80px rgba(220, 38, 38, 0.6)` | Spielverlust |
| **Positive Event** | `2px solid #059669` | `linear-gradient(135deg, #064e3b, #065f46)` | `0 0 20px rgba(5, 150, 105, 0.25)` | Positive Ereignisse |
| **Negative Event** | `2px solid #dc2626` | `linear-gradient(135deg, #450a0a, #7f1d1d)` | `0 0 20px rgba(220, 38, 38, 0.25)` | Negative Ereignisse |
| **Card Draw - Direction** | `3px solid #3b82f6` | `linear-gradient(135deg, #1e3a8a, #3b82f6)` | `0 0 20px rgba(59, 130, 246, 0.3)` | Himmelsrichtung |
| **Card Draw - Hero** | `3px solid #b45309` | `linear-gradient(135deg, #92400e, #b45309)` | `0 0 20px rgba(180, 83, 9, 0.3)` | Heldenauswahl |
| **Tor der Weisheit** | `3px solid #d1d5db` | `linear-gradient(135deg, #f9fafb, #e5e7eb)` | `0 0 40px rgba(255, 255, 255, 0.4)` | Tor-Erscheinung |
| **Herz der Finsternis** | `3px solid #dc2626` | `linear-gradient(135deg, #0f0f0f, #1a0000, #000000)` | `0 0 80px rgba(220, 38, 38, 0.6)` | Herz-Erscheinung |

### **3. Hero-Card Rückseite (4 Element-Symbole)**

**EXAKT die gleichen Symbole wie in `HeroAvatar.jsx` / `ActivePlayerCard.jsx`:**

```jsx
const heroSymbols = {
  terra: '🌿',   // Minotaurin - Erde (earth)
  ignis: '🔥',   // Drache - Feuer (fire)
  lyra: '💧',    // Sirene - Wasser (water)
  corvus: '🦅'   // Aviari - Luft (air)
};

// Anordnung auf Kartenrückseite (2×2 Grid)
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  fontSize: '3rem',
  padding: '24px'
}}>
  <div>🌿</div> {/* Terra/Erde */}
  <div>🔥</div> {/* Ignis/Feuer */}
  <div>💧</div> {/* Lyra/Wasser */}
  <div>🦅</div> {/* Corvus/Luft */}
</div>
```

### **4. Dezente Story-passende Farben**

**Positive Events (Hoffnung, Zusammenhalt):**
```jsx
border: '2px solid #059669', // Dezentes Waldgrün
background: 'linear-gradient(135deg, #064e3b, #065f46)',
boxShadow: '0 0 20px rgba(5, 150, 105, 0.25)', // Subtiler Glow
color: '#d1fae5' // Hellgrün für Text
```

**Negative Events (Finsternis, Gefahr):**
```jsx
border: '2px solid #dc2626', // Blutrot
background: 'linear-gradient(135deg, #450a0a, #7f1d1d)',
boxShadow: '0 0 20px rgba(220, 38, 38, 0.25)', // Subtiler Glow
color: '#fecaca' // Hellrot für Text
```

**Tor der Weisheit (Reinheit, Erleuchtung):**
```jsx
border: '3px solid #d1d5db', // Hellgrau
background: 'linear-gradient(135deg, #f9fafb, #e5e7eb)', // Fast Weiß
boxShadow: '0 0 40px rgba(255, 255, 255, 0.4)',
color: '#1f2937' // Dunkelgrau für Text (gute Lesbarkeit)
```

### **5. Responsive Typography**

```jsx
// Mobile (<640px) / Desktop (≥640px)
const responsive = {
  title: window.innerWidth < 640 ? '1.75rem' : '2.5rem',
  subtitle: window.innerWidth < 640 ? '1rem' : '1.3rem',
  body: window.innerWidth < 640 ? '0.875rem' : '1rem',
  button: window.innerWidth < 640 ? '1rem' : '1.1rem'
};
```

---

## 🚀 **Implementation-Plan**

### **Phase 1: Shared Modal Component (~250 LOC)**

Erstelle `src/components/ui/UnifiedModal.jsx`:

**Props:**
```typescript
interface UnifiedModalProps {
  type: 'success' | 'victory' | 'defeat' | 'positiveEvent' | 'negativeEvent' |
        'directionCard' | 'heroCard' | 'torDerWeisheit' | 'herzDerFinsternis';
  show: boolean;
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  onClose?: () => void;
  customTheme?: {
    border?: string;
    background?: string;
    boxShadow?: string;
    color?: string;
  };
}
```

**Features:**
- Automatisches Theme-Switching basierend auf `type`
- Mobile-First Responsive Design
- Touch-optimierte Buttons (min 44px height)
- `maxHeight: 90vh` + `overflowY: auto` IMMER aktiv
- Safe Area Padding für Mobile (16px outer container)

**Code-Struktur:**
```jsx
const UnifiedModal = ({ type, show, title, subtitle, icon, children, onClose, customTheme }) => {
  if (!show) return null;

  const themes = {
    success: { /* Gold */ },
    victory: { /* Grün */ },
    defeat: { /* Rot */ },
    positiveEvent: { /* Dezentes Grün */ },
    negativeEvent: { /* Dezentes Rot */ },
    directionCard: { /* Blau */ },
    heroCard: { /* Gold */ },
    torDerWeisheit: { /* Hell/Weiß */ },
    herzDerFinsternis: { /* Dunkelrot/Schwarz */ }
  };

  const theme = customTheme || themes[type];
  const isMobile = window.innerWidth < 640;

  return (
    <div style={{/* Outer Container */}}>
      <div style={{/* Inner Container mit theme */}}>
        {/* Header mit icon, title, subtitle */}
        {/* Children (Content) */}
        {/* Close Button (optional) */}
      </div>
    </div>
  );
};
```

---

### **Phase 2: Modal-Refactoring (~1000 LOC)**

Refactore **10 Modal-Typen** zu Unified System:

#### **A) Game Flow Modals**

**1. Game Start Modal (NEU - 346-597 im GameSetup)**
- Epic 3-Section Story
- Dezente Gold-Akzente
- Button: "⭐ DIE REISE BEGINNT"
- Type: `'success'`

**Location:** `src/components/GameSetup.tsx`

**2. Phase Transition Modal (6082-6267)**
- Goldenes Success-Theme
- Light Bonus Breakdown
- **FIX:** `maxHeight: 90vh` + `overflowY: auto`
- Type: `'success'`

**Location:** `src/ApeironGame.jsx:6082-6267`

---

#### **B) Success Modals**

**3. Foundation Success Modal (~5750+)**
- 3 verschiedene Texte (index-basiert)
- Element-Icons mit Pulsing
- **FIX:** `maxHeight: 90vh` + `overflowY: auto`
- Type: `'success'`

**Location:** `src/ApeironGame.jsx` (suche nach `foundationSuccessModal`)

**4. Element Success Modal (~5880+)**
- Element-spezifische Farben
- Finsternis-Reduktion Anzeige
- **FIX:** `maxHeight: 90vh` + `overflowY: auto`
- Type: `'success'` mit custom colors

**Location:** `src/ApeironGame.jsx` (suche nach `elementSuccessModal`)

---

#### **C) Story Modals**

**5. Tor der Weisheit Modal (6573-6833) ⚠️ KRITISCH**
- **FARBE:** Hell/Weiß statt Blau!
- **FIX:** `maxHeight: 90vh` + `overflowY: auto` - Button war außerhalb Viewport!
- Border: `3px solid #d1d5db` (Hellgrau)
- Background: `linear-gradient(135deg, #f9fafb, #e5e7eb)` (Fast Weiß)
- Text: `#1f2937` (Dunkelgrau für Lesbarkeit)
- 2-Phasen Flow (awaiting vs placed)
- Type: `'torDerWeisheit'`

**Location:** `src/ApeironGame.jsx:6573-6833`

**Code-Locations:**
```javascript
// Modal State
gameState.torDerWeisheitModal: {
  show: boolean,
  position: [x, y] | null,
  chosenDirection: 'north' | 'east' | 'south' | 'west' | null,
  awaitingCardDraw: boolean
}

// Modal Rendering
{gameState.torDerWeisheitModal.show && (
  <UnifiedModal type="torDerWeisheit" ...>
    {/* Content */}
  </UnifiedModal>
)}
```

**6. Herz der Finsternis Modal (7367-7500+)**
- Horror-Theme Rot/Schwarz (bleibt)
- Heartbeat Animation
- **FIX:** `maxHeight: 90vh` + `overflowY: auto`
- Type: `'herzDerFinsternis'`

**Location:** `src/ApeironGame.jsx:7367-7500+`

---

#### **D) End Game Modals**

**7. Victory Modal (6836-7091)**
- Phase-separierte Stats (2×2 Grid → 1×4 auf Mobile)
- **Responsive Grid:**
  ```jsx
  gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr'
  ```
- **FIX:** `maxHeight: 90vh` + `overflowY: auto`
- Type: `'victory'`

**Location:** `src/ApeironGame.jsx:6836-7091`

**Stats Structure:**
```javascript
gameState.victoryModal: {
  show: boolean,
  stats: {
    phase1: { foundations: 4, totalTurns: N, totalApSpent: N },
    phase2: { elements: 4, totalTurns: N, totalApSpent: N },
    rounds: N,
    totalTurns: N,
    totalApSpent: N,
    durationMinutes: N,
    durationSeconds: N,
    playerNames: string[],
    playerCount: N
  }
}
```

**8. Defeat Modal (7094-7364)**
- Apocalyptic Theme
- Phase-separierte Stats (2×2 Grid → 1×4 auf Mobile)
- **FIX:** `maxHeight: 90vh` + `overflowY: auto`
- Type: `'defeat'`

**Location:** `src/ApeironGame.jsx:7094-7364`

---

#### **E) Event Modals**

**9. Event Card Modal (5758-6079)**
- **Positive Events:** Dezentes Grün (#059669)
- **Negative Events:** Dezentes Rot (#dc2626)
- Dynamic border basierend auf `event.type` Property
- Subtile Glow-Effekte (0.25 opacity statt 0.4-0.6)
- Effekt-Info Box
- Konter-Info Box
- **FIX:** `maxHeight: 90vh` + `overflowY: auto`
- Type: `'positiveEvent'` oder `'negativeEvent'`

**Location:** `src/ApeironGame.jsx:5758-6079`

**Event Structure:**
```javascript
gameState.currentEvent: {
  id: string,
  name: string,
  description: string,
  symbol: string,
  type: 'positive' | 'negative', // ← Für Theme-Switching
  effectText: string,
  resolvedEffectText?: string
}
```

**ALLE 58 Events sind entweder positiv ODER negativ (KEINE neutralen):**
```javascript
// events.json - Positive Events
{ "id": "rueckenwind", "type": "positive" }
{ "id": "gemeinsame_staerke", "type": "positive" }
{ "id": "guenstiges_omen", "type": "positive" }

// events.json - Negative Events
{ "id": "laehmende_kaelte", "type": "negative" }
{ "id": "dreifache_blockade", "type": "negative" }
{ "id": "tsunami_der_finsternis", "type": "negative" }
```

---

#### **F) Card Draw Modals**

**10. Card Draw Modal (5449-5755)**

**Hero Card Rückseite - 4 Element-Symbole:**
```jsx
// Unflipped State - Card Stack
<div style={{
  position: 'relative',
  width: '200px',
  height: '280px'
}}>
  {[0, 1, 2, 3].map(i => (
    <div key={i} style={{
      position: 'absolute',
      top: `${i * 4}px`,
      left: `${i * 4}px`,
      width: '200px',
      height: '280px',
      backgroundColor: '#92400e', // Dezentes Gold
      borderRadius: '12px',
      border: '3px solid #b45309',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
    }}>
      {i === 3 && (
        // 4 Element-Symbole im Grid (EXAKT wie HeroAvatar.jsx)
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          fontSize: '2.5rem'
        }}>
          <div>🌿</div> {/* Terra/Erde */}
          <div>🔥</div> {/* Ignis/Feuer */}
          <div>💧</div> {/* Lyra/Wasser */}
          <div>🦅</div> {/* Corvus/Luft */}
        </div>
      )}
    </div>
  ))}
</div>

// Flipped State - Show drawn hero with hero-specific color
{drawnHero && (
  <div style={{
    width: '200px',
    height: '280px',
    backgroundColor: heroColors[drawnHero.id], // Element-spezifische Farbe
    borderRadius: '12px',
    border: '3px solid rgba(255, 255, 255, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    animation: 'flipCard 0.6s ease-out'
  }}>
    <div style={{ fontSize: '5rem' }}>{heroSymbols[drawnHero.id]}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>
      {drawnHero.name}
    </div>
  </div>
)}
```

**Direction Card:**
```jsx
// Unflipped State - Card Stack (blue theme)
backgroundColor: '#1e3a8a'
border: '3px solid #3b82f6'

// Flipped State
<div style={{
  backgroundColor: '#3b82f6',
  border: '3px solid #60a5fa'
}}>
  <div style={{ fontSize: '5rem' }}>
    {drawnDirection === 'north' && '⬆️'}
    {drawnDirection === 'east' && '➡️'}
    {drawnDirection === 'south' && '⬇️'}
    {drawnDirection === 'west' && '⬅️'}
  </div>
  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>
    {directionNames[drawnDirection]}
  </div>
</div>
```

**Type:** `'heroCard'` oder `'directionCard'`

**Location:** `src/ApeironGame.jsx:5449-5755`

**Card Draw State:**
```javascript
gameState.cardDrawState: 'none' | 'drawing' | 'result_shown' | 'event_shown'
gameState.cardDrawQueue: Array<{
  type: 'hero' | 'direction',
  purpose: 'event' | 'tor_der_weisheit' | 'herz_der_finsternis'
}>
gameState.drawnCards: {
  hero?: heroId,
  direction?: 'north' | 'east' | 'south' | 'west'
}
```

---

### **Phase 3: Mobile-Optimierungen**

**Stats-Grid Responsive:**
```jsx
// Victory/Defeat Modal Stats
<div style={{
  display: 'grid',
  gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr',
  gap: '24px'
}}>
  {/* Phase 1 Stats */}
  {/* Phase 2 Stats */}
</div>

<div style={{
  display: 'grid',
  gridTemplateColumns: window.innerWidth < 640 ? '1fr' : 'repeat(4, 1fr)',
  gap: '12px'
}}>
  {/* Overall Stats (Runden, Spielzüge, AP, Dauer) */}
</div>
```

**Button-Gruppe Responsive:**
```jsx
// Horizontal → Vertikal Stack
<div style={{
  display: 'flex',
  flexDirection: window.innerWidth < 640 ? 'column' : 'row',
  gap: '12px',
  justifyContent: 'center'
}}>
  <button>Button 1</button>
  <button>Button 2</button>
</div>
```

**Touch-Targets:**
```jsx
// Minimum 44×44px für alle interaktiven Elemente
button: {
  minHeight: '44px',
  padding: '12px 24px',
  fontSize: '1rem'
}
```

**Safe Area Padding:**
```jsx
// iOS Notch-Support
padding: '16px', // Outer container
paddingTop: 'max(16px, env(safe-area-inset-top))',
paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
```

---

### **Phase 4: Testing-Checkliste**

**Mobile Testing (iPhone SE - 375px width):**
- [ ] Tor der Weisheit Modal scrollbar + Button erreichbar
- [ ] Victory/Defeat Modals Stats-Grid responsive (2 Spalten → 1 Spalte)
- [ ] Hero-Card zeigt 4 Element-Symbole (🌿🔥💧🦅) im 2×2 Grid
- [ ] Event Modals dezente Farben (Grün #059669, Rot #dc2626)
- [ ] Alle Modals scrollbar bei langem Content
- [ ] Touch-Targets min 44×44px
- [ ] Keine horizontalen Scrollbars

**Desktop Testing (1920×1080):**
- [ ] Victory/Defeat Modals Stats-Grid 2×2 und 4×1
- [ ] Alle Modals zentriert mit korrektem maxWidth
- [ ] Hover-Effekte auf Buttons funktionieren
- [ ] Card-Flip Animationen smooth

**Theme Testing:**
- [ ] Positive Events: Dezentes Grün (Border #059669, Background #064e3b)
- [ ] Negative Events: Dezentes Rot (Border #dc2626, Background #450a0a)
- [ ] Tor der Weisheit: Hell/Weiß (Border #d1d5db, Background #f9fafb)
- [ ] Hero-Card: Dezentes Gold (Border #b45309, Background #92400e)
- [ ] Direction-Card: Dezentes Blau (Border #3b82f6, Background #1e3a8a)

---

## 📁 **Dateien-Struktur**

### **Neue Dateien**
```
src/
├── components/
│   └── ui/
│       └── UnifiedModal.jsx (~250 LOC)
└── docs/
    └── MODAL_REDESIGN_PLAN.md (dieser Plan)
```

### **Zu ändernde Dateien**
```
src/
├── ApeironGame.jsx (~1000 LOC Änderungen)
│   ├── Card Draw Modal (5449-5755) - Hero-Card 4 Symbole
│   ├── Event Modal (5758-6079) - Positive/Negative Colors
│   ├── Phase Transition (6082-6267) - Scrollbar
│   ├── Tor der Weisheit (6573-6833) - Hell/Weiß + Scrollbar
│   ├── Victory (6836-7091) - Responsive Stats
│   ├── Defeat (7094-7364) - Responsive Stats
│   └── Herz der Finsternis (7367+) - Scrollbar
├── components/
│   └── GameSetup.tsx (~50 LOC)
│       └── Game Start Modal zurück integrieren
└── config/
    └── events.json (bereits korrekt - type: positive/negative)
```

---

## ⚠️ **Kritische Fixes (Priorität P0)**

### **1. Tor der Weisheit Button außerhalb Viewport**
**Problem:** Button ist auf Mobile nicht erreichbar (außerhalb des sichtbaren Bereichs)

**Lösung:**
```jsx
// Alt (FALSCH)
<div style={{ padding: '2rem', /* KEIN maxHeight */ }}>

// Neu (RICHTIG)
<div style={{
  padding: '2rem',
  maxHeight: '90vh', // ← Kritisch!
  overflowY: 'auto'  // ← Kritisch!
}}>
```

### **2. Hero-Card zeigt falsche Symbole**
**Problem:** Hero-Card Rückseite zeigt nur 🎴 statt 4 Element-Symbole

**Lösung:**
```jsx
// Alt (FALSCH)
{i === 3 && '🎴'}

// Neu (RICHTIG - EXAKT wie HeroAvatar.jsx)
{i === 3 && (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    fontSize: '2.5rem'
  }}>
    <div>🌿</div> {/* Terra/Erde */}
    <div>🔥</div> {/* Ignis/Feuer */}
    <div>💧</div> {/* Lyra/Wasser */}
    <div>🦅</div> {/* Corvus/Luft */}
  </div>
)}
```

### **3. Tor der Weisheit hat falsches Theme**
**Problem:** Tor der Weisheit ist blau, sollte aber hell/weiß sein

**Lösung:**
```jsx
// Alt (FALSCH - Blau)
background: 'linear-gradient(135deg, #1e293b, #334155)',
border: '3px solid #3b82f6',
color: '#d1d5db'

// Neu (RICHTIG - Hell/Weiß)
background: 'linear-gradient(135deg, #f9fafb, #e5e7eb)',
border: '3px solid #d1d5db',
color: '#1f2937', // Dunkelgrau für Lesbarkeit
boxShadow: '0 0 40px rgba(255, 255, 255, 0.4)'
```

### **4. Event Modals zu grelle Farben**
**Problem:** Positive/Negative Events haben zu intensive Glow-Effekte

**Lösung:**
```jsx
// Alt (FALSCH - zu intensiv)
boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'

// Neu (RICHTIG - dezent)
boxShadow: '0 0 20px rgba(5, 150, 105, 0.25)'
```

### **5. Victory/Defeat Stats nicht responsive**
**Problem:** Stats-Grid hat feste 2×2 Struktur auf Mobile

**Lösung:**
```jsx
// Alt (FALSCH)
gridTemplateColumns: '1fr 1fr'

// Neu (RICHTIG)
gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr'
```

---

## 🎯 **Geschätzter Aufwand**

| Phase | Aufgabe | Zeit |
|-------|---------|------|
| Phase 1 | Shared Modal Component | ~1.5h |
| Phase 2 | Modal-Refactoring (10 Modals) | ~3-4h |
| Phase 3 | Mobile-Optimierungen | ~1h |
| Phase 4 | Testing & Bug Fixes | ~30min |
| **Total** | | **~6-7h** |

---

## 📝 **Implementation-Reihenfolge**

### **Empfohlene Reihenfolge:**
1. **UnifiedModal Component** erstellen (Phase 1)
2. **Tor der Weisheit** refactoren (P0 - kritischer Bug!)
3. **Hero-Card** 4 Symbole (P0 - User-Request)
4. **Event Modals** Farben (Positive/Negative)
5. **Victory/Defeat** Responsive Stats
6. **Phase Transition, Foundation, Element** Success Modals
7. **Herz der Finsternis** Modal
8. **Game Start Modal** zurück integrieren
9. **Mobile Testing** auf iPhone SE
10. **Desktop Testing** auf 1920×1080

---

## 🔍 **Code-Referenzen**

### **Hero-Symbole (EXAKT wie implementiert):**
```javascript
// src/components/ui/HeroAvatar.jsx:52-59
const getHeroEmoji = (element) => {
  const emojis = {
    earth: '🌿',  // Terra - Minotaurin
    fire: '🔥',   // Ignis - Drache
    water: '💧',  // Lyra - Sirene
    air: '🦅'     // Corvus - Aviari
  };
  return emojis[element] || '⭐';
};
```

### **Hero-Farben:**
```javascript
// src/ApeironGame.jsx
const heroColors = {
  terra: '#22c55e',   // Grün (Erde)
  ignis: '#ef4444',   // Rot (Feuer)
  lyra: '#3b82f6',    // Blau (Wasser)
  corvus: '#eab308'   // Gelb (Luft)
};
```

### **Event Type Property:**
```javascript
// src/config/events.json
{
  "id": "rueckenwind",
  "type": "positive", // ← Bereits vorhanden!
  "name": "Rückenwind",
  "description": "...",
  "symbol": "🌟",
  "effects": [...]
}
```

---

## ✅ **Definition of Done**

**Dieses Feature ist DONE wenn:**
- [ ] Alle 10 Modals verwenden UnifiedModal Component
- [ ] Tor der Weisheit: Hell/Weiß + Button scrollbar auf iPhone SE
- [ ] Hero-Card zeigt 4 Element-Symbole (🌿🔥💧🦅) im 2×2 Grid
- [ ] Event Modals: Dezente Farben basierend auf type (positive/negative)
- [ ] Victory/Defeat: Stats-Grid responsive (2×2 Desktop, 1×4 Mobile)
- [ ] Alle Modals: `maxHeight: 90vh` + `overflowY: auto`
- [ ] Touch-Targets: Min 44×44px auf Mobile
- [ ] Keine horizontalen Scrollbars auf 375px Breite
- [ ] Alle Buttons erreichbar ohne Scrollen auf Standard-Modals
- [ ] Card-Flip Animationen smooth (60fps)

---

**Ende des Implementation-Plans**

*Dieser Plan wurde am 2025-10-07 erstellt und ist bereit für die Umsetzung in der nächsten Session.*
