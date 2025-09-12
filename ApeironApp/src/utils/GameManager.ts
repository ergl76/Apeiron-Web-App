import { GameState, Player, Tile, GameEvent, Hero, Skill, TileConfig } from '../types';
import gameRulesConfig from '../config/gameRules.json';
import heroesConfig from '../config/heroes.json';
import skillsConfig from '../config/skills.json';
import tilesConfig from '../config/tiles.json';
import eventsConfig from '../config/events.json';

export class GameManager {
  private gameState: GameState;
  
  constructor() {
    this.gameState = this.initializeGameState();
  }

  private initializeGameState(): GameState {
    return {
      players: [],
      round: 1,
      currentPlayerIndex: 0,
      light: gameRulesConfig.light.maxValue,
      phase: 1,
      preventLightLoss: false,
      lightLossPerRound: 0,
      mode: null,
      scoutSelections: [],
      gateOfWisdomPlaced: false,
      spherePhaseStep: null,
      board: { '4,4': { id: 'krater', x: 4, y: 4, revealed: true, resources: [] } },
      heroPositions: {},
      tower: { foundations: [], activatedElements: [] },
      tileDeck1: [],
      tileDeck2: [],
      eventDeck: [],
      selectedCharacters: [],
      playerCount: 4,
      difficulty: 'normal'
    };
  }

  // Config Getters
  public getGameRules() { return gameRulesConfig; }
  public getHeroes(): Record<string, Hero> { return heroesConfig; }
  public getSkills(): Record<string, Skill> { return skillsConfig; }
  public getTiles() { return tilesConfig; }
  public getEvents() { return eventsConfig; }

  // Game State Management
  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public setPlayerCount(count: number) {
    this.gameState.playerCount = count;
  }

  public setDifficulty(difficulty: string) {
    this.gameState.difficulty = difficulty;
  }

  public setSelectedCharacters(characters: string[]) {
    this.gameState.selectedCharacters = characters;
  }

  // Game Initialization
  public startGame() {
    const heroes = this.getHeroes();
    const gameRules = this.getGameRules();
    
    // Create players from selected characters
    this.gameState.players = this.gameState.selectedCharacters.map(id => {
      const hero = heroes[id];
      return {
        id: hero.id,
        name: hero.name,
        element: hero.element,
        ap: gameRules.actionPoints.perTurn,
        maxAp: gameRules.actionPoints.perTurn,
        inventory: [],
        learnedSkills: [...hero.innateSkills, 'aufdecken'],
        selectedInventory: [],
        hasPassedGate: false,
        blockedSkills: [],
        effects: [],
        position: '4,4'
      };
    });

    // Set light loss per round
    const playerCountKey = `players${this.gameState.playerCount}` as keyof typeof gameRules.light.lossPerRound.phase1;
    this.gameState.lightLossPerRound = gameRules.light.lossPerRound.phase1[playerCountKey];

    // Initialize hero positions
    this.gameState.players.forEach(player => {
      this.gameState.heroPositions[player.id] = '4,4';
    });

    // Create tile decks
    this.createTileDecks();
    this.createEventDecks();

    return this.gameState;
  }

  private createTileDecks() {
    const tiles = this.getTiles();
    const heroes = this.getHeroes();
    
    // Phase 1 deck
    const tileDeck1: string[] = [];
    Object.entries(tiles.phase1).forEach(([tileId, config]) => {
      for (let i = 0; i < config.count; i++) {
        tileDeck1.push(tileId);
      }
    });

    // Add artifacts for missing heroes
    const missingHeroes = Object.keys(heroes).filter(id => 
      !this.gameState.selectedCharacters.includes(id)
    );
    const artifacts = missingHeroes.map(id => `artefakt_${id}`);
    
    this.gameState.tileDeck1 = this.shuffle([...tileDeck1, ...artifacts]);

    // Phase 2 deck
    const tileDeck2: string[] = [];
    Object.entries(tiles.phase2).forEach(([tileId, config]) => {
      for (let i = 0; i < config.count; i++) {
        tileDeck2.push(tileId);
      }
    });
    
    this.gameState.tileDeck2 = this.shuffle(tileDeck2);
  }

  private createEventDecks() {
    const events = this.getEvents();
    const gameRules = this.getGameRules();
    const difficulty = gameRules.difficulty[this.gameState.difficulty];
    
    const totalCards = 40;
    const numPositive = Math.round(totalCards * difficulty.positiveEvents);
    const numNegative = totalCards - numPositive;

    const positiveCards = this.shuffle([...events.phase1.positive]).slice(0, numPositive);
    const negativeCards = this.shuffle([...events.phase1.negative]).slice(0, numNegative);
    
    this.gameState.eventDeck = this.shuffle([...positiveCards, ...negativeCards]);
  }

