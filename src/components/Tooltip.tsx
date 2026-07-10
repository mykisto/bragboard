import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * Mirrors the Astryx (Pumpkin) Tooltip: inverted surface (dark-on-light / light-on-dark
 * via --gray-12 / --gray-1, same as the toast), --radius-container, a 200ms show delay,
 * and a short hover-bridge on hide so the tooltip is dismissible (Escape) and doesn't
 * flicker. It wraps its single child in a display:contents span, so it never adds a box
 * or disturbs layout - the child stays the real anchor.
 */

const SHOW_DELAY = 200;
const HIDE_BRIDGE = 100;
const GAP = 8;

interface Props {
  content: ReactNode;
  placement?: 'above' | 'below';
  /** Override the show delay (ms). */
  delay?: number;
  children: ReactNode;
}

export function Tooltip({ content, placement = 'above', delay = SHOW_DELAY, children }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const anchor = useCallback(
    () => (wrapRef.current?.firstElementChild as HTMLElement | null) ?? null,
    [],
  );

  const clearTimers = useCallback(() => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
  }, []);

  const place = useCallback(() => {
    const el = anchor();
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      x: r.left + r.width / 2,
      y: placement === 'above' ? r.top - GAP : r.bottom + GAP,
    });
  }, [anchor, placement]);

  const show = useCallback(() => {
    // Touch devices simulate hover and would eat a tap - skip there.
    if (window.matchMedia?.('(hover: none)').matches) return;
    clearTimers();
    showTimer.current = setTimeout(place, delay);
  }, [clearTimers, place, delay]);

  const hide = useCallback(() => {
    clearTimers();
    hideTimer.current = setTimeout(() => setPos(null), HIDE_BRIDGE);
  }, [clearTimers]);

  useEffect(() => {
    const el = anchor();
    if (!el) return;
    const onFocus = () => {
      // Keyboard focus only, not click/programmatic focus.
      if (el.matches(':focus-visible')) place();
    };
    const onDown = () => {
      clearTimers();
      setPos(null);
    };
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focusin', onFocus);
    el.addEventListener('focusout', hide);
    el.addEventListener('pointerdown', onDown);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDown();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('mouseenter', show);
      el.removeEventListener('mouseleave', hide);
      el.removeEventListener('focusin', onFocus);
      el.removeEventListener('focusout', hide);
      el.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      clearTimers();
    };
  }, [anchor, show, hide, place, clearTimers]);

  return (
    <>
      <span ref={wrapRef} style={{ display: 'contents' }}>
        {children}
      </span>
      {pos &&
        createPortal(
          <div
            role="tooltip"
            className={`tooltip tooltip--${placement}`}
            style={{ left: pos.x, top: pos.y }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
