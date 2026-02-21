import { useState, useCallback, memo, useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Quest from '../Quest';
import { hash } from '../../../utils/hash';
import { normalizeAnswer } from '../../../utils/normalize';
import styles from './variants.module.css';

/**
 * DraggableItem — перетаскиваемый элемент (левая колонка)
 */
function DraggableItem({ id, item, isMatched }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isMatched ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.matchItem} ${isMatched ? styles.matched : ''} ${isDragging ? styles.dragging : ''}`}
      {...attributes}
      {...listeners}
    >
      {item}
    </div>
  );
}

/**
 * DropZone — зона для сброса (правая колонка)
 */
function DropZone({ id, item, matchedWith, onDrop, isOver }) {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dragId = e.dataTransfer.getData('text/plain');
    onDrop(dragId, id);
  };

  return (
    <div
      className={`${styles.dropZone} ${matchedWith ? styles.hasMatch : ''} ${isOver ? styles.dragOver : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-drop-id={id}
    >
      <span className={styles.dropItemText}>{item}</span>
      {matchedWith && <span className={styles.matchIndicator}>✓</span>}
    </div>
  );
}

/**
 * MatchPairs — соединить пары (термин ↔ определение)
 */
function MatchPairs({
  id,
  question,
  options,
  correctAnswer,
  explanation = '',
  points = 1,
  alwaysShowExplanation = false,
  onStatusChange
}) {
  const { pairs = [] } = options || {};
  
  // Перемешиваем правую колонку
  const [shuffledRight] = useState(() => {
    const rightItems = pairs.map(p => p.right);
    const shuffled = [...rightItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const [matches, setMatches] = useState({}); // { leftId: rightId }
  const [draggingId, setDraggingId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  // Хэш правильных пар для сравнения
  const correctPairsHash = useMemo(() => {
    return pairs.map(p => `${hash(normalizeAnswer(p.left))}|${hash(normalizeAnswer(p.right))}`).join('||');
  }, [pairs]);

  const handleDragStart = useCallback((event) => {
    setDraggingId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setDraggingId(null);

    if (over) {
      setMatches(prev => ({
        ...prev,
        [active.id]: over.id
      }));
    }
  }, []);

  const handleNativeDragStart = useCallback((e, leftId) => {
    e.dataTransfer.setData('text/plain', leftId);
    setDraggingId(leftId);
  }, []);

  const handleNativeDrop = useCallback((leftId, rightId) => {
    setMatches(prev => ({
      ...prev,
      [leftId]: rightId
    }));
    setDraggingId(null);
  }, []);

  const checkAnswer = useCallback((answer) => {
    return answer === correctAnswer;
  }, [correctAnswer]);

  const renderAnswer = useCallback(({ onSubmit }) => {
    const handleSubmit = () => {
      // Формируем хэш ответа пользователя
      const userPairsHash = pairs.map(p => {
        const leftId = `left-${p.left}`;
        const matchedRightId = matches[leftId];
        const matchedRight = shuffledRight.find((_, idx) => `right-${idx}` === matchedRightId);
        return `${hash(normalizeAnswer(p.left))}|${hash(normalizeAnswer(matchedRight || ''))}`;
      }).join('||');
      
      onSubmit(userPairsHash);
    };

    const allMatched = Object.keys(matches).length === pairs.length;

    return (
      <div className={styles.matchPairs}>
        <p className={styles.hint}>Перетащите термины к соответствующим определениям:</p>
        
        <div className={styles.matchContainer}>
          {/* Левая колонка - термины */}
          <div className={styles.matchColumn}>
            {pairs.map((pair, idx) => {
              const leftId = `left-${pair.left}`;
              const isMatched = !!matches[leftId];
              return (
                <div
                  key={leftId}
                  draggable
                  onDragStart={(e) => handleNativeDragStart(e, leftId)}
                  className={`${styles.matchItem} ${isMatched ? styles.matched : ''} ${draggingId === leftId ? styles.dragging : ''}`}
                >
                  {pair.left}
                </div>
              );
            })}
          </div>

          {/* Правая колонка - определения */}
          <div className={styles.matchColumn}>
            {shuffledRight.map((item, idx) => {
              const rightId = `right-${idx}`;
              const matchedWith = Object.entries(matches).find(([_, rId]) => rId === rightId)?.[0];
              return (
                <div
                  key={rightId}
                  className={`${styles.dropZone} ${matchedWith ? styles.hasMatch : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const leftId = e.dataTransfer.getData('text/plain');
                    handleNativeDrop(leftId, rightId);
                  }}
                >
                  <span>{item}</span>
                  {matchedWith && <span className={styles.matchIndicator}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={!allMatched}
          type="button"
        >
          Ответить
        </button>
      </div>
    );
  }, [pairs, shuffledRight, matches, draggingId, handleNativeDragStart, handleNativeDrop]);

  const renderCorrectAnswer = useCallback(() => {
    return (
      <div className={styles.correctPairs}>
        {pairs.map((pair, idx) => (
          <div key={idx} className={styles.correctPair}>
            <span className={styles.pairLeft}>{pair.left}</span>
            <span className={styles.pairArrow}>→</span>
            <span className={styles.pairRight}>{pair.right}</span>
          </div>
        ))}
      </div>
    );
  }, [pairs]);

  return (
    <Quest
      id={id}
      question={question}
      correctAnswer={correctPairsHash}
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

export default memo(MatchPairs);
