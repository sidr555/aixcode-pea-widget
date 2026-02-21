import { createContext, useContext, useCallback, useMemo } from 'react';

const QuestContext = createContext(null);

export function QuestProvider({ children, id, points = 0, correctAnswer, onAnswer }) {
  const value = useMemo(() => ({ id, points, correctAnswer, onAnswer }), [id, points, correctAnswer, onAnswer]);
  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
}

export function useQuest() {
  const context = useContext(QuestContext);
  if (!context) throw new Error('useQuest must be used within QuestProvider');
  return context;
}

export function useCheckAnswer() {
  const { correctAnswer } = useQuest();
  return useCallback((userAnswer) => {
    if (!correctAnswer || !userAnswer) return false;
    if (correctAnswer.includes('|')) {
      const correctParts = correctAnswer.split('|').sort();
      const userParts = userAnswer.split('|').sort();
      return correctParts.join('|') === userParts.join('|');
    }
    return correctAnswer === userAnswer;
  }, [correctAnswer]);
}

export default QuestContext;


