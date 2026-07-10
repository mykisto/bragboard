import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { Check } from '@phosphor-icons/react';

/**
 * Popover menu mirroring the Astryx (Pumpkin) DropdownMenu: a --radius-container
 * surface padded by --space-1, items rounded to (container - padding), overlay-hover
 * highlight, roving arrow-key focus, light-dismiss, and Escape returning focus to the
 * trigger. The trigger button is owned by the caller (with `triggerRef`); this renders
 * only the popover, anchored to a position:relative wrapper the caller provides.
 */

interface MenuProps {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  placement?: 'above' | 'below';
  align?: 'start' | 'end';
  /** Accessible name for the menu, taken from its trigger. */
  label: string;
  children: ReactNode;
}

export function Menu({
  open,
  onClose,
  triggerRef,
  placement = 'below',
  align = 'start',
  label,
  children,
}: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || triggerRef.current?.contains(t)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, triggerRef]);

  // Focus the checked item (radio menus) or the first item when the menu opens, so
  // keyboard users land inside it - matching the DS menu-button pattern.
  useEffect(() => {
    if (!open) return;
    const items = itemsOf(ref.current);
    (items.find((el) => el.getAttribute('aria-checked') === 'true') ?? items[0])?.focus();
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const items = itemsOf(ref.current);
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(i + 1) % items.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1].focus();
    }
  };

  if (!open) return null;
  return (
    <div
      ref={ref}
      className={`menu menu--${placement} menu--${align}`}
      role="menu"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}

function itemsOf(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])'));
}

interface MenuItemProps {
  icon?: ReactNode;
  label: string;
  onSelect: () => void;
  /** Provide to render a radio item (checkmark when true); omit for a plain action. */
  selected?: boolean;
}

export function MenuItem({ icon, label, onSelect, selected }: MenuItemProps) {
  const radio = selected !== undefined;
  return (
    <button
      type="button"
      role={radio ? 'menuitemradio' : 'menuitem'}
      aria-checked={radio ? selected : undefined}
      tabIndex={-1}
      className="menu__item"
      onClick={onSelect}
    >
      {icon && (
        <span className="menu__item-icon" aria-hidden>
          {icon}
        </span>
      )}
      <span className="menu__item-label">{label}</span>
      {radio && (
        <span className="menu__item-check" aria-hidden>
          {selected && <Check size={16} />}
        </span>
      )}
    </button>
  );
}
