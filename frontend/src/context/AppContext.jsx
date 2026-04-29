import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

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

  useEffect(() => {
    localStorage.setItem('otsTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('otsXP', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('otsAchievements', JSON.stringify(achievements));
  }, [achievements]);

  const login = (userData) => {
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error', e);
    }

    setUser(null);
    localStorage.removeItem('otsUser');
  };

  const addXP = (amount) => {
    setXp(prev => prev + amount);
  };

  const unlockAchievement = (ach) => {
    setAchievements(prev => {
      if (prev.find(a => a.id === ach.id)) return prev;
      return [...prev, { ...ach, unlockedAt: Date.now() }];
    });
  };

  const resetAllData = () => {
    localStorage.clear();
    setUser(null);
    setXp(0);
    setAchievements([]);
    setTheme('dark');
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
      resetAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
};
