import type { AchievementCard, BoardExport, Draft } from './types';

const CARDS_KEY = 'bragboard:cards';
const THEME_KEY = 'bragboard:theme';
const DRAFT_KEY = 'bragboard:draft';

/** Rough character budget before we start warning about the ~5MB localStorage cap. */
const STORAGE_WARN_CHARS = 4_200_000;

export type SaveResult = 'ok' | 'near-limit' | 'quota-exceeded';

const FONT_SIZES = new Set(['s', 'm', 'l', 'xl']);
const LAYOUTS = new Set(['stack', 'split']);

function isCard(value: unknown): value is AchievementCard {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.text === 'string' &&
    (c.image === undefined || typeof c.image === 'string') &&
    LAYOUTS.has(c.layout as string) &&
    FONT_SIZES.has(c.fontSize as string) &&
    typeof c.lifeChanging === 'boolean'
  );
}

export function loadCards(): AchievementCard[] {
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCard);
  } catch {
    return [];
  }
}

export function saveCards(cards: AchievementCard[]): SaveResult {
  const json = JSON.stringify(cards);
  try {
    localStorage.setItem(CARDS_KEY, json);
  } catch {
    return 'quota-exceeded';
  }
  return json.length > STORAGE_WARN_CHARS ? 'near-limit' : 'ok';
}

export type Theme = 'light' | 'dark';

export function loadTheme(): Theme {
  // Light is the default startup theme by design; dark is a user-triggered alternate.
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* theme preference is not worth surfacing an error for */
  }
}

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d: unknown = JSON.parse(raw);
    if (typeof d !== 'object' || d === null) return null;
    const draft = d as Draft;
    if (typeof draft.text !== 'string') return null;
    return draft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft | null): void {
  try {
    if (draft === null || (draft.text === '' && !draft.image && !draft.editingId)) {
      localStorage.removeItem(DRAFT_KEY);
    } else {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  } catch {
    /* a lost draft on quota pressure is acceptable; the cards themselves warn loudly */
  }
}

export function exportBoard(cards: AchievementCard[]): void {
  const payload: BoardExport = {
    app: 'bragboard',
    version: 1,
    exportedAt: new Date().toISOString(),
    cards,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bragboard-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export type ImportResult =
  | { ok: true; cards: AchievementCard[] }
  | { ok: false; error: string };

export function parseImport(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  // Accept both a full export payload and a bare array of cards.
  const list = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as BoardExport).cards)
      ? (parsed as BoardExport).cards
      : null;
  if (!list) return { ok: false, error: 'That file does not look like a Bragboard export.' };
  const cards = list.filter(isCard);
  if (cards.length === 0) return { ok: false, error: 'No valid cards found in that file.' };
  return { ok: true, cards };
}
