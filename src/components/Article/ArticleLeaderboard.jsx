import { useMemo, memo } from 'react';
import { useProfile } from '../Profile/ProfileContext';
import styles from './Article.module.css';

function ArticleLeaderboard({ articleId }) {
  const { profiles } = useProfile();

  const rows = useMemo(() => {
    const result = [];
    for (const profile of profiles) {
      try {
        const raw = localStorage.getItem(`quest_sessions_${profile.id}`);
        if (!raw) continue;
        const sessions = JSON.parse(raw);
        for (const s of sessions) {
          if (s.articleId !== articleId) continue;
          result.push({
            name: profile.name + (profile.surname ? ` ${profile.surname}` : ''),
            wordCount: s.wordCount,
            date: s.date,
            timestamp: s.timestamp,
          });
        }
      } catch {}
    }
    // Sort by wordCount desc
    result.sort((a, b) => b.wordCount - a.wordCount);
    return result;
  }, [articleId, profiles]);

  if (rows.length === 0) {
    return <div className={styles.leaderboardEmpty}>Ещё нет результатов</div>;
  }

  return (
    <table className={styles.leaderboard}>
      <thead>
        <tr>
          <th>#</th>
          <th>Дата</th>
          <th>Профиль</th>
          <th>Слов</th>
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 10).map((r, i) => (
          <tr key={`${r.timestamp}-${i}`}>
            <td>{i + 1}</td>
            <td>{new Date(r.timestamp).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
            <td>{r.name}</td>
            <td><strong>{r.wordCount}</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default memo(ArticleLeaderboard);
