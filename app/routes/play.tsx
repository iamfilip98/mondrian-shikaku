import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { generatePuzzle } from '~/lib/puzzle/generator';
import { DIFFICULTY_CONFIGS, type Difficulty } from '~/lib/puzzle/types';
import GamePage from '~/components/game/GamePage';

export function meta() {
  return [
    { title: 'Free Play — Mondrian Shikaku' },
    {
      name: 'description',
      content:
        'Practice Shikaku puzzles at any difficulty. From Easy to Nightmare. No registration required.',
    },
    { property: 'og:title', content: 'Free Play — Mondrian Shikaku' },
  ];
}

const difficulties: Difficulty[] = [
  'easy',
  'medium',
  'hard',
  'expert',
  'nightmare',
];

const accentColors: Record<string, string> = {
  easy: 'var(--color-yellow)',
  medium: 'var(--color-blue)',
  hard: 'var(--color-red)',
  expert: 'var(--color-black)',
  nightmare: 'var(--color-red)',
};

// Asymmetric grid layout for Mondrian feel
const gridAreas: Record<string, string> = {
  easy: 'col-span-1 row-span-1',
  medium: 'col-span-1 row-span-1',
  hard: 'col-span-1 row-span-2',
  expert: 'col-span-2 row-span-1',
  nightmare: 'col-span-2 row-span-2',
};

export default function Play() {
  const [selected, setSelected] = useState<Difficulty | null>(null);
  const [puzzleSeed, setPuzzleSeed] = useState(() =>
    `free-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const puzzle = useMemo(() => {
    if (!selected) return null;
    const config = DIFFICULTY_CONFIGS[selected];
    try {
      return generatePuzzle({
        width: config.maxGrid,
        height: config.maxGrid,
        difficulty: selected,
        seed: puzzleSeed,
      });
    } catch {
      return null;
    }
  }, [selected, puzzleSeed]);

  const handleNextPuzzle = () => {
    setPuzzleSeed(`free-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  };

  if (selected && puzzle) {
    return (
      <div>
        <div className="flex items-center gap-4 px-6 py-3 border-b-2 border-[var(--color-border)]">
          <button
            onClick={() => setSelected(null)}
            className="cursor-pointer"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
            }}
          >
            ← Back
          </button>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              color: 'var(--color-text)',
            }}
          >
            {DIFFICULTY_CONFIGS[selected].name}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            {puzzle.width}×{puzzle.height}
          </span>
        </div>
        <GamePage
          puzzle={puzzle}
          difficulty={selected}
          puzzleType="Free Play"
          puzzleSeed={puzzleSeed}
          onNextPuzzle={handleNextPuzzle}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <h1
        className="mb-2"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          color: 'var(--color-text)',
        }}
      >
        Free Play
      </h1>
      <p
        className="mb-10"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-muted)',
        }}
      >
        Choose your difficulty.
      </p>

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: 'minmax(120px, auto)',
        }}
      >
        {difficulties.map((diff) => {
          const config = DIFFICULTY_CONFIGS[diff];
          return (
            <motion.button
              key={diff}
              className={`
                flex flex-col justify-between p-5
                border-2 border-[var(--color-border)]
                cursor-pointer text-left
                shadow-sharp-lg
                ${gridAreas[diff]}
              `}
              style={{
                backgroundColor: accentColors[diff],
                color:
                  diff === 'easy'
                    ? 'var(--color-black)'
                    : 'var(--color-white)',
              }}
              whileHover={{ y: -3, boxShadow: '8px 8px 0px 0px var(--color-border)' }}
              whileTap={{ y: 1, boxShadow: '2px 2px 0px 0px var(--color-border)' }}
              onClick={() => setSelected(diff)}
            >
              <div>
                <span
                  className="block"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: diff === 'nightmare' ? 'var(--text-3xl)' : 'var(--text-2xl)',
                  }}
                >
                  {config.name}
                </span>
                <span
                  className="block mt-1"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    opacity: 0.8,
                  }}
                >
                  {config.maxGrid}×{config.maxGrid}
                </span>
              </div>
              <span
                className="mt-auto"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  opacity: 0.6,
                }}
              >
                {config.estimatedTime}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
