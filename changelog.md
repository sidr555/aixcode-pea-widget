## 2026-02-23 v0.1.6 — Persistent timer bar

- Progress bar stays visible after reading session ends
- Prevents layout shift when transitioning to word-picking phase
- Click-to-stop only active during reading phase

## 2026-02-23 v0.1.5 — Profile theme sync, leaderboard highlight

- Theme, mode, font size saved to profile on change
- Settings restored when switching profiles
- Current profile rows in leaderboard bold and 20% larger

## 2026-02-23 v0.1.4 — Logout, quick profile switch

- "Logout" button in theme menu replaces profile links
- Click accordion row for instant profile switch
- Theme-colored dot on the right expands delete panel
- Removed "Enter" button from accordion

## 2026-02-23 v0.1.3 — Badges, hide leaderboard dot

- Swapped discipline and progress badge order in header
- Leaderboard dot hidden when article has no sessions

## 2026-02-23 v0.1.2 — Gold dot, limit, empty state font

- Gold dot replaces crown emoji, 20px diameter
- Leaderboard table limited to 10 rows
- "No results yet" scales with font size slider

## 2026-02-23 v0.1.1 — Fonts, badges, button

- Theme button shows profile name in theme color
- Removed color circle before name on button
- Font size slider now affects article titles, leaderboards, quizzes
- Fixed global `.app h3` overriding article title size
- "Read" badge instead of "Mass", counts articles with sessions
- "Read" badge background uses current theme color

## 2026-02-23 v0.1.0 — Profiles, sessions, leaderboards

- Profile system with localStorage and accordion selector
- Profile context: create, delete, switch
- Reading sessions tied to profile and article
- Four header badges: read, speed, progress, discipline
- Greedy algorithm for discipline streak bonuses
- Per-article leaderboard via crown button
- Configurable duration prop in ArticleReader
- Font size slider in theme settings
- Profile change/delete links in ThemeSelector
- App title renamed to "reati"
