import { useCallback, useEffect, useState } from 'react';
import { loadTheme, saveTheme } from '../storage';
import type { Theme } from '../storage';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => loadTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
