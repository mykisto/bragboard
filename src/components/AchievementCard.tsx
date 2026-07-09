import { memo, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { AchievementCard as CardData } from '../types';

interface Props {
  card: CardData;
  x: number;
  y: number;
  width: number;
  isDragging: boolean;
  dragDelta: { x: number; y: number } | null;
  isNew: boolean;
  /** Layout transitions stay off until the first pack is measured. */
  ready: boolean;
  onEdit: (id: string) => void;
  onHeight: (id: string, height: number) => void;
  onKeyMove: (id: string, direction: -1 | 1) => void;
}

export const AchievementCard = memo(function AchievementCard({
  card,
  x,
  y,
  width,
  isDragging,
  dragDelta,
  isNew,
  ready,
  onEdit,
  onHeight,
  onKeyMove,
}: Props) {
  const innerRef = useRef<HTMLDivElement>(null);
  const pointerDown = useRef<{ x: number; y: number } | null>(null);

  // We take `listeners` (pointer drag) but not `attributes`: dnd-kit's attributes
  // announce the card as a draggable that responds to Space/Enter, which we don't
  // wire up. We set our own a11y below - Enter/Space edits, Ctrl+Arrow reorders.
  const { setNodeRef: setDragRef, listeners } = useDraggable({ id: card.id });

  // Report rendered height so the masonry can pack around real content.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const report = () => onHeight(card.id, el.getBoundingClientRect().height);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [card.id, onHeight, width]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + arrows moves the card in the ordered list.
    if ((e.metaKey || e.ctrlKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      onKeyMove(card.id, e.key === 'ArrowUp' ? -1 : 1);
      return;
    }
    // Enter/Space opens the editor - the card's primary action.
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit(card.id);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // A real drag moves past dnd-kit's 8px threshold; anything under that is a
    // click that should open the editor, not a dropped reorder.
    const start = pointerDown.current;
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) return;
    onEdit(card.id);
  };

  const tx = x + (dragDelta?.x ?? 0);
  const ty = y + (dragDelta?.y ?? 0);

  const sizeClass = `card-text--${card.fontSize}`;
  const life = card.lifeChanging;

  return (
    <div
      ref={setDragRef}
      className={[
        'card-slot',
        ready && 'card-slot--ready',
        isDragging && 'card-slot--dragging',
        isNew && 'card-slot--new',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        width,
        transform: `translate(${tx}px, ${ty}px)`,
      }}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={card.text}
      aria-keyshortcuts="Control+ArrowUp Control+ArrowDown"
      title="Click to edit · drag to reorder"
      onPointerDownCapture={(e) => {
        pointerDown.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <article
        ref={innerRef}
        className={['card', life && 'card--life'].filter(Boolean).join(' ')}
        style={{ minHeight: width * 0.3, maxHeight: width * 1.5 }}
      >
        {card.image && card.layout === 'split' ? (
          <div className="card-split">
            <p className={`card-text ${sizeClass}`}>{card.text}</p>
            <img src={card.image} alt="" loading="lazy" decoding="async" className="card-image card-image--split" />
          </div>
        ) : (
          <>
            <p className={`card-text ${sizeClass}`}>{card.text}</p>
            {card.image && (
              <img src={card.image} alt="" loading="lazy" decoding="async" className="card-image card-image--stack" />
            )}
          </>
        )}
      </article>
    </div>
  );
});
