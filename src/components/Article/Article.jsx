import { useState, useEffect, useCallback, useRef, useMemo, memo, createElement } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../Theme/ThemeContext';
import { useProfile } from '../Profile/ProfileContext';
import { parseArticle } from '../../utils/parseArticle';
import { mapQuestion, getComponent } from '../../utils/mapTestData';
import Test from '../Test/Test';
import ArticleReader from './ArticleReader';
import ArticleLeaderboard from './ArticleLeaderboard';
import styles from './Article.module.css';

const QUEST_SPLITTER = /%%QUEST:(\S+?)%%/;

/**
 * Рендерит body статьи, разбивая по %%QUEST:ID%% плейсхолдерам.
 * Между сегментами вставляет Quest-компоненты из testData.
 */
function ArticleBody({ body, questionsMap }) {
  const segments = useMemo(() => {
    if (!questionsMap || Object.keys(questionsMap).length === 0) {
      return [{ type: 'md', content: body }];
    }

    const parts = body.split(QUEST_SPLITTER);
    const result = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        const md = parts[i].trim();
        if (md) result.push({ type: 'md', content: md });
      } else {
        const qId = parts[i];
        if (questionsMap[qId]) {
          result.push({ type: 'quest', id: qId });
        }
      }
    }
    return result;
  }, [body, questionsMap]);

  return (
    <div className={styles.markdown}>
      {segments.map((seg, i) => {
        if (seg.type === 'md') {
          return <ReactMarkdown key={i}>{seg.content}</ReactMarkdown>;
        }
        const q = questionsMap[seg.id];
        const Component = getComponent(q._type);
        if (!Component) return null;
        const { _type, ...props } = q;
        return createElement(Component, { key: seg.id, ...props });
      })}
    </div>
  );
}

function Article({ id: articleId, author, title, content: rawContent, duration, testData }) {
  const { colors } = useTheme();
  const { addSession, activeProfileId } = useProfile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const readerResetRef = useRef(null);

  // Парсим содержимое при получении
  const content = rawContent ? parseArticle(rawContent) : null;

  // Маппим вопросы из JSON → props
  const { questionsMap, testQuestions } = useMemo(() => {
    if (!testData || !testData.questions) {
      return { questionsMap: {}, testQuestions: [] };
    }

    const inlineIds = new Set(content?.inlineMarkers || []);
    const prefix = articleId || '';
    const map = {};
    const test = [];

    for (const q of testData.questions) {
      const mapped = mapQuestion(q, prefix);
      mapped._type = q.type;

      if (inlineIds.has(q.id)) {
        map[q.id] = mapped;
      } else {
        test.push(mapped);
      }
    }

    return { questionsMap: map, testQuestions: test };
  }, [testData, content?.inlineMarkers, articleId]);

  // Count sessions for this article from localStorage
  const [sessionCount, setSessionCount] = useState(0);
  useEffect(() => {
    if (!articleId) return;
    let count = 0;
    try {
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
    setShowLeaderboard(false);
    readerResetRef.current?.();
    const storageKey = `article_expanded_${title}`;
    if (typeof window !== "undefined" && window.localStorage) localStorage.setItem(storageKey, String(newState));
  }, [isExpanded, title]);

  const handleSessionComplete = useCallback((wordCount) => {
    if (articleId) {
      addSession(articleId, wordCount);
      setSessionCount(prev => prev + 1);
      setShowLeaderboard(true);
      setIsExpanded(true);
    }
  }, [articleId, addSession]);

  const toggleLeaderboard = useCallback((e) => {
    e.stopPropagation();
    setShowLeaderboard(prev => !prev);
    readerResetRef.current?.();
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

  const hasInlineQuests = Object.keys(questionsMap).length > 0;

  return (
    <ArticleReader body={content.body || ''} duration={duration} onSessionComplete={handleSessionComplete}>
      {({ control, progressBar, bodyContent, phase, reset }) => {
        readerResetRef.current = reset;
        return (
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

          {isExpanded && !bodyContent && (
            <div className={styles.body}>
              {showLeaderboard ? (
                <ArticleLeaderboard articleId={articleId} />
              ) : hasInlineQuests ? (
                <ArticleBody body={content.body} questionsMap={questionsMap} />
              ) : (
                <div className={styles.markdown}>
                  <ReactMarkdown>
                    {content.body}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Тест после статьи */}
          {isExpanded && !bodyContent && !showLeaderboard && testQuestions.length > 0 && (
            <div className={styles.body}>
              <Test
                id={`${articleId}-test`}
                title="Тест"
                limit={testData?.timer || null}
                showCorrectAnswers={true}
              >
                {testQuestions.map(q => {
                  const Component = getComponent(q._type);
                  if (!Component) return null;
                  const { _type, ...props } = q;
                  return createElement(Component, { key: q.id, ...props });
                })}
              </Test>
            </div>
          )}
        </article>
        );
      }}
    </ArticleReader>
  );
}

export default memo(Article);
