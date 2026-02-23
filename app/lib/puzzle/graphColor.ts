import type { GridRect } from './types';

const MONDRIAN_COLORS = ['var(--color-red)', 'var(--color-yellow)', 'var(--color-blue)', 'var(--color-neutral)'];
const MONDRIAN_HEX = ['#D40920', '#F9C30F', '#1356A2', '#0A0A0A'];

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

function sharesCorner(a: GridRect, b: GridRect): boolean {
  // Check if two rectangles meet at a corner point (without sharing an edge)
  const aCorners = [
    `${a.col},${a.row}`,
    `${a.col + a.width},${a.row}`,
    `${a.col},${a.row + a.height}`,
    `${a.col + a.width},${a.row + a.height}`,
  ];
  const bCorners = new Set([
    `${b.col},${b.row}`,
    `${b.col + b.width},${b.row}`,
    `${b.col},${b.row + b.height}`,
    `${b.col + b.width},${b.row + b.height}`,
  ]);
  return aCorners.some((c) => bCorners.has(c));
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

function buildCornerAdjacency(rectangles: GridRect[]): Map<number, Set<number>> {
  const adj = new Map<number, Set<number>>();

  for (let i = 0; i < rectangles.length; i++) {
    adj.set(i, new Set());
  }

  for (let i = 0; i < rectangles.length; i++) {
    for (let j = i + 1; j < rectangles.length; j++) {
      if (!sharesEdge(rectangles[i], rectangles[j]) && sharesCorner(rectangles[i], rectangles[j])) {
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
  const cornerAdj = buildCornerAdjacency(rectangles);
  const colorMap = new Map<number, string>();
  const colorCount = new Map<string, number>();

  for (const color of unlockedColors) {
    colorCount.set(color, 0);
  }

  for (let i = 0; i < rectangles.length; i++) {
    // Hard constraint: no same color as edge-sharing neighbors
    const edgeNeighborColors = new Set<string>();
    for (const neighbor of adj.get(i) || []) {
      const nc = colorMap.get(neighbor);
      if (nc) edgeNeighborColors.add(nc);
    }

    // Soft constraint: avoid same color as corner-touching neighbors
    const cornerNeighborColors = new Set<string>();
    for (const neighbor of cornerAdj.get(i) || []) {
      const nc = colorMap.get(neighbor);
      if (nc) cornerNeighborColors.add(nc);
    }

    const validColors = unlockedColors.filter((c) => !edgeNeighborColors.has(c));

    // Prefer colors not used by corner neighbors
    const preferred = validColors.filter((c) => !cornerNeighborColors.has(c));
    const candidates = preferred.length > 0 ? preferred : validColors;

    // Find minimum usage count among candidates
    let minCount = Infinity;
    for (const color of candidates) {
      const count = colorCount.get(color) || 0;
      if (count < minCount) minCount = count;
    }

    // Collect all tied colors at minimum count
    const tied = candidates.filter((c) => (colorCount.get(c) || 0) === minCount);

    // Rotate pick based on rect index to break ties with variety
    const bestColor = tied.length > 0
      ? tied[i % tied.length]
      : validColors[0] || unlockedColors[0];

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
