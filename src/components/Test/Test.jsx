import { useMemo, Children, memo } from 'react';
import { TestProvider, useTest } from './TestContext';
import Timer from './Timer';
import Score from '../Score/Score';
import styles from './Test.module.css';

/**
 * TestContent — внутренний контент теста
 */
function TestContent({ children, title = 'Тестовый режим', showProgress = true }) {
  const {
    state,
    questions,
    results,
    showAnswers,
    showCorrectAnswers,
    finishTest,
    setShowAnswers
  } = useTest();

  const isFinished = state.status === 'finished';
  const isInProgress = state.status === 'in_progress' || state.status === 'not_started';

  // Count answered questions
  const answeredCount = questions.filter(q => q.answered).length;
  const totalCount = questions.length;

  // Show one question at a time during test, all questions when reviewing
  const childArray = Children.toArray(children);
  const currentIndex = answeredCount < totalCount ? answeredCount : totalCount - 1;

  return (
    <div className={styles.test}>
      {/* Заголовок с дробью */}
      {isInProgress && (
        <div className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          {totalCount > 0 && (
            <span className={styles.fraction}>{answeredCount}/{totalCount}</span>
          )}
        </div>
      )}

      {/* Прогресс и таймер */}
      {showProgress && state.status !== 'not_started' && (
        <div className={styles.header}>
          <div className={styles.progress}>
            <Score type="test" />
          </div>
          <Timer />
        </div>
      )}

      {/* Вопросы: один за раз во время теста, все при просмотре */}
      <div className={styles.questions}>
        {isInProgress
          ? childArray.map((child, i) => (
              <div key={i} style={i === currentIndex ? undefined : { display: 'none' }}>
                {child}
              </div>
            ))
          : children}
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

          {/* Кнопка показа/скрытия правильных ответов */}
          {showCorrectAnswers && (
            <button
              className={styles.showAnswersBtn}
              onClick={() => setShowAnswers(prev => !prev)}
              type="button"
            >
              {showAnswers ? 'Скрыть правильные ответы' : 'Показать правильные ответы'}
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
  title,
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
      <TestContent title={title} showProgress={showProgress}>
        {children}
      </TestContent>
    </TestProvider>
  );
}

export default memo(Test);
