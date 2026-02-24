import { useState, useCallback, memo } from 'react';
import Quest from '../Quest';
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

  return (
    <Quest
      id={id}
      question={question}
      correctAnswer={correctAnswer}
      explanation={explanation}
      points={points}
      alwaysShowExplanation={alwaysShowExplanation}
      renderAnswer={renderAnswer}
      checkAnswer={checkAnswer}
      onStatusChange={onStatusChange}
      onReset={resetState}
    />
  );
}

export default memo(CodeBlock);
