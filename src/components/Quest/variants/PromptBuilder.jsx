import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import Quest from '../Quest';
import { hash, parseHashString } from '../../../utils/hash';
import styles from './variants.module.css';

/**
 * PromptBuilder — построение промпта из блоков
 */
function PromptBuilder({
  id,
  question,
  options,
  correctAnswer,
  explanation = '',
  points = 1,
  alwaysShowExplanation = false,
  onStatusChange
}) {
  const { blocks = [] } = options || {};
  const textareaRef = useRef(null);
  
  // Перемешиваем блоки при первом рендере
  const [shuffledBlocks] = useState(() => {
    const shuffled = [...blocks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  // Состояние: какие блоки вставлены и в каком порядке
  const [insertedBlocks, setInsertedBlocks] = useState([]);
  const [textareaValue, setTextareaValue] = useState('');

  const resetState = useCallback(() => {
    setInsertedBlocks([]);
    setTextareaValue('');
  }, []);

  // Синхронизация textarea и insertedBlocks
  useEffect(() => {
    // При изменении textarea проверяем, какие блоки ещё есть в тексте
    const remainingBlocks = insertedBlocks.filter(block => 
      textareaValue.includes(block)
    );
    
    if (remainingBlocks.length !== insertedBlocks.length) {
      setInsertedBlocks(remainingBlocks);
    }
  }, [textareaValue, insertedBlocks]);

  const handleBlockClick = useCallback((block) => {
    const isInserted = insertedBlocks.includes(block);
    
    if (isInserted) {
      // Удаляем блок из textarea и из списка
      const newValue = textareaValue.replace(`\n\n${block}`, '').replace(`${block}\n\n`, '').replace(block, '');
      setTextareaValue(newValue);
      setInsertedBlocks(prev => prev.filter(b => b !== block));
    } else {
      // Добавляем блок в конец textarea
      const separator = textareaValue && !textareaValue.endsWith('\n\n') ? '\n\n' : '';
      const newValue = textareaValue + separator + block;
      setTextareaValue(newValue);
      setInsertedBlocks(prev => [...prev, block]);
    }
  }, [insertedBlocks, textareaValue]);

  const checkAnswer = useCallback((answer) => {
    // answer — это хэш-строка с порядком блоков
    return answer === correctAnswer;
  }, [correctAnswer]);

  const renderAnswer = useCallback(({ onSubmit }) => {
    const handleSubmit = () => {
      // Формируем хэш из порядка вставленных блоков
      const answerHash = insertedBlocks.map(b => hash(b)).join('|');
      onSubmit(answerHash);
    };

    return (
      <div className={styles.promptBuilder}>
        <p className={styles.hint}>
          Кликните на блоки в правильном порядке для построения промпта:
        </p>

        <div className={styles.promptContainer}>
          {/* Textarea для результата */}
          <div className={styles.textareaWrapper}>
            <textarea
              ref={textareaRef}
              className={styles.promptTextarea}
              placeholder="Ваш промпт будет здесь..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              rows={8}
            />
          </div>

          {/* Блоки для вставки */}
          <div className={styles.blocksContainer}>
            <p className={styles.blocksLabel}>Доступные блоки:</p>
            <div className={styles.blocksList}>
              {shuffledBlocks.map((block, idx) => {
                const isInserted = insertedBlocks.includes(block);
                return (
                  <button
                    key={idx}
                    className={`${styles.blockButton} ${isInserted ? styles.blockInserted : ''}`}
                    onClick={() => handleBlockClick(block)}
                    type="button"
                  >
                    {isInserted && <span className={styles.blockCheck}>✓</span>}
                    {block}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.promptInfo}>
          Вставлено блоков: {insertedBlocks.length} из {blocks.length}
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={insertedBlocks.length === 0}
          type="button"
        >
          Ответить
        </button>
      </div>
    );
  }, [shuffledBlocks, insertedBlocks, textareaValue, blocks.length, handleBlockClick]);

  // Build explanation with correct block chain appended
  const fullExplanation = useMemo(() => {
    const correctHashes = parseHashString(correctAnswer);
    const correctBlocks = correctHashes.map(hashStr =>
      blocks.find(block => hash(block) === hashStr)
    ).filter(Boolean);

    const chain = correctBlocks.join(' → ');
    return chain
      ? (explanation ? `${explanation}\n${chain}` : chain)
      : explanation;
  }, [correctAnswer, blocks, explanation]);

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

export default memo(PromptBuilder);
