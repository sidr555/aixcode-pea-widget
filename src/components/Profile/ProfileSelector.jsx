import { useState, memo } from 'react';
import { useProfile } from './ProfileContext';
import { useTheme } from '../Theme/ThemeContext';
import styles from './Profile.module.css';

function calcAge(birthDate) {
  if (!birthDate) return null;
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function ProfileSelector() {
  const { profiles, needsProfile, createProfile, selectProfile, deleteProfile } = useProfile();
  const { colors } = useTheme();
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(profiles.length === 0);
  const [form, setForm] = useState({ name: '', surname: '', birthDate: '', gender: '' });

  if (!needsProfile) return null;

  const handleSelect = (id) => {
    selectProfile(id);
  };

  const handleToggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId(prev => prev === id ? null : id);
    setShowForm(false);
  };

  const handleNewClick = () => {
    setExpandedId(null);
    setShowForm(true);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const profile = createProfile({
      name: form.name.trim(),
      surname: form.surname.trim(),
      birthDate: form.birthDate,
      gender: form.gender,
    });
    selectProfile(profile.id);
    setForm({ name: '', surname: '', birthDate: '', gender: '' });
    setShowForm(false);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (confirm('Удалить профиль и все его данные?')) {
      deleteProfile(id);
      if (expandedId === id) setExpandedId(null);
    }
  };

  const totalScore = (p) => {
    return (p.maxSpeed || 0) + (p.uniqueArticles || 0) + (p.disciplineBonus || 0);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h2 className={styles.panelTitle} style={{ color: colors.primary }}>Выберите профиль</h2>

        <div className={styles.list}>
          {profiles.map(p => (
            <div key={p.id} className={styles.item}>
              <button
                className={`${styles.itemHeader} ${expandedId === p.id ? styles.itemHeaderActive : ''}`}
                onClick={() => handleSelect(p.id)}
                type="button"
              >
                <span className={styles.itemName}>{p.name}{p.surname ? ` ${p.surname}` : ''}</span>
                <span className={styles.itemMeta}>
                  {calcAge(p.birthDate) !== null && <span>{calcAge(p.birthDate)} лет</span>}
                  <span className={styles.itemScore}>{totalScore(p)}</span>
                  <span
                    className={styles.itemDot}
                    style={{ backgroundColor: colors.primary }}
                    onClick={(e) => handleToggleExpand(p.id, e)}
                  />
                </span>
              </button>
              {expandedId === p.id && (
                <div className={styles.itemBody}>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(p.id, e)}
                    type="button"
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* New profile row */}
          <button
            className={`${styles.itemHeader} ${styles.newProfileBtn} ${showForm ? styles.itemHeaderActive : ''}`}
            onClick={handleNewClick}
            type="button"
          >
            <span>+ Новый профиль</span>
          </button>
        </div>

        {showForm && (
          <form className={styles.form} onSubmit={handleCreate} onClick={e => e.stopPropagation()}>
            <input
              className={styles.input}
              type="text"
              placeholder="Имя *"
              value={form.name}
              onInput={e => setForm(f => ({ ...f, name: e.target.value }))}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
              required
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Фамилия"
              value={form.surname}
              onInput={e => setForm(f => ({ ...f, surname: e.target.value }))}
              onChange={e => setForm(f => ({ ...f, surname: e.target.value }))}
            />
            <input
              className={styles.input}
              type="date"
              placeholder="Дата рождения"
              value={form.birthDate}
              onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
            />
            <div className={styles.genderRow}>
              {[['m', 'он'], ['f', 'она'], ['n', 'оно']].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  className={`${styles.genderBtn} ${form.gender === val ? styles.genderBtnActive : ''}`}
                  style={form.gender === val ? { backgroundColor: colors.primary, borderColor: colors.primary } : undefined}
                  onClick={() => setForm(f => ({ ...f, gender: f.gender === val ? '' : val }))}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              className={styles.createBtn}
              type="submit"
              style={{ backgroundColor: colors.primary }}
            >
              Создать
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default memo(ProfileSelector);
