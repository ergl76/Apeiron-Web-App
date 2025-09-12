// Game Types
export interface GameConfig {
  light: {
    maxValue: number;
    lossPerRound: {
      phase1: PlayerCountConfig;
      phase2: PlayerCountConfig;
    };
  };
  actionPoints: {
    perTurn: number;
  };
  inventory: {
    slots: number;
  };
  gateOfWisdom: {
    appearsAtRound: PlayerCountConfig;
  };
  difficulty: {
    [key: string]: DifficultyConfig;
  };
}

export interface PlayerCountConfig {
  players2: number;
  players3: number; 
  players4: number;
}

export interface DifficultyConfig {
  positiveEvents: number;
  negativeEvents: number;
}

// Hero Types
export interface Hero {
  id: string;
  name: string;
  element: string;
  description: string;
  innateSkills: string[];
  image: string;
  color: string;
}

// Skill Types
export interface Skill {
  id: string;
  name: string;
  symbol: string;
  description: string;
  actionCost?: number;
  category: string;
  requiredResources?: string[];
  specialRules?: string;
}

// Tile Types
export interface TileConfig {
  count: number;
  id: string;
  name: string;
  type: string;
  color: string;
  symbol: string;
  resource?: string;
  description: string;
  effect?: string;
}

export interface PhaseConfig {
  [tileId: string]: TileConfig;
}

// Event Types  
export interface EventEffect {
  type: string;
  value?: number;
  resource?: string;
  target?: string;
  obstacle?: string;
  duration?: string;
  effect_type?: string;
}

export interface GameEvent {
  id: string;
  name: string;
  symbol: string;
  description: string;
  effects: EventEffect[];
}

export interface EventPhase {
  positive: GameEvent[];
  negative: GameEvent[];
}

// Game State Types
export interface Player {
  id: string;
  name: string;
  element: string;
  ap: number;
  maxAp: number;
  inventory: string[];
  learnedSkills: string[];
  selectedInventory: string[];
  hasPassedGate: boolean;
  blockedSkills: string[];
  effects: string[];
  position: string;
}

export interface GameState {
  players: Player[];
  round: number;
  currentPlayerIndex: number;
  light: number;
  phase: number;
  preventLightLoss: boolean;
  lightLossPerRound: number;
  mode: string | null;
  scoutSelections: string[];
  gateOfWisdomPlaced: boolean;
  spherePhaseStep: string | null;
  board: { [key: string]: Tile };
  heroPositions: { [heroId: string]: string };
  tower: {
    foundations: string[];
    activatedElements: string[];
  };
  tileDeck1: string[];
  tileDeck2: string[];
  eventDeck: GameEvent[];
  selectedCharacters: string[];
  playerCount: number;
  difficulty: string;
}

export interface Tile {
  id: string;
  x: number;
  y: number;
  revealed: boolean;
  resources: string[];
  obstacle?: string;
}