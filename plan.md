## 2026-02-23 Profiles, sessions, leaderboards

### 1. bonus.json + utils/bonus.js
Bonus config and calculation functions.
- `calcDisciplineBonus` — greedy algorithm over day streaks
- `calcAllStats` — mass, speed, progress, disciplineBonus from sessions
- Done

### 2. ProfileContext + ProfileSelector + CSS
Profile context in localStorage, selection overlay.
- `ProfileProvider` — CRUD profiles, `addSession`, `updateProfileStats`
- `ProfileSelector` — accordion list + creation form
- `Profile.module.css` — overlay, accordion, form, dark mode
- Done

### 3. App.jsx — header, badges, ProfileProvider
- Title "reati", 4 badges to the right of name
- `<ProfileSelector>` shown when no profile selected
- Each `<Article>` gets `id={hash(title+author)}`
- `App.css` — `.header-right`, `.badge` styles
- Done

### 4. ArticleReader — duration, onSessionComplete
- `duration` prop (seconds, default 60) replaces hardcoded `'60s'`
- Progress bar: `time / duration` instead of `time / 60`
- `onSessionComplete(wordCount)` called at phase=done
- Done

### 5. Article — id, crown, leaderboard
- `id` prop (articleId), passed to reader and leaderboard
- Crown button with session count, toggles text/leaderboard
- `handleSessionComplete` → `addSession` → recalc stats
- Done

### 6. ArticleLeaderboard
- Table: #, date, profile, words — sorted by wordCount desc
- Data from `quest_sessions_*` across all profiles
- Done

### 7. ThemeSelector — profile, font
- Font size slider 10–28
- "Change profile" and "Delete profile" links
- Done

### 8. ThemeContext — fontSize, sync
- `fontSize` state, CSS variable `--article-font-size`
- `changeFontSize`, `syncFromProfile`
- Done

### 9. useLocalStorage, main.jsx, index.jsx
- `useProfileSessions` hook for profile sessions
- `main.jsx` — wrapped in `<ProfileProvider>`
- `index.jsx` — exports ProfileProvider, useProfile, bonus utils
- Done

### Verification
- `npm run build` — no errors ✓

---

## 2026-02-23 Fonts, badges, button

### 1. Theme button — profile name
- Removed `.colorPreview` circle when profile exists
- Text = profile name in `colors.primary`, fallback to theme name
- Button size 15px (one third smaller than 22px)
- `Theme.module.css` — removed `.modeIcon`, `.selectorText` bold 600
- Done

### 2. Font slider — extended scope
- Removed `font-size: 16px` from `.app h3` (was overriding CSS module)
- `.title` in Article.module.css → `calc(--article-font-size + 2px)`
- `.leaderboard` → `var(--article-font-size)`
- `.leaderboard th` → `calc(--article-font-size - 4px)`
- Quest `.header` → `var(--article-font-size)`
- Quest `.explanation` → `calc(--article-font-size - 2px)`
- variants: `.option`, `.textInput`, `.textarea`, `.codeTextarea`, `.correctCode`, `.promptTextarea`, `.blockButton`, `.hint` → `calc(--article-font-size - 2px)`
- `.trueFalse .option`, `.correctText` → `var(--article-font-size)`
- Done

### 3. "Read" badge
- `bonus.json`: `"mass"` label → `"Read"`, removed `color`
- `calcAllStats`: `mass` = unique articles with `wordCount > 0`
- `ProfileContext`: `uniqueArticles` taken from `stats.mass`
- `App.jsx`: mass badge `bg` = `colors.primary`
- Done

### Verification
- `npm run build` — no errors ✓

---

## 2026-02-23 Gold dot, limit, empty state font

