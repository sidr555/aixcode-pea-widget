import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import './theme.css';

const ThemeContext = createContext(null);

export const THEMES = {
  orange: {
    name: 'Апельсин',
    light: {
      primary: '#ff6b35',
      primaryLight: '#ff8c5a',
      primaryDark: '#e55a2b',
      accent: '#ff9f1c',
      accentLight: '#ffb347',
    },
    dark: {
      primary: '#ff7b45',
      primaryLight: '#ff9c6a',
      primaryDark: '#e56a35',
      accent: '#ffaf3c',
      accentLight: '#ffc367',
    }
  },
  lime: {
    name: 'Лайм',
    light: {
      primary: '#4caf50',
      primaryLight: '#66bb6a',
      primaryDark: '#388e3c',
      accent: '#8bc34a',
      accentLight: '#9ccc65',
    },
    dark: {
      primary: '#5cbf60',
      primaryLight: '#76cf7a',
      primaryDark: '#4cae50',
      accent: '#9cd35a',
      accentLight: '#acd670',
    }
  },
  melon: {
    name: 'Дыня',
    light: {
      primary: '#ff6b9d',
      primaryLight: '#ff8cb5',
      primaryDark: '#e55a87',
      accent: '#ffb3c6',
      accentLight: '#ffc6d4',
    },
    dark: {
      primary: '#ff7bad',
      primaryLight: '#ff9cc5',
      primaryDark: '#e56a97',
      accent: '#ffc3d6',
      accentLight: '#ffd6e4',
    }
  },
  ice: {
    name: 'Лёд',
    light: {
      primary: '#00bcd4',
      primaryLight: '#26c6da',
      primaryDark: '#00acc1',
      accent: '#4dd0e1',
      accentLight: '#80deea',
    },
    dark: {
      primary: '#10ccdc',
      primaryLight: '#36dcea',
      primaryDark: '#00bcd1',
      accent: '#5de0f1',
      accentLight: '#80e6f2',
    }
  }
};

export function ThemeProvider({ children, defaultTheme = 'orange', defaultMode = 'light', defaultFontSize = 16 }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultTheme;
    }
    const saved = localStorage.getItem('quest_theme');
    return saved || defaultTheme;
  });

  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultMode;
    }
    const saved = localStorage.getItem('quest_mode');
    return saved || defaultMode;
  });

  const [fontSize, setFontSize] = useState(() => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultFontSize;
    }
    const saved = localStorage.getItem('quest_font_size');
    return saved ? Number(saved) : defaultFontSize;
  });

  // Сохранение в localStorage и установка data-атрибутов
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage) localStorage.setItem('quest_theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage) localStorage.setItem('quest_mode', mode);
    document.documentElement.dataset.mode = mode;
    document.body.classList.toggle('dark', mode === 'dark');
    document.body.classList.toggle('light', mode === 'light');
  }, [mode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage) localStorage.setItem('quest_font_size', String(fontSize));
    document.documentElement.style.setProperty('--article-font-size', `${fontSize}px`);
  }, [fontSize]);


  const changeTheme = useCallback((newTheme) => {
    if (THEMES[newTheme]) {
      setTheme(newTheme);
    }
  }, []);

  const changeMode = useCallback((newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setMode(newMode);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const changeFontSize = useCallback((size) => {
    const s = Number(size);
    if (s >= 10 && s <= 28) setFontSize(s);
  }, []);

  // Sync from profile
  const syncFromProfile = useCallback((profile) => {
    if (!profile) return;
    if (profile.theme && THEMES[profile.theme]) setTheme(profile.theme);
    if (profile.mode === 'light' || profile.mode === 'dark') setMode(profile.mode);
    if (profile.fontSize >= 10 && profile.fontSize <= 28) setFontSize(profile.fontSize);
  }, []);

  const colors = useMemo(() => {
    return THEMES[theme]?.[mode] || THEMES.orange.light;
  }, [theme, mode]);

  const value = useMemo(() => ({
    theme,
    mode,
    fontSize,
    colors,
    themes: Object.keys(THEMES).map(key => ({ key, name: THEMES[key].name })),
    changeTheme,
    changeMode,
    toggleMode,
    changeFontSize,
    syncFromProfile
  }), [theme, mode, fontSize, colors, changeTheme, changeMode, toggleMode, changeFontSize, syncFromProfile]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'orange',
      mode: 'light',
      fontSize: 16,
      colors: THEMES.orange.light,
      themes: Object.keys(THEMES).map(key => ({ key, name: THEMES[key].name })),
      changeTheme: () => {},
      changeMode: () => {},
      toggleMode: () => {},
      changeFontSize: () => {},
      syncFromProfile: () => {}
    };
  }
  return context;
}

export default ThemeContext;
