import { hash, hashMultiple } from './hash';
import { normalizeAnswer } from './normalize';
import TrueFalse from '../components/Quest/variants/TrueFalse';
import MultipleChoice from '../components/Quest/variants/MultipleChoice';
import FillTheBlank from '../components/Quest/variants/FillTheBlank';
import Text from '../components/Quest/variants/Text';
import CodeBlock from '../components/Quest/variants/CodeBlock';
import OrderSteps from '../components/Quest/variants/OrderSteps';
import MatchPairs from '../components/Quest/variants/MatchPairs';
import SpotTheHallucination from '../components/Quest/variants/SpotTheHallucination';
import PromptBuilder from '../components/Quest/variants/PromptBuilder';

const COMPONENTS = {
  'true-false': TrueFalse,
  'choice': MultipleChoice,
  'multi-choice': MultipleChoice,
  'fill': FillTheBlank,
  'text': Text,
  'code': CodeBlock,
  'order': OrderSteps,
  'pairs': MatchPairs,
  'spot': SpotTheHallucination,
  'blocks': PromptBuilder,
};

/**
 * Возвращает React-компонент по короткому типу вопроса
 */
export function getComponent(type) {
  return COMPONENTS[type] || null;
}

/**
 * Конвертирует вопрос из JSON-формата в props для Quest-компонента.
 * Автоматически хэширует plaintext-ответы.
 *
 * JSON-формат:
 *   { id, type, question, items?, pairs?, text?, answer, hint, points?, difficulty? }
 *
 * Возвращает props, готовые для передачи в соответствующий Quest-компонент.
 */
export function mapQuestion(q, idPrefix = '') {
  const base = {
    id: idPrefix ? `${idPrefix}-${q.id}` : q.id,
    question: q.question,
    explanation: q.hint || '',
    points: q.points || 1,
  };

  switch (q.type) {
    case 'true-false':
      return {
        ...base,
        correctAnswer: String(q.answer),
      };

    case 'choice':
      return {
        ...base,
        options: { multiple: false, items: q.items },
        correctAnswer: hash(q.items[q.answer]),
      };

    case 'multi-choice':
      return {
        ...base,
        options: { multiple: true, items: q.items },
        correctAnswer: q.answer
          .map(i => hash(q.items[i]))
          .sort()
          .join('|'),
      };

    case 'fill':
      return {
        ...base,
        options: q.placeholder ? { placeholder: q.placeholder } : undefined,
        correctAnswer: q.answer,
      };

    case 'text':
      return {
        ...base,
        options: {
          placeholder: q.placeholder || 'Введите ответ',
          rows: q.rows || 3,
        },
        correctAnswer: q.answer,
      };

    case 'code':
      return {
        ...base,
        options: {
          placeholder: q.placeholder || 'Введите код',
          language: q.language || 'javascript',
        },
        correctAnswer: q.answer,
      };

    case 'order':
      return {
        ...base,
        options: { items: q.items },
        correctAnswer: q.answer.map(i => hash(q.items[i])).join('|'),
      };

    case 'blocks':
      return {
        ...base,
        options: { blocks: q.items },
        correctAnswer: q.answer.map(i => hash(q.items[i])).join('|'),
      };

    case 'spot':
      return {
        ...base,
        options: { text: q.text },
        correctAnswer: q.answer.join('|'),
      };

    case 'pairs': {
      const pairs = q.pairs.map(p => ({
        left: Array.isArray(p) ? p[0] : p.left,
        right: Array.isArray(p) ? p[1] : p.right,
      }));
      return {
        ...base,
        options: { pairs },
        correctAnswer: pairs
          .map(p => `${hash(normalizeAnswer(p.left))}|${hash(normalizeAnswer(p.right))}`)
          .join('||'),
      };
    }

    default:
      return base;
  }
}
