/**
 * Нормализация ответа для сравнения
 * Убирает лишние пробелы и приводит к нижнему регистру
 */
export function normalizeAnswer(answer) {
  if (typeof answer !== 'string') return '';
  return answer.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Проверка, является ли токен значимым для оценки
 * Значимые: числа и слова > 2 букв
 */
export function isSignificantToken(token) {
  if (!token) return false;
  
  // Убираем знаки препинания и спецсимволы для проверки
  const clean = token.replace(/[^\p{L}\p{N}]/gu, '');
  
  if (!clean) return false;
  
  // Число
  if (/^\d+$/.test(clean)) return true;
  
  // Слово > 2 букв
  if (clean.length > 2) return true;
  
  return false;
}

/**
 * Токенизация текста для SpotTheHallucination
 * Возвращает массив токенов с их свойствами
 */
export function tokenizeAll(text) {
  if (!text) return [];
  
  return text.split(/\s+/).map((token, index) => ({
    index,
    text: token,
    isSignificant: isSignificantToken(token)
  }));
}

/**
 * Фильтрация выбранных индексов - оставляем только значимые
 */
export function getSignificantIndices(selectedIndices, tokens) {
  return selectedIndices.filter(idx => tokens[idx]?.isSignificant);
}

/**
 * Сортировка массива чисел для сравнения
 */
export function sortIndices(indices) {
  return [...indices].sort((a, b) => a - b);
}

/**
 * Сравнение двух массивов индексов
 */
export function compareIndices(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = sortIndices(arr1);
  const sorted2 = sortIndices(arr2);
  return sorted1.every((val, idx) => val === sorted2[idx]);
}