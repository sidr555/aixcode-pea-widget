import { useMemo, memo } from 'react';
import { TestProvider, useTest } from './TestContext';
import Timer from './Timer';
import Score from '../Score/Score';
import styles from './Test.module.css';

/**
 * TestContent — внутренний контент теста
 */
function TestContent({ children, showProgress = true }) {
  const { 
    state, 
    results, 
    showAnswers, 
    showCorrectAnswers,
    finishTest, 
    setShowAnswers 
  } = useTest();

  const isFinished = state.status === 'finished';

  return (
    <div className={styles.test}>
      {/* Прогресс и таймер */}
      {showProgress && state.status !== 'not_started' && (
        <div className={styles.header}>
          <div className={styles.progress}>
            <Score type="test" />
          </div>
          <Timer />
        </div>
      )}

      {/* Вопросы */}
      <div className={styles.questions}>
        {children}
      </div>

      {/* Результаты */}
      {isFinished && (
        <div className={styles.results}>
          <div className={styles.resultHeader}>
            <h3>Результаты теста</h3>
            <div className={styles.percentage}>
              {results.percentage}%
            </div>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Правильных ответов:</span>
              <span className={styles.statValue}>{results.correctQuestions} из {results.totalQuestions}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Набрано баллов:</span>
              <span className={styles.statValue}>{results.totalScore} из {results.maxScore}</span>
            </div>
          </div>

          {/* Кнопка показа правильных ответов */}
          {showCorrectAnswers && !showAnswers && (
            <button 
              className={styles.showAnswersBtn}
              onClick={() => setShowAnswers(true)}
              type="button"
            >
              Показать правильные ответы
            </button>
          )}
        </div>
      )}

      {/* Кнопка завершения (если не все отвечены) */}
      {state.status === 'in_progress' && !isFinished && (
        <button 
          className={styles.finishBtn}
          onClick={finishTest}
          type="button"
        >
          Завершить тест
        </button>
      )}
    </div>
  );
}

/**
 * Test — обёртка для теста
 */
function Test({ 
  id, 
  limit = null, 
  showCorrectAnswers = true,
  showProgress = true,
  onTimeUp,
  onFinish,
  children 
}) {
  return (
    <TestProvider 
      id={id} 
      limit={limit}
      showCorrectAnswers={showCorrectAnswers}
      onTimeUp={onTimeUp}
      onFinish={onFinish}
    >
      <TestContent showProgress={showProgress}>
        {children}
      </TestContent>
    </TestProvider>
  );
}

export default memo(Test);
