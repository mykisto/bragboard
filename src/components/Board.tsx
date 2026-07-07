import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core';
import type { DragMoveEvent, DragOverEvent } from '@dnd-kit/core';
import type { AchievementCard as CardData } from '../types';
import { AchievementCard } from './AchievementCard';

interface Props {
  cards: CardData[];
  lastAddedId: string | null;
  onEdit: (id: string) => void;
  onMove: (id: string, toIndex: number) => void;
}

const GAP = 20;

function columnsFor(width: number): number {
  if (width >= 1460) return 5;
  if (width >= 1120) return 4;
  if (width >= 800) return 3;
  if (width >= 520) return 2;
  return 1;
}

export function Board({ cards, lastAddedId, onEdit, onMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [heights, setHeights] = useState<ReadonlyMap<string, number>>(new Map());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onHeight = useCallback((id: string, height: number) => {
    setHeights((prev) => {
      if (Math.abs((prev.get(id) ?? 0) - height) < 0.5) return prev;
      const next = new Map(prev);
      next.set(id, height);
      return next;
    });
  }, []);

  // Shortest-column packing: order = importance reads left-to-right, top-to-bottom.
  const { positions, colWidth, boardHeight } = useMemo(() => {
    const cols = columnsFor(containerWidth);
    const colWidth = cols === 1 ? containerWidth : (containerWidth - GAP * (cols - 1)) / cols;
    const colHeights = new Array<number>(cols).fill(0);
    const positions = new Map<string, { x: number; y: number }>();
    for (const card of cards) {
      const h = heights.get(card.id) ?? colWidth * 0.3;
      let target = 0;
      for (let i = 1; i < cols; i++) {
        if (colHeights[i] < colHeights[target] - 0.5) target = i;
      }
      positions.set(card.id, { x: target * (colWidth + GAP), y: colHeights[target] });
      colHeights[target] += h + GAP;
    }
    return { positions, colWidth, boardHeight: Math.max(0, ...colHeights) - GAP };
  }, [cards, heights, containerWidth]);

  // Enable layout transitions only after the first real pack, so cards don't
  // fly in from (0, 0) on load.
  useEffect(() => {
    if (ready || containerWidth === 0 || cards.length === 0) return;
    const measured = cards.every((c) => heights.has(c.id));
    if (!measured) return;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(raf);
  }, [ready, containerWidth, cards, heights]);

  const sensors = useSensors(
    // Movement threshold keeps clicks and taps from starting accidental drags.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // Long-press lifts the card on touch, leaving taps free to reveal the edit button.
    useSensor(TouchSensor, { activationConstraint: { delay: 280, tolerance: 8 } }),
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const overIndex = cards.findIndex((c) => c.id === over.id);
    if (overIndex !== -1) onMove(String(active.id), overIndex);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    setDragDelta({ x: event.delta.x, y: event.delta.y });
  };

  const endDrag = () => {
    setDragId(null);
    setDragDelta(null);
  };

  const handleKeyMove = useCallback(
    (id: string, direction: -1 | 1) => {
      const index = cards.findIndex((c) => c.id === id);
      if (index === -1) return;
      onMove(id, index + direction);
    },
    [cards, onMove],
  );

  return (
    <div ref={containerRef} className="board-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={(e) => setDragId(String(e.active.id))}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={endDrag}
        onDragCancel={endDrag}
      >
        <div className="board" style={{ height: boardHeight > 0 ? boardHeight : undefined }}>
          {cards.map((card) => (
            <AchievementCard
              key={card.id}
              card={card}
              x={positions.get(card.id)?.x ?? 0}
              y={positions.get(card.id)?.y ?? 0}
              width={colWidth}
              isDragging={dragId === card.id}
              dragDelta={dragId === card.id ? dragDelta : null}
              isNew={ready && lastAddedId === card.id}
              ready={ready}
              onEdit={onEdit}
              onHeight={onHeight}
              onKeyMove={handleKeyMove}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
