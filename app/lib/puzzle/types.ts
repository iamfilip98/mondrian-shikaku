export type Difficulty =
  | 'primer'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'expert'
  | 'nightmare';

export interface PuzzleConfig {
  width: number;
  height: number;
  difficulty: Difficulty;
  seed: string;
}

export interface GridRect {
  row: number;
  col: number;
  width: number;
  height: number;
}

export interface Clue {
  row: number;
  col: number;
  value: number; // always ≥ 2, never 1
}

export interface PlacedRect extends GridRect {
  color: string;
  isCorrect: boolean;
  clueIndex: number; // which clue this rect covers, or -1
  _actuallyCorrect?: boolean;
}

export interface Puzzle {
  width: number;
  height: number;
  clues: Clue[];
  solution: GridRect[];
}

export interface DifficultyConfig {
  name: string;
  label: string;
  minGrid: number;
  maxGrid: number;
  minArea: number;
  maxArea: number;
  backtrackMin: number;
  backtrackMax: number;
  estimatedTime: string;
  splitProbability: number;
  elongatedBias: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  primer: {
    name: 'Primer',
    label: 'Primer',
    minGrid: 4,
    maxGrid: 5,
    minArea: 2,
    maxArea: 6,
    backtrackMin: 0,
    backtrackMax: 0,
    estimatedTime: '1–3 min',
    splitProbability: 0.30,
    elongatedBias: 0,
  },
  easy: {
    name: 'Easy',
    label: 'Easy',
    minGrid: 6,
    maxGrid: 7,
    minArea: 2,
    maxArea: 8,
    backtrackMin: 0,
    backtrackMax: 3,
    estimatedTime: '2–5 min',
    splitProbability: 0.40,
    elongatedBias: 0.05,
  },
  medium: {
    name: 'Medium',
    label: 'Medium',
    minGrid: 8,
    maxGrid: 10,
    minArea: 2,
    maxArea: 12,
    backtrackMin: 2,
    backtrackMax: 15,
    estimatedTime: '5–15 min',
    splitProbability: 0.50,
    elongatedBias: 0.10,
  },
  hard: {
    name: 'Hard',
    label: 'Hard',
    minGrid: 12,
    maxGrid: 15,
    minArea: 2,
    maxArea: 16,
    backtrackMin: 10,
    backtrackMax: 50,
    estimatedTime: '15–30 min',
    splitProbability: 0.55,
    elongatedBias: 0.15,
  },
  expert: {
    name: 'Expert',
    label: 'Expert',
    minGrid: 18,
    maxGrid: 22,
    minArea: 2,
    maxArea: 24,
    backtrackMin: 20,
    backtrackMax: 100,
    estimatedTime: '30–60 min',
    splitProbability: 0.55,
    elongatedBias: 0.20,
  },
  nightmare: {
    name: 'Nightmare',
    label: 'Nightmare',
    minGrid: 25,
    maxGrid: 40,
    minArea: 2,
    maxArea: 32,
    backtrackMin: 30,
    backtrackMax: 999,
    estimatedTime: '60+ min',
    splitProbability: 0.55,
    elongatedBias: 0.20,
  },
};
