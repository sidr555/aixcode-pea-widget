import bonusConfig from '../bonus.json';

/**
 * Расчёт бонуса за дисциплину.
 * 1. Извлечь уникальные даты сеансов
 * 2. Найти все подряд идущие серии дней
 * 3. Жадно: от самого длинного стрика к короткому, начисляем за каждую серию
 */
export function calcDisciplineBonus(sessions, streaks = bonusConfig.discipline.streaks) {
  if (!sessions || sessions.length === 0) return 0;

  // 1. Уникальные даты (YYYY-MM-DD), отсортированные
  const dateSet = new Set(sessions.map(s => s.date));
  const dates = [...dateSet].sort();

  if (dates.length === 0) return 0;

  // 2. Найти серии подряд идущих дат
  const runs = [];
  let currentRun = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentRun++;
    } else {
      runs.push(currentRun);
      currentRun = 1;
    }
  }
  runs.push(currentRun);

  // 3. Сортируем стрики по дням desc
  const sortedStreaks = Object.entries(streaks)
    .map(([days, points]) => [Number(days), points])
    .sort((a, b) => b[0] - a[0]);

  // 4. Жадный подсчёт
  let total = 0;
  for (const run of runs) {
    let remaining = run;
    for (const [days, points] of sortedStreaks) {
      const count = Math.floor(remaining / days);
      total += count * points;
      remaining = remaining % days;
    }
  }

  return total;
}

/**
 * Расчёт всех метрик профиля на основе сеансов.
 * Возвращает { mass, speed, progress, disciplineBonus }
 */
export function calcAllStats(sessions) {
  if (!sessions || sessions.length === 0) {
    return { mass: 0, speed: 0, progress: 0, disciplineBonus: 0 };
  }

  // mass = общее кол-во слов
  const mass = sessions.reduce((sum, s) => sum + (s.wordCount || 0), 0);

  // speed = максимум слов за сеанс
  const speed = Math.max(...sessions.map(s => s.wordCount || 0));

  // progress = кол-во уникальных статей
  const uniqueArticles = new Set(sessions.map(s => s.articleId));
  const progress = uniqueArticles.size;

  // discipline
  const disciplineBonus = calcDisciplineBonus(sessions);

  return { mass, speed, progress, disciplineBonus };
}
