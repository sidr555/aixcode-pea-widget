import { useState, useCallback, useMemo, memo } from 'react';
import Quest from '../Quest';
import { hash } from '../../../utils/hash';
import styles from './variants.module.css';

/**
 * TrueFalse — вопрос верно/неверно
 */
function TrueFalse({
  id,
  question,
  correctAnswer,
  explanation = '',
  points = 1,
  alwaysShowExplanation = false,
  onStatusChange
}) {
  const [selected, setSelected] = useState(null);

  const resetState = useCallback(() => {
    setSelected(null);
  }, []);

  const normalizedCorrect = correctAnswer === 'true' || correctAnswer === true
    ? hash('true')
    : correctAnswer === 'false' || correctAnswer === false
      ? hash('false')
      : correctAnswer;

  const checkAnswer = useCallback((answer) => {
    return answer === normalizedCorrect;
  }, [normalizedCorrect]);

  const handleSelect = useCallback((value) => {
    setSelected(value);
  }, []);

  const renderAnswer = useCallback(({ onSubmit }) => {
    const handleSubmit = () => {
      const answerHash = hash(selected);
      onSubmit(answerHash);
    };

    return (
      <div className={styles.trueFalse}>
        <div className={styles.options}>
          <button
            className={`${styles.option} ${selected === 'true' ? styles.selected : ''}`}
            onClick={() => handleSelect('true')}
            type="button"
          >
            ✓ Верно
          </button>
          <button
            className={`${styles.option} ${selected === 'false' ? styles.selected : ''}`}
            onClick={() => handleSelect('false')}
            type="button"
          >
            ✗ Неверно
          </button>
        </div>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!selected}
          type="button"
        >
          Ответить
        </button>
      </div>
    );
  }, [selected, handleSelect]);

  const fullExplanation = useMemo(() => {
    const isTrue = normalizedCorrect === hash('true');
    const label = isTrue ? 'Верно' : 'Неверно';
    return explanation ? `${explanation}\n${label}` : label;
  }, [normalizedCorrect, explanation]);

  return (
    <Quest
      id={id}
      question={question}
      correctAnswer={normalizedCorrect}
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

export default memo(TrueFalse);
