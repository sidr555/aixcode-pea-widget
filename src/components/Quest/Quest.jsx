import { useState, useCallback, useEffect, memo } from 'react';
import { QuestProvider } from './QuestContext.jsx';
import { useQuestStorage } from '../../hooks/useLocalStorage';
import { useTestQuestion } from '../Test/TestContext';
import styles from './Quest.module.css';

/**
 * Базовый компонент вопроса
 * Все наследники используют этот компонент как обёртку
 */
function Quest({
  id,
  question,
  correctAnswer,
  explanation = '',
  points = 1,
  alwaysShowExplanation = false,
  children,
  renderAnswer,        // Функция рендеринга вариантов ответа
  checkAnswer,         // Функция проверки ответа
  onStatusChange,      // Callback при изменении статуса (из теста)
  onReset              // Callback для сброса внутреннего состояния варианта
}) {
  const { state, setAnswer, reset } = useQuestStorage(id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  // Интеграция с тестом
  const { isInTest, showAnswers, onStatusChange: testOnStatusChange } = useTestQuestion(id, points);

  // Восстановление состояния при монтировании
  useEffect(() => {
    if (state.status !== 'unanswered' && state.answer) {
      setUserAnswer(state.answer);
    }
  }, []);

  // Раскрываем вопрос при старте
  useEffect(() => {
    if (state.status === 'unanswered') {
      setIsExpanded(true);
    }
  }, [state.status]);

  const handleSubmit = useCallback((answer) => {
    const isCorrect = checkAnswer ? checkAnswer(answer) : answer === correctAnswer;
    const earnedPoints = isCorrect ? points : 0;
    
    setAnswer(answer, isCorrect ? 'correct' : 'incorrect', earnedPoints);
    setUserAnswer(answer);
    setIsExpanded(false);
    
    // Уведомляем тест
    if (isInTest) {
      testOnStatusChange(isCorrect ? 'correct' : 'incorrect', earnedPoints);
    }
    
    // Внешний callback
    onStatusChange?.(isCorrect ? 'correct' : 'incorrect', earnedPoints);
  }, [checkAnswer, correctAnswer, points, setAnswer, isInTest, testOnStatusChange, onStatusChange]);

  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleReset = useCallback(() => {
    reset();
    setUserAnswer(null);
    setIsExpanded(true);
    setResetKey(k => k + 1);
    onReset?.();
    onStatusChange?.('unanswered', 0);
  }, [reset, onReset, onStatusChange]);

  return (
    <QuestProvider 
      id={id} 
      points={points} 
      correctAnswer={correctAnswer}
      onAnswer={handleSubmit}
    >
      <div className={styles.quest} data-status={state.status}>
        {/* Заголовок с иконкой */}
        <button 
          className={styles.header}
          onClick={handleToggle}
          type="button"
        >
          <span className={styles.icon}>
            {state.status === 'unanswered' && '?'}
            {state.status === 'correct' && '✓'}
            {state.status === 'incorrect' && '✗'}
          </span>
          <span className={styles.question}>{question}</span>
          <span className={styles.points}>{points} баллов</span>
        </button>

        {/* Развёрнутый блок с вариантами */}
        {isExpanded && state.status === 'unanswered' && (
          <div className={styles.content}>
            {renderAnswer?.({ onSubmit: handleSubmit, userAnswer, setUserAnswer, resetKey }) || children}
          </div>
        )}

        {/* Подсказка при неверном ответе или при showAnswers */}
        {(state.status === 'incorrect' || (showAnswers && state.status !== 'unanswered')) && (isExpanded || showAnswers) && explanation && (
          <div className={styles.content}>
            <div className={styles.explanation}>
              {explanation}
            </div>
          </div>
        )}

        {/* Кнопка сброса для отвеченных (только вне теста) */}
        {state.status !== 'unanswered' && !isInTest && (
          <button 
            className={styles.resetBtn}
            onClick={handleReset}
            type="button"
          >
            Сбросить ответ
          </button>
        )}
      </div>
    </QuestProvider>
  );
}

export default memo(Quest);
