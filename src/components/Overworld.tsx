import { useEffect } from 'react';
import { Position, TileType } from '@/types/game';

interface OverworldProps {
  playerPosition: Position;
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

const GRID_SIZE = 10;

const generateTiles = (): TileType[][] => {
  const tiles: TileType[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    tiles[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      // Create a path in the middle, grass elsewhere
      if ((x === 4 || x === 5) && (y >= 2 && y <= 7)) {
        tiles[y][x] = 'path';
      } else {
        tiles[y][x] = 'grass';
      }
    }
  }
  return tiles;
};

const tiles = generateTiles();

export const Overworld = ({ playerPosition, onMove }: OverworldProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onMove('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onMove('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onMove('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onMove('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4 text-foreground">Monster Navigator</h1>
      <p className="text-muted-foreground mb-6">Use WASD or Arrow Keys to move</p>
      
      <div className="grid gap-1 p-4 bg-card rounded-lg shadow-xl border-4 border-primary/20">
        {tiles.map((row, y) => (
          <div key={y} className="flex gap-1">
            {row.map((tile, x) => {
              const isPlayer = playerPosition.x === x && playerPosition.y === y;
              return (
                <div
                  key={`${x}-${y}`}
                  className={`w-12 h-12 flex items-center justify-center transition-all duration-200 ${
                    tile === 'grass' ? 'tile-grass' : 'tile-path'
                  } ${isPlayer ? 'ring-4 ring-accent shadow-lg scale-110' : ''}`}
                >
                  {isPlayer && (
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center font-bold text-accent-foreground shadow-lg">
                      P
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
