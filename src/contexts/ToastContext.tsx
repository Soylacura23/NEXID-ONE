import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const iconFor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-[var(--semantic-success)] shrink-0" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-[var(--semantic-error)] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-[var(--semantic-warning)] shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-[var(--semantic-info)] shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 shadow-lg"
            >
              <div className="mt-0.5">{iconFor(item.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs text-[var(--text-muted)] leading-relaxed">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Cerrar notificación"
                className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
