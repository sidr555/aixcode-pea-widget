import { memo } from 'react';
import { useTest } from './TestContext';
import styles from './Test.module.css';

/**
 * Timer — компонент таймера для теста
 */
function Timer() {
  const { timer, state } = useTest();
  
  if (!timer || state.status === 'not_started') {
    return null;
  }

  const { formattedTime, isCountdown, isRunning, isFinished } = timer;

  return (
    <div className={`${styles.timer} ${isFinished ? styles.timerFinished : ''} ${isCountdown && timer.time <= 10 ? styles.timerWarning : ''}`}>
      <span className={styles.timerIcon}>
        {isCountdown ? '⏱' : '⏱'}
      </span>
      <span className={styles.timerValue}>
        {formattedTime}
      </span>
      {!isRunning && !isFinished && (
        <span className={styles.timerStatus}>пауза</span>
      )}
    </div>
  );
}

export default memo(Timer);
