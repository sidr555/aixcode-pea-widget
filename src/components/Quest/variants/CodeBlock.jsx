import { useState, useCallback, memo } from 'react';
import Quest from '../Quest';
import { hash } from '../../../utils/hash';
import { normalizeAnswer } from '../../../utils/normalize';
import styles from './variants.module.css';

/**
 * CodeBlock — блок с моноширинным шрифтом для ввода кода
 */
function CodeBlock({
  id,
  question,
  options,
  correctAnswer,
  explanation = '',
  points = 1,
  alwaysShowExplanation = false,
  onStatusChange
}) {
  const { placeholder = 'Введите код', language = 'javascript' } = options || {};
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

    return (
      <div className={styles.codeBlock}>
        <pre className={styles.codeWrapper}>
          <code>
            <textarea
              className={styles.codeTextarea}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              spellCheck={false}
            />
          </code>
        </pre>
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
      <pre className={styles.correctCode}>
        <code>{correctAnswer}</code>
      </pre>
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

export default memo(CodeBlock);
