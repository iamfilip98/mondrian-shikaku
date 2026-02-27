const COLOR_TO_EMOJI: Record<string, string> = {
  'var(--color-red)': '\u{1F7E5}',    // red square
  'var(--color-blue)': '\u{1F7E6}',   // blue square
  'var(--color-yellow)': '\u{1F7E8}', // yellow square
  'var(--color-black)': '\u2B1B',     // black square
  'var(--color-neutral)': '\u2B1B',   // black square
  'var(--color-white)': '\u2B1C',     // white square
  'var(--color-wrong)': '\u2B1B',     // black square
  'var(--color-surface-2)': '\u2B1B', // black square
};

interface RectForEmoji {
  row: number;
  col: number;
  width: number;
  height: number;
  color: string;
}

/**
 * Generate an emoji grid representation of the solved puzzle.
 * For grids larger than 10, downsamples to fit.
 */
export function generateEmojiGrid(
  rects: RectForEmoji[],
  gridWidth: number,
  gridHeight: number,
): string {
  // Build full color grid
  const grid: string[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill('\u2B1B')
  );

  for (const rect of rects) {
    const emoji = COLOR_TO_EMOJI[rect.color] || '\u2B1B';
    for (let r = rect.row; r < rect.row + rect.height && r < gridHeight; r++) {
      for (let c = rect.col; c < rect.col + rect.width && c < gridWidth; c++) {
        grid[r][c] = emoji;
      }
    }
  }

  // Downsample if grid is too large (max 10x10 display)
  const maxDisplay = 10;
  if (gridWidth <= maxDisplay && gridHeight <= maxDisplay) {
    return grid.map(row => row.join('')).join('\n');
  }

  const stepR = Math.ceil(gridHeight / maxDisplay);
  const stepC = Math.ceil(gridWidth / maxDisplay);
  const rows: string[] = [];

  for (let r = 0; r < gridHeight; r += stepR) {
    let row = '';
    for (let c = 0; c < gridWidth; c += stepC) {
      row += grid[r][c];
    }
    rows.push(row);
  }

  return rows.join('\n');
}
