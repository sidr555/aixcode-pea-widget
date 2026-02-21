/**
 * Парсит markdown-файл статьи и извлекает данные
 * @param {string} content - Содержимое markdown-файла
 * @returns {Object} Объект с полями { author, title, body }
 */
export function parseArticle(content) {
  const lines = content.split('\n');
  
  let author = '';
  let title = '';
  let body = '';
  let inBody = false;
  let bodyLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Извлекаем автора
    if (line.startsWith('Автор:')) {
      author = line.replace('Автор:', '').trim();
      continue;
    }
    
    // Извлекаем заголовок (текст после "Шокирующий заголовок: ")
    if (line.startsWith('Шокирующий заголовок:')) {
      title = line.replace('Шокирующий заголовок:', '').trim();
      continue;
    }
    
    // Начало тела статьи
    if (line.startsWith('Текст статьи:')) {
      inBody = true;
      continue;
    }
    
    // Конец тела статьи (начало опросника)
    if (line.startsWith('Опросник:')) {
      break;
    }
    
    // Собираем тело статьи
    if (inBody) {
      bodyLines.push(line);
    }
  }
  
  body = bodyLines.join('\n').trim();
  
  return {
    author,
    title,
    body
  };
}