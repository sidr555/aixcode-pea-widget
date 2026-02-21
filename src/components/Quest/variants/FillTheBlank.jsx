import { useState, useCallback, memo } from 'react';
import Quest from '../Quest';
import { hash } from '../../../utils/hash';
import { normalizeAnswer } from '../../../utils/normalize';
import styles from './variants.module.css';

/**
 * FillTheBlank — вставить пропущенное слово
 */
function FillTheBlank({
  id,
  question,
  options,
  correctAnswer,
  explanation = '',
  points = 1,
  alwaysShowExplanation = false,
  onStatusChange
}) {
  const { placeholder = 'Введите ответ' } = options || {};
  const [value, setValue] = useState('');

  const checkAnswer = useCallback((answer) => {
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    const normalizedUser = normalizeAnswer(answer);
    return hash(normalizedUser) === hash(normalizedCorrect);
  }, [correctAnswer]);

  const renderAnswer = useCallback(({ onSubmit }) => {
    const handleSubmit = () => {
      const answerHash = hash(normalizeAnswer(value));
      onSubmit(answerHash);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && value.trim()) {
        handleSubmit();
      }
    };

    return (
      <div className={styles.fillTheBlank}>
        <input
          type="text"
          className={styles.textInput}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!value.trim()}
          type="button"
        >
          Ответить
        </button>
      </div>
    );
  }, [placeholder, value]);

  const renderCorrectAnswer = useCallback(() => {
    return (
      <p className={styles.correctText}>
        {correctAnswer}
      </p>
    );
  }, [correctAnswer]);

  return (
    <Quest
      id={id}
      question={question}
      correctAnswer={hash(normalizeAnswer(correctAnswer))}
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

export default memo(FillTheBlank);
