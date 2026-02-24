import { useState, useCallback, useMemo, memo } from 'react';
import Quest from '../Quest';
import { hash, parseHashString } from '../../../utils/hash';
import styles from './variants.module.css';

/**
 * MultipleChoice — выбор одного или нескольких правильных ответов
 */
function MultipleChoice({
  id,
  question,
  options,
  correctAnswer,
  explanation = '',
  points = 1,
  alwaysShowExplanation = false,
  onStatusChange
}) {
  const { multiple = false, items = [] } = options || {};
  const [selected, setSelected] = useState([]);

  const resetState = useCallback(() => {
    setSelected([]);
  }, []);

  const checkAnswer = useCallback((answer) => {
    if (multiple) {
      const correctParts = parseHashString(correctAnswer).sort();
      const answerParts = parseHashString(answer).sort();
      return correctParts.join('|') === answerParts.join('|');
    }
    return answer === correctAnswer;
  }, [correctAnswer, multiple]);

  const handleToggle = useCallback((item) => {
    setSelected(prev => {
      if (multiple) {
        return prev.includes(item)
          ? prev.filter(i => i !== item)
          : [...prev, item];
      }
      return [item];
    });
  }, [multiple]);

  const renderAnswer = useCallback(({ onSubmit }) => {
    const handleSubmit = () => {
      const answerHash = multiple
        ? selected.map(s => hash(s)).join('|')
        : hash(selected[0] || '');
      onSubmit(answerHash);
    };

    return (
      <div className={styles.multipleChoice}>
        <div className={styles.options}>
          {items.map((item, idx) => (
            <label key={idx} className={styles.checkboxLabel}>
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={`quest-${id}`}
                checked={selected.includes(item)}
                onChange={() => handleToggle(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={selected.length === 0}
          type="button"
        >
          Ответить
        </button>
      </div>
    );
  }, [id, items, multiple, selected, handleToggle]);

  const fullExplanation = useMemo(() => {
    const correctHashes = parseHashString(correctAnswer);
    const correctItems = items.filter(item =>
      correctHashes.includes(hash(item))
    );
    const label = correctItems.join(', ');
    return label
      ? (explanation ? `${explanation}\n${label}` : label)
      : explanation;
  }, [correctAnswer, items, explanation]);

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

export default memo(MultipleChoice);
