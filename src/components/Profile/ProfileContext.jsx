import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { hash } from '../../utils/hash';
import { calcAllStats } from '../../utils/bonus';
import { useTheme } from '../Theme/ThemeContext';

const ProfileContext = createContext(null);

const PROFILES_KEY = 'quest_profiles';
const ACTIVE_KEY = 'quest_active_profile';

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function writeLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function removeLS(key) {
  try { localStorage.removeItem(key); } catch {}
}

function profileId(name, surname, birthDate, gender) {
  return hash(`${name}${surname}${birthDate}${gender}`);
}

function readSessions(pid) {
  return readLS(`quest_sessions_${pid}`, []);
}

export function ProfileProvider({ children }) {
  const { theme, mode, fontSize, syncFromProfile } = useTheme();
  const [profiles, setProfiles] = useState(() => readLS(PROFILES_KEY, []));
  const [activeProfileId, setActiveProfileId] = useState(() => readLS(ACTIVE_KEY, null));
  const [needsProfile, setNeedsProfile] = useState(false);
  const initialSyncDone = useRef(false);

  // Persist profiles
  useEffect(() => { writeLS(PROFILES_KEY, profiles); }, [profiles]);

  // Persist active id
  useEffect(() => {
    if (activeProfileId) writeLS(ACTIVE_KEY, activeProfileId);
    else removeLS(ACTIVE_KEY);
  }, [activeProfileId]);

  // On mount: if no active profile, show selector
  useEffect(() => {
    if (!activeProfileId) {
      setNeedsProfile(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load theme settings from profile on mount and on profile switch
  useEffect(() => {
    if (!activeProfileId) return;
    const profile = profiles.find(p => p.id === activeProfileId);
    if (profile) {
      syncFromProfile(profile);
      initialSyncDone.current = true;
    }
  }, [activeProfileId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save theme/mode/fontSize to active profile when they change
  useEffect(() => {
    if (!activeProfileId || !initialSyncDone.current) return;
    setProfiles(prev => prev.map(p => {
      if (p.id !== activeProfileId) return p;
      if (p.theme === theme && p.mode === mode && p.fontSize === fontSize) return p;
      return { ...p, theme, mode, fontSize };
    }));
  }, [theme, mode, fontSize, activeProfileId]);

  const activeProfile = useMemo(
    () => profiles.find(p => p.id === activeProfileId) || null,
    [profiles, activeProfileId]
  );

  const createProfile = useCallback(({ name, surname = '', birthDate = '', gender = '' }) => {
    const id = profileId(name, surname, birthDate, gender);
    const existing = profiles.find(p => p.id === id);
    if (existing) return existing;

    const newProfile = {
      id, name, surname, birthDate, gender,
      theme: 'orange', mode: 'light', fontSize: 16,
      lastSessionTime: null,
      uniqueArticles: 0,
      maxSpeed: 0,
      progress: 0,
      disciplineBonus: 0,
    };
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  }, [profiles]);

  const deleteProfile = useCallback((id) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    removeLS(`quest_sessions_${id}`);
    if (activeProfileId === id) {
      setActiveProfileId(null);
      setNeedsProfile(true);
    }
  }, [activeProfileId]);

  const selectProfile = useCallback((id) => {
    setActiveProfileId(id);
    setNeedsProfile(false);
  }, []);

  const openProfileSelector = useCallback(() => {
    setNeedsProfile(true);
  }, []);

  const updateProfileStats = useCallback((id) => {
    const sessions = readSessions(id);
    const stats = calcAllStats(sessions);
    setProfiles(prev => prev.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        maxSpeed: stats.speed,
        uniqueArticles: stats.mass,
        progress: stats.progress,
        disciplineBonus: stats.disciplineBonus,
        lastSessionTime: sessions.length > 0 ? sessions[sessions.length - 1].timestamp : p.lastSessionTime,
      };
    }));
  }, []);

  const addSession = useCallback((articleId, wordCount) => {
    if (!activeProfileId) return;
    const sessions = readSessions(activeProfileId);
    const now = new Date();
    sessions.push({
      articleId,
      wordCount,
      date: now.toISOString().slice(0, 10),
      timestamp: now.getTime(),
    });
    writeLS(`quest_sessions_${activeProfileId}`, sessions);
    updateProfileStats(activeProfileId);
  }, [activeProfileId, updateProfileStats]);

  const updateProfileField = useCallback((id, fields) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
  }, []);

  const value = useMemo(() => ({
    profiles,
    activeProfile,
    activeProfileId,
    needsProfile,
    createProfile,
    deleteProfile,
    selectProfile,
    openProfileSelector,
    updateProfileStats,
    addSession,
    updateProfileField,
  }), [profiles, activeProfile, activeProfileId, needsProfile, createProfile, deleteProfile, selectProfile, openProfileSelector, updateProfileStats, addSession, updateProfileField]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    return {
      profiles: [], activeProfile: null, activeProfileId: null, needsProfile: true,
      createProfile: () => {}, deleteProfile: () => {}, selectProfile: () => {},
      openProfileSelector: () => {}, updateProfileStats: () => {}, addSession: () => {},
      updateProfileField: () => {},
    };
  }
  return ctx;
}

export default ProfileContext;
