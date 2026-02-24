import { useState, useEffect, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../Theme/ThemeContext';
import { useProfile } from '../Profile/ProfileContext';
import { parseArticle } from '../../utils/parseArticle';
import ArticleReader from './ArticleReader';
import ArticleLeaderboard from './ArticleLeaderboard';
import styles from './Article.module.css';

function Article({ id: articleId, author, title, content: rawContent, duration }) {
  const { colors } = useTheme();
  const { addSession, activeProfileId } = useProfile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Парсим содержимое при получении
  const content = rawContent ? parseArticle(rawContent) : null;

  // Count sessions for this article from localStorage
  const [sessionCount, setSessionCount] = useState(0);
  useEffect(() => {
    if (!articleId) return;
    let count = 0;
    try {
      // Scan all quest_sessions_* keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('quest_sessions_')) {
          const sessions = JSON.parse(localStorage.getItem(key) || '[]');
          count += sessions.filter(s => s.articleId === articleId).length;
        }
      }
    } catch {}
    setSessionCount(count);
  }, [articleId]);

  // Загрузка состояния из localStorage
  useEffect(() => {
    const storageKey = `article_expanded_${title}`;
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
    setIsExpanded(saved === 'true');
    }
    }
  }, [title]);

  // Сохранение состояния в localStorage
  const toggleExpanded = useCallback(() => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    const storageKey = `article_expanded_${title}`;
    if (typeof window !== "undefined" && window.localStorage) localStorage.setItem(storageKey, String(newState));
  }, [isExpanded, title]);

  const handleSessionComplete = useCallback((wordCount) => {
    if (articleId) {
      addSession(articleId, wordCount);
      setSessionCount(prev => prev + 1);
    }
  }, [articleId, addSession]);

  const toggleLeaderboard = useCallback((e) => {
    e.stopPropagation();
    setShowLeaderboard(prev => !prev);
    if (!isExpanded) {
      setIsExpanded(true);
      const storageKey = `article_expanded_${title}`;
      if (typeof window !== "undefined" && window.localStorage) localStorage.setItem(storageKey, 'true');
    }
  }, [isExpanded, title]);

  if (!content) {
    return (
      <article className={styles.article}>
        <div className={styles.error}>Ошибка загрузки статьи</div>
      </article>
    );
  }

  return (
    <ArticleReader body={content.body || ''} duration={duration} onSessionComplete={handleSessionComplete}>
      {({ control, progressBar, bodyContent }) => (
        <article className={styles.article}>
          <div
            className={styles.header}
            onClick={toggleExpanded}
            role="button"
            tabIndex={0}
            style={{ borderColor: isExpanded ? colors.primary : 'transparent' }}
          >
            <div className={styles.headerContent}>
              <h3 className={styles.title} style={{ color: colors.primary }}>
                {title || content.title}
              </h3>
              <span className={styles.author}>{author || content.author}</span>
            </div>
            <div className={styles.headerRight}>
              {control}
              {articleId && sessionCount > 0 && (
                <button
                  className={`${styles.crownBtn} ${showLeaderboard ? styles.crownBtnActive : ''}`}
                  onClick={toggleLeaderboard}
                  type="button"
                  title="Таблица рекордов"
                >
                  <span className={styles.crownDot} />
                  {sessionCount > 0 && <span className={styles.crownCount}>{sessionCount}</span>}
                </button>
              )}
              <span className={styles.arrow}>{isExpanded ? '▲' : '▼'}</span>
            </div>
          </div>

          {progressBar}
          {bodyContent}

          {isExpanded && (
            <div className={styles.body}>
              {showLeaderboard ? (
                <ArticleLeaderboard articleId={articleId} />
              ) : (
                <div className={styles.markdown}>
                  <ReactMarkdown>
                    {content.body}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </article>
      )}
    </ArticleReader>
  );
}

export default memo(Article);
