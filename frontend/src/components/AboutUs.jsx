import React from 'react';
import {
  Timer, Brain, Briefcase, StickyNote, ListChecks, BookOpen,
  Clock3, Trophy, Bot, Star, Zap, Shield
} from 'lucide-react';

const features = [
  { icon: Timer, title: 'Pomodoro', desc: 'Customizable focus timers with gamified rewards.', emoji: '🍅' },
  { icon: Bot, title: 'AI Assistant', desc: 'Your personal AI tutor ready to answer questions.', emoji: '🤖' },
  { icon: Brain, title: 'Quizzes', desc: 'Generate and take quizzes to test your knowledge.', emoji: '🧠' },
  { icon: Briefcase, title: 'Interview Prep', desc: 'AI-driven mock interviews to boost confidence.', emoji: '💼' },
  { icon: StickyNote, title: 'Notes', desc: 'Organize your thoughts and study materials.', emoji: '📝' },
  { icon: ListChecks, title: 'AI Study Plan', desc: 'Personalized learning paths tailored to you.', emoji: '📅' },
  { icon: BookOpen, title: 'AI Book Notes', desc: 'Quick summaries and insights from books.', emoji: '📚' },
  { icon: Clock3, title: 'Timetable', desc: 'Schedule your classes and study sessions.', emoji: '⏰' },
  { icon: Trophy, title: 'Gamification', desc: 'Earn XP, level up, and stay motivated.', emoji: '🏆' },
];

export default function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-10">
      {/* Hero Header */}
      <div className="text-center space-y-6 pt-10">
        <div className="inline-block px-4 py-1.5 rounded-full glass-button text-brand-accent font-bold text-sm mb-4 animate-float cursor-default">
          🚀 Next-Gen AI Learning Platform
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">Tap2Gyaan</span>
        </h1>
        <p className="text-slate-300 max-w-3xl mx-auto text-xl leading-relaxed">
          We built Tap2Gyaan to revolutionize the way you learn. Combining powerful <span className="text-brand-accent font-bold">AI tools</span> with <span className="text-brand-secondary font-bold">gamified motivation</span>, we've created the ultimate all-in-one study platform. 🌟
        </p>
      </div>

      {/* Mission / Vision Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 px-4">
        {/* Mission */}
        <div className="glass-panel rounded-[2rem] p-8 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-3xl group-hover:bg-brand-accent/20 transition-all duration-500" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-accent to-blue-500 flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:rotate-6 transition-all duration-300">
            <Zap size={32} />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Our Mission 🎯</h3>
          <p className="text-slate-400 font-medium leading-relaxed text-lg">To empower students with cutting-edge tools that make learning faster, more engaging, and highly effective.</p>
        </div>
        {/* Vision */}
        <div className="glass-panel rounded-[2rem] p-8 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,0,122,0.2)] transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary/10 rounded-full blur-3xl group-hover:bg-brand-secondary/20 transition-all duration-500" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-secondary to-pink-500 flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:-rotate-6 transition-all duration-300">
            <Star size={32} />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Our Vision 🌌</h3>
          <p className="text-slate-400 font-medium leading-relaxed text-lg">A world where education is personalized, accessible, and fun for everyone, driven by Artificial Intelligence.</p>
        </div>
        {/* Values */}
        <div className="glass-panel rounded-[2rem] p-8 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,255,157,0.2)] transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-success/10 rounded-full blur-3xl group-hover:bg-brand-success/20 transition-all duration-500" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-success to-emerald-500 flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:rotate-12 transition-all duration-300">
            <Shield size={32} />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Our Values 💎</h3>
          <p className="text-slate-400 font-medium leading-relaxed text-lg">Innovation, accessibility, user-centric design, and continuous improvement in the digital learning space.</p>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="mt-24 pt-10 border-t border-white/10">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-12 text-center drop-shadow-lg">Discover the Toolkit 🛠️</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-3xl flex gap-5 items-start hover:bg-white/10 transition-all duration-300 group cursor-pointer hover:scale-[1.02]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-brand-accent/50 shadow-inner relative">
                  <div className="absolute inset-0 bg-brand-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon size={26} className="text-brand-accent relative z-10" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    {feature.title} <span className="text-2xl">{feature.emoji}</span>
                  </h4>
                  <p className="text-base text-slate-400 font-medium">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer / CTA */}
      <div className="mt-24 relative overflow-hidden rounded-[3rem] p-12 text-center group cursor-pointer hover:scale-[1.01] transition-all duration-500 mx-4 lg:mx-0 border border-white/10">
        {/* Dynamic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/20 via-brand-secondary/20 to-blue-600/20 blur-2xl group-hover:blur-3xl transition-all duration-700" />
        <div className="absolute inset-0 bg-brand-card/60 backdrop-blur-3xl" />
        
        <div className="relative z-10">
          <h3 className="text-4xl font-black text-white mb-4">Ready to level up your studies? 🔥</h3>
          <p className="text-slate-300 mb-8 text-xl max-w-2xl mx-auto font-medium">Explore the tools in the sidebar and start your personalized learning journey with Tap2Gyaan today.</p>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 animate-float text-3xl shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            👇
          </div>
        </div>
      </div>
    </div>
  );
}
