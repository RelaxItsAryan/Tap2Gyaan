import React from 'react';
import {
  Timer, Brain, Briefcase, StickyNote, ListChecks, BookOpen,
  Clock3, Trophy, Bot, Star, Zap, Shield
} from 'lucide-react';

const features = [
  { icon: Timer, title: 'Pomodoro', desc: 'Customizable focus timers with gamified rewards.' },
  { icon: Bot, title: 'AI Assistant', desc: 'Your personal AI tutor ready to answer questions.' },
  { icon: Brain, title: 'Quizzes', desc: 'Generate and take quizzes to test your knowledge.' },
  { icon: Briefcase, title: 'Interview Prep', desc: 'AI-driven mock interviews to boost confidence.' },
  { icon: StickyNote, title: 'Notes', desc: 'Organize your thoughts and study materials.' },
  { icon: ListChecks, title: 'AI Study Plan', desc: 'Personalized learning paths tailored to you.' },
  { icon: BookOpen, title: 'AI Book Notes', desc: 'Quick summaries and insights from books.' },
  { icon: Clock3, title: 'Timetable', desc: 'Schedule your classes and study sessions.' },
  { icon: Trophy, title: 'Gamification', desc: 'Earn XP, level up, and stay motivated.' },
];

export default function AboutUs() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          About <span className="text-brand-accent">Tap2Gyaan</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          We built Tap2Gyaan to revolutionize the way you learn. Combining powerful AI tools with gamified motivation, we've created the ultimate all-in-one study platform.
        </p>
      </div>

      {/* Mission / Vision */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-brand-card border border-brand-border rounded-2xl p-6 hover:border-brand-accent/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-brand-accent/20 flex items-center justify-center text-brand-accent mb-4">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
          <p className="text-slate-400">To empower students with cutting-edge tools that make learning faster, more engaging, and highly effective.</p>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-2xl p-6 hover:border-brand-accent/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <Star size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
          <p className="text-slate-400">A world where education is personalized, accessible, and fun for everyone, driven by AI.</p>
        </div>
        <div className="bg-brand-card border border-brand-border rounded-2xl p-6 hover:border-brand-accent/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Our Values</h3>
          <p className="text-slate-400">Innovation, accessibility, user-centric design, and continuous improvement in the learning space.</p>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="mt-16">
        <h2 className="text-3xl font-black text-white mb-8 text-center">What We Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-brand-card/50 border border-brand-border p-5 rounded-2xl flex gap-4 items-start hover:bg-brand-card transition-all">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-brand-accent" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">{feature.title}</h4>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer / CTA */}
      <div className="mt-16 bg-gradient-to-r from-brand-accent/20 to-blue-500/20 border border-brand-accent/30 rounded-3xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">Ready to level up your studies?</h3>
        <p className="text-slate-300 mb-6">Explore the tools in the sidebar and start your journey with Tap2Gyaan.</p>
      </div>
    </div>
  );
}
