/**
 * Парсит markdown-файл статьи и извлекает данные.
 *
 * Формат MD:
 *   # Заголовок статьи
 *
 *   Абзацы с поддержкой **bold**, *italic*, ## подзаголовков, списков и т.д.
 *
 *   <!-- q:questionId -->          ← inline-маркер вопроса (опционально)
 *
 *   Ещё текст...
 *
 *   Автор: Имя Фамилия.
 *
 *   Тест: / Опросник:             ← стоп-маркер, всё после игнорируется
 *
 * @param {string} content - Содержимое markdown-файла
 * @returns {{ title: string, author: string, body: string, inlineMarkers: string[] }}
 */
export function parseArticle(content) {
  const lines = content.split('\n');

  let title = '';
  let author = '';
  let bodyLines = [];
  let inlineMarkers = [];
  let titleFound = false;

  const QUEST_MARKER = /^<!--\s*q:(\S+)\s*-->$/;
  const SKIP_LINES = /^(Статья\s+\d+|Текст статьи:|Шокирующий заголовок:)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Стоп-маркеры — всё после них отбрасывается
    if (/^(Опросник|Тест)\s*:/.test(trimmed)) break;

    // Автор
    if (trimmed.startsWith('Автор:')) {
      author = trimmed.replace(/^Автор:\s*/, '').replace(/\.\s*$/, '').trim();
      continue;
    }

    // Заголовок: первая строка # (h1)
    if (!titleFound && /^#\s+/.test(trimmed)) {
      title = trimmed.replace(/^#\s+/, '').trim();
      titleFound = true;
      continue;
    }

    // Обратная совместимость: "Шокирующий заголовок:" (старый формат)
    if (!titleFound && trimmed.startsWith('Шокирующий заголовок:')) {
      title = trimmed.replace(/^Шокирующий заголовок:\s*/, '').trim();
      titleFound = true;
      continue;
    }

    // Пропускаем служебные строки старого формата
    if (SKIP_LINES.test(trimmed)) continue;

    // Inline-маркеры вопросов <!-- q:ID -->
    const markerMatch = trimmed.match(QUEST_MARKER);
    if (markerMatch) {
      inlineMarkers.push(markerMatch[1]);
      bodyLines.push(`%%QUEST:${markerMatch[1]}%%`);
      continue;
    }

    // Пропускаем блоки ``` quest ... ``` (старый формат в ai-5)
    if (trimmed.startsWith('``` quest') || trimmed === '``` quest') {
      // Пропускаем до закрывающего ```
      while (i + 1 < lines.length && lines[i + 1].trim() !== '```') i++;
      i++; // пропускаем закрывающий ```
      continue;
    }
    if (trimmed === '```' && i > 0 && lines[i - 1]?.trim()?.startsWith('``` quest')) {
      continue;
    }

    bodyLines.push(line);
  }

  const body = bodyLines.join('\n').trim();

  return { title, author, body, inlineMarkers };
}
