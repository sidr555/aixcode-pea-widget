// Базовый компонент
export { default as Quest } from './components/Quest/Quest';

// Статьи
export { default as Article } from './components/Article/Article';

// Простые наследники
export { default as TrueFalse } from './components/Quest/variants/TrueFalse';
export { default as MultipleChoice } from './components/Quest/variants/MultipleChoice';
export { default as FillTheBlank } from './components/Quest/variants/FillTheBlank';
export { default as Text } from './components/Quest/variants/Text';

// DnD наследники
export { default as OrderSteps } from './components/Quest/variants/OrderSteps';
export { default as MatchPairs } from './components/Quest/variants/MatchPairs';

// Продвинутые компоненты
export { default as CodeBlock } from './components/Quest/variants/CodeBlock';
export { default as SpotTheHallucination } from './components/Quest/variants/SpotTheHallucination';
export { default as PromptBuilder } from './components/Quest/variants/PromptBuilder';

// Тест-режим
export { default as Test } from './components/Test/Test';
export { TestProvider, useTest, useTestQuestion } from './components/Test/TestContext';
export { default as Timer } from './components/Test/Timer';
export { default as Score } from './components/Score/Score';

// Хуки
export { useLocalStorage, useQuestStorage, useTestStorage } from './hooks/useLocalStorage';
export { useTimer, parseTimeLimit, formatTime } from './hooks/useTimer';

// Утилиты
export { hash, hashMultiple, parseHashString } from './utils/hash';
export { 
  normalizeAnswer, 
  tokenizeAll, 
  isSignificantToken, 
  getSignificantIndices,
  sortIndices,
  compareIndices
} from './utils/normalize';
