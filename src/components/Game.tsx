import { useState } from 'react';
import { Overworld } from './Overworld';
import { Battle } from './Battle';
import { Position, GameState, Combatant, TileType } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

const GRID_SIZE = 10;

const playerData: Combatant = {
  name: 'Player',
  hp: 20,
  maxHp: 20,
  attacks: [
    { name: 'Punch', damage: 2, accuracy: 100 },
    { name: 'Kick', damage: 3, accuracy: 70 },
    { 
      name: 'Shout', 
      damage: 0, 
      accuracy: 100,
      effect: { type: 'debuff', value: -1, duration: 2 }
    },
  ],
};

const generateEnemy = (): Combatant => ({
  name: 'Wild Monster',
  hp: 15,
  maxHp: 15,
  attacks: [
    { name: 'Bite', damage: 3, accuracy: 100 },
    { 
      name: 'Lick', 
      damage: 0, 
      accuracy: 100,
      effect: { type: 'heal', value: 1 }
    },
  ],
});

const getTileType = (x: number, y: number): TileType => {
  if ((x === 4 || x === 5) && (y >= 2 && y <= 7)) {
    return 'path';
  }
  return 'grass';
};

export const Game = () => {
  const [gameState, setGameState] = useState<GameState>('exploring');
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 5, y: 5 });
  const [player, setPlayer] = useState<Combatant>(playerData);
  const [enemy, setEnemy] = useState<Combatant>(generateEnemy());
  const { toast } = useToast();

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState !== 'exploring') return;

    let newX = playerPosition.x;
    let newY = playerPosition.y;

    switch (direction) {
      case 'up':
        newY = Math.max(0, playerPosition.y - 1);
        break;
      case 'down':
        newY = Math.min(GRID_SIZE - 1, playerPosition.y + 1);
        break;
      case 'left':
        newX = Math.max(0, playerPosition.x - 1);
        break;
      case 'right':
        newX = Math.min(GRID_SIZE - 1, playerPosition.x + 1);
        break;
    }

    setPlayerPosition({ x: newX, y: newY });

    // Check for encounter on grass
    const tileType = getTileType(newX, newY);
    if (tileType === 'grass') {
      const encounterChance = Math.random();
      if (encounterChance < 0.2) { // 20% chance
        setEnemy(generateEnemy());
        setGameState('battle');
      }
    }
  };

  const handleVictory = () => {
    toast({
      title: "Victory!",
      description: "You defeated the wild monster!",
    });
    setGameState('exploring');
    setPlayer({ ...player, hp: Math.min(player.maxHp, player.hp + 3) }); // Heal 3 HP
  };

  const handleDefeat = () => {
    toast({
      title: "Defeated!",
      description: "You were knocked out! Resetting...",
      variant: "destructive",
    });
    setPlayer({ ...playerData });
    setPlayerPosition({ x: 5, y: 5 });
    setGameState('exploring');
  };

  if (gameState === 'battle') {
    return <Battle player={player} enemy={enemy} onVictory={handleVictory} onDefeat={handleDefeat} />;
  }

  return <Overworld playerPosition={playerPosition} onMove={handleMove} />;
};
