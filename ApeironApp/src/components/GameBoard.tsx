import React from 'react';
import { GameState, Tile } from '../types';

interface GameBoardProps {
  gameState: GameState;
  onTileClick: (position: string) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onTileClick }) => {
  const boardSize = 9;
  const centerPos = Math.floor(boardSize / 2);

  const renderTile = (x: number, y: number) => {
    const position = `${x},${y}`;
    const tile = gameState.board[position];
    const isKrater = position === '4,4';
    
    // Find heroes on this tile
    const heroesOnTile = Object.entries(gameState.heroPositions)
      .filter(([_, pos]) => pos === position)
      .map(([heroId, _]) => gameState.players.find(p => p.id === heroId))
      .filter(Boolean);

    // Check if tile is discoverable (adjacent to revealed tile)
    const isDiscoverable = !tile?.revealed && isAdjacentToRevealed(x, y, gameState.board);
    
    return (
      <div
        key={position}
        onClick={() => onTileClick(position)}
        className={`
          relative border border-gray-600 flex justify-center items-center flex-col
          text-center text-xs leading-tight p-1 aspect-square
          ${tile?.revealed ? getTileBackgroundClass(tile) : 'bg-gray-800'}
          ${isDiscoverable ? 'bg-gray-700 cursor-pointer hover:bg-gray-600' : ''}
          ${isKrater ? 'bg-gray-500' : ''}
        `}
        style={{ fontSize: '10px' }}
      >
        {/* Tile Content */}
        {tile?.revealed && (
          <>
            {getTileSymbol(tile)}
            <div className="text-xs mt-1">
              {getTileName(tile)}
            </div>
          </>
        )}

        {/* Krater */}
        {isKrater && (
          <>
            <div className="text-lg">🌋</div>
            <div className="text-xs">Krater</div>
          </>
        )}

        {/* Heroes on tile */}
        {heroesOnTile.length > 0 && (
          <div className={`absolute inset-0 flex items-center justify-center ${getHeroContainerClass(heroesOnTile.length)}`}>
            {heroesOnTile.map((hero, index) => (
              <div
                key={hero?.id}
                className={`hero-token font-bold text-white text-shadow ${
                  gameState.currentPlayerIndex === gameState.players.findIndex(p => p.id === hero?.id)
                    ? 'ring-2 ring-yellow-400'
                    : ''
                }`}
                style={{ 
                  color: getHeroColor(hero?.element || ''),
                  textShadow: '1px 1px 2px black'
                }}
              >
                {getHeroSymbol(hero?.element || '')}
              </div>
            ))}
          </div>
        )}

        {/* Discoverable indicator */}
        {isDiscoverable && !tile?.revealed && (
          <div className="text-gray-400 text-lg">?</div>
        )}

        {/* Tile resources */}
        {tile?.resources && tile.resources.length > 0 && (
          <div className="absolute top-0 right-0 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
            {tile.resources.length}
          </div>
        )}
      </div>
    );
  };

  const isAdjacentToRevealed = (x: number, y: number, board: { [key: string]: Tile }): boolean => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    return directions.some(([dx, dy]) => {
      const newX = x + dx;
      const newY = y + dy;
      if (newX < 0 || newX >= boardSize || newY < 0 || newY >= boardSize) return false;
      
      const adjacentPos = `${newX},${newY}`;
      return board[adjacentPos]?.revealed;
    });
  };

  const getTileBackgroundClass = (tile: Tile): string => {
    const tileColors: { [key: string]: string } = {
      krater: 'bg-gray-500',
      tor_der_weisheit: 'bg-white text-black',
      wiese_kristall: 'bg-green-400',
      hoehle_kristall: 'bg-gray-600',
      bauplan_erde: 'bg-yellow-600',
      bauplan_wasser: 'bg-blue-600',
      bauplan_feuer: 'bg-red-600', 
      bauplan_luft: 'bg-purple-400',
      fluss: 'bg-blue-500',
      gebirge: 'bg-gray-600',
      wald: 'bg-green-600',
      huegel: 'bg-green-500',
      herz_finster: 'bg-gray-900',
      element_fragment_erde: 'bg-yellow-600',
      element_fragment_wasser: 'bg-blue-600',
      element_fragment_feuer: 'bg-red-600',
      element_fragment_luft: 'bg-purple-400'
    };
    
    return tileColors[tile.id] || 'bg-gray-700';
  };

  const getTileSymbol = (tile: Tile): string => {
    const symbols: { [key: string]: string } = {
      tor_der_weisheit: '⛩️',
      wiese_kristall: '💎',
      hoehle_kristall: '💎',
      bauplan_erde: '📜',
      bauplan_wasser: '📜',
      bauplan_feuer: '📜',
      bauplan_luft: '📜',
      fluss: '🌊',
      gebirge: '⛰️',
      wald: '🌲',
      huegel: '⛰️',
      herz_finster: '🖤',
      element_fragment_erde: '🟫',
      element_fragment_wasser: '🟦',
      element_fragment_feuer: '🟥',
      element_fragment_luft: '🟪'
    };
    
    return symbols[tile.id] || '';
  };

  const getTileName = (tile: Tile): string => {
    const names: { [key: string]: string } = {
      tor_der_weisheit: 'Tor',
      wiese_kristall: 'Wiese',
      hoehle_kristall: 'Höhle',
      bauplan_erde: 'Erde',
      bauplan_wasser: 'Wasser',
      bauplan_feuer: 'Feuer',
      bauplan_luft: 'Luft',
      fluss: 'Fluss',
      gebirge: 'Berg',
      wald: 'Wald',
      huegel: 'Hügel',
      herz_finster: 'Finster',
      element_fragment_erde: 'Erde-F',
      element_fragment_wasser: 'Wasser-F',
      element_fragment_feuer: 'Feuer-F',
      element_fragment_luft: 'Luft-F'
    };
    
    return names[tile.id] || tile.id;
  };

  const getHeroContainerClass = (heroCount: number): string => {
    if (heroCount === 1) return '';
    if (heroCount === 2) return 'hero-container-2';
    if (heroCount === 3) return 'hero-container-3';
    return 'hero-container-4';
  };

  const getHeroColor = (element: string): string => {
    const colors: { [key: string]: string } = {
      earth: '#ca8a04',
      fire: '#ef4444', 
      water: '#3b82f6',
      air: '#a78bfa'
    };
    return colors[element] || '#ffffff';
  };

  const getHeroSymbol = (element: string): string => {
    const symbols: { [key: string]: string } = {
      earth: 'T',
      fire: 'I',
      water: 'L', 
      air: 'C'
    };
    return symbols[element] || '?';
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div 
        className="grid bg-gray-800 border-2 border-gray-600 rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          width: '90vmin',
          height: '90vmin',
          maxWidth: '800px',
          maxHeight: '800px'
        }}
      >
        {Array.from({ length: boardSize }, (_, y) =>
          Array.from({ length: boardSize }, (_, x) =>
            renderTile(x, y)
          )
        )}
      </div>
    </div>
  );
};

export default GameBoard;