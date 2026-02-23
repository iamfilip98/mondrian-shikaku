import { useRef, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Puzzle } from '~/lib/puzzle/types';
import type { PlacedRect } from '~/lib/hooks/useGameState';
import type { GridRect } from '~/lib/puzzle/types';

interface GameBoardProps {
  puzzle: Puzzle;
  placed: PlacedRect[];
  startCell: { row: number; col: number } | null;
  previewRect: GridRect | null;
  isComplete: boolean;
  onCellPointerDown: (row: number, col: number, e: React.PointerEvent) => void;
  onCellPointerMove: (row: number, col: number) => void;
  onCellPointerUp: (row: number, col: number, e: React.PointerEvent) => void;
  onRectClick: (index: number) => void;
  cellSize: number;
  showDragCounter: boolean;
}

export default memo(function GameBoard({
  puzzle,
  placed,
  startCell,
  previewRect,
  isComplete,
  onCellPointerDown,
  onCellPointerMove,
  onCellPointerUp,
  onRectClick,
  cellSize,
  showDragCounter,
}: GameBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const svgWidth = cellSize * puzzle.width;
  const svgHeight = cellSize * puzzle.height;

  // Proportional stroke widths anchored to daily (cellSize=34)
  const stroke = useMemo(() => {
    const scale = cellSize / 34;
    return {
      grid: 1,
      rect: Math.max(1, scale * 5),
      outer: Math.max(2, scale * 10),
      preview: Math.max(1, scale * 2),
      clueHalo: Math.max(1, scale * 4),
    };
  }, [cellSize]);

  // Build a map of which cells are covered
  const coverageMap = useMemo(() => {
    const map = new Map<string, number>();
    placed.forEach((rect, idx) => {
      for (let r = rect.row; r < rect.row + rect.height; r++) {
        for (let c = rect.col; c < rect.col + rect.width; c++) {
          map.set(`${r}-${c}`, idx);
        }
      }
    });
    return map;
  }, [placed]);

  const getCellFromEvent = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Use visual size from bounding rect to stay accurate under zoom transforms
      const col = Math.floor((x / rect.width) * puzzle.width);
      const row = Math.floor((y / rect.height) * puzzle.height);
      if (row < 0 || row >= puzzle.height || col < 0 || col >= puzzle.width)
        return null;
      return { row, col };
    },
    [puzzle.width, puzzle.height]
  );

  return (
    <svg
      ref={svgRef}
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{
        display: 'block',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onPointerDown={(e) => {
        const cell = getCellFromEvent(e);
        if (cell) onCellPointerDown(cell.row, cell.col, e);
      }}
      onPointerMove={(e) => {
        const cell = getCellFromEvent(e);
        if (cell) onCellPointerMove(cell.row, cell.col);
      }}
      onPointerUp={(e) => {
        const cell = getCellFromEvent(e);
        if (cell) onCellPointerUp(cell.row, cell.col, e);
      }}
    >
      {/* Layer 1: Background */}
      <rect
        x={0}
        y={0}
        width={svgWidth}
        height={svgHeight}
        fill="var(--color-grid-bg)"
      />

      {/* Ambient breathing for unplaced cells — skip on large grids for performance */}
      {!isComplete &&
        puzzle.width * puzzle.height <= 225 &&
        Array.from({ length: puzzle.height }, (_, r) =>
          Array.from({ length: puzzle.width }, (_, c) => {
            if (coverageMap.has(`${r}-${c}`)) return null;
            const delay = Math.sin(r * 0.7 + c * 0.5) * 2000;
            return (
              <rect
                key={`breathe-${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="var(--color-grid-bg)"
                className="grid-breathe"
                style={{
                  animation: `grid-breathe var(--dur-ambient) ease-in-out infinite`,
                  animationDelay: `${delay}ms`,
                }}
              />
            );
          })
        )}

      {/* Layer 2: Grid lines (below placed rects so colored boxes cover them) */}
      {Array.from({ length: puzzle.height + 1 }, (_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * cellSize}
          x2={svgWidth}
          y2={i * cellSize}
          stroke="var(--color-grid-line)"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: puzzle.width + 1 }, (_, i) => (
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1={0}
          x2={i * cellSize}
          y2={svgHeight}
          stroke="var(--color-grid-line)"
          strokeWidth={1}
        />
      ))}

      {/* Layer 3: Placed rectangles */}
      {puzzle.width * puzzle.height > 225 ? (
        // Skip Framer Motion on large grids for performance
        placed.map((rect, idx) => (
          <rect
            key={`placed-${idx}-${rect.row}-${rect.col}`}
            x={rect.col * cellSize}
            y={rect.row * cellSize}
            width={rect.width * cellSize}
            height={rect.height * cellSize}
            fill={rect.color}
            stroke="var(--color-border)"
            strokeWidth={stroke.rect}
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onRectClick(idx);
            }}
          />
        ))
      ) : (
        <AnimatePresence>
          {placed.map((rect, idx) => (
            <motion.rect
              key={`placed-${idx}-${rect.row}-${rect.col}`}
              x={rect.col * cellSize}
              y={rect.row * cellSize}
              width={rect.width * cellSize}
              height={rect.height * cellSize}
              fill={rect.color}
              stroke="var(--color-border)"
              strokeWidth={stroke.rect}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                onRectClick(idx);
              }}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Layer 3: Preview rectangle */}
      {previewRect && (
        <>
          <rect
            x={previewRect.col * cellSize + stroke.preview / 2}
            y={previewRect.row * cellSize + stroke.preview / 2}
            width={previewRect.width * cellSize - stroke.preview}
            height={previewRect.height * cellSize - stroke.preview}
            fill="var(--color-preview)"
            stroke="var(--color-blue)"
            strokeWidth={stroke.preview}
            pointerEvents="none"
          />
          {showDragCounter && (
            <text
              x={previewRect.col * cellSize + (previewRect.width * cellSize) / 2}
              y={previewRect.row * cellSize + (previewRect.height * cellSize) / 2}
              textAnchor="middle"
              dominantBaseline="central"
              pointerEvents="none"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: `${Math.max(5, cellSize * 0.5)}px`,
                fill: 'var(--color-blue)',
                opacity: 0.8,
                userSelect: 'none',
              }}
            >
              {previewRect.width * previewRect.height}
            </text>
          )}
        </>
      )}

      {/* Layer 5: Outer border — strokeWidth doubled since half is clipped by viewport */}
      <rect
        x={0}
        y={0}
        width={svgWidth}
        height={svgHeight}
        fill="none"
        stroke="var(--color-grid-border)"
        strokeWidth={stroke.outer}
      />

      {/* Layer 6: Clue numbers */}
      {puzzle.clues.map((clue, i) => {
        const coveredIdx = coverageMap.get(`${clue.row}-${clue.col}`);
        const isCovered = coveredIdx !== undefined;
        const coveredColor = isCovered ? placed[coveredIdx].color : null;
        const isLightBg = coveredColor === 'var(--color-yellow)';
        const isNeutral = coveredColor === 'var(--color-neutral)';
        const clueFill = isCovered
          ? isNeutral ? 'var(--color-bg)' : (isLightBg ? 'var(--color-black)' : 'var(--color-white)')
          : 'var(--color-text)';
        return (
          <text
            key={`clue-${i}`}
            x={clue.col * cellSize + cellSize / 2}
            y={clue.row * cellSize + cellSize / 2}
            textAnchor="middle"
            dominantBaseline="central"
            stroke={isCovered ? "none" : "var(--color-grid-bg)"}
            strokeWidth={isCovered ? 0 : stroke.clueHalo}
            paintOrder="stroke"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: `${Math.max(4, cellSize * 0.42)}px`,
              fontVariantNumeric: 'tabular-nums',
              fill: clueFill,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {clue.value}
          </text>
        );
      })}

      {/* Layer 7: Start cell highlight (tap mode) */}
      {startCell && (
        <motion.rect
          x={startCell.col * cellSize + stroke.preview / 2}
          y={startCell.row * cellSize + stroke.preview / 2}
          width={cellSize - stroke.preview}
          height={cellSize - stroke.preview}
          fill="var(--color-select)"
          pointerEvents="none"
          animate={{
            opacity: [0, 0.35, 0, 0.35, 0, 0.35, 0],
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            repeatDelay: 0.3,
          }}
        />
      )}
    </svg>
  );
})
