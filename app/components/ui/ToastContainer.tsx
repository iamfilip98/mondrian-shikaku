import { AnimatePresence, motion } from 'framer-motion';
import { useToast, type ToastType } from '~/lib/hooks/useToast';

const accentColor: Record<ToastType, string> = {
  success: 'var(--color-blue)',
  error: 'var(--color-red)',
  info: 'var(--color-yellow)',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Escape') removeToast(toast.id);
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              padding: '10px 16px',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-surface)',
              border: '2px solid var(--color-border)',
              borderLeftWidth: '5px',
              borderLeftColor: accentColor[toast.type],
              boxShadow: '4px 4px 0px 0px var(--color-border)',
              minWidth: '200px',
              maxWidth: '360px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span className="sr-only">
              {toast.type === 'error' ? 'Error: ' : toast.type === 'success' ? 'Success: ' : 'Info: '}
            </span>
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                padding: '0 2px',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
