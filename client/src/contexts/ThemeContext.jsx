import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'posto-theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

const ThemeContext = createContext({
  theme: THEMES.LIGHT,
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return THEMES.LIGHT;
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    return storedTheme === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
  });

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    const nextClass = theme === THEMES.DARK ? 'theme-dark' : 'theme-light';
    root.classList.add(nextClass);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme
    }),
    [theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
