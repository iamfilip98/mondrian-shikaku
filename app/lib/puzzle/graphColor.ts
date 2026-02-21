import type { GridRect } from './types';

const MONDRIAN_COLORS = ['var(--color-red)', 'var(--color-yellow)', 'var(--color-blue)'];
const MONDRIAN_HEX = ['#D40920', '#F9C30F', '#1356A2'];

function sharesEdge(a: GridRect, b: GridRect): boolean {
  // Check if two rectangles share an edge (not just a corner)
  const aRight = a.col + a.width;
  const aBottom = a.row + a.height;
  const bRight = b.col + b.width;
  const bBottom = b.row + b.height;

  // Check horizontal adjacency (share a vertical edge)
  if (aRight === b.col || bRight === a.col) {
    const overlapStart = Math.max(a.row, b.row);
    const overlapEnd = Math.min(aBottom, bBottom);
    if (overlapEnd > overlapStart) return true;
  }

  // Check vertical adjacency (share a horizontal edge)
  if (aBottom === b.row || bBottom === a.row) {
    const overlapStart = Math.max(a.col, b.col);
    const overlapEnd = Math.min(aRight, bRight);
    if (overlapEnd > overlapStart) return true;
  }

  return false;
}

export function buildAdjacency(rectangles: GridRect[]): Map<number, Set<number>> {
  const adj = new Map<number, Set<number>>();

  for (let i = 0; i < rectangles.length; i++) {
    adj.set(i, new Set());
  }

  for (let i = 0; i < rectangles.length; i++) {
    for (let j = i + 1; j < rectangles.length; j++) {
      if (sharesEdge(rectangles[i], rectangles[j])) {
        adj.get(i)!.add(j);
        adj.get(j)!.add(i);
      }
    }
  }

  return adj;
}

export function assignColors(
  rectangles: GridRect[],
  unlockedColors: string[]
): Map<number, string> {
  const adj = buildAdjacency(rectangles);
  const colorMap = new Map<number, string>();
  const colorCount = new Map<string, number>();

  for (const color of unlockedColors) {
    colorCount.set(color, 0);
  }

  for (let i = 0; i < rectangles.length; i++) {
    const neighborColors = new Set<string>();
    for (const neighbor of adj.get(i) || []) {
      const nc = colorMap.get(neighbor);
      if (nc) neighborColors.add(nc);
    }

    // Find first valid color, preferring least-used
    let bestColor = unlockedColors[0];
    let bestCount = Infinity;

    for (const color of unlockedColors) {
      if (!neighborColors.has(color)) {
        const count = colorCount.get(color) || 0;
        if (count < bestCount) {
          bestCount = count;
          bestColor = color;
        }
      }
    }

    colorMap.set(i, bestColor);
    colorCount.set(bestColor, (colorCount.get(bestColor) || 0) + 1);
  }

  return colorMap;
}

export function getUnlockedColors(): string[] {
  return [...MONDRIAN_COLORS];
}

export function getUnlockedHexColors(): string[] {
  return [...MONDRIAN_HEX];
}

export { MONDRIAN_COLORS, MONDRIAN_HEX };
