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

---

## 2026-02-23 Шрифты, бейджи, кнопка

### 1. Кнопка темы — имя профиля
- Убран кружок `.colorPreview` когда есть профиль
- Текст = имя профиля в `colors.primary`, fallback на название темы
- Размер кнопки 15px (треть меньше 22px)
- `Theme.module.css` — убран `.modeIcon`, `.selectorText` bold 600
- Готово

### 2. Ползунок шрифта — расширенное влияние
- Убран `font-size: 16px` из `.app h3` (перекрывал CSS-модуль)
- `.title` в Article.module.css → `calc(--article-font-size + 2px)`
- `.leaderboard` → `var(--article-font-size)`
- `.leaderboard th` → `calc(--article-font-size - 4px)`
- Quest `.header` → `var(--article-font-size)`
- Quest `.explanation` → `calc(--article-font-size - 2px)`
- variants: `.option`, `.textInput`, `.textarea`, `.codeTextarea`, `.correctCode`, `.promptTextarea`, `.blockButton`, `.hint` → `calc(--article-font-size - 2px)`
- `.trueFalse .option`, `.correctText` → `var(--article-font-size)`
- Готово

### 3. Бейдж «Прочли»
- `bonus.json`: `"mass"` label → `"Прочли"`, убран `color`
- `calcAllStats`: `mass` = кол-во уникальных статей с `wordCount > 0`
- `ProfileContext`: `uniqueArticles` берётся из `stats.mass`
- `App.jsx`: бейдж mass `bg` = `colors.primary`
- Готово

### Верификация
- `npm run build` — без ошибок ✓

---

## 2026-02-23 Кружок, лимит, шрифт пустого

### 1. Золотой кружок вместо короны
- `.crownIcon` → `.crownDot` (20×20px, border-radius 50%, bg #f5c518)
- JSX: `<span className={styles.crownDot} />` вместо эмодзи
- Готово

### 2. Лимит 10 строк в таблице рекордов
- `rows.slice(0, 10).map(...)` в ArticleLeaderboard
- Готово

### 3. Шрифт пустого состояния
- `.leaderboardEmpty` font-size → `var(--article-font-size, 16px)`
- Готово

### Верификация
- `npm run build` — без ошибок ✓

---

## 2026-02-23 Бейджи, скрытие кружка

### 1. Порядок бейджей в шапке
- Массив badges: дисциплина и прогресс поменяны местами
- Готово

### 2. Скрытие кружка рекордов
- Условие `articleId && sessionCount > 0` вместо `articleId`
- Готово

### Верификация
- `npm run build` — без ошибок ✓

---

## 2026-02-23 Выход, быстрая смена профиля

### 1. Кнопка «Выйти» в ThemeSelector
- Убраны ссылки «Сменить/Удалить профиль»
- `.logoutBtn` — стиль как у «Читать» (6px 16px, 14px, font-weight 500)
- Фон = цвет темы, белый текст
- Готово

### 2. Аккордеон профилей — быстрый вход
- Клик по строке → `selectProfile(id)` напрямую
- Кружок `.itemDot` (16px, цвет темы) справа в `.itemMeta`
- Клик по кружку → `handleToggleExpand` (stopPropagation)
- Панель содержит только кнопку «Удалить»
- Убрана кнопка «Войти» и стиль `.enterBtn`
- Готово

### Верификация
- `npm run build` — без ошибок ✓
