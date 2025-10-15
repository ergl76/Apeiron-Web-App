// Global type declarations for Apeiron Game
declare global {
  interface Window {
    [key: string]: any;
  }
}

// Game State Types
export interface Player {
  id: string;
  name: string;
  position: string;
  ap: number;
  maxAp: number;
  inventory: string[];
  maxInventory: number;
  learnedSkills: string[];
  element: string;
  isMaster: boolean;
  artifactSkills: string[];
  effects?: any[];
}

export interface GameState {
  round: number;
  phase: number;
  light: number;
  currentPlayerIndex: number;
  players: Player[];
  board: Record<string, any>;
  tower: {
    foundations: string[];
    activatedElements: string[];
  };
  torDerWeisheit: {
    triggered: boolean;
    position: string | null;
    lightLossAtTrigger: number;
  };
  herzDerFinsternis: {
    triggered: boolean;
    position: string | null;
    darkTiles: string[];
  };
  herzDerFinsternisModal: {
    show: boolean;
    position: string | null;
    chosenDirection: string | null;
    awaitingCardDraw: boolean;
  };
  torDerWeisheitModal: {
    show: boolean;
    position: string | null;
    chosenDirection: string | null;
    awaitingCardDraw: boolean;
  };
  victoryModal: {
    show: boolean;
    stats: any;
  };
  defeatModal: {
    show: boolean;
    stats: any;
  };
  foundationSuccessModal: {
    show: boolean;
    foundationType: string | null;
    count: number;
    lightBonus: number;
  };
  elementSuccessModal: {
    show: boolean;
    elementType: string | null;
    count: number;
    bonus: any;
  };
  foundationSelectionModal: {
    show: boolean;
  };
  elementSelectionModal: {
    show: boolean;
  };
  teachSkillSelectionModal: {
    show: boolean;
  };
  isTransitioning: boolean;
  currentEvent: any;
  eventDeck: string[];
  discoveryTracking: {
    firstDiscoveryPosition: string | null;
    firstDiscoveryActive: boolean;
  };
  tileDeck: string[];
  actionBlockers: any[];
  isEventTriggering: boolean;
  roundCompleted: boolean;
  phaseTransitionModal: {
    show: boolean;
    foundationBonus: number;
    phaseCompletionBonus: number;
    totalBonus: number;
  };
  cardDrawQueue: any[];
  drawnCards: Record<string, any>;
  cardDrawState: string;
  gameStartTime: number;
  totalApSpent: number;
  totalTurns: number;
  phase1TotalTurns: number;
  phase2TotalTurns: number;
  phase1TotalApSpent: number;
  phase2TotalApSpent: number;
  phase1Stats: any;
}

export interface GameData {
  playerCount: number;
  difficulty: string;
  selectedCharacters: string[];
}

export interface Hero {
  id: string;
  name: string;
  element: string;
  description: string;
  color: string;
  image: string;
}

// Component Props Types
export interface GameSetupProps {
  onStartGame: (playerCount: number, difficulty: string, selectedCharacters: string[]) => void;
}

export interface GameScreenProps {
  gameData: GameData;
  onNewGame: () => void;
}

export interface GameBoardProps {
  gameState: GameState;
  onTileClick: (position: string) => void;
  onHeroClick: (heroId: string) => void;
  boardContainerRef: React.RefObject<HTMLDivElement>;
}

// Event Handler Types
export type ObstacleRemovalHandler = (position: string, obstacle: string) => void;
export type DarknessRemovalHandler = (position: string) => void;

// Allow 'any' types for complex game objects to avoid excessive typing
declare module 'react' {
  interface CSSProperties {
    [key: string]: any;
  }
}

export {};