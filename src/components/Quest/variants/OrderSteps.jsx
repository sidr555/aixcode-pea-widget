import { useState, useCallback, useMemo, memo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Quest from '../Quest';
import { hash, parseHashString } from '../../../utils/hash';
import styles from './variants.module.css';

/**
 * SortableItem — отдельный перетаскиваемый элемент
 */
function SortableItem({ id, item }) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.sortableItem} ${isDragging ? styles.dragging : ''}`}
      {...attributes}
      {...listeners}
    >
      <span className={styles.dragHandle}>☰</span>
      <span>{item.text}</span>
    </div>
  );
}

/**
 * OrderSteps — расставить шаги в правильном порядке
 */
function OrderSteps({
  id,
  question,
  options,
  correctAnswer,
  explanation = '',
  points = 1,
  alwaysShowExplanation = false,
  onStatusChange
}) {
  const { items = [] } = options || {};

  // Stable items with unique IDs
  const stableItems = useMemo(() => items.map((text, i) => ({ id: `s-${i}`, text })), [items]);

  const shuffle = useCallback((arr) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const [shuffledItems, setShuffledItems] = useState(() => shuffle(stableItems));

  const resetState = useCallback(() => {
    setShuffledItems(shuffle(stableItems));
  }, [stableItems, shuffle]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setShuffledItems((prev) => {
      const oldIndex = prev.findIndex(item => item.id === active.id);
      const newIndex = prev.findIndex(item => item.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const checkAnswer = useCallback((answer) => {
    return answer === correctAnswer;
  }, [correctAnswer]);

  const renderAnswer = useCallback(({ onSubmit }) => {
    const handleSubmit = () => {
      const answerHash = shuffledItems.map(item => hash(item.text)).join('|');
      onSubmit(answerHash);
    };

    return (
      <div className={styles.orderSteps}>
        <p className={styles.hint}>Перетащите элементы в правильном порядке:</p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={shuffledItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={styles.sortableList}>
              {shuffledItems.map((item) => (
                <SortableItem key={item.id} id={item.id} item={item} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          type="button"
        >
          Ответить
        </button>
      </div>
    );
  }, [shuffledItems, sensors, handleDragEnd]);

  const fullExplanation = useMemo(() => {
    const correctHashes = parseHashString(correctAnswer);
    const correctItems = correctHashes.map(h =>
      items.find(item => hash(item) === h)
    ).filter(Boolean);

    const chain = correctItems.join(' → ');
    return chain
      ? (explanation ? `${explanation}\n${chain}` : chain)
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

export default memo(OrderSteps);
