import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

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

export function ThemeProvider({ children, defaultTheme = 'orange', defaultMode = 'light' }) {
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof window !== "undefined" && window.localStorage) localStorage.setItem('quest_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) localStorage.setItem('quest_mode', mode);
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('dark', mode === 'dark');
    document.body.classList.toggle('light', mode === 'light');
  }, [mode]);

  // Установка CSS переменных для цветов темы
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const c = THEMES[theme]?.[mode] || THEMES.orange.light;
    root.style.setProperty('--primary-color', c.primary);
    root.style.setProperty('--primary-light', c.primaryLight);
    root.style.setProperty('--primary-dark', c.primaryDark);
    root.style.setProperty('--accent-color', c.accent);
    root.style.setProperty('--accent-light', c.accentLight);

    // Цвета для light/dark режима
    if (mode === 'light') {
      root.style.setProperty('--bg-primary', '#fff');
      root.style.setProperty('--bg-secondary', '#fafafa');
      root.style.setProperty('--bg-input', '#fff');
      root.style.setProperty('--bg-hover', '#f5f5f5');
      root.style.setProperty('--bg-selected', '#fff3e0');
      root.style.setProperty('--bg-success', '#e8f5e9');
      root.style.setProperty('--bg-warning', '#fff3e0');
      root.style.setProperty('--bg-word-selected', '#ffecb3');
      root.style.setProperty('--bg-word-correct', '#c8e6c9');
      root.style.setProperty('--bg-word-incorrect', '#ffcdd2');
      root.style.setProperty('--text-primary', '#333');
      root.style.setProperty('--text-secondary', '#666');
      root.style.setProperty('--border-color', '#e0e0e0');
    } else {
      root.style.setProperty('--bg-primary', '#2a2a2a');
      root.style.setProperty('--bg-secondary', '#333');
      root.style.setProperty('--bg-input', '#404040');
      root.style.setProperty('--bg-hover', '#3a3a3a');
      root.style.setProperty('--bg-selected', 'rgba(255, 107, 53, 0.2)');
      root.style.setProperty('--bg-success', 'rgba(76, 175, 80, 0.2)');
      root.style.setProperty('--bg-warning', 'rgba(255, 152, 0, 0.2)');
      root.style.setProperty('--bg-word-selected', 'rgba(255, 193, 179, 0.3)');
      root.style.setProperty('--bg-word-correct', 'rgba(129, 199, 132, 0.3)');
      root.style.setProperty('--bg-word-incorrect', 'rgba(229, 115, 115, 0.3)');
      root.style.setProperty('--text-primary', '#e0e0e0');
      root.style.setProperty('--text-secondary', '#999');
      root.style.setProperty('--border-color', '#444');
    }
  }, [theme, mode]);


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

  const colors = useMemo(() => {
    return THEMES[theme]?.[mode] || THEMES.orange.light;
  }, [theme, mode]);

  const value = useMemo(() => ({
    theme,
    mode,
    colors,
    themes: Object.keys(THEMES).map(key => ({ key, name: THEMES[key].name })),
    changeTheme,
    changeMode,
    toggleMode
  }), [theme, mode, colors, changeTheme, changeMode, toggleMode]);

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
      colors: THEMES.orange.light,
      themes: Object.keys(THEMES).map(key => ({ key, name: THEMES[key].name })),
      changeTheme: () => {},
      changeMode: () => {},
      toggleMode: () => {}
    };
  }
  return context;
}

export default ThemeContext;
