import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BLOCKS = [
  { x: '5%', y: '10%', w: '35%', h: '40%', color: 'var(--color-red)' },
  { x: '45%', y: '5%', w: '50%', h: '25%', color: 'var(--color-blue)' },
  { x: '60%', y: '35%', w: '35%', h: '55%', color: 'var(--color-yellow)' },
  { x: '10%', y: '55%', w: '45%', h: '35%', color: 'var(--color-blue)' },
  { x: '0%', y: '0%', w: '20%', h: '20%', color: 'var(--color-yellow)' },
  { x: '75%', y: '0%', w: '25%', h: '15%', color: 'var(--color-red)' },
];

function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch { return false; }
}

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(() => !prefersReducedMotion());

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShow(false);
      onComplete();
      return;
    }

    // Check if already played this session
    try {
      if (sessionStorage.getItem('introPlayed')) {
        setShow(false);
        onComplete();
        return;
      }
    } catch {}

    const timer = setTimeout(() => {
      setShow(false);
      try { sessionStorage.setItem('introPlayed', '1'); } catch {}
      onComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 z-20 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {BLOCKS.map((block, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: block.x,
                top: block.y,
                width: block.w,
                height: block.h,
                backgroundColor: block.color,
                border: '3px solid var(--color-border)',
              }}
              initial={{ scale: 1, opacity: 0.9 }}
              animate={{ scale: 0, opacity: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3 + i * 0.1,
                ease: [0.23, 1, 0.32, 1],
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
