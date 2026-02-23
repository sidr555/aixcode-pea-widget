import { useState, useRef, useEffect, memo } from 'react';
import { useTheme, THEMES } from './ThemeContext';
import { useProfile } from '../Profile/ProfileContext';
import styles from './Theme.module.css';

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28];

function ThemeSelector() {
  const { theme, mode, fontSize, colors, themes, changeTheme, changeMode, changeFontSize } = useTheme();
  const { activeProfile, openProfileSelector } = useProfile();
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

  const handleLogout = () => {
    setIsOpen(false);
    openProfileSelector();
  };

  return (
    <div className={styles.selector} ref={dropdownRef}>
      <button
        className={styles.selectorBtn}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        style={{ borderColor: colors.primary }}
      >
        {!activeProfile && (
          <span
            className={styles.colorPreview}
            style={{ background: colors.primary }}
          />
        )}
        <span className={styles.selectorText} style={activeProfile ? { color: colors.primary } : undefined}>
          {activeProfile ? activeProfile.name : currentThemeName}
        </span>
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

          <div className={styles.section}>
            <div className={styles.sectionLabel}>Размер шрифта</div>
            <div className={styles.fontSizeRow}>
              <input
                type="range"
                className={styles.fontSlider}
                min={FONT_SIZES[0]}
                max={FONT_SIZES[FONT_SIZES.length - 1]}
                step={2}
                value={fontSize}
                onChange={e => changeFontSize(Number(e.target.value))}
              />
              <span className={styles.fontSizeValue}>{fontSize}</span>
            </div>
          </div>

          {activeProfile && (
            <div className={styles.section}>
              <button
                className={styles.logoutBtn}
                onClick={handleLogout}
                type="button"
                style={{ backgroundColor: colors.primary }}
              >
                Выйти
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ThemeSelector);
