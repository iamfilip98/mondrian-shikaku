import type { Puzzle, PuzzleConfig } from './types';
import { generatePuzzle } from './generator';

export function generatePuzzleAsync(
  config: PuzzleConfig,
  timeoutMs = 30000
): Promise<Puzzle> {
  // Fall back to synchronous on the server or if Workers unavailable
  if (typeof Worker === 'undefined') {
    return Promise.resolve(generatePuzzle(config));
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./puzzleWorker.ts', import.meta.url),
      { type: 'module' }
    );

    const timer = setTimeout(() => {
      worker.terminate();
      // Timeout: fall back to synchronous generation
      try {
        resolve(generatePuzzle(config));
      } catch {
        reject(new Error('Puzzle generation timed out and fallback failed'));
      }
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      if (e.data.type === 'success') {
        resolve(e.data.puzzle);
      } else {
        reject(new Error(e.data.message || 'Worker generation failed'));
      }
    };

    worker.onerror = (_err) => {
      clearTimeout(timer);
      worker.terminate();
      // Worker failed to load: fall back to synchronous
      try {
        resolve(generatePuzzle(config));
      } catch {
        reject(new Error('Puzzle generation failed'));
      }
    };

    worker.postMessage(config);
  });
}
