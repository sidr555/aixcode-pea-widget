import { memo, useMemo } from 'react';
import { useTest } from '../Test/TestContext';
import { useQuestStorage } from '../../hooks/useLocalStorage';
import styles from './Score.module.css';

/**
 * Score — универсальный компонент счётчика
 * @param {string} type - 'question' | 'test' | 'article'
 * @param {string} targetId - ID вопроса/теста (для question)
 */
function Score({ type = 'test', targetId }) {
  const test = useTest();

  // Для теста используем контекст
  if (type === 'test' && test) {
    const { results, state } = test;
    
    if (state.status === 'not_started') {
      return (
        <div className={styles.score}>
          <span className={styles.label}>Вопросов: {results.totalQuestions}</span>
        </div>
      );
    }

    return (
      <div className={styles.score}>
        <div className={styles.progress}>
          <div 
            className={styles.progressBar}
            style={{ width: `${results.percentage}%` }}
          />
        </div>
        <div className={styles.stats}>
          <span className={styles.correct}>{results.correctQuestions}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.total}>{results.totalQuestions}</span>
        </div>
        <span className={styles.percentage}>{results.percentage}%</span>
      </div>
    );
  }

  // Для отдельного вопроса
  if (type === 'question' && targetId) {
    return <QuestionScore questId={targetId} />;
  }

  return null;
}

/**
 * QuestionScore — счётчик для отдельного вопроса
 */
function QuestionScore({ questId }) {
  const { state } = useQuestStorage(questId);

  const statusClass = useMemo(() => {
    switch (state.status) {
      case 'correct': return styles.statusCorrect;
      case 'incorrect': return styles.statusIncorrect;
      default: return styles.statusPending;
    }
  }, [state.status]);

  return (
    <div className={`${styles.questionScore} ${statusClass}`}>
      {state.status === 'correct' && (
        <span>+{state.score} баллов</span>
      )}
      {state.status === 'incorrect' && (
        <span>0 баллов</span>
      )}
      {state.status === 'unanswered' && (
        <span>Не отвечено</span>
      )}
    </div>
  );
}

export default memo(Score);
