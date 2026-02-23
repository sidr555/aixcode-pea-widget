import { hash } from './utils/hash';
import { useProfile } from './components/Profile/ProfileContext';
import ProfileSelector from './components/Profile/ProfileSelector';
import bonusConfig from './bonus.json';
import {
  TrueFalse,
  MultipleChoice,
  FillTheBlank,
  Text,
  OrderSteps,
  MatchPairs,
  CodeBlock,
  SpotTheHallucination,
  PromptBuilder,
  Test,
  Score,
  Article
} from './index.jsx';
import ThemeSelector from './components/Theme/ThemeSelector';
import './App.css';
import ai1 from './art/ai-1.md?raw';
import ai2 from './art/ai-2.md?raw';
// import ai3 from './art/ai-3.md';
// import ai4 from './art/ai-4.md';
// import ai5 from './art/ai-5.md';
// import ai6 from './art/ai-6.md';


/**
 * Демо-страница с примерами всех компонентов
 */
function App() {
  const { activeProfile, needsProfile } = useProfile();

  const badges = activeProfile ? [
    { key: 'mass', value: activeProfile.maxSpeed != null ? (activeProfile.maxSpeed + (activeProfile.uniqueArticles || 0) + (activeProfile.disciplineBonus || 0)) : 0, label: bonusConfig.mass.label, bg: bonusConfig.mass.color },
    { key: 'speed', value: activeProfile.maxSpeed || 0, label: bonusConfig.speed.label, bg: bonusConfig.speed.color },
    { key: 'progress', value: activeProfile.progress || 0, label: bonusConfig.progress.label, bg: (activeProfile.progress || 0) >= 0 ? bonusConfig.progress.colorPositive : bonusConfig.progress.colorNegative },
    { key: 'discipline', value: activeProfile.disciplineBonus || 0, label: bonusConfig.discipline.label, bg: bonusConfig.discipline.color },
  ] : [];

  return (
    <div className="app">
      <ProfileSelector />

      <div className="app-header">
        <h1>reati</h1>
        {activeProfile && (
          <div className="header-right">
            <span className="header-name">{activeProfile.name}</span>
            <div className="header-badges">
              {badges.map(b => (
                <span key={b.key} className="badge" style={{ backgroundColor: b.bg }} title={b.label}>
                  {b.value}
                </span>
              ))}
            </div>
            <ThemeSelector />
          </div>
        )}
        {!activeProfile && <ThemeSelector />}
      </div>

      {/* ==================== СТАТЬИ ==================== */}
      <section className="section">
        <h2>Статьи</h2>

        <Article
          id={hash("Нейросеть научилась нагло врать!" + "Че Блок")}
          author="Че Блок"
          title="Нейросеть научилась нагло врать!"
          content={ai1}
        />

        <Article
          id={hash("Твой робот делает фальшивые фото!" + "Фидель Ахматова")}
          author="Фидель Ахматова"
          title="Твой робот делает фальшивые фото!"
          content={ai2}
        />

      {/*  <Article
          id={hash("Скажи мне, кто я есть!" + "Камило Есенин")}
          author="Камило Есенин"
          title="Скажи мне, кто я есть!"
          content={ai3}
        />

        <Article
          id={hash("Строгий приказ для непослушной машины!" + "Рауль Пастернак")}
          author="Рауль Пастернак"
          title="Строгий приказ для непослушной машины!"
          content={ai4}
        />

        <Article
          id={hash("У железного друга нет сердца!" + "Франк Волконский")}
          author="Франк Волконский"
          title="У железного друга нет сердца!"
          content={ai5}
        />

        <Article
          id={hash("Твой друг-робот поможет учиться!" + "Убер Пестель")}
          author="Убер Пестель"
          title="Твой друг-робот поможет учиться!"
          content={ai6}
        />*/}
      </section>

      {/* ==================== INLINE РЕЖИМ ==================== */}
      <section className="section">
        <h2>Inline-режим (одиночные вопросы)</h2>

        {/* TrueFalse */}
        <article className="article">
          <p>
            React — это библиотека для создания пользовательских интерфейсов.
            Она была разработана компанией Facebook в 2013 году.
          </p>

          <TrueFalse
            id="inline-tf-1"
            question="React был разработан компанией Google в 2015 году"
            correctAnswer="false"
            explanation="React был разработан Facebook (Meta) в 2013 году."
            points={5}
          />

          <p>
            Продолжение статьи после вопроса...
          </p>
        </article>

        {/* MultipleChoice */}
        <article className="article">
          <p>Выберите правильный ответ на следующий вопрос:</p>

          <MultipleChoice
            id="inline-mc-1"
            question="Какой хук используется для управления состоянием в React?"
            options={{
              type: 'multiple',
              multiple: false,
              items: ['useState', 'useEffect', 'useContext', 'useReducer']
            }}
            correctAnswer={hash('useState')}
            explanation="useState — основной хук для управления локальным состоянием компонента."
            points={10}
          />
        </article>

        {/* MultipleChoice с множественным выбором */}
        <article className="article">
          <MultipleChoice
            id="inline-mc-2"
            question="Какие из перечисленных хуков являются базовыми в React?"
            options={{
              type: 'multiple',
              multiple: true,
              items: ['useState', 'useEffect', 'useCustomHook', 'useContext', 'usejQuery']
            }}
            correctAnswer={`${hash('useState')}|${hash('useEffect')}|${hash('useContext')}`}
            explanation="useState, useEffect и useContext — базовые хуки React. useCustomHook — пользовательский хук, usejQuery — не существует."
            points={15}
          />
        </article>

        {/* FillTheBlank */}
        <article className="article">
          <p>Заполните пропуск в предложении:</p>

          <FillTheBlank
            id="inline-ftb-1"
            question="Хук useEffect выполняется после _____ компонента."
            options={{ placeholder: 'Введите слово' }}
            correctAnswer="рендера"
            explanation="useEffect выполняется после рендера компонента."
            points={10}
          />
        </article>

        {/* Text */}
        <article className="article">
          <Text
            id="inline-text-1"
            question="Опишите своими словами, что такое виртуальный DOM:"
            options={{ placeholder: 'Введите ответ', rows: 4 }}
            correctAnswer="Виртуальный DOM — это легковесная копия реального DOM, которая позволяет React эффективно обновлять интерфейс"
            explanation="Виртуальный DOM — это программное представление реального DOM в памяти."
            points={20}
          />
        </article>

        {/* CodeBlock */}
        <article className="article">
          <CodeBlock
            id="inline-code-1"
            question="Напишите хук для получения ширины окна браузера:"
            options={{ placeholder: 'function useWindowWidth() { ... }' }}
            correctAnswer={`function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}`}
            explanation="Этот хук отслеживает ширину окна и очищает подписку при размонтировании."
            points={30}
          />
        </article>

        {/* OrderSteps */}
        <article className="article">
          <OrderSteps
            id="inline-order-1"
            question="Расставьте этапы жизненного цикла React-компонента в правильном порядке:"
            options={{
              type: 'order',
              items: ['Render', 'Constructor', 'ComponentDidMount', 'ComponentWillUnmount']
            }}
            correctAnswer={`${hash('Constructor')}|${hash('Render')}|${hash('ComponentDidMount')}|${hash('ComponentWillUnmount')}`}
            explanation="Constructor → Render → ComponentDidMount → ComponentWillUnmount"
            points={15}
          />
        </article>

        {/* MatchPairs */}
        <article className="article">
          <MatchPairs
            id="inline-match-1"
            question="Соедините хуки с их назначением:"
            options={{
              type: 'match',
              pairs: [
                { left: 'useState', right: 'Управление состоянием' },
                { left: 'useEffect', right: 'Побочные эффекты' },
                { left: 'useContext', right: 'Доступ к контексту' },
                { left: 'useMemo', right: 'Мемоизация значений' }
              ]
            }}
            correctAnswer=""
            explanation="Каждый хук имеет своё специфическое назначение в React."
            points={20}
          />
        </article>

        {/* SpotTheHallucination */}
        <article className="article">
          <SpotTheHallucination
            id="inline-hall-1"
            question="Найдите слова-галлюцинации (неверные утверждения) в тексте:"
            options={{
              type: 'hallucination',
              text: "React был создан Google в 2010 году. React Native позволяет создавать мобильные приложения. jQuery является частью React. Виртуальный DOM работает медленнее реального."
            }}
            correctAnswer="2|5|6|7|8|9"
            explanation="'Google' — React создан Facebook. '2010' — React создан в 2013. 'jQuery является частью React' — это неверно. 'Виртуальный DOM работает медленнее реального' — неверно, он быстрее."
            points={25}
          />
        </article>

        {/* PromptBuilder */}
        <article className="article">
          <PromptBuilder
            id="inline-prompt-1"
            question="Составьте промпт для AI-ассистента в правильном порядке:"
            options={{
              type: 'prompt',
              blocks: [
                'Напиши функцию на JavaScript',
                'которая сортирует массив чисел',
                'по возрастанию',
                'используя алгоритм быстрой сортировки',
                'с временной сложностью O(n log n)'
              ]
            }}
            correctAnswer={`${hash('Напиши функцию на JavaScript')}|${hash('которая сортирует массив чисел')}|${hash('по возрастанию')}|${hash('используя алгоритм быстрой сортировки')}|${hash('с временной сложностью O(n log n)')}`}
            explanation="Правильный порядок: задача → объект → условие → метод → ограничение"
            points={20}
          />
        </article>
      </section>

      {/* ==================== ТЕСТ-РЕЖИМ ==================== */}
      <section className="section">
        <h2>Тест-режим</h2>

        <Test id="test-react-basics" limit="5m" showCorrectAnswers={true}>
          <TrueFalse
            id="test-tf-1"
            question="React использует двустороннюю привязку данных"
            correctAnswer="false"
            explanation="React использует одностороннюю привязку данных (one-way data flow)."
            points={5}
          />

          <MultipleChoice
            id="test-mc-1"
            question="Что возвращает компонент-функция в React?"
            options={{
              type: 'multiple',
              multiple: false,
              items: ['HTML', 'JSX', 'DOM-элемент', 'React-элемент']
            }}
            correctAnswer={hash('React-элемент')}
            explanation="Компонент-функция возвращает React-элемент (виртуальный DOM-узел)."
            points={10}
          />

          <FillTheBlank
            id="test-ftb-1"
            question="Метод _____ вызывается при удалении компонента из DOM."
            options={{ placeholder: 'Введите название метода' }}
            correctAnswer="componentWillUnmount"
            explanation="componentWillUnmount вызывается перед удалением компонента."
            points={10}
          />

          <OrderSteps
            id="test-order-1"
            question="Расставьте шаги обновления состояния в правильном порядке:"
            options={{
              type: 'order',
              items: ['setState вызван', 'Reconciliation', 'Новый виртуальный DOM', 'Обновление реального DOM']
            }}
            correctAnswer={`${hash('setState вызван')}|${hash('Новый виртуальный DOM')}|${hash('Reconciliation')}|${hash('Обновление реального DOM')}`}
            points={15}
          />
        </Test>
      </section>

      {/* ==================== СЧЁТЧИКИ ==================== */}
      <section className="section">
        <h2>Примеры счётчиков</h2>

        <div className="counters-demo">
          <div className="counter-item">
            <h3>Счётчик для вопроса</h3>
            <Score type="question" targetId="inline-tf-1" />
          </div>

          <div className="counter-item">
            <h3>Счётчик для теста</h3>
            <Score type="test" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
