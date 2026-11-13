import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {destructive && (
                  <div className="rounded-xl bg-[var(--semantic-error)]/15 p-2 text-[var(--semantic-error)] shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 id="confirm-modal-title" className="font-display text-lg font-semibold text-[var(--text-primary)]">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                aria-label={cancelLabel}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-surface-alt)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] transition-colors whitespace-nowrap shrink-0"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 ${
                  destructive
                    ? 'bg-[var(--semantic-error)] text-white hover:opacity-90'
                    : 'bg-[var(--accent-gold)] text-[var(--accent-ink)] hover:bg-[var(--accent-gold-soft)]'
                }`}
              >
                {loading ? '...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
