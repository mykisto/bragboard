import { useCallback, useRef, useState } from 'react';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { Composer } from './components/Composer';
import { EmptyState } from './components/EmptyState';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { useCards } from './hooks/useCards';
import { useTheme } from './hooks/useTheme';
import { exportBoard, parseImport, loadDraft, saveDraft } from './storage';
import type { SaveResult } from './storage';
import { EMPTY_DRAFT } from './types';
import type { Draft } from './types';
import './app.css';

let toastId = 0;

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [draft, setDraftState] = useState<Draft>(() => loadDraft() ?? EMPTY_DRAFT);
  const [composerOpen, setComposerOpen] = useState(false);
  // Polite screen-reader announcement for silent board mutations (add/delete).
  const [srMessage, setSrMessage] = useState('');

  const showToast = useCallback((text: string, tone: 'info' | 'error' = 'info') => {
    setToast({ id: ++toastId, text, tone });
  }, []);

  const onSaveIssue = useCallback(
    (result: SaveResult) => {
      if (result === 'quota-exceeded') {
        showToast('Storage is full - this change was not saved. Export your board, then remove an image or two.', 'error');
      } else {
        showToast('Storage is getting full. A JSON export now would be a good backup.');
      }
    },
    [showToast],
  );

  const { cards, addCard, updateCard, deleteCard, moveCard, replaceAll, lastAddedId } =
    useCards(onSaveIssue);

  const setDraft = useCallback(
    (next: Draft) => {
      setDraftState(next);
      if (next.editingId) {
        // Editing writes straight to the card so the board updates live.
        updateCard(next.editingId, {
          text: next.text,
          image: next.image,
          layout: next.layout,
          fontSize: next.fontSize,
          lifeChanging: next.lifeChanging,
        });
      } else {
        // Only a new-card draft is worth persisting - an edit already lives on the card.
        saveDraft(next);
      }
    },
    [updateCard],
  );

  const openComposerForNew = useCallback(() => {
    setComposerOpen(true);
  }, []);

  const openComposerForEdit = useCallback(
    (id: string) => {
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      // Load the card into the composer without persisting it as a draft; any
      // in-progress new-card draft stays safe in localStorage and returns on close.
      setDraftState({
        text: card.text,
        image: card.image,
        layout: card.layout,
        fontSize: card.fontSize,
        lifeChanging: card.lifeChanging,
        editingId: id,
      });
      setComposerOpen(true);
    },
    [cards],
  );

  // New cards commit on Add; edits are already saved live, so this only handles new.
  const handleAdd = useCallback(() => {
    const text = draft.text.trim();
    if (!text) return;
    addCard({
      text,
      image: draft.image,
      layout: draft.layout,
      fontSize: draft.fontSize,
      lifeChanging: draft.lifeChanging,
    });
    setDraftState(EMPTY_DRAFT);
    saveDraft(null);
    setComposerOpen(false);
    setSrMessage('Card added to the top of your board.');
  }, [draft, addCard]);

  const handleComposerOpenChange = useCallback((open: boolean) => {
    setComposerOpen(open);
  }, []);

  // Runs once the composer has finished animating shut. Restoring the new-card
  // draft here (not at close-request time) keeps the edit state on screen for the
  // whole exit, instead of flashing the empty "Add" composer for a frame.
  const handleComposerClosed = useCallback(() => {
    if (draft.editingId) {
      // A live edit left empty has no card to keep; otherwise it's already saved.
      if (!draft.text.trim()) deleteCard(draft.editingId);
      setDraftState(loadDraft() ?? EMPTY_DRAFT);
    }
  }, [draft, deleteCard]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteCard(id);
      // The draft restore runs in handleComposerClosed, after the exit animation.
      setComposerOpen(false);
      setSrMessage('Card deleted.');
    },
    [deleteCard],
  );

  const handleImportFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = parseImport(String(reader.result));
        if (result.ok) {
          // Import replaces the whole board; guard the existing cards from a
          // silent overwrite.
          if (
            cards.length > 0 &&
            !window.confirm(
              `Importing replaces all ${cards.length} card${cards.length === 1 ? '' : 's'} on your board. Export first if you want a backup. Continue?`,
            )
          ) {
            return;
          }
          replaceAll(result.cards);
          showToast(`Imported ${result.cards.length} card${result.cards.length === 1 ? '' : 's'}.`);
        } else {
          showToast(result.error, 'error');
        }
      };
      reader.onerror = () => showToast('Could not read that file.', 'error');
      reader.readAsText(file);
    },
    [cards, replaceAll, showToast],
  );

  const dismissToast = useCallback(() => setToast(null), []);
  const composerRootRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onExport={() => exportBoard(cards)}
        onImportFile={handleImportFile}
      />

      <main className="main" ref={composerRootRef}>
        {cards.length === 0 ? (
          <EmptyState onStart={openComposerForNew} />
        ) : (
          <Board
            cards={cards}
            lastAddedId={lastAddedId.current}
            editingId={composerOpen ? draft.editingId ?? null : null}
            onEdit={openComposerForEdit}
            onMove={moveCard}
          />
        )}
      </main>

      <Composer
        draft={draft}
        onDraftChange={setDraft}
        expanded={composerOpen}
        onExpandedChange={handleComposerOpenChange}
        onClosed={handleComposerClosed}
        onSave={handleAdd}
        onDelete={handleDelete}
        onImageError={(msg) => showToast(msg, 'error')}
      />

      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="visually-hidden" role="status" aria-live="polite">
        {srMessage}
      </div>
    </>
  );
}
