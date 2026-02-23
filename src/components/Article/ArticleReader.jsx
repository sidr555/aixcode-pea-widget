import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
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
 * Токенизирует текст, назначая индексы только значимым словам (> 2 букв).
 * Возвращает [{text, sigIdx, isSignificant}]
 * sigIdx — порядковый номер среди значимых слов (0-based), или -1
 */
function tokenize(text) {
  const tokens = [];
  const parts = text.split(/(\s+)/);
  let sigIdx = 0;
  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      tokens.push({ text: part, sigIdx: -1, isSignificant: false });
    } else {
      const letters = part.replace(/[^a-zа-яёA-ZА-ЯЁ]/g, '');
      const isSignificant = letters.length > 2;
      tokens.push({
        text: part,
        sigIdx: isSignificant ? sigIdx : -1,
        isSignificant,
      });
      if (isSignificant) sigIdx++;
    }
  }
  return tokens;
}

/**
 * ArticleReader — таймер чтения с подсчётом слов.
 * Render-props компонент: children({ control, progressBar, bodyContent })
 *
 * @param {number} duration — время чтения в секундах (по умолчанию 60)
 * @param {function} onSessionComplete — вызывается при phase=done с (wordCount)
 */
function ArticleReader({ body, duration = 60, onSessionComplete, children }) {
  const { colors } = useTheme();
  const [phase, setPhase] = useState('idle'); // idle | reading | picking | done
  const [selectedSigIdx, setSelectedSigIdx] = useState(null);
  const [wordCount, setWordCount] = useState(null);
  const calledRef = useRef(false);

  const { time, start, stop, reset: resetTimer } = useTimer(`${duration}s`, () => {
    setPhase('picking');
  });

  const handleStopEarly = useCallback(() => {
    stop();
    setPhase('picking');
  }, [stop]);

  const tokens = useMemo(() => tokenize(body), [body]);

  const handleStart = useCallback(() => {
    setPhase('reading');
    calledRef.current = false;
    start();
  }, [start]);

  const handleWordClick = useCallback((sigIdx) => {
    if (phase !== 'picking') return;

    if (selectedSigIdx === sigIdx) {
      // Повторный клик — завершаем. sigIdx 0-based, значит кол-во = sigIdx + 1
      setWordCount(sigIdx + 1);
      setPhase('done');
    } else {
      setSelectedSigIdx(sigIdx);
    }
  }, [phase, selectedSigIdx]);

  // Call onSessionComplete when phase becomes 'done'
  useEffect(() => {
    if (phase === 'done' && wordCount != null && !calledRef.current) {
      calledRef.current = true;
      onSessionComplete?.(wordCount);
    }
  }, [phase, wordCount, onSessionComplete]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setSelectedSigIdx(null);
    setWordCount(null);
    calledRef.current = false;
    resetTimer();
  }, [resetTimer]);

  const isExpanded = phase === 'reading' || phase === 'picking';

  // Контрол для размещения в заголовке
  const control = (() => {
    if (phase === 'idle') {
      return (
        <button
          className={styles.readerBtn}
          onClick={(e) => { e.stopPropagation(); handleStart(); }}
          type="button"
          style={{ backgroundColor: colors.primary }}
        >
          Читать
        </button>
      );
    }

    if (phase === 'reading') {
      return null; // прогрессбар рендерится отдельно
    }

    if (phase === 'picking') {
      return (
        <div className={styles.readerPickLabel} onClick={(e) => e.stopPropagation()}>
          Кликни слово
        </div>
      );
    }

    if (phase === 'done') {
      return (
        <div className={styles.readerResult} onClick={(e) => e.stopPropagation()}>
          <span className={styles.readerResultCount} style={{ color: colors.primary }}>
            {pluralWords(wordCount)}
          </span>
          <button
            className={styles.readerResetBtn}
            onClick={(e) => { e.stopPropagation(); handleReset(); }}
            type="button"
          >
            ↻
          </button>
        </div>
      );
    }

    return null;
  })();

  // Прогрессбар (отдельно, ниже заголовка)
  const progressBar = phase === 'reading' ? (
    <div className={styles.readerTimer} onClick={handleStopEarly} title="Нажмите, чтобы завершить чтение">
      <div className={styles.readerTimerBar}>
        <div
          className={styles.readerTimerFill}
          style={{
            width: `${(time / duration) * 100}%`,
            backgroundColor: colors.primary,
          }}
        />
      </div>
      <span className={styles.readerTimerText}>{formatTime(time)}</span>
    </div>
  ) : null;

  const bodyContent = isExpanded ? (
    <div className={styles.readerBody}>
      {tokens.map((token, i) => {
        if (!token.isSignificant) {
          return <span key={i}>{token.text}</span>;
        }

        const canClick = phase === 'picking';
        const isSelected = selectedSigIdx === token.sigIdx;

        return (
          <span
            key={i}
            className={`${styles.readerWord} ${canClick ? styles.readerWordClickable : ''} ${isSelected ? styles.readerWordSelected : ''}`}
            style={isSelected ? { backgroundColor: colors.primary, color: '#fff' } : undefined}
            onClick={canClick ? () => handleWordClick(token.sigIdx) : undefined}
          >
            {token.text}
          </span>
        );
      })}
    </div>
  ) : null;

  return children({ control, progressBar, bodyContent });
}

export default memo(ArticleReader);
