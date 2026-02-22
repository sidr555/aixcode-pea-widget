import { useState, useCallback, useMemo, memo } from 'react';
import { useTimer, formatTime } from '../../hooks/useTimer';
import { useTheme } from '../Theme/ThemeContext';
import styles from './Article.module.css';

/**
 * Склонение слова "слово" по количеству
 */
function pluralWords(n) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 19) return `${n} слов`;
  if (last === 1) return `${n} слово`;
  if (last >= 2 && last <= 4) return `${n} слова`;
  return `${n} слов`;
}

/**
 * Токенизирует текст статьи в массив слов с позициями
 * Возвращает [{text, index, isWord}] где isWord = слово > 2 букв
 */
function tokenize(text) {
  const tokens = [];
  // Разбиваем по границам слов, сохраняя пробелы и пунктуацию
  const parts = text.split(/(\s+)/);
  let wordIdx = 0;
  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      tokens.push({ text: part, index: -1, isWord: false });
    } else {
      // Слово может содержать пунктуацию — выделяем буквенную часть
      const letters = part.replace(/[^a-zа-яёA-ZА-ЯЁ0-9]/g, '');
      const isWord = letters.length > 2;
      tokens.push({ text: part, index: wordIdx, isWord });
      wordIdx++;
    }
  }
  return tokens;
}

/**
 * ArticleReader — таймер чтения с подсчётом слов
 */
function ArticleReader({ body }) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('idle'); // idle | reading | picking | done
  const [selectedWordIdx, setSelectedWordIdx] = useState(null);
  const [wordCount, setWordCount] = useState(null);

  const { time, isFinished, start, reset: resetTimer } = useTimer('60s', () => {
    setPhase('picking');
  });

  const tokens = useMemo(() => tokenize(body), [body]);

  // Считаем слова > 2 букв (для подсчёта)
  const significantWords = useMemo(() => {
    return tokens.filter(t => t.isWord);
  }, [tokens]);

  const handleStart = useCallback(() => {
    setPhase('reading');
    start();
  }, [start]);

  const handleWordClick = useCallback((wordIndex) => {
    if (phase !== 'picking') return;

    if (selectedWordIdx === wordIndex) {
      // Повторный клик — завершаем
      const count = significantWords.filter(w => w.index <= wordIndex).length;
      setWordCount(count);
      setPhase('done');
    } else {
      setSelectedWordIdx(wordIndex);
    }
  }, [phase, selectedWordIdx, significantWords]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setSelectedWordIdx(null);
    setWordCount(null);
    resetTimer();
  }, [resetTimer]);

  // Кнопка/таймер/результат
  const renderControl = () => {
    if (phase === 'idle') {
      return (
        <button
          className={styles.readerBtn}
          onClick={handleStart}
          type="button"
          style={{ backgroundColor: colors.primary }}
        >
          Читать
        </button>
      );
    }

    if (phase === 'reading') {
      return (
        <div className={styles.readerTimer}>
          <div className={styles.readerTimerBar}>
            <div
              className={styles.readerTimerFill}
              style={{
                width: `${(time / 60) * 100}%`,
                backgroundColor: colors.primary,
              }}
            />
          </div>
          <span className={styles.readerTimerText}>{formatTime(time)}</span>
        </div>
      );
    }

    if (phase === 'picking') {
      return (
        <div className={styles.readerPickLabel}>
          Кликни слово
        </div>
      );
    }

    if (phase === 'done') {
      return (
        <div className={styles.readerResult}>
          <span className={styles.readerResultCount} style={{ color: colors.primary }}>
            {pluralWords(wordCount)}
          </span>
          <button
            className={styles.readerResetBtn}
            onClick={handleReset}
            type="button"
          >
            ↻
          </button>
        </div>
      );
    }
  };

  const isExpanded = phase === 'reading' || phase === 'picking';

  return (
    <div className={styles.reader}>
      {renderControl()}

      {isExpanded && (
        <div className={styles.readerBody}>
          {tokens.map((token, i) => {
            if (!token.isWord) {
              return <span key={i}>{token.text}</span>;
            }

            const canClick = phase === 'picking';
            const isSelected = selectedWordIdx === token.index;

            return (
              <span
                key={i}
                className={`${styles.readerWord} ${canClick ? styles.readerWordClickable : ''} ${isSelected ? styles.readerWordSelected : ''}`}
                style={isSelected ? { backgroundColor: colors.primary, color: '#fff' } : undefined}
                onClick={canClick ? () => handleWordClick(token.index) : undefined}
              >
                {token.text}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(ArticleReader);
