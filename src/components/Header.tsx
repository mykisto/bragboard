import { useEffect, useRef, useState } from 'react';
import { Sun, Moon, DotsThree, DownloadSimple, UploadSimple } from '@phosphor-icons/react';
import type { Theme } from '../storage';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
}

export function Header({ theme, onToggleTheme, onExport, onImportFile }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo" aria-hidden>
          B
        </span>
        <span className="header__wordmark">BragBoard</span>
      </div>

      <div className="header__actions">
        <button
          type="button"
          className="icon-button"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {theme === 'light' ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
        </button>

        <div className="header__menu" ref={menuRef}>
          <button
            type="button"
            className="icon-button"
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <DotsThree size={20} weight="bold" aria-hidden />
          </button>

          {menuOpen && (
            <div className="menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="menu__item"
                onClick={() => {
                  onExport();
                  setMenuOpen(false);
                }}
              >
                <DownloadSimple size={16} aria-hidden />
                Export JSON
              </button>
              <button
                type="button"
                role="menuitem"
                className="menu__item"
                onClick={() => fileRef.current?.click()}
              >
                <UploadSimple size={16} aria-hidden />
                Import JSON
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="visually-hidden"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImportFile(file);
                  e.target.value = '';
                  setMenuOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
