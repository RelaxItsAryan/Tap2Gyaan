import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import AboutUs from './components/AboutUs';
import PomodoroTimer from './components/PomodoroTimer';
import QuizPage from './components/QuizPage';
import InterviewPrep from './components/InterviewPrep';
import NotesPage from './components/NotesPage';
import PlannerPage from './components/PlannerPage';
import BookInsights from './components/BookInsights';
import TimetablePage from './components/TimetablePage';
import GamificationPage from './components/GamificationPage';
import SettingsPage from './components/SettingsPage';
import AIChatbot from './components/AIChatbot';
import Toast from './components/Toast';
import bgImage from './assets/Bg_new.png';

function App() {
  const { user } = useApp();
  const location = useLocation();

  // Show login if no user
  if (!user) {
    return (
      <>
        <LoginPage />
        <Toast />
      </>
    );
  }

  return (
    <div
      className="min-h-screen bg-brand-bg bg-cover bg-center bg-fixed font-outfit selection:bg-brand-accent/30"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Sidebar />

      {/* Main content area — pushed right on desktop for sidebar */}
      <main className="lg:pl-[90px] lg:pr-6 pb-20 lg:pb-6 min-h-screen pt-4 lg:pt-6">
        <div className="w-full max-w-7xl mx-auto glass-panel rounded-3xl min-h-[calc(100vh-3rem)] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
          {/* Subtle glowing orbs behind content */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          <Routes>
            <Route path="/" element={<AboutUs />} />
            <Route path="/pomodoro" element={<PomodoroTimer />} />
            <Route path="/ai-chat" element={<AIChatbot />} />
            <Route path="/quizzes" element={<QuizPage />} />
            <Route path="/interview" element={<InterviewPrep />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/books" element={<BookInsights />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/gamification" element={<GamificationPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Toast />
    </div>
  );
}

export default App;
