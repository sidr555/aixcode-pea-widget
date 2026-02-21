import { useState, useRef, useEffect, memo } from 'react';
import { useTheme, THEMES } from './ThemeContext';
import styles from './Theme.module.css';

function ThemeSelector() {
  const { theme, mode, colors, themes, changeTheme, changeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeName = THEMES[theme]?.name || 'Апельсин';

  return (
    <div className={styles.selector} ref={dropdownRef}>
      <button
        className={styles.selectorBtn}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        style={{ borderColor: colors.primary }}
      >
        <span 
          className={styles.colorPreview} 
          style={{ background: colors.primary }}
        />
        <span className={styles.selectorText}>{currentThemeName}</span>
        <span className={styles.modeIcon}>{mode === 'dark' ? '🌙' : '☀️'}</span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Режим</div>
            <div className={styles.modeButtons}>
              <button
                className={`${styles.modeBtn} ${mode === 'light' ? styles.active : ''}`}
                onClick={() => changeMode('light')}
                type="button"
              >
                ☀️ Светлый
              </button>
              <button
                className={`${styles.modeBtn} ${mode === 'dark' ? styles.active : ''}`}
                onClick={() => changeMode('dark')}
                type="button"
              >
                🌙 Тёмный
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionLabel}>Тема</div>
            <div className={styles.themeList}>
              {themes.map(({ key, name }) => (
                <button
                  key={key}
                  className={`${styles.themeBtn} ${theme === key ? styles.active : ''}`}
                  onClick={() => changeTheme(key)}
                  type="button"
                >
                  <span 
                    className={styles.themeColor}
                    style={{ background: THEMES[key][mode].primary }}
                  />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ThemeSelector);
