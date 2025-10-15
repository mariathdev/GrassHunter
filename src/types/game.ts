export type TileType = 'grass' | 'path';

export interface Position {
  x: number;
  y: number;
}

export interface Attack {
  name: string;
  damage: number;
  accuracy: number;
  effect?: {
    type: 'debuff' | 'heal';
    value: number;
    duration?: number;
  };
}

export interface Combatant {
  name: string;
  hp: number;
  maxHp: number;
  attacks: Attack[];
  debuff?: number;
  debuffTurns?: number;
}

export type GameState = 'exploring' | 'battle' | 'victory';
