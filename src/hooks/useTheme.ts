import { useCallback, useEffect, useState } from 'react';
import { loadTheme, saveTheme } from '../storage';
import type { Theme } from '../storage';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => loadTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
    const bg = theme === 'dark' ? '#15100d' : '#fff6f0';
    // Keep the inline <html> background (set pre-paint in index.html) and the
    // mobile browser-chrome color in step with the board on toggle.
    document.documentElement.style.backgroundColor = bg;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', bg);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