  // Utility Functions
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Player Actions
  public getCurrentPlayer(): Player {
    return this.gameState.players[this.gameState.currentPlayerIndex];
  }

  public canPerformAction(actionCost: number = 1): boolean {
    const player = this.getCurrentPlayer();
    return player.ap >= actionCost;
  }

  public spendActionPoints(cost: number = 1): boolean {
    if (!this.canPerformAction(cost)) return false;
    
    const player = this.getCurrentPlayer();
    player.ap -= cost;
    return true;
  }

  // Movement
  public movePlayer(playerId: string, targetPosition: string): boolean {
    if (!this.canPerformAction(1)) return false;

    const tile = this.gameState.board[targetPosition];
    if (!tile || !tile.revealed) return false;

    this.gameState.heroPositions[playerId] = targetPosition;
    this.spendActionPoints(1);
    return true;
  }

  // Tile Discovery
  public discoverTile(position: string): string | null {
    if (!this.canPerformAction(1)) return null;
    if (this.gameState.board[position]?.revealed) return null;

    const deck = this.gameState.phase === 1 ? this.gameState.tileDeck1 : this.gameState.tileDeck2;
    if (deck.length === 0) return null;

    const tileId = deck.pop()!;
    const [x, y] = position.split(',').map(Number);
    
    this.gameState.board[position] = {
      id: tileId,
      x,
      y,
      revealed: true,
      resources: this.getTileResources(tileId)
    };

    this.spendActionPoints(1);
    return tileId;
  }

  private getTileResources(tileId: string): string[] {
    const tiles = this.getTiles();
    const phase = this.gameState.phase === 1 ? 'phase1' : 'phase2';
    const tileConfig = tiles[phase][tileId];
    
    if (tileConfig?.resource) {
      return [tileConfig.resource];
    }
    return [];
  }

  // Turn Management
  public endTurn(): void {
    // Reset current player's AP
    const currentPlayer = this.getCurrentPlayer();
    currentPlayer.ap = currentPlayer.maxAp;

    // Next player
    this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;
    
    // If back to first player, new round
    if (this.gameState.currentPlayerIndex === 0) {
      this.startNewRound();
    }
  }

  private startNewRound(): void {
    this.gameState.round++;
    
    // Apply light loss
    if (!this.gameState.preventLightLoss) {
      this.gameState.light += this.gameState.lightLossPerRound;
      this.gameState.light = Math.max(0, this.gameState.light);
    }
    
    this.gameState.preventLightLoss = false;

    // Check for game over
    if (this.gameState.light <= 0) {
      // Game over logic
      return;
    }

    // Check for phase transition or gate of wisdom
    this.checkPhaseTransition();
  }

  private checkPhaseTransition(): void {
    const gameRules = this.getGameRules();
    const playerCountKey = `players${this.gameState.playerCount}` as keyof typeof gameRules.gateOfWisdom.appearsAtRound;
    const gateRound = gameRules.gateOfWisdom.appearsAtRound[playerCountKey];

    if (this.gameState.round === gateRound && !this.gameState.gateOfWisdomPlaced) {
      this.placeGateOfWisdom();
    }
  }

  private placeGateOfWisdom(): void {
    // Find a random revealed tile to place the gate
    const revealedPositions = Object.keys(this.gameState.board).filter(pos => 
      this.gameState.board[pos].revealed && pos !== '4,4'
    );
    
    if (revealedPositions.length > 0) {
      const randomPos = revealedPositions[Math.floor(Math.random() * revealedPositions.length)];
      const [x, y] = randomPos.split(',').map(Number);
      
      this.gameState.board[randomPos] = {
        id: 'tor_der_weisheit',
        x,
        y,
        revealed: true,
        resources: []
      };
      
      this.gameState.gateOfWisdomPlaced = true;
    }
  }

  // Win Condition Check
  public checkWinCondition(): boolean {
    const tower = this.gameState.tower;
    return tower.foundations.length === 4 && tower.activatedElements.length === 4;
  }

  // Light Management
  public modifyLight(amount: number): void {
    this.gameState.light += amount;
    this.gameState.light = Math.max(0, Math.min(gameRulesConfig.light.maxValue, this.gameState.light));
  }
}