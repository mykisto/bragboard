import { useEffect, useRef, useState } from 'react';
import {
  CaretDown,
  ImageSquare,
  Rows,
  Columns,
  Sparkle,
  TrashSimple,
  X,
} from '@phosphor-icons/react';
import type { Draft, FontSize, CardLayout } from '../types';
import { prepareImage } from '../utils/image';
import { Menu, MenuItem } from './Menu';
import { Tooltip } from './Tooltip';

interface Props {
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Fires after the collapse animation ends, once the composer is fully gone. */
  onClosed: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onImageError: (message: string) => void;
}

const FONT_SIZE_OPTIONS: Array<{ value: FontSize; label: string }> = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
];

export function Composer({
  draft,
  onDraftChange,
  expanded,
  onExpandedChange,
  onClosed,
  onSave,
  onDelete,
  onImageError,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const sizeTriggerRef = useRef<HTMLButtonElement>(null);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  // Live flag so the document Escape handler (stale closure) can tell whether the
  // size menu owns this Escape - if it does, the composer must not also collapse.
  const sizeMenuOpenRef = useRef(false);
  sizeMenuOpenRef.current = sizeMenuOpen;
  // Set when a close is keyboard-initiated (Escape / Cmd+Enter) so focus isn't
  // dropped on <body>. 'pill' returns to the composer pill (new-card compose);
  // a card id returns to the card that was being edited. Null = mouse close, leave
  // focus alone. Keep a live editingId ref so the document-level Escape handler
  // (whose closure is stale) reads the current card.
  const refocusTarget = useRef<'pill' | string | null>(null);
  const editingIdRef = useRef(draft.editingId);
  editingIdRef.current = draft.editingId;
  // Track prior open + edited-card so the textarea can tell a card *switch* (which
  // should tween its height) from a fresh open or plain typing (which shouldn't).
  const prevExpandedRef = useRef(false);
  const prevEditingIdRef = useRef<string | undefined>(undefined);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // The pill and the expanded composer are different elements, so to animate the
  // collapse we keep the composer mounted through its exit animation and only
  // drop it back to the pill once composer-out finishes.
  const [mounted, setMounted] = useState(expanded);
  const [closing, setClosing] = useState(false);

  const editing = Boolean(draft.editingId);
  const hasDraft = draft.text.trim() !== '' || Boolean(draft.image);
  const sizeLabel = FONT_SIZE_OPTIONS.find((o) => o.value === draft.fontSize)?.label ?? 'Medium';

  // Click outside collapses; the draft is preserved by design - no Cancel button.
  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (rootRef.current && !rootRef.current.contains(target)) {
        // Clicking another card swaps the composer's content in place (its onEdit
        // reloads the draft); don't collapse, or it would close and reopen.
        if (target.closest?.('.card-slot')) return;
        onExpandedChange(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // The size menu owns Escape while it's open - let it close first, keep the
        // composer open.
        if (sizeMenuOpenRef.current) return;
        refocusTarget.current = editingIdRef.current ?? 'pill';
        onExpandedChange(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded, onExpandedChange]);

  useEffect(() => {
    if (expanded) {
      textareaRef.current?.focus();
    } else {
      setConfirmingDelete(false);
    }
  }, [expanded]);

  // Drive the mount / exit-animation lifecycle off the expanded prop: expanding
  // mounts immediately; collapsing flips into the closing state so composer-out
  // can play before unmount.
  useEffect(() => {
    if (expanded) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
    }
  }, [expanded, mounted]);

  // Once the composer has fully collapsed back to the pill, restore focus if the
  // close came from the keyboard: to the edited card if it still exists, else the
  // pill (new card, or the card was deleted on close).
  useEffect(() => {
    if (mounted) return;
    const target = refocusTarget.current;
    if (!target) return;
    refocusTarget.current = null;
    if (target !== 'pill') {
      const card = document.querySelector<HTMLElement>(`[data-card-id="${CSS.escape(target)}"]`);
      if (card) {
        card.focus();
        return;
      }
    }
    pillRef.current?.focus();
  }, [mounted]);

  // Auto-grow the textarea to fit its content, bounded by CSS max-height. `mounted`
  // is in the deps because the textarea only exists once mounted flips true (a
  // render after `expanded`), so without it the first sizing pass runs while the
  // ref is still null and a long card would open stuck at its 2-row minimum.
  // Switching between cards (composer already open, editingId changed) tweens the
  // height from old to new; a fresh open or plain typing resizes instantly.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const wasOpen = prevExpandedRef.current;
    const prevEditingId = prevEditingIdRef.current;
    prevExpandedRef.current = expanded;
    prevEditingIdRef.current = draft.editingId;

    const switching = wasOpen && expanded && prevEditingId !== draft.editingId;
    if (switching) {
      const from = el.offsetHeight;
      el.style.height = 'auto';
      const to = el.scrollHeight;
      el.style.transition = 'none';
      el.style.height = `${from}px`;
      void el.offsetHeight; // commit the start height before transitioning
      el.style.transition = 'height var(--dur-base) var(--ease-out)';
      el.style.height = `${to}px`;
    } else {
      el.style.transition = 'none';
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [draft.text, draft.editingId, expanded, mounted]);

  const set = (patch: Partial<Draft>) => onDraftChange({ ...draft, ...patch });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const result = await prepareImage(file);
    if (result.ok) {
      set({ image: result.dataUrl });
    } else {
      onImageError(result.error);
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      // Editing is already live; Cmd+Enter just closes. New cards commit on Add.
      if (editing) {
        refocusTarget.current = draft.editingId ?? 'pill';
        onExpandedChange(false);
      } else if (draft.text.trim()) {
        refocusTarget.current = 'pill';
        onSave();
      }
    }
  };

  if (!mounted) {
    return (
      <div className="composer-dock" ref={rootRef}>
        <button
          ref={pillRef}
          type="button"
          className="composer-pill"
          onClick={() => onExpandedChange(true)}
          aria-label={hasDraft ? 'Continue your draft' : 'Add a new card'}
        >
          {hasDraft ? (
            <>
              <span className="composer-pill__draft-dot" aria-hidden />
              <span className="composer-pill__text composer-pill__text--draft">
                {editing ? 'Keep editing: ' : 'Draft: '}
                {draft.text.trim() || 'with an image'}
              </span>
            </>
          ) : (
            <span className="composer-pill__text">Something you're proud of…</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="composer-dock" ref={rootRef}>
      <div
        className={`composer${closing ? ' composer--closing' : ''}`}
        role="dialog"
        aria-label={editing ? 'Edit card' : 'New card'}
        onAnimationEnd={(e) => {
          if (e.animationName === 'composer-out') {
            setMounted(false);
            setClosing(false);
            onClosed();
          }
        }}
      >
        <textarea
          ref={textareaRef}
          className="composer__text"
          value={draft.text}
          onChange={(e) => set({ text: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Something you're proud of…"
          rows={2}
          aria-label="Achievement text"
        />

        {draft.image && (
          <div className="composer__preview">
            <img src={draft.image} alt="Attached image preview" decoding="async" />
            <Tooltip content="Remove image" placement="above">
              <button
                type="button"
                className="composer__preview-remove"
                aria-label="Remove image"
                onClick={() => set({ image: undefined })}
              >
                <X size={14} aria-hidden />
              </button>
            </Tooltip>
          </div>
        )}

        <div className="composer__controls">
          <div className="composer__group">
            <div className="composer__size">
              <button
                ref={sizeTriggerRef}
                type="button"
                className="composer__size-trigger"
                aria-haspopup="menu"
                aria-expanded={sizeMenuOpen}
                aria-label={`Text size: ${sizeLabel}`}
                onClick={() => setSizeMenuOpen((o) => !o)}
              >
                {sizeLabel}
                <CaretDown size={14} aria-hidden />
              </button>
              <Menu
                open={sizeMenuOpen}
                onClose={() => setSizeMenuOpen(false)}
                triggerRef={sizeTriggerRef}
                placement="above"
                align="start"
                label="Text size"
              >
                {FONT_SIZE_OPTIONS.map((o) => (
                  <MenuItem
                    key={o.value}
                    label={o.label}
                    selected={draft.fontSize === o.value}
                    onSelect={() => {
                      set({ fontSize: o.value });
                      setSizeMenuOpen(false);
                      sizeTriggerRef.current?.focus();
                    }}
                  />
                ))}
              </Menu>
            </div>

            {draft.image && (
              <div className="composer__layout" role="group" aria-label="Card layout">
                {(
                  [
                    { value: 'stack', label: 'Text above image', Icon: Rows },
                    { value: 'split', label: 'Text beside image', Icon: Columns },
                  ] as Array<{ value: CardLayout; label: string; Icon: typeof Rows }>
                ).map(({ value, label, Icon }) => (
                  <Tooltip key={value} content={label} placement="above">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={label}
                      aria-pressed={draft.layout === value}
                      onClick={() => set({ layout: value })}
                    >
                      <Icon size={18} aria-hidden />
                    </button>
                  </Tooltip>
                ))}
              </div>
            )}

            <button
              type="button"
              className="composer__life"
              aria-pressed={draft.lifeChanging}
              onClick={() => set({ lifeChanging: !draft.lifeChanging })}
            >
              <Sparkle size={16} weight={draft.lifeChanging ? 'fill' : 'regular'} aria-hidden />
              Life-changing
            </button>
          </div>

          <div className="composer__group">
            {editing && (
              <button
                type="button"
                className={`composer__delete${confirmingDelete ? ' composer__delete--confirm' : ''}`}
                onClick={() => {
                  if (confirmingDelete) {
                    onDelete(draft.editingId!);
                  } else {
                    setConfirmingDelete(true);
                  }
                }}
                onBlur={() => setConfirmingDelete(false)}
              >
                <TrashSimple size={16} aria-hidden />
                {confirmingDelete ? 'Delete card?' : 'Delete'}
              </button>
            )}

            <Tooltip content="Attach an image" placement="above">
              <button
                type="button"
                className="icon-button"
                aria-label="Attach an image"
                onClick={() => fileRef.current?.click()}
              >
                <ImageSquare size={18} aria-hidden />
              </button>
            </Tooltip>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="visually-hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
              tabIndex={-1}
              aria-hidden
            />

            {/* Editing writes to the card live, so there's no Save step - only
              * new cards need an explicit Add to come into existence. */}
            {!editing && (
              <button
                type="button"
                className="composer__save"
                disabled={!draft.text.trim()}
                onClick={onSave}
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
