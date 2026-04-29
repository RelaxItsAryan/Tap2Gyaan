import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { triggerToast } from '../components/Toast';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const ACHIEVEMENT_XP = {
  first_session: 50, five_sessions: 100, one_hour: 100, quiz_master: 150,
  note_taker: 75, streak_3: 100, streak_7: 250, planner_pro: 100,
  bookworm: 200, night_owl: 50, early_bird: 50, legend: 500,
};

const DAILY_XP = { dc1: 30, dc2: 25, dc3: 15, dc4: 40, dc5: 10 };

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('otsTheme') || 'dark';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // XP / Gamification state
  const [xp, setXp] = useState(() => {
    return parseInt(localStorage.getItem('otsXP') || '0', 10);
  });

  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem('otsAchievements');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState(() => {
    return JSON.parse(localStorage.getItem('otsStats')) || {
      sessions: 0,
      studyMinutes: 0,
      quizzesPerfect: 0,
      notesCreated: 0,
      plansGenerated: 0,
      booksFinished: 0,
      lastStudyDate: null,
      streak: 0,
    };
  });

  const [dailyProgress, setDailyProgress] = useState(() => {
    return JSON.parse(localStorage.getItem('otsDailyProgress')) || {
      date: new Date().toDateString(),
      studyMinutes: 0,
      quizzes: 0,
      notes: 0,
      pomodoros: 0,
      tasks: 0,
      claimed: [],
    };
  });

  const xpRef = useRef(xp);
  useEffect(() => { xpRef.current = xp; }, [xp]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const userData = {
          id: fbUser.uid,
          email: fbUser.email,
          username: fbUser.displayName || fbUser.email,
        };
        setUser(userData);
        localStorage.setItem('otsUser', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('otsUser');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => { localStorage.setItem('otsTheme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('otsXP', xp.toString()); }, [xp]);
  useEffect(() => { localStorage.setItem('otsAchievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem('otsStats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('otsDailyProgress', JSON.stringify(dailyProgress)); }, [dailyProgress]);

  useEffect(() => {
    if (dailyProgress.date !== new Date().toDateString()) {
      setDailyProgress({
        date: new Date().toDateString(),
        studyMinutes: 0, quizzes: 0, notes: 0, pomodoros: 0, tasks: 0, claimed: []
      });
    }
  }, []);

  const login = (userData) => { setUser(userData); return userData; };
  const logout = async () => {
    try { await signOut(auth); } catch (e) { console.error('Logout error', e); }
    setUser(null);
    localStorage.removeItem('otsUser');
  };

  const addXP = (amount) => { setXp(prev => prev + amount); };

  const unlockAchievement = (id) => {
    setAchievements(prev => {
      if (prev.find(a => a.id === id || a.id === id)) return prev; // check existing
      triggerToast(`Achievement Unlocked! (+${ACHIEVEMENT_XP[id]} XP)`, 'success');
      setXp(x => x + ACHIEVEMENT_XP[id]); // update xp directly
      return [...prev, { id, unlockedAt: Date.now() }];
    });
  };

  const checkAchievements = (s) => {
    if (s.sessions >= 1) unlockAchievement('first_session');
    if (s.sessions >= 5) unlockAchievement('five_sessions');
    if (s.studyMinutes >= 60) unlockAchievement('one_hour');
    if (s.quizzesPerfect >= 1) unlockAchievement('quiz_master');
    if (s.notesCreated >= 10) unlockAchievement('note_taker');
    if (s.streak >= 3) unlockAchievement('streak_3');
    if (s.streak >= 7) unlockAchievement('streak_7');
    if (s.plansGenerated >= 20) unlockAchievement('planner_pro');
    if (s.booksFinished >= 1) unlockAchievement('bookworm');

    const level = Math.floor(xpRef.current / 500) + 1;
    if (level >= 10) unlockAchievement('legend');
  };

  const checkDaily = (dp) => {
    const claimDaily = (id, curDp) => {
      triggerToast(`Daily Challenge Complete! (+${DAILY_XP[id]} XP)`, 'success');
      setXp(x => x + DAILY_XP[id]);
      return id;
    };
    
    let newlyClaimed = [];
    if (dp.studyMinutes >= 30 && !dp.claimed.includes('dc1')) newlyClaimed.push(claimDaily('dc1', dp));
    if (dp.quizzes >= 1 && !dp.claimed.includes('dc2')) newlyClaimed.push(claimDaily('dc2', dp));
    if (dp.notes >= 1 && !dp.claimed.includes('dc3')) newlyClaimed.push(claimDaily('dc3', dp));
    if (dp.pomodoros >= 3 && !dp.claimed.includes('dc4')) newlyClaimed.push(claimDaily('dc4', dp));
    if (dp.tasks >= 1 && !dp.claimed.includes('dc5')) newlyClaimed.push(claimDaily('dc5', dp));
    
    return [...dp.claimed, ...newlyClaimed];
  };

  const trackAction = (action, value = 1) => {
    let s = { ...stats };
    let dp = { ...dailyProgress };

    if (dp.date !== new Date().toDateString()) {
      dp = { date: new Date().toDateString(), studyMinutes: 0, quizzes: 0, notes: 0, pomodoros: 0, tasks: 0, claimed: [] };
    }

    const todayStr = new Date().toDateString();

    if (action === 'pomodoro_session' || action === 'study_session') {
      s.sessions += 1;
      const minutes = action === 'pomodoro_session' ? 25 : Math.round(value / 60);
      s.studyMinutes += minutes;
      dp.studyMinutes += minutes;
      if (action === 'pomodoro_session') dp.pomodoros += 1;

      const hour = new Date().getHours();
      if (hour >= 0 && hour < 4) unlockAchievement('night_owl');
      if (hour >= 4 && hour < 6) unlockAchievement('early_bird');

      if (s.lastStudyDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (s.lastStudyDate === yesterday.toDateString()) {
          s.streak += 1;
        } else {
          s.streak = 1;
        }
        s.lastStudyDate = todayStr;
      }
    } else if (action === 'quiz_completed') {
      dp.quizzes += 1;
      if (value === 100) s.quizzesPerfect += 1;
    } else if (action === 'note_created') {
      s.notesCreated += 1;
      dp.notes += 1;
    } else if (action === 'plan_generated') {
      s.plansGenerated += 1;
      dp.tasks += 1;
    } else if (action === 'book_finished') {
      s.booksFinished += 1;
    }

    dp.claimed = checkDaily(dp);
    checkAchievements(s);

    setStats(s);
    setDailyProgress(dp);
  };

  const resetAllData = () => {
    localStorage.clear();
    setUser(null);
    setXp(0);
    setAchievements([]);
    setTheme('dark');
    setStats({
      sessions: 0, studyMinutes: 0, quizzesPerfect: 0, notesCreated: 0,
      plansGenerated: 0, booksFinished: 0, lastStudyDate: null, streak: 0,
    });
    setDailyProgress({ date: new Date().toDateString(), studyMinutes: 0, quizzes: 0, notes: 0, pomodoros: 0, tasks: 0, claimed: [] });
  };

  const userId = user?.id || 'user_demo_001';
  const username = user?.username || 'Guest';

  return (
    <AppContext.Provider value={{
      user, userId, username,
      login, logout,
      theme, setTheme,
      sidebarOpen, setSidebarOpen,
      xp, addXP,
      achievements, unlockAchievement,
      stats, dailyProgress, trackAction,
      resetAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
};
