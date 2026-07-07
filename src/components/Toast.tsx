import { useEffect } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'info' | 'error';
}

interface Props {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: Props) {
  useEffect(() => {
    // Errors are usually actionable (storage full - export first), so they stay
    // until dismissed. Info toasts auto-clear.
    if (!toast || toast.tone === 'error') return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className={`toast toast--${toast.tone}`}>
          {toast.text}
          <button type="button" className="toast__dismiss" onClick={onDismiss} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
