import { useCallback } from 'react';
import type { Puzzle } from '~/lib/puzzle/types';
import type { PlacedRect } from '~/lib/hooks/useGameState';

interface ShareOptions {
  puzzle: Puzzle;
  placed: PlacedRect[];
  cellSize: number;
  puzzleType: string;
  difficulty: string;
  solveTime: string;
  date: string;
}

export function useShareImage() {
  const generateShareImage = useCallback(
    async ({
      puzzle,
      placed,
      cellSize,
      puzzleType,
      difficulty,
      solveTime,
      date,
    }: ShareOptions): Promise<Blob | null> => {
      const svgWidth = cellSize * puzzle.width;
      const svgHeight = cellSize * puzzle.height;
      const stripHeight = 48;
      const totalHeight = svgHeight + stripHeight;
      const totalWidth = svgWidth;

      const canvas = document.createElement('canvas');
      canvas.width = totalWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Background
      ctx.fillStyle = '#F5F5F0';
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Draw placed rectangles
      for (const rect of placed) {
        ctx.fillStyle = rect.color.startsWith('var(')
          ? getComputedStyle(document.documentElement).getPropertyValue(
              rect.color.slice(4, -1)
            ) || '#D40920'
          : rect.color;
        ctx.fillRect(
          rect.col * cellSize + 1,
          rect.row * cellSize + 1,
          rect.width * cellSize - 2,
          rect.height * cellSize - 2
        );
      }

      // Grid lines
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= puzzle.height; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(svgWidth, i * cellSize);
        ctx.stroke();
      }
      for (let i = 0; i <= puzzle.width; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, svgHeight);
        ctx.stroke();
      }

      // Outer border
      ctx.strokeStyle = '#0A0A0A';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, svgWidth, svgHeight);

      // Clue numbers
      ctx.fillStyle = '#0A0A0A';
      ctx.font = `700 ${Math.min(cellSize * 0.42, 22)}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const clue of puzzle.clues) {
        ctx.fillText(
          String(clue.value),
          clue.col * cellSize + cellSize / 2,
          clue.row * cellSize + cellSize / 2
        );
      }

      // Bottom strip
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, svgHeight, totalWidth, stripHeight);
      ctx.fillStyle = '#F5F5F0';
      ctx.font = '500 13px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `MONDRIAN SHIKAKU · ${puzzleType} · ${date} · ${solveTime}`,
        totalWidth / 2,
        svgHeight + stripHeight / 2
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    },
    []
  );

  const share = useCallback(
    async (options: ShareOptions) => {
      const blob = await generateShareImage(options);
      if (!blob) return;

      const file = new File([blob], 'mondrian-shikaku.png', { type: 'image/png' });
      const text = `MONDRIAN SHIKAKU · ${options.puzzleType} · ${options.date} · ${options.solveTime}`;

      try {
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            text,
            files: [file],
          });
        } else {
          await navigator.clipboard.writeText(text);
        }
      } catch {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(text);
        } catch {}
      }
    },
    [generateShareImage]
  );

  return { generateShareImage, share };
}
