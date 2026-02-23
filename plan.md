## 2026-02-23 Профили, сеансы, рекорды

### 1. bonus.json + utils/bonus.js
Конфиг четырёх бонусов и функции расчёта.
- `calcDisciplineBonus` — жадный алгоритм по сериям дней
- `calcAllStats` — mass, speed, progress, disciplineBonus из сеансов
- Готово

### 2. ProfileContext + ProfileSelector + CSS
Контекст профилей в localStorage, оверлей выбора.
- `ProfileProvider` — CRUD профилей, `addSession`, `updateProfileStats`
- `ProfileSelector` — аккордеон со списком + форма создания
- `Profile.module.css` — оверлей, аккордеон, форма, тёмная тема
- Готово

### 3. App.jsx — шапка, бейджи, ProfileProvider
- Заголовок "reati", 4 бейджа справа от имени
- `<ProfileSelector>` показывается если профиль не выбран
- Каждому `<Article>` передан `id={hash(title+author)}`
- `App.css` — стили `.header-right`, `.badge`
- Готово

### 4. ArticleReader — duration, onSessionComplete
- Проп `duration` (сек, default 60) вместо хардкода `'60s'`
- Прогрессбар: `time / duration` вместо `time / 60`
- `onSessionComplete(wordCount)` вызывается при phase=done
- Готово

### 5. Article — id, корона, лидерборд
- Проп `id` (articleId), передаётся в reader и leaderboard
- Кнопка-корона с числом сеансов, тогл текст/рекорды
- `handleSessionComplete` → `addSession` → пересчёт метрик
- Готово

### 6. ArticleLeaderboard
- Таблица: #, дата, профиль, слов — сортировка по wordCount desc
- Данные из `quest_sessions_*` всех профилей
- Готово

### 7. ThemeSelector — профиль, шрифт
- Ползунок размера шрифта 10–28
- Ссылки «Сменить профиль» и «Удалить профиль»
- Готово

### 8. ThemeContext — fontSize, синхронизация
- `fontSize` state, CSS-переменная `--article-font-size`
- `changeFontSize`, `syncFromProfile`
- Готово

### 9. useLocalStorage, main.jsx, index.jsx
- `useProfileSessions` хук для сеансов профиля
- `main.jsx` — обёртка `<ProfileProvider>`
- `index.jsx` — экспорт ProfileProvider, useProfile, bonus-утилит
- Готово

### Верификация
- `npm run build` — без ошибок ✓
