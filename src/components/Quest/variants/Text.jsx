import { useState, useCallback, memo } from 'react';
import Quest from '../Quest';
import { hash } from '../../../utils/hash';
import { normalizeAnswer } from '../../../utils/normalize';
import styles from './variants.module.css';

/**
 * Text — текстовое поле для ввода ответа
 */
function Text({
  id,
  question,
  options,
  correctAnswer,
  explanation = '',
  points = 1,
  alwaysShowExplanation = false,
  onStatusChange
}) {
  const { placeholder = 'Введите ответ', rows = 3 } = options || {};
  const [value, setValue] = useState('');

  const resetState = useCallback(() => {
    setValue('');
  }, []);

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

    return (
      <div className={styles.text}>
        <textarea
          className={styles.textarea}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={rows}
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
  }, [placeholder, rows, value]);

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
      onReset={resetState}
    />
  );
}

export default memo(Text);
