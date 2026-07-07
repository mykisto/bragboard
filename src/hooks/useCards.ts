import { useCallback, useEffect, useRef, useState } from 'react';
import type { AchievementCard } from '../types';
import { loadCards, saveCards } from '../storage';
import type { SaveResult } from '../storage';

export function useCards(onSaveIssue: (result: SaveResult) => void) {
  const [cards, setCards] = useState<AchievementCard[]>(() => loadCards());
  const skippedInitialSave = useRef(false);
  const lastAddedId = useRef<string | null>(null);

  useEffect(() => {
    if (!skippedInitialSave.current) {
      skippedInitialSave.current = true;
      return;
    }
    const result = saveCards(cards);
    if (result !== 'ok') onSaveIssue(result);
  }, [cards, onSaveIssue]);

  const addCard = useCallback((card: Omit<AchievementCard, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    lastAddedId.current = id;
    // New cards enter at the top: top = most important, and the newest win
    // deserves to be seen before it settles into its place.
    setCards((prev) => [{ ...card, id, createdAt: new Date().toISOString() }, ...prev]);
    return id;
  }, []);

  const updateCard = useCallback((id: string, patch: Partial<AchievementCard>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  /** Move the card with `id` so it occupies `toIndex` in the ordered list. */
  const moveCard = useCallback((id: string, toIndex: number) => {
    setCards((prev) => {
      const from = prev.findIndex((c) => c.id === id);
      if (from === -1 || from === toIndex) return prev;
      const next = [...prev];
      const [card] = next.splice(from, 1);
      next.splice(Math.max(0, Math.min(toIndex, next.length)), 0, card);
      return next;
    });
  }, []);

  const replaceAll = useCallback((next: AchievementCard[]) => {
    setCards(next);
  }, []);

  return { cards, addCard, updateCard, deleteCard, moveCard, replaceAll, lastAddedId };
}
