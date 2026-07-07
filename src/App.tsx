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

  const setDraft = useCallback((next: Draft) => {
    setDraftState(next);
    saveDraft(next);
  }, []);

  const openComposerForNew = useCallback(() => {
    setComposerOpen(true);
  }, []);

  const openComposerForEdit = useCallback(
    (id: string) => {
      const card = cards.find((c) => c.id === id);
      if (!card) return;
      // Editing reuses the composer, pre-filled. An unsaved new-card draft is
      // not thrown away silently - it stays in localStorage under the same key
      // only if the user had one; warn instead of clobbering.
      if (draft.text.trim() && !draft.editingId && draft.text !== card.text) {
        showToast('Your unsaved draft was kept - finish the edit, then reopen the composer.');
      }
      setDraft({
        text: card.text,
        image: card.image,
        layout: card.layout,
        fontSize: card.fontSize,
        lifeChanging: card.lifeChanging,
        editingId: id,
      });
      setComposerOpen(true);
    },
    [cards, draft, setDraft, showToast],
  );

  const handleSave = useCallback(() => {
    const text = draft.text.trim();
    if (!text) return;
    const payload = {
      text,
      image: draft.image,
      layout: draft.layout,
      fontSize: draft.fontSize,
      lifeChanging: draft.lifeChanging,
    };
    if (draft.editingId) {
      updateCard(draft.editingId, payload);
    } else {
      addCard(payload);
    }
    setDraft(EMPTY_DRAFT);
    setComposerOpen(false);
  }, [draft, addCard, updateCard, setDraft]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteCard(id);
      setDraft(EMPTY_DRAFT);
      setComposerOpen(false);
    },
    [deleteCard, setDraft],
  );

  const handleImportFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = parseImport(String(reader.result));
        if (result.ok) {
          replaceAll(result.cards);
          showToast(`Imported ${result.cards.length} card${result.cards.length === 1 ? '' : 's'}.`);
        } else {
          showToast(result.error, 'error');
        }
      };
      reader.onerror = () => showToast('Could not read that file.', 'error');
      reader.readAsText(file);
    },
    [replaceAll, showToast],
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
            onEdit={openComposerForEdit}
            onMove={moveCard}
          />
        )}
      </main>

      <Composer
        draft={draft}
        onDraftChange={setDraft}
        expanded={composerOpen}
        onExpandedChange={setComposerOpen}
        onSave={handleSave}
        onDelete={handleDelete}
        onImageError={(msg) => showToast(msg, 'error')}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
