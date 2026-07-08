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

interface Props {
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
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
  onSave,
  onDelete,
  onImageError,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // The pill and the expanded composer are different elements, so to animate the
  // collapse we keep the composer mounted through its exit animation and only
  // drop it back to the pill once composer-out finishes.
  const [mounted, setMounted] = useState(expanded);
  const [closing, setClosing] = useState(false);

  const editing = Boolean(draft.editingId);
  const hasDraft = draft.text.trim() !== '' || Boolean(draft.image);

  // Click outside collapses; the draft is preserved by design - no Cancel button.
  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onExpandedChange(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExpandedChange(false);
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

  // Auto-grow the textarea with content, bounded by CSS max-height.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft.text, expanded]);

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
      if (editing) onExpandedChange(false);
      else if (draft.text.trim()) onSave();
    }
  };

  if (!mounted) {
    return (
      <div className="composer-dock" ref={rootRef}>
        <button
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
            <button
              type="button"
              className="composer__preview-remove"
              aria-label="Remove image"
              onClick={() => set({ image: undefined })}
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        )}

        <div className="composer__controls">
          <div className="composer__group">
            <label className="composer__size">
              <span className="visually-hidden">Text size</span>
              <select
                value={draft.fontSize}
                onChange={(e) => set({ fontSize: e.target.value as FontSize })}
                aria-label="Text size"
              >
                {FONT_SIZE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <CaretDown size={14} className="composer__size-caret" aria-hidden />
            </label>

            {draft.image && (
              <div className="composer__layout" role="group" aria-label="Card layout">
                {(
                  [
                    { value: 'stack', label: 'Text above image', Icon: Rows },
                    { value: 'split', label: 'Text beside image', Icon: Columns },
                  ] as Array<{ value: CardLayout; label: string; Icon: typeof Rows }>
                ).map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className="icon-button"
                    aria-label={label}
                    aria-pressed={draft.layout === value}
                    onClick={() => set({ layout: value })}
                  >
                    <Icon size={18} aria-hidden />
                  </button>
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

            <button
              type="button"
              className="icon-button"
              aria-label="Attach an image"
              onClick={() => fileRef.current?.click()}
            >
              <ImageSquare size={18} aria-hidden />
            </button>
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
