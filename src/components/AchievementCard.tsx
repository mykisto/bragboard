import { memo, useCallback, useEffect, useRef } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { PencilSimple } from '@phosphor-icons/react';
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

  const { setNodeRef: setDragRef, attributes, listeners } = useDraggable({ id: card.id });
  const { setNodeRef: setDropRef } = useDroppable({ id: card.id });

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node);
      setDropRef(node);
    },
    [setDragRef, setDropRef],
  );

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
    // Keyboard reorder: Cmd/Ctrl + arrows moves the card in the ordered list.
    if ((e.metaKey || e.ctrlKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      onKeyMove(card.id, e.key === 'ArrowUp' ? -1 : 1);
    }
  };

  const tx = x + (dragDelta?.x ?? 0);
  const ty = y + (dragDelta?.y ?? 0);

  const sizeClass = `card-text--${card.fontSize}`;
  const life = card.lifeChanging;

  return (
    <div
      ref={setRefs}
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
      {...attributes}
      {...listeners}
      onKeyDown={handleKeyDown}
      aria-roledescription="draggable card"
      aria-describedby={undefined}
    >
      <article
        ref={innerRef}
        className={['card', life && 'card--life'].filter(Boolean).join(' ')}
        style={{ minHeight: width * 0.3, maxHeight: width * 1.5 }}
      >
        {card.image && card.layout === 'split' ? (
          <div className="card-split">
            <p className={`card-text ${sizeClass}`}>{card.text}</p>
            <img src={card.image} alt="" loading="lazy" className="card-image card-image--split" />
          </div>
        ) : (
          <>
            <p className={`card-text ${sizeClass}`}>{card.text}</p>
            {card.image && (
              <img src={card.image} alt="" loading="lazy" className="card-image card-image--stack" />
            )}
          </>
        )}
        <button
          type="button"
          className="card-edit"
          aria-label="Edit this card"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(card.id);
          }}
          // Draggable listeners live on the wrapper; keep the button out of drag starts.
          onPointerDown={(e) => e.stopPropagation()}
        >
          <PencilSimple size={16} weight="regular" aria-hidden />
        </button>
      </article>
    </div>
  );
});
