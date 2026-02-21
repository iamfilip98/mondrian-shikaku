import { motion, AnimatePresence } from 'framer-motion';

interface ColourUnlockProps {
  color: string;
  isVisible: boolean;
  onComplete: () => void;
}

export default function ColourUnlock({
  color,
  isVisible,
  onComplete,
}: ColourUnlockProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: color,
              border: '4px solid var(--color-border)',
            }}
            initial={{ scale: 0 }}
            animate={{
              scale: [0, 1.2, 1, 1.1, 1],
            }}
            transition={{
              duration: 1.2,
              ease: [0.23, 1, 0.32, 1],
            }}
            onAnimationComplete={onComplete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
