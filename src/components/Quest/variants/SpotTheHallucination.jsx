import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import Quest from '../Quest';
import { tokenizeAll, getSignificantIndices, compareIndices } from '../../../utils/normalize';
import { parseHashString } from '../../../utils/hash';
import styles from './variants.module.css';

/**
 * WordToken — отдельное слово в тексте
 */
function WordToken({ token, isSelected, onToggle, showCorrect, isCorrect }) {
  const handleClick = () => {
    if (!showCorrect) {
      onToggle(token.index);
    }
  };

  let className = styles.wordToken;
  if (isSelected) className += ` ${styles.selectedWord}`;
  if (showCorrect && isCorrect) className += ` ${styles.correctWord}`;
  if (showCorrect && isSelected && !isCorrect) className += ` ${styles.incorrectWord}`;

  return (
    <span
      className={className}
      onClick={handleClick}
      style={{ cursor: showCorrect ? 'default' : 'pointer' }}
    >
      {token.text}
    </span>
  );
}

/**
 * SpotTheHallucination — найти слова-галлюцинации в тексте
 */
function SpotTheHallucination({
  id,
  question,
  options,
  correctAnswer,
  explanation = '',
  points = 1,
  alwaysShowExplanation = false,
  onStatusChange
}) {
  const { text = '' } = options || {};
  
  // Токенизируем текст
  const tokens = useMemo(() => tokenizeAll(text), [text]);
  
  // Парсим правильные индексы из хэш-строки
  const correctIndices = useMemo(() => {
    return parseHashString(correctAnswer).map(h => parseInt(h, 10));
  }, [correctAnswer]);

  const [selectedIndices, setSelectedIndices] = useState([]);
  const selectedSet = useMemo(() => new Set(selectedIndices), [selectedIndices]);
  const correctSet = useMemo(() => new Set(correctIndices), [correctIndices]);
  const [showResult, setShowResult] = useState(false);

  const resetState = useCallback(() => {
    setSelectedIndices([]);
    setShowResult(false);
  }, []);

  // Восстановление состояния
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem(`quest_q_${id}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.answer) {
            setSelectedIndices(parseHashString(data.answer).map(h => parseInt(h, 10)));
            setShowResult(data.status !== 'unanswered');
          }
        } catch (e) {}
      }
    }
  }, [id]);

  const handleToggle = useCallback((index) => {
    setSelectedIndices(prev => {
      const set = new Set(prev);
      if (set.has(index)) {
        set.delete(index);
      } else {
        set.add(index);
      }
      return [...set];
    });
  }, []);

  const checkAnswer = useCallback((answer) => {
    const userIndices = parseHashString(answer).map(h => parseInt(h, 10));
    const userSignificant = getSignificantIndices(userIndices, tokens);
    const correctSignificant = getSignificantIndices(correctIndices, tokens);
    return compareIndices(userSignificant, correctSignificant);
  }, [correctIndices, tokens]);

  const renderAnswer = useCallback(({ onSubmit }) => {
    const handleSubmit = () => {
      // Сохраняем только значимые индексы как хэш
      const significant = getSignificantIndices(selectedIndices, tokens);
      const answerHash = significant.join('|');
      onSubmit(answerHash);
      setShowResult(true);
    };

    return (
      <div className={styles.hallucination}>
        <p className={styles.hint}>
          Найдите слова-галлюцинации в тексте. Кликните на слово, чтобы отметить его:
        </p>
        
        <div className={styles.textContainer}>
          {tokens.map((token) => (
            <WordToken
              key={token.index}
              token={token}
              isSelected={selectedSet.has(token.index)}
              onToggle={handleToggle}
              showCorrect={false}
              isCorrect={false}
            />
          ))}
        </div>

        <div className={styles.selectionInfo}>
          Выбрано слов: {selectedIndices.length}
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          type="button"
        >
          Завершить
        </button>
      </div>
    );
  }, [tokens, selectedIndices, selectedSet, handleToggle]);

  const renderCorrectAnswer = useCallback(() => {
    return (
      <div className={styles.hallucination}>
        <p className={styles.hint}>Правильные ответы:</p>
        <div className={styles.textContainer}>
          {tokens.map((token) => (
            <WordToken
              key={token.index}
              token={token}
              isSelected={selectedSet.has(token.index)}
              onToggle={() => {}}
              showCorrect={true}
              isCorrect={correctSet.has(token.index)}
            />
          ))}
        </div>
        <div className={styles.legend}>
          <span className={styles.correctLegend}>Зелёным</span> — слова-галлюцинации
          {selectedIndices.some(i => !correctSet.has(i)) && (
            <>, <span className={styles.incorrectLegend}>красным</span> — ошибочно отмеченные</>
          )}
        </div>
      </div>
    );
  }, [tokens, selectedIndices, selectedSet, correctSet]);

  return (
    <Quest
      id={id}
      question={question}
      correctAnswer={correctAnswer}
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

export default memo(SpotTheHallucination);
