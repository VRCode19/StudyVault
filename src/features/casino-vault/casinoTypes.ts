export type CasinoGameTab = 'slots' | 'roulette';

export type SlotSymbol = '7' | 'gem' | 'star' | 'cherry' | 'bell' | 'book';

export interface SlotSymbolDef {
  id: SlotSymbol;
  label: string;
  glyph: string;
  multiplier3x: number;
  multiplier2x: number;
  color: string;
  glow: string;
}

export const SLOT_SYMBOLS: SlotSymbolDef[] = [
  {
    id: '7',
    label: 'Lucky 7',
    glyph: '7',
    multiplier3x: 100, // Mega Jackpot
    multiplier2x: 5,
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.8)',
  },
  {
    id: 'gem',
    label: 'Ruby Diamond',
    glyph: '💎',
    multiplier3x: 50,
    multiplier2x: 3,
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.7)',
  },
  {
    id: 'book',
    label: 'Study Vault Book',
    glyph: '📚',
    multiplier3x: 35,
    multiplier2x: 2.5,
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.7)',
  },
  {
    id: 'star',
    label: 'Gold Star',
    glyph: '⭐',
    multiplier3x: 25,
    multiplier2x: 2,
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.7)',
  },
  {
    id: 'bell',
    label: 'Liberty Bell',
    glyph: '🔔',
    multiplier3x: 15,
    multiplier2x: 1.5,
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.6)',
  },
  {
    id: 'cherry',
    label: 'Twin Cherries',
    glyph: '🍒',
    multiplier3x: 10,
    multiplier2x: 1.2,
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.6)',
  },
];

export type RouletteBetType = 
  | 'number' 
  | 'red' 
  | 'black' 
  | 'even' 
  | 'odd' 
  | 'low'   // 1-18
  | 'high';  // 19-36

export interface RouletteBet {
  type: RouletteBetType;
  value?: number; // 0-36 for 'number'
  amount: number;
}

export interface RoulettePocket {
  number: number;
  color: 'red' | 'black' | 'green';
}

// European Roulette wheel sequence (clockwise)
export const ROULETTE_NUMBERS: RoulettePocket[] = [
  { number: 0, color: 'green' },
  { number: 32, color: 'red' },
  { number: 15, color: 'black' },
  { number: 19, color: 'red' },
  { number: 4, color: 'black' },
  { number: 21, color: 'red' },
  { number: 2, color: 'black' },
  { number: 25, color: 'red' },
  { number: 17, color: 'black' },
  { number: 34, color: 'red' },
  { number: 6, color: 'black' },
  { number: 27, color: 'red' },
  { number: 13, color: 'black' },
  { number: 36, color: 'red' },
  { number: 11, color: 'black' },
  { number: 30, color: 'red' },
  { number: 8, color: 'black' },
  { number: 23, color: 'red' },
  { number: 10, color: 'black' },
  { number: 5, color: 'red' },
  { number: 24, color: 'black' },
  { number: 16, color: 'red' },
  { number: 33, color: 'black' },
  { number: 1, color: 'red' },
  { number: 20, color: 'black' },
  { number: 14, color: 'red' },
  { number: 31, color: 'black' },
  { number: 9, color: 'red' },
  { number: 22, color: 'black' },
  { number: 18, color: 'red' },
  { number: 29, color: 'black' },
  { number: 7, color: 'red' },
  { number: 28, color: 'black' },
  { number: 12, color: 'red' },
  { number: 35, color: 'black' },
  { number: 3, color: 'red' },
  { number: 26, color: 'black' },
];

export const BET_AMOUNTS = [10, 50, 100, 500] as const;
