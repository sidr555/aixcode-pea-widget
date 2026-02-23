import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_PREFIX = 'quest_';

/**
 * Хук для синхронизации состояния с localStorage
 */
export function useLocalStorage(key, initialValue) {
  const fullKey = STORAGE_PREFIX + key;
  
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return initialValue;
      }
      const item = window.localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${fullKey}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(fullKey, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${fullKey}":`, error);
    }
  }, [fullKey]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(fullKey);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${fullKey}":`, error);
    }
  }, [fullKey, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Хук для хранения состояния вопроса
 */
export function useQuestStorage(questId) {
  const key = `q_${questId}`;
  
  const [state, setState] = useLocalStorage(key, {
    status: 'unanswered', // unanswered | correct | incorrect
    answer: null,
    score: 0,
    timestamp: null
  });

  const setAnswer = useCallback((answer, status, score = 0) => {
    setState({
      status,
      answer,
      score,
      timestamp: Date.now()
    });
  }, [setState]);

  const reset = useCallback(() => {
    setState({
      status: 'unanswered',
      answer: null,
      score: 0,
      timestamp: null
    });
  }, [setState]);

  return {
    state,
    setAnswer,
    reset
  };
}

/**
 * Хук для хранения состояния теста
 */
export function useTestStorage(testId) {
  const key = `t_${testId}`;
  
  const [state, setState] = useLocalStorage(key, {
    status: 'not_started', // not_started | in_progress | finished
    startedAt: null,
    finishedAt: null,
    totalScore: 0,
    maxScore: 0,
    correctCount: 0,
    incorrectCount: 0
  });

  const start = useCallback((maxScore = 0) => {
    setState(prev => ({
      ...prev,
      status: 'in_progress',
      startedAt: Date.now(),
      maxScore
    }));
  }, [setState]);

  const updateScore = useCallback((scoreDelta, isCorrect) => {
    setState(prev => ({
      ...prev,
      totalScore: prev.totalScore + scoreDelta,
      correctCount: prev.correctCount + (isCorrect ? 1 : 0),
      incorrectCount: prev.incorrectCount + (isCorrect ? 0 : 1)
    }));
  }, [setState]);

  const finish = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'finished',
      finishedAt: Date.now()
    }));
  }, [setState]);

  const reset = useCallback(() => {
    setState({
      status: 'not_started',
      startedAt: null,
      finishedAt: null,
      totalScore: 0,
      maxScore: 0,
      correctCount: 0,
      incorrectCount: 0
    });
  }, [setState]);

  return {
    state,
    start,
    updateScore,
    finish,
    reset
  };
}

/**
 * Хук для чтения/записи сеансов профиля
 * Формат: [{ articleId, wordCount, date (ISO), timestamp }]
 */
export function useProfileSessions(profileId) {
  const key = profileId ? `sessions_${profileId}` : null;
  const [sessions, setSessions, removeSessions] = useLocalStorage(key, []);

  const addSession = useCallback((articleId, wordCount) => {
    const now = new Date();
    setSessions(prev => [...prev, {
      articleId,
      wordCount,
      date: now.toISOString().slice(0, 10),
      timestamp: now.getTime(),
    }]);
  }, [setSessions]);

  return { sessions: key ? sessions : [], addSession, setSessions, removeSessions };
}
