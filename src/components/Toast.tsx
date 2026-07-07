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
    if (!toast) return;
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
