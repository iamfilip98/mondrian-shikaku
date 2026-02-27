import { useEffect, useCallback, useState, useRef } from 'react';

interface KeyboardControlsOptions {
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onClear: () => void;
  onSettings: () => void;
  isComplete: boolean;
}

export function useKeyboardControls({
  onUndo,
  onRedo,
  onHint,
  onClear,
  onSettings,
  isComplete,
}: KeyboardControlsOptions) {
  const [keyboardActive, setKeyboardActive] = useState(false);
  const keyboardActiveRef = useRef(false);

  // Hide keyboard cursor on pointer input
  useEffect(() => {
    const handlePointer = () => {
      if (keyboardActiveRef.current) {
        keyboardActiveRef.current = false;
        setKeyboardActive(false);
      }
    };
    window.addEventListener('pointerdown', handlePointer);
    return () => window.removeEventListener('pointerdown', handlePointer);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isMac = navigator.platform.includes('Mac');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+Z / Cmd+Z → Undo
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
        return;
      }

      // Ctrl+Y or Cmd+Shift+Z → Redo
      if ((ctrl && e.key === 'y') || (ctrl && e.shiftKey && e.key === 'z') || (ctrl && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        onRedo();
        return;
      }

      // H → Hint
      if (e.key === 'h' || e.key === 'H') {
        if (!ctrl && !e.altKey) {
          e.preventDefault();
          onHint();
          return;
        }
      }

      // R → Clear
      if (e.key === 'r' || e.key === 'R') {
        if (!ctrl && !e.altKey) {
          e.preventDefault();
          onClear();
          return;
        }
      }

      // Escape → Settings
      if (e.key === 'Escape') {
        e.preventDefault();
        onSettings();
        return;
      }

      // Arrow keys activate keyboard mode
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (!keyboardActiveRef.current) {
          keyboardActiveRef.current = true;
          setKeyboardActive(true);
        }
      }
    },
    [onUndo, onRedo, onHint, onClear, onSettings]
  );

  useEffect(() => {
    if (isComplete) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, isComplete]);

  return { keyboardActive };
}
