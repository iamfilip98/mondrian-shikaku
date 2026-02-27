export interface BadgeDef {
  key: string;
  name: string;
  description: string;
  color: string;
}

export const BADGES: BadgeDef[] = [
  // Solve count milestones
  { key: 'first_solve', name: 'First Steps', description: 'Complete your first puzzle', color: '#D40920' },
  { key: 'solves_10', name: 'Getting Started', description: 'Complete 10 puzzles', color: '#D40920' },
  { key: 'solves_50', name: 'Dedicated', description: 'Complete 50 puzzles', color: '#1356A2' },
  { key: 'solves_100', name: 'Centurion', description: 'Complete 100 puzzles', color: '#F9C30F' },
  { key: 'solves_500', name: 'Puzzle Master', description: 'Complete 500 puzzles', color: '#D40920' },

  // Streak milestones
  { key: 'streak_3', name: 'Hat Trick', description: 'Reach a 3-day streak', color: '#F9C30F' },
  { key: 'streak_7', name: 'Full Week', description: 'Reach a 7-day streak', color: '#F9C30F' },
  { key: 'streak_30', name: 'Monthly Regular', description: 'Reach a 30-day streak', color: '#F9C30F' },

  // Difficulty milestones
  { key: 'first_hard', name: 'Stepping Up', description: 'Complete a Hard puzzle', color: '#1356A2' },
  { key: 'first_expert', name: 'Expert Solver', description: 'Complete an Expert puzzle', color: '#1356A2' },
  { key: 'first_nightmare', name: 'Fearless', description: 'Complete a Nightmare puzzle', color: '#D40920' },

  // Special
  { key: 'no_hints', name: 'Purist', description: 'Complete 10 puzzles without hints', color: '#1356A2' },
  { key: 'speed_demon', name: 'Speed Demon', description: 'Complete an Easy puzzle in under 30 seconds', color: '#D40920' },
];

export const BADGE_MAP = new Map(BADGES.map(b => [b.key, b]));

export interface AchievementCheckContext {
  puzzlesCompleted: number;
  longestStreak: number;
  difficulty: string;
  hintsUsed: number;
  solveTimeSeconds: number;
  noHintSolves: number;
  earnedBadges: Set<string>;
}

export function checkNewBadges(ctx: AchievementCheckContext): string[] {
  const newBadges: string[] = [];

  const checks: [string, boolean][] = [
    ['first_solve', ctx.puzzlesCompleted >= 1],
    ['solves_10', ctx.puzzlesCompleted >= 10],
    ['solves_50', ctx.puzzlesCompleted >= 50],
    ['solves_100', ctx.puzzlesCompleted >= 100],
    ['solves_500', ctx.puzzlesCompleted >= 500],
    ['streak_3', ctx.longestStreak >= 3],
    ['streak_7', ctx.longestStreak >= 7],
    ['streak_30', ctx.longestStreak >= 30],
    ['first_hard', ctx.difficulty === 'hard' || ctx.difficulty === 'expert' || ctx.difficulty === 'nightmare'],
    ['first_expert', ctx.difficulty === 'expert' || ctx.difficulty === 'nightmare'],
    ['first_nightmare', ctx.difficulty === 'nightmare'],
    ['no_hints', ctx.noHintSolves >= 10],
    ['speed_demon', ctx.difficulty === 'easy' && ctx.solveTimeSeconds <= 30 && ctx.hintsUsed === 0],
  ];

  for (const [key, condition] of checks) {
    if (condition && !ctx.earnedBadges.has(key)) {
      newBadges.push(key);
    }
  }

  return newBadges;
}
