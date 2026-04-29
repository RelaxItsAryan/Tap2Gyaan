import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Users, Timer, Brain, Briefcase, StickyNote, ListChecks, BookOpen,
  CalendarDays, Clock3, BarChart3, Trophy, Settings, LogOut, Menu, X,
  Flame, Bot, Info, Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Info, label: 'About Us', emoji: '🌟' },
  { path: '/pomodoro', icon: Timer, label: 'Pomodoro', emoji: '🍅' },
  { path: '/ai-chat', icon: Bot, label: 'AI Assistant', emoji: '🤖' },
  { path: '/quizzes', icon: Brain, label: 'Quizzes', emoji: '🧠' },
  { path: '/interview', icon: Briefcase, label: 'Interview', emoji: '💼' },
  { path: '/notes', icon: StickyNote, label: 'Notes', emoji: '📝' },
  { path: '/planner', icon: ListChecks, label: 'AI Study Plan', emoji: '📅' },
  { path: '/books', icon: BookOpen, label: 'AI book notes', emoji: '📚' },
  { path: '/timetable', icon: Clock3, label: 'Timetable', emoji: '⏰' },
  { path: '/gamification', icon: Trophy, label: 'Gamification', emoji: '🏆' },
  { path: '/settings', icon: Settings, label: 'Settings', emoji: '⚙️' },
];

export default function Sidebar() {
  const { user, username, xp, sidebarOpen, setSidebarOpen, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden glass-button p-2.5 rounded-xl text-slate-300 hover:text-white hover:border-brand-accent transition-all animate-fade-in"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-30 lg:hidden backdrop-blur-md"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Floating Sidebar Dock */}
      <aside className={`fixed top-4 bottom-4 left-4 z-40 glass-panel rounded-[2rem] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10
        ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-[120%] lg:translate-x-0 lg:w-[80px] lg:hover:w-64'}
        group/sidebar`}
      >
        {/* Brand */}
        <div className="px-5 py-6 border-b border-white/5 flex items-center gap-4 min-h-[84px] relative overflow-hidden">
          {/* Subtle logo bg glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-accent/10 to-brand-secondary/10 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500" />
          
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-accent to-brand-secondary flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-pulse-glow z-10">
            <Sparkles size={20} className="text-white animate-float" />
          </div>
          <span className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 text-xl tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 z-10
            ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:w-auto'}`}>
            Tap2Gyaan
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto custom-scrollbar space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            const isRoomActive = item.path === '/' && (location.pathname === '/' || location.pathname.startsWith('/room'));

            const active = isActive || isRoomActive;

            if (item.path === '/interview') {
              return (
                <a
                  key={item.path}
                  href="https://interview-buddy-v2.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 text-sm font-medium hover-bounce group/navitem
                    ${active
                      ? 'bg-gradient-to-r from-brand-accent/20 to-brand-secondary/20 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)] border border-brand-accent/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <div className="relative flex items-center justify-center shrink-0 w-6">
                    <Icon size={22} className={`transition-transform duration-300 ${active ? 'text-brand-accent scale-110' : 'group-hover/navitem:text-brand-secondary group-hover/navitem:scale-110'}`} />
                  </div>
                  <div className={`flex items-center gap-2 whitespace-nowrap overflow-hidden transition-all duration-300
                    ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:w-auto'}`}>
                    <span className="text-base">{item.emoji}</span>
                    <span className="font-semibold tracking-wide">{item.label}</span>
                  </div>
                </a>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 text-sm font-medium hover-bounce group/navitem
                  ${active
                    ? 'bg-gradient-to-r from-brand-accent/20 to-brand-secondary/20 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)] border border-brand-accent/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
              >
                <div className="relative flex items-center justify-center shrink-0 w-6">
                  <Icon size={22} className={`transition-transform duration-300 ${active ? 'text-brand-accent scale-110' : 'group-hover/navitem:text-brand-accent group-hover/navitem:scale-110'}`} />
                  {active && <div className="absolute inset-0 bg-brand-accent blur-md opacity-40 rounded-full" />}
                </div>
                <div className={`flex items-center gap-2 whitespace-nowrap overflow-hidden transition-all duration-300
                  ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:w-auto'}`}>
                  <span className="text-base">{item.emoji}</span>
                  <span className="font-semibold tracking-wide">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-accent to-blue-500 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg border border-white/20 hover:scale-105 transition-transform">
              {username.charAt(0).toUpperCase()}
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 bg-brand-secondary text-[9px] font-black px-1.5 py-0.5 rounded-md border border-black shadow-sm">
                L{level}
              </div>
            </div>
            <div className={`flex-1 overflow-hidden transition-all duration-300
              ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:w-auto'}`}>
              <div className="text-sm font-bold text-white truncate">{username}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-brand-accent to-brand-success rounded-full transition-all duration-1000 relative" style={{ width: `${(xpInLevel / 500) * 100}%` }}>
                    <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-brand-accent">{xpInLevel}/500</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav (compact floating dock) */}
      <div className="fixed bottom-4 left-4 right-4 z-30 lg:hidden glass-panel rounded-2xl flex justify-around p-2 shadow-2xl border border-white/10 animate-slide-up">
        {navItems.slice(0, 4).map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/room'));

          if (item.path === '/interview') {
            return (
              <a
                key={item.path}
                href="https://interview-buddy-v2.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 text-[10px] text-slate-400 hover:bg-white/5"
              >
                <div className="relative">
                  <Icon size={20} />
                </div>
                <span className="font-semibold">{item.label}</span>
              </a>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 text-[10px] relative
                ${isActive ? 'text-white' : 'text-slate-400 hover:bg-white/5'}`}
            >
              {isActive && <div className="absolute inset-0 bg-brand-accent/20 rounded-xl blur-md" />}
              <div className="relative z-10">
                <Icon size={20} className={`${isActive ? 'text-brand-accent scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''}`} />
              </div>
              <span className={`font-semibold z-10 ${isActive ? 'text-brand-accent' : ''}`}>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 text-[10px] hover:bg-white/5 transition-all"
        >
          <Menu size={20} />
          <span className="font-semibold">More</span>
        </button>
      </div>
    </>
  );
}