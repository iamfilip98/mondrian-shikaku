import { describe, it, expect } from 'vitest';
import { mulberry32, seededShuffle, seededRandInt } from './prng';

describe('mulberry32', () => {
  it('produces deterministic output for the same seed', () => {
    const rng1 = mulberry32('test-seed');
    const rng2 = mulberry32('test-seed');
    const vals1 = Array.from({ length: 20 }, () => rng1());
    const vals2 = Array.from({ length: 20 }, () => rng2());
    expect(vals1).toEqual(vals2);
  });

  it('produces different output for different seeds', () => {
    const rng1 = mulberry32('seed-a');
    const rng2 = mulberry32('seed-b');
    const vals1 = Array.from({ length: 10 }, () => rng1());
    const vals2 = Array.from({ length: 10 }, () => rng2());
    expect(vals1).not.toEqual(vals2);
  });

  it('returns values in [0, 1)', () => {
    const rng = mulberry32('range-test');
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('seededShuffle', () => {
  it('returns all original elements', () => {
    const rng = mulberry32('shuffle-test');
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = seededShuffle(arr, rng);
    expect(shuffled.sort((a, b) => a - b)).toEqual(arr);
  });

  it('is deterministic', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const s1 = seededShuffle(arr, mulberry32('det'));
    const s2 = seededShuffle(arr, mulberry32('det'));
    expect(s1).toEqual(s2);
  });

  it('does not mutate the input array', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    seededShuffle(arr, mulberry32('no-mutate'));
    expect(arr).toEqual(copy);
  });
});

describe('seededRandInt', () => {
  it('returns values within [min, max] inclusive', () => {
    const rng = mulberry32('randint-test');
    for (let i = 0; i < 500; i++) {
      const v = seededRandInt(3, 7, rng);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
    }
  });

  it('is deterministic', () => {
    const vals1 = Array.from({ length: 20 }, () => seededRandInt(1, 100, mulberry32('ri')));
    const vals2 = Array.from({ length: 20 }, () => seededRandInt(1, 100, mulberry32('ri')));
    // Each call creates a fresh rng, so the first value from each should match
    expect(vals1[0]).toEqual(vals2[0]);
  });
});
