import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, Shield, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import logo from '../assets/logo.png';

import { triggerToast } from './Toast';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';

export default function LoginPage() {
  const { login } = useApp();

  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill all fields.');
      return;
    }

    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = credential.user;
      const userData = {
        id: fbUser.uid,
        email: fbUser.email,
        username: fbUser.displayName || fbUser.email,
      };
      triggerToast('Logged in successfully!', 'success');
      login(userData);
    } catch (err) {
      setError(err.message);
      triggerToast('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const fbUser = credential.user;
      const userData = {
        id: fbUser.uid,
        email: fbUser.email,
        username: fbUser.displayName || fbUser.email,
      };

      triggerToast('Signed in with Google!', 'success');
      login(userData);
    } catch (err) {
      setError(err.message);
      triggerToast('Google sign-in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || !username) {
      setError('Please fill all fields.');
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: username });
      const userData = {
        id: credential.user.uid,
        email: credential.user.email,
        username,
      };
      triggerToast('Account created successfully!', 'success');
      login(userData);
    } catch (err) {
      setError(err.message);
      triggerToast('Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto flex items-center justify-center mb-6 overflow-hidden">
            <img src={logo} alt="Tap2Gyaan Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Tap2Gyaan</h1>
          <p className="text-slate-400">Secure AES-256 Encrypted Portal</p>
        </div>

        <div className="bg-brand-card/80 backdrop-blur-xl border border-brand-border rounded-3xl p-8 shadow-2xl">

          {/* Tabs */}
          {activeTab !== 'otp' && (
            <div className="flex p-1 bg-brand-bg border border-brand-border rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'login' ? 'bg-brand-card text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'signup' ? 'bg-brand-card text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6 animate-fade-in text-center font-medium">
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    placeholder="student@university.edu"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Secure Login'}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full border border-slate-700 hover:border-white text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
              >
                <Globe size={18} />
                Continue with Google
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Display Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    placeholder="StudyNinja"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    placeholder="student@university.edu"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    required
                  />
                </div>
              </div>



              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Create Account'}
              </button>
            </form>
          )}


        </div>

        <div className="mt-8 text-center text-xs font-medium text-slate-500 flex items-center justify-center gap-2">
          <Shield size={14} />
          End-to-End Encrypted Connection • Tap2Gyaan
        </div>
      </div>
    </div>
  );
}
