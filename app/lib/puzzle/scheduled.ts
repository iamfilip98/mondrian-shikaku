import { getISOWeek } from 'date-fns';
import { generatePuzzle } from './generator';
import type { Puzzle } from './types';

export function getDailyPuzzle(date: Date): Puzzle {
  return generatePuzzle({
    width: 10,
    height: 10,
    difficulty: 'medium',
    seed: `daily-${date.toISOString().slice(0, 10)}`,
  });
}

export function getWeeklyPuzzle(date: Date): Puzzle {
  return generatePuzzle({
    width: 20,
    height: 20,
    difficulty: 'expert',
    seed: `weekly-${date.getFullYear()}-W${String(getISOWeek(date)).padStart(2, '0')}`,
  });
}

export function getMonthlyPuzzle(date: Date): Puzzle {
  return generatePuzzle({
    width: 40,
    height: 40,
    difficulty: 'nightmare',
    seed: `monthly-${date.toISOString().slice(0, 7)}`,
  });
}

export function getTimeUntilMidnightUTC(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tomorrow.getTime() - now.getTime();
}

export function getTimeUntilMondayUTC(): number {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday)
  );
  return nextMonday.getTime() - now.getTime();
}

export function getTimeUntilFirstOfMonth(): number {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return nextMonth.getTime() - now.getTime();
}