### 1. Gold dot instead of crown
- `.crownIcon` → `.crownDot` (20×20px, border-radius 50%, bg #f5c518)
- JSX: `<span className={styles.crownDot} />` instead of emoji
- Done

### 2. Leaderboard limited to 10 rows
- `rows.slice(0, 10).map(...)` in ArticleLeaderboard
- Done

### 3. Empty state font size
- `.leaderboardEmpty` font-size → `var(--article-font-size, 16px)`
- Done

### Verification
- `npm run build` — no errors ✓

---

## 2026-02-23 Badges, hide leaderboard dot

### 1. Badge order in header
- Badges array: swapped discipline and progress
- Done

### 2. Hide leaderboard dot
- Condition `articleId && sessionCount > 0` instead of `articleId`
- Done

### Verification
- `npm run build` — no errors ✓

---

## 2026-02-23 Logout, quick profile switch

### 1. "Logout" button in ThemeSelector
- Removed "Change/Delete profile" links
- `.logoutBtn` — styled like "Read" button (6px 16px, 14px, font-weight 500)
- Background = theme color, white text
- Done

### 2. Accordion — quick profile entry
- Row click → `selectProfile(id)` directly
- `.itemDot` (16px, theme color) on the right in `.itemMeta`
- Dot click → `handleToggleExpand` (stopPropagation)
- Panel contains only "Delete" button
- Removed "Enter" button and `.enterBtn` style
- Done

### Verification
- `npm run build` — no errors ✓

---

## 2026-02-23 Profile theme sync, leaderboard highlight

### 1. Theme settings saved to profile
- `ProfileContext` imports `useTheme` for `theme`, `mode`, `fontSize`, `syncFromProfile`
- On profile switch: `syncFromProfile(profile)` loads saved settings
- On theme/mode/fontSize change: `useEffect` writes back to active profile
- `initialSyncDone` ref prevents saving during initial load
- Done

### 2. Leaderboard highlights current profile
- Rows include `profileId` field
- `isMine = r.profileId === activeProfileId`
- `.leaderboardMine td` — `font-weight: 700`, `font-size: calc(--article-font-size * 1.2)`
- Done

### Verification
- `npm run build` — no errors ✓

---

## 2026-02-23 Persistent timer bar

### 1. ArticleReader — keep progress bar visible
- Changed `phase === 'reading'` to `phase !== 'idle'` for progressBar rendering
- Bar stays visible during picking and done phases
- Click-to-stop handler only active during reading phase
- Cursor set to default when not reading
- Done

### Verification
- `npm run build` — no errors ✓

---

## 2026-02-24 Fix profile form, gender buttons

### 1. ProfileSelector — fix readonly inputs
- Switched name/surname/birthDate from controlled (`value`+`onChange`) to uncontrolled (`ref`)
- Form data collected via refs at submit time
- Gender kept as separate state (needed for button highlight)
- Done

### 2. ProfileSelector — gender toggle buttons
- Replaced `<select>` dropdown with 2 `<button>` elements: мальчик, девочка
- Gender values: `m`, `f`
- Click toggles selection (click again to deselect)
- Active button uses theme color background, white text
- Done

### 3. Profile.module.css — gender button styles
- `.genderRow` — flex row with gap
- `.genderBtn` — bordered button, flex:1
- `.genderBtnActive` — white text, theme bg
- Dark mode support
- Done

### Verification
- `npm run build` — no errors ✓

---

## 2026-02-24 Fix nested buttons, profile form

### 1. Article.jsx — fix button-in-button nesting
- Article header `<button>` → `<div role="button" tabIndex={0}>`
- Inner buttons (Читать, crown) no longer nested inside a `<button>`
- Fixes React hydration error: `<button> cannot be a descendant of <button>`
- This was the root cause of broken profile form inputs
- Done

### Verification
- `npm run build` — no errors ✓

---

## 2026-02-24 Reading mode fixes

### 1. Fix duplicate text in reading mode
- Added `!bodyContent` condition to markdown body block
- When reader is active (reading/picking), only reader body shows
- When reader is idle/done, normal body shows
- Done

### 2. Red border on picking phase
- `.readerBody` gets `border: 2px solid transparent` base
- `.readerBodyPicking` sets `border-color: #e53935`
- ArticleReader passes `phase` in render-props
- Done

### 3. Leaderboard after session, text on toggle
- `handleSessionComplete` sets `showLeaderboard = true` and `isExpanded = true`
- `toggleExpanded` resets `showLeaderboard = false`
- Done

### Verification
- `npm run build` — no errors ✓

---

## 2026-02-24 Header badges, reader flow

### 1. Badge font size
- `.badge` font-size `12px` → `18px` (1.5× increase)
- Done

### 2. Progress bar visibility
- Changed from `phase !== 'idle'` to `phase === 'reading' || phase === 'picking'`
- Bar hidden when article collapsed or session done
- Done

### 3. Remove reset button, reader lifecycle
- Removed ↻ button from done phase control
- Removed `.readerResetBtn` CSS
- ArticleReader exposes `reset` function in render-props
- `toggleExpanded` and `toggleLeaderboard` call `reset` via ref
- Reader returns to idle → shows "Читать" on collapse or mode switch
- Done

### Verification
- `npm run build` — no errors ✓
