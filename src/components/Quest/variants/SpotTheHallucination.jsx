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
  const [showResult, setShowResult] = useState(false);

  // Восстановление состояния
  useEffect(() => {
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
  }, [id]);

  const handleToggle = useCallback((index) => {
    setSelectedIndices(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
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
              isSelected={selectedIndices.includes(token.index)}
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
  }, [tokens, selectedIndices, handleToggle]);

  const renderCorrectAnswer = useCallback(() => {
    return (
      <div className={styles.hallucination}>
        <p className={styles.hint}>Правильные ответы:</p>
        <div className={styles.textContainer}>
          {tokens.map((token) => (
            <WordToken
              key={token.index}
              token={token}
              isSelected={selectedIndices.includes(token.index)}
              onToggle={() => {}}
              showCorrect={true}
              isCorrect={correctIndices.includes(token.index)}
            />
          ))}
        </div>
        <div className={styles.legend}>
          <span className={styles.correctLegend}>Зелёным</span> — слова-галлюцинации
          {selectedIndices.some(i => !correctIndices.includes(i)) && (
            <>, <span className={styles.incorrectLegend}>красным</span> — ошибочно отмеченные</>
          )}
        </div>
      </div>
    );
  }, [tokens, selectedIndices, correctIndices]);

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
    />
  );
}

export default memo(SpotTheHallucination);
