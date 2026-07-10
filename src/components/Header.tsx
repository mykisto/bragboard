import { useRef, useState } from 'react';
import { Sun, Moon, DotsThree, DownloadSimple, UploadSimple } from '@phosphor-icons/react';
import type { Theme } from '../storage';
import { Menu, MenuItem } from './Menu';
import { Tooltip } from './Tooltip';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
}

export function Header({ theme, onToggleTheme, onExport, onImportFile }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo" aria-hidden>
          B
        </span>
        <h1 className="header__wordmark">BragBoard</h1>
      </div>

      <div className="header__actions">
        <Tooltip content={theme === 'light' ? 'Dark theme' : 'Light theme'} placement="below">
          <button
            type="button"
            className="icon-button"
            onClick={onToggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {theme === 'light' ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
          </button>
        </Tooltip>

        <div className="header__menu">
          <button
            ref={triggerRef}
            type="button"
            className="icon-button"
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <DotsThree size={20} weight="bold" aria-hidden />
          </button>

          <Menu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            triggerRef={triggerRef}
            placement="below"
            align="end"
            label="More options"
          >
            <MenuItem
              icon={<DownloadSimple size={16} />}
              label="Export JSON"
              onSelect={() => {
                setMenuOpen(false);
                onExport();
              }}
            />
            <MenuItem
              icon={<UploadSimple size={16} />}
              label="Import JSON"
              onSelect={() => {
                setMenuOpen(false);
                fileRef.current?.click();
              }}
            />
          </Menu>

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
            }}
          />
        </div>
      </div>
    </header>
  );
}
