import { describe, it, expect } from 'vitest';
import {
  getDailyPuzzle,
  getWeeklyPuzzle,
  getMonthlyPuzzle,
  getTimeUntilMidnightUTC,
  getTimeUntilMondayUTC,
  getTimeUntilFirstOfMonth,
} from './scheduled';

describe('getDailyPuzzle', () => {
  it('returns deterministic puzzle for the same date', () => {
    const date = new Date('2025-06-15T12:00:00Z');
    const p1 = getDailyPuzzle(date);
    const p2 = getDailyPuzzle(date);
    expect(p1.clues).toEqual(p2.clues);
    expect(p1.solution).toEqual(p2.solution);
  });

  it('returns different puzzles for different dates', () => {
    const p1 = getDailyPuzzle(new Date('2025-06-15T00:00:00Z'));
    const p2 = getDailyPuzzle(new Date('2025-06-16T00:00:00Z'));
    expect(p1.clues).not.toEqual(p2.clues);
  });

  it('generates a 10x10 grid', () => {
    const p = getDailyPuzzle(new Date('2025-06-15T00:00:00Z'));
    expect(p.width).toBe(10);
    expect(p.height).toBe(10);
  });
});

describe('getWeeklyPuzzle', () => {
  it('returns deterministic puzzle for the same week', () => {
    const date = new Date('2025-06-16T12:00:00Z');
    const p1 = getWeeklyPuzzle(date);
    const p2 = getWeeklyPuzzle(date);
    expect(p1.clues).toEqual(p2.clues);
  });

  it('generates a 20x20 grid', () => {
    const p = getWeeklyPuzzle(new Date('2025-06-16T00:00:00Z'));
    expect(p.width).toBe(20);
    expect(p.height).toBe(20);
  });
});

describe('getMonthlyPuzzle', () => {
  it('returns deterministic puzzle for the same month', () => {
    const date = new Date('2025-06-01T00:00:00Z');
    const p1 = getMonthlyPuzzle(date);
    const p2 = getMonthlyPuzzle(date);
    expect(p1.clues).toEqual(p2.clues);
  }, 15000);

  it('generates a 40x40 grid', () => {
    const p = getMonthlyPuzzle(new Date('2025-06-01T00:00:00Z'));
    expect(p.width).toBe(40);
    expect(p.height).toBe(40);
  });
});

describe('getTimeUntilMidnightUTC', () => {
  it('returns a positive value', () => {
    expect(getTimeUntilMidnightUTC()).toBeGreaterThan(0);
  });

  it('returns at most 24 hours in ms', () => {
    expect(getTimeUntilMidnightUTC()).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });
});

describe('getTimeUntilMondayUTC', () => {
  it('returns a positive value', () => {
    expect(getTimeUntilMondayUTC()).toBeGreaterThan(0);
  });

  it('returns at most 7 days in ms', () => {
    expect(getTimeUntilMondayUTC()).toBeLessThanOrEqual(7 * 24 * 60 * 60 * 1000);
  });
});

describe('getTimeUntilFirstOfMonth', () => {
  it('returns a positive value', () => {
    expect(getTimeUntilFirstOfMonth()).toBeGreaterThan(0);
  });

  it('returns at most 31 days in ms', () => {
    expect(getTimeUntilFirstOfMonth()).toBeLessThanOrEqual(31 * 24 * 60 * 60 * 1000);
  });
});
