import { useState, useCallback, useMemo, memo } from 'react';
import Quest from '../Quest';
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

  const resetState = useCallback(() => {
    setValue('');
  }, []);

  const checkAnswer = useCallback((answer) => {
    return normalizeAnswer(answer) === normalizeAnswer(correctAnswer);
  }, [correctAnswer]);

  const renderAnswer = useCallback(({ onSubmit }) => {
    const handleSubmit = () => {
      onSubmit(value);
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

  const fullExplanation = useMemo(() => {
    return explanation ? `${explanation}\n${correctAnswer}` : correctAnswer;
  }, [explanation, correctAnswer]);

  return (
    <Quest
      id={id}
      question={question}
      correctAnswer={correctAnswer}
      explanation={fullExplanation}
      points={points}
      alwaysShowExplanation={alwaysShowExplanation}
      renderAnswer={renderAnswer}
      checkAnswer={checkAnswer}
      onStatusChange={onStatusChange}
      onReset={resetState}
    />
  );
}

export default memo(FillTheBlank);
