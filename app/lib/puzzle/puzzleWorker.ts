import { generatePuzzle } from './generator';
import type { PuzzleConfig } from './types';

self.onmessage = (e: MessageEvent<PuzzleConfig>) => {
  try {
    const puzzle = generatePuzzle(e.data);
    self.postMessage({ type: 'success', puzzle });
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err) });
  }
};
