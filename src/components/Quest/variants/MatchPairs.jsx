import { useState, useCallback, memo, useMemo } from 'react';
import Quest from '../Quest';
import { hash } from '../../../utils/hash';
import { normalizeAnswer } from '../../../utils/normalize';
import styles from './variants.module.css';

const PAIR_COLORS = [
  '#e06c75', '#e5c07b', '#61afef', '#c678dd',
  '#56b6c2', '#d19a66', '#98c379', '#be5046',
  '#ff6b9d', '#20b2aa', '#dda0dd', '#f0e68c',
  '#87ceeb', '#ffa07a', '#00ced1', '#ba55d3',
];

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function assignColors(count) {
  const pool = shuffleArray(PAIR_COLORS);
  return pool.slice(0, count);
}

/**
 * MatchPairsInput — изолированный компонент ввода для drag-and-drop пар.
 * Владеет собственным состоянием drag-событий, не затрагивая Quest.
 */
const MatchPairsInput = memo(function MatchPairsInput({ pairs, shuffledRight, onSubmit }) {
  const [matches, setMatches] = useState({});
  const [draggingId, setDraggingId] = useState(null);
  const [pairColors] = useState(() => assignColors(pairs.length));
  const [colorAssignment, setColorAssignment] = useState({});
  const [nextColorIdx, setNextColorIdx] = useState(0);

  const reverseMatches = useMemo(() => {
    const map = {};
    for (const [leftId, rightId] of Object.entries(matches)) {
      map[rightId] = leftId;
    }
    return map;
  }, [matches]);

  const handleNativeDragStart = useCallback((e, leftId) => {
    e.dataTransfer.setData('text/plain', leftId);
    setDraggingId(leftId);
  }, []);

  const handleNativeDrop = useCallback((leftId, rightId) => {
    const occupiedBy = reverseMatches[rightId];
    if (occupiedBy && occupiedBy !== leftId) {
      setDraggingId(null);
      return;
    }

    setMatches(prev => ({ ...prev, [leftId]: rightId }));

    setColorAssignment(prev => {
      if (prev[leftId] !== undefined) return prev;
      return { ...prev, [leftId]: nextColorIdx };
    });
    setNextColorIdx(prev => {
      if (colorAssignment[leftId] !== undefined) return prev;
      return prev + 1;
    });

    setDraggingId(null);
  }, [reverseMatches, colorAssignment, nextColorIdx]);

  const getPairColor = useCallback((leftId) => {
    const idx = colorAssignment[leftId];
    if (idx === undefined) return undefined;
    return pairColors[idx % pairColors.length];
  }, [colorAssignment, pairColors]);

  const handleSubmit = useCallback(() => {
    const userPairsHash = pairs.map(p => {
      const leftId = `left-${p.left}`;
      const matchedRightId = matches[leftId];
      const matchedRight = shuffledRight.find((_, idx) => `right-${idx}` === matchedRightId);
      return `${hash(normalizeAnswer(p.left))}|${hash(normalizeAnswer(matchedRight || ''))}`;
    }).join('||');

    onSubmit(userPairsHash);
  }, [pairs, matches, shuffledRight, onSubmit]);

  const allMatched = Object.keys(matches).length === pairs.length;

  return (
    <div className={styles.matchPairs}>
      <p className={styles.hint}>Перетащите термины к соответствующим определениям:</p>

      <div className={styles.matchContainer}>
        <div className={styles.matchColumn}>
          {pairs.map((pair) => {
            const leftId = `left-${pair.left}`;
            const isMatched = !!matches[leftId];
            const color = getPairColor(leftId);
            const colorStyle = isMatched && color
              ? { borderColor: color, backgroundColor: `${color}22` }
              : {};
            return (
              <div
                key={leftId}
                draggable
                onDragStart={(e) => handleNativeDragStart(e, leftId)}
                className={`${styles.matchItem} ${isMatched ? styles.matched : ''} ${draggingId === leftId ? styles.dragging : ''}`}
                style={colorStyle}
              >
                {pair.left}
              </div>
            );
          })}
        </div>

        <div className={styles.matchColumn}>
          {shuffledRight.map((item, idx) => {
            const rightId = `right-${idx}`;
            const matchedLeftId = reverseMatches[rightId];
            const color = matchedLeftId ? getPairColor(matchedLeftId) : undefined;
            const colorStyle = matchedLeftId && color
              ? { borderColor: color, backgroundColor: `${color}22`, borderStyle: 'solid' }
              : {};
            return (
              <div
                key={rightId}
                className={`${styles.dropZone} ${matchedLeftId ? styles.hasMatch : ''}`}
                style={colorStyle}
                onDragOver={(e) => {
                  const occupied = !!reverseMatches[rightId];
                  if (occupied) {
                    if (matches[draggingId] !== rightId) return;
                  }
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const leftId = e.dataTransfer.getData('text/plain');
                  handleNativeDrop(leftId, rightId);
                }}
              >
                <span>{item}</span>
                {matchedLeftId && <span className={styles.matchIndicator}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={!allMatched}
        type="button"
      >
        Ответить
      </button>
    </div>
  );
});

/**
 * MatchPairsResult — отображение результатов с подсветкой правильных/неправильных
 */
const MatchPairsResult = memo(function MatchPairsResult({ pairs, shuffledRight, matches, reverseMatches, getPairColor, getPairResults }) {
  const [correctColors] = useState(() => assignColors(pairs.length));
  const results = getPairResults();

  let wrongColorIdx = 0;
  const wrongColors = {};
  results.forEach((r) => {
    if (!r.isCorrect) {
      wrongColors[r.leftId] = correctColors[wrongColorIdx % correctColors.length];
      wrongColorIdx++;
    }
  });

  return (
    <div className={styles.matchPairs}>
      <div className={styles.matchContainer}>
        <div className={styles.matchColumn}>
          {pairs.map((pair) => {
            const leftId = `left-${pair.left}`;
            const result = results.find(r => r.leftId === leftId);
            const isCorrect = result?.isCorrect;
            const color = getPairColor(leftId);
            const wrongColor = wrongColors[leftId];
            const itemStyle = isCorrect && color
              ? { borderColor: color, backgroundColor: `${color}22` }
              : wrongColor
                ? { borderColor: wrongColor, backgroundColor: `${wrongColor}15` }
                : {};
            return (
              <div
                key={leftId}
                className={`${styles.matchItem} ${styles.matched}`}
                style={itemStyle}
              >
                <span className={isCorrect ? styles.resultCorrectIcon : styles.resultIncorrectIcon}>
                  {isCorrect ? '✓' : '✗'}
                </span>
                {pair.left}
              </div>
            );
          })}
        </div>

        <div className={styles.matchColumn}>
          {shuffledRight.map((item, idx) => {
            const rightId = `right-${idx}`;
            const matchedLeftId = reverseMatches[rightId];
            const result = matchedLeftId ? results.find(r => r.leftId === matchedLeftId) : null;
            const isCorrect = result?.isCorrect;
            const color = matchedLeftId ? getPairColor(matchedLeftId) : undefined;
            const wrongColor = matchedLeftId ? wrongColors[matchedLeftId] : undefined;
            const itemStyle = isCorrect && color
              ? { borderColor: color, backgroundColor: `${color}22`, borderStyle: 'solid' }
              : wrongColor
                ? { borderColor: wrongColor, backgroundColor: `${wrongColor}15`, borderStyle: 'solid' }
                : {};
            return (
              <div
                key={rightId}
                className={`${styles.dropZone} ${matchedLeftId ? styles.hasMatch : ''}`}
                style={itemStyle}
              >
                {matchedLeftId && (
                  <span className={isCorrect ? styles.resultCorrectIcon : styles.resultIncorrectIcon}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
                <span>{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

/**
 * MatchPairs — соединить пары (термин - определение)
 */
function MatchPairs({
  id,
  question,
  options,
  correctAnswer,
  explanation = '',
  points = 1,
  alwaysShowExplanation = false,
  onStatusChange
}) {
  const { pairs = [] } = options || {};

  const [shuffledRight, setShuffledRight] = useState(() => shuffleArray(pairs.map(p => p.right)));
  // Matches хранится здесь для renderCorrectAnswer (после ответа)
  const [submittedMatches, setSubmittedMatches] = useState({});

  const [pairColors] = useState(() => assignColors(pairs.length));
  const [colorAssignment, setColorAssignment] = useState({});

  const reverseMatches = useMemo(() => {
    const map = {};
    for (const [leftId, rightId] of Object.entries(submittedMatches)) {
      map[rightId] = leftId;
    }
    return map;
  }, [submittedMatches]);

  const correctPairsHash = useMemo(() => {
    return pairs.map(p => `${hash(normalizeAnswer(p.left))}|${hash(normalizeAnswer(p.right))}`).join('||');
  }, [pairs]);

  const checkAnswer = useCallback((answer) => {
    return answer === correctAnswer;
  }, [correctAnswer]);

  const getPairColor = useCallback((leftId) => {
    const idx = colorAssignment[leftId];
    if (idx === undefined) return undefined;
    return pairColors[idx % pairColors.length];
  }, [colorAssignment, pairColors]);

  const getPairResults = useCallback(() => {
    return pairs.map(p => {
      const leftId = `left-${p.left}`;
      const matchedRightId = submittedMatches[leftId];
      const matchedRight = shuffledRight.find((_, idx) => `right-${idx}` === matchedRightId);
      const isCorrect = matchedRight && normalizeAnswer(matchedRight) === normalizeAnswer(p.right);
      return { leftId, matchedRightId, isCorrect };
    });
  }, [pairs, submittedMatches, shuffledRight]);

  const [inputKey, setInputKey] = useState(0);

  const renderAnswer = useCallback(({ onSubmit }) => {
    const handleInputSubmit = (userPairsHash) => {
      // Восстанавливаем matches из хэша, чтобы renderCorrectAnswer мог использовать
      // Парсим обратно из формата hash|hash||hash|hash
      // Проще: перехватываем submit и сохраняем matches до хэширования
      onSubmit(userPairsHash);
    };

    return (
      <MatchPairsInput
        key={inputKey}
        pairs={pairs}
        shuffledRight={shuffledRight}
        onSubmit={handleInputSubmit}
      />
    );
  }, [pairs, shuffledRight, inputKey]);

  const renderCorrectAnswer = useCallback(() => {
    return (
      <MatchPairsResult
        pairs={pairs}
        shuffledRight={shuffledRight}
        matches={submittedMatches}
        reverseMatches={reverseMatches}
        getPairColor={getPairColor}
        getPairResults={getPairResults}
      />
    );
  }, [pairs, shuffledRight, submittedMatches, reverseMatches, getPairColor, getPairResults]);

  const resetState = useCallback(() => {
    setSubmittedMatches({});
    setColorAssignment({});
    setShuffledRight(shuffleArray(pairs.map(p => p.right)));
    setInputKey(k => k + 1);
  }, [pairs]);

  return (
    <Quest
      id={id}
      question={question}
      correctAnswer={correctPairsHash}
      explanation={explanation}
      points={points}
      alwaysShowExplanation={alwaysShowExplanation}
      renderAnswer={renderAnswer}
      renderCorrectAnswer={renderCorrectAnswer}
      checkAnswer={checkAnswer}
      onStatusChange={onStatusChange}
      onReset={resetState}
    />
  );
}

export default memo(MatchPairs);
