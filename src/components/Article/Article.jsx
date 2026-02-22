import { useState, useEffect, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../Theme/ThemeContext';
import { parseArticle } from '../../utils/parseArticle';
import { useArticleReader } from './ArticleReader';
import styles from './Article.module.css';

function Article({ author, title, content: rawContent }) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Парсим содержимое при получении
  const content = rawContent ? parseArticle(rawContent) : null;

  const { control, progressBar, bodyContent } = useArticleReader(content?.body || '');

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

  if (!content) {
    return (
      <article className={styles.article}>
        <div className={styles.error}>Ошибка загрузки статьи</div>
      </article>
    );
  }

  return (
    <article className={styles.article}>
      <button
        className={styles.header}
        onClick={toggleExpanded}
        type="button"
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
          <span className={styles.arrow}>{isExpanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {progressBar}
      {bodyContent}

      {isExpanded && (
        <div className={styles.body}>
          <div className={styles.markdown}>
            <ReactMarkdown>
              {content.body}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </article>
  );
}

export default memo(Article);
