import { describe, it, expect } from 'vitest';
import { buildAdjacency, assignColors } from './graphColor';
import type { GridRect } from './types';

describe('buildAdjacency', () => {
  it('detects horizontal adjacency (share vertical edge)', () => {
    const rects: GridRect[] = [
      { row: 0, col: 0, width: 2, height: 2 },
      { row: 0, col: 2, width: 2, height: 2 },
    ];
    const adj = buildAdjacency(rects);
    expect(adj.get(0)!.has(1)).toBe(true);
    expect(adj.get(1)!.has(0)).toBe(true);
  });

  it('detects vertical adjacency (share horizontal edge)', () => {
    const rects: GridRect[] = [
      { row: 0, col: 0, width: 2, height: 2 },
      { row: 2, col: 0, width: 2, height: 2 },
    ];
    const adj = buildAdjacency(rects);
    expect(adj.get(0)!.has(1)).toBe(true);
  });

  it('does not detect corner-only touching as adjacent', () => {
    const rects: GridRect[] = [
      { row: 0, col: 0, width: 2, height: 2 },
      { row: 2, col: 2, width: 2, height: 2 },
    ];
    const adj = buildAdjacency(rects);
    expect(adj.get(0)!.has(1)).toBe(false);
  });

  it('does not detect non-touching rects as adjacent', () => {
    const rects: GridRect[] = [
      { row: 0, col: 0, width: 2, height: 2 },
      { row: 5, col: 5, width: 2, height: 2 },
    ];
    const adj = buildAdjacency(rects);
    expect(adj.get(0)!.has(1)).toBe(false);
  });

  it('detects partial edge sharing', () => {
    const rects: GridRect[] = [
      { row: 0, col: 0, width: 2, height: 3 },
      { row: 1, col: 2, width: 2, height: 2 },
    ];
    const adj = buildAdjacency(rects);
    expect(adj.get(0)!.has(1)).toBe(true);
  });
});

describe('assignColors', () => {
  const colors = ['red', 'yellow', 'blue'];

  it('assigns different colors to adjacent rects', () => {
    const rects: GridRect[] = [
      { row: 0, col: 0, width: 2, height: 2 },
      { row: 0, col: 2, width: 2, height: 2 },
    ];
    const colorMap = assignColors(rects, colors);
    expect(colorMap.get(0)).not.toBe(colorMap.get(1));
  });

  it('does not assign same color to adjacent rects in a line', () => {
    const rects: GridRect[] = [
      { row: 0, col: 0, width: 2, height: 2 },
      { row: 0, col: 2, width: 2, height: 2 },
      { row: 0, col: 4, width: 2, height: 2 },
    ];
    const colorMap = assignColors(rects, colors);
    // Adjacent pairs must have different colors
    expect(colorMap.get(0)).not.toBe(colorMap.get(1));
    expect(colorMap.get(1)).not.toBe(colorMap.get(2));
    // All assigned colors must be from the palette
    for (let i = 0; i < 3; i++) {
      expect(colors).toContain(colorMap.get(i));
    }
  });

  it('assigns a color to every rectangle', () => {
    const rects: GridRect[] = [
      { row: 0, col: 0, width: 1, height: 1 },
      { row: 0, col: 1, width: 1, height: 1 },
      { row: 1, col: 0, width: 1, height: 1 },
      { row: 1, col: 1, width: 1, height: 1 },
    ];
    const colorMap = assignColors(rects, colors);
    expect(colorMap.size).toBe(4);
    for (let i = 0; i < 4; i++) {
      expect(colors).toContain(colorMap.get(i));
    }
  });
});
