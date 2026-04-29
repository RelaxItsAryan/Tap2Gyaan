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
import bgImage from './assets/Bg.png';

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
      className="min-h-screen bg-brand-bg bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Sidebar />

      {/* Main content area — pushed right on desktop for sidebar */}
      <main className="lg:ml-[72px] pb-20 lg:pb-0 min-h-screen">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
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
