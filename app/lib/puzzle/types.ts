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
    splitProbability: 0.3,
    elongatedBias: 0,
  },
  easy: {
    name: 'Easy',
    label: 'Easy',
    minGrid: 6,
    maxGrid: 7,
    minArea: 2,
    maxArea: 10,
    backtrackMin: 0,
    backtrackMax: 0,
    estimatedTime: '3–5 min',
    splitProbability: 0.35,
    elongatedBias: 0.05,
  },
  medium: {
    name: 'Medium',
    label: 'Medium',
    minGrid: 8,
    maxGrid: 10,
    minArea: 3,
    maxArea: 16,
    backtrackMin: 1,
    backtrackMax: 5,
    estimatedTime: '5–10 min',
    splitProbability: 0.4,
    elongatedBias: 0.1,
  },
  hard: {
    name: 'Hard',
    label: 'Hard',
    minGrid: 12,
    maxGrid: 15,
    minArea: 4,
    maxArea: 32,
    backtrackMin: 6,
    backtrackMax: 20,
    estimatedTime: '10–20 min',
    splitProbability: 0.35,
    elongatedBias: 0.20,
  },
  expert: {
    name: 'Expert',
    label: 'Expert',
    minGrid: 18,
    maxGrid: 22,
    minArea: 4,
    maxArea: 54,
    backtrackMin: 21,
    backtrackMax: 50,
    estimatedTime: '20–45 min',
    splitProbability: 0.30,
    elongatedBias: 0.25,
  },
  nightmare: {
    name: 'Nightmare',
    label: 'Nightmare',
    minGrid: 25,
    maxGrid: 40,
    minArea: 4,
    maxArea: 80,
    backtrackMin: 51,
    backtrackMax: 999,
    estimatedTime: '45+ min',
    splitProbability: 0.30,
    elongatedBias: 0.22,
  },
};
