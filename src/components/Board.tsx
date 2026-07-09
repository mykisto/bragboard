import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragMoveEvent } from '@dnd-kit/core';
import type { AchievementCard as CardData } from '../types';
import { AchievementCard } from './AchievementCard';

interface Props {
  cards: CardData[];
  lastAddedId: string | null;
  /** Id of the card currently open in the composer, or null. */
  editingId: string | null;
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

export function Board({ cards, lastAddedId, editingId, onEdit, onMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [heights, setHeights] = useState<ReadonlyMap<string, number>>(new Map());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ overId: string; after: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

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

  // We do NOT reorder the list mid-drag. Reordering live re-packs every column,
  // which shifts the dragged card's own home position while its delta keeps
  // growing from the original grab point - so it drifts off the cursor and the
  // whole board jumps. Instead the layout stays frozen: only the lifted card
  // follows the cursor, a recessed slot marks where it came from, and a line
  // marks where it will land. The single real move happens on drop.

  // Drop target is derived from the cursor position, not dnd-kit's collision:
  // closestCenter matches by the dragged card's rect center, which drifts far
  // from the pointer on tall cards and lands the indicator in the wrong column.
  // We resolve the column under the cursor, then the gap within that column.
  const targetForPointer = (px: number, py: number) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const lx = px - rect.left;
    const ly = py - rect.top;
    const cols = columnsFor(containerWidth);
    const step = colWidth + GAP;
    const col = Math.max(0, Math.min(cols - 1, Math.floor((lx + GAP / 2) / step)));
    const colOf = (id: string) => Math.round((positions.get(id)?.x ?? 0) / step);
    // Cards in this column, already in list order = top-to-bottom.
    const inCol = cards.filter((c) => c.id !== dragId && colOf(c.id) === col);
    for (const c of inCol) {
      const p = positions.get(c.id);
      if (!p) continue;
      const h = heights.get(c.id) ?? colWidth * 0.3;
      if (ly < p.y + h / 2) return { overId: c.id, after: false };
    }
    if (inCol.length) return { overId: inCol[inCol.length - 1].id, after: true };
    // Empty column under the cursor: fall back to the nearest card overall.
    let best: string | null = null;
    let bestDist = Infinity;
    let bestAfter = false;
    for (const c of cards) {
      if (c.id === dragId) continue;
      const p = positions.get(c.id);
      if (!p) continue;
      const h = heights.get(c.id) ?? colWidth * 0.3;
      const cx = p.x + colWidth / 2;
      const cy = p.y + h / 2;
      const d = (cx - lx) ** 2 + (cy - ly) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = c.id;
        bestAfter = ly > cy;
      }
    }
    return best ? { overId: best, after: bestAfter } : null;
  };

  const handleDragMove = (event: DragMoveEvent) => {
    setDragDelta({ x: event.delta.x, y: event.delta.y });
    const s = pointerStart.current;
    if (!s) return;
    const t = targetForPointer(s.x + event.delta.x, s.y + event.delta.y);
    setDropTarget(t && t.overId !== dragId ? t : null);
  };

  const handleDragEnd = () => {
    if (dragId && dropTarget && dropTarget.overId !== dragId) {
      // Target index is measured in the list with the dragged card removed -
      // exactly the array moveCard splices into after it pulls the card out.
      const withoutActive = cards.filter((c) => c.id !== dragId);
      const overIndex = withoutActive.findIndex((c) => c.id === dropTarget.overId);
      if (overIndex !== -1) onMove(dragId, overIndex + (dropTarget.after ? 1 : 0));
    }
    endDrag();
  };

  const endDrag = () => {
    setDragId(null);
    setDragDelta(null);
    setDropTarget(null);
  };

  const handleKeyMove = useCallback(
    (id: string, direction: -1 | 1) => {
      const index = cards.findIndex((c) => c.id === id);
      if (index === -1) return;
      onMove(id, index + direction);
    },
    [cards, onMove],
  );

  const dragPos = dragId ? positions.get(dragId) : null;
  const dragHeight = dragId ? heights.get(dragId) ?? colWidth * 0.3 : 0;

  // Insertion line: a terracotta bar in the gap above (or below) the hovered
  // card's frozen slot. GAP/2 centers it in the space between the two cards.
  let dropLine: { x: number; y: number; width: number } | null = null;
  if (dropTarget && dropTarget.overId !== dragId) {
    const pos = positions.get(dropTarget.overId);
    if (pos) {
      const h = heights.get(dropTarget.overId) ?? colWidth * 0.3;
      dropLine = {
        x: pos.x,
        y: dropTarget.after ? pos.y + h + GAP / 2 : pos.y - GAP / 2,
        width: colWidth,
      };
    }
  }

  return (
    <div ref={containerRef} className="board-container">
      <DndContext
        sensors={sensors}
        onDragStart={(e) => {
          setDragId(String(e.active.id));
          const ae = e.activatorEvent as PointerEvent & { touches?: TouchList };
          const t = ae.touches?.[0];
          pointerStart.current = {
            x: t ? t.clientX : ae.clientX,
            y: t ? t.clientY : ae.clientY,
          };
        }}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={endDrag}
      >
        <div className="board" style={{ height: boardHeight > 0 ? boardHeight : undefined }}>
          {dragId && dragPos && (
            <div
              className="card-placeholder"
              style={{
                transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
                width: colWidth,
                height: dragHeight,
              }}
            />
          )}
          {dropLine && (
            <div
              className="card-drop-line"
              style={{
                transform: `translate(${dropLine.x}px, ${dropLine.y}px)`,
                width: dropLine.width,
              }}
            />
          )}
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
              isEditing={editingId === card.id}
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
