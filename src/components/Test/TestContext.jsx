import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useTestStorage } from '../../hooks/useLocalStorage';
import { useTimer } from '../../hooks/useTimer';

const TestContext = createContext(null);

/**
 * Провайдер контекста теста
 */
export function TestProvider({ 
  children, 
  id, 
  limit = null,
  showCorrectAnswers = true,
  onTimeUp,
  onFinish
}) {
  const { state, start, updateScore, finish, reset } = useTestStorage(id);
  
  const [questions, setQuestions] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);

  // Таймер
  const timer = useTimer(limit, () => {
    // Время вышло - завершаем тест
    handleFinishTest();
    onTimeUp?.();
  });

  // Регистрация вопроса в тесте
  const registerQuestion = useCallback((questionId, maxPoints) => {
    setQuestions(prev => {
      if (prev.find(q => q.id === questionId)) return prev;
      return [...prev, { id: questionId, maxPoints, answered: false, correct: false, score: 0 }];
    });
  }, []);

  // Обновление статуса вопроса
  const updateQuestionStatus = useCallback((questionId, status, score) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, answered: true, correct: status === 'correct', score }
        : q
    ));

    // Обновляем общий счёт
    const isCorrect = status === 'correct';
    updateScore(score, isCorrect);
  }, [updateScore]);

  // Запуск теста при первом ответе
  const startTestIfNeeded = useCallback(() => {
    if (state.status === 'not_started') {
      const maxScore = questions.reduce((sum, q) => sum + q.maxPoints, 0);
      start(maxScore);
      timer.start();
    }
  }, [state.status, questions, start, timer]);

  // Завершение теста
  const handleFinishTest = useCallback(() => {
    timer.stop();
    finish();
    onFinish?.(state);
  }, [timer, finish, onFinish, state]);

  // Проверка, все ли вопросы отвечены
  const allAnswered = useMemo(() => {
    return questions.length > 0 && questions.every(q => q.answered);
  }, [questions]);

  // Автозавершение при ответе на все вопросы
  useEffect(() => {
    if (allAnswered && state.status === 'in_progress') {
      handleFinishTest();
    }
  }, [allAnswered, state.status, handleFinishTest]);

  // Подсчёт результатов
  const results = useMemo(() => {
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(q => q.answered).length;
    const correctQuestions = questions.filter(q => q.correct).length;
    const totalScore = questions.reduce((sum, q) => sum + q.score, 0);
    const maxScore = questions.reduce((sum, q) => sum + q.maxPoints, 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      totalQuestions,
      answeredQuestions,
      correctQuestions,
      incorrectQuestions: answeredQuestions - correctQuestions,
      totalScore,
      maxScore,
      percentage
    };
  }, [questions]);

  // Сброс теста
  const handleReset = useCallback(() => {
    reset();
    setQuestions([]);
    setShowAnswers(false);
    timer.reset();
  }, [reset, timer]);

  const value = useMemo(() => ({
    testId: id,
    state,
    questions,
    results,
    showAnswers,
    timer,
    limit,
    showCorrectAnswers,
    registerQuestion,
    updateQuestionStatus,
    startTestIfNeeded,
    finishTest: handleFinishTest,
    resetTest: handleReset,
    setShowAnswers
  }), [
    id, state, questions, results, showAnswers, timer, limit, showCorrectAnswers,
    registerQuestion, updateQuestionStatus, startTestIfNeeded, handleFinishTest, handleReset
  ]);

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
}

/**
 * Хук для доступа к контексту теста
 */
export function useTest() {
  const context = useContext(TestContext);
  return context;
}

/**
 * Хук для регистрации вопроса в тесте
 */
export function useTestQuestion(questionId, maxPoints) {
  const test = useTest();
  
  useEffect(() => {
    if (test) {
      test.registerQuestion(questionId, maxPoints);
    }
  }, [test, questionId, maxPoints]);

  const handleStatusChange = useCallback((status, score) => {
    if (test) {
      test.startTestIfNeeded();
      test.updateQuestionStatus(questionId, status, score);
    }
  }, [test, questionId]);

  return {
    isInTest: !!test,
    showAnswers: test?.showAnswers || false,
    onStatusChange: handleStatusChange
  };
}

export default TestContext;
