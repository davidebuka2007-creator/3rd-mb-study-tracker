import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { BookOpen, Lock, Mail, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [session, setSession] = useState(null);

  // Handle Authentication (Login / Sign Up)
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Account created! Check your email or sign in.' });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSession(data.session);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // If user is logged in, show the sleek dashboard placeholder
  if (session) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-6">
        <header className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" /> 3rd MB Study Tracker
            </h1>
            <p className="text-sm text-slate-500">Welcome back, future doctor!</p>
          </div>
          <button 
            onClick={() => setSession(null)}
            className="text-sm px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-600 transition-colors"
          >
            Sign Out
          </button>
        </header>

        <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-1">Study Progress</h3>
            <p className="text-3xl font-extrabold text-indigo-600">0%</p>
            <p className="text-xs text-slate-400 mt-2">Syllabus completion rate</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-1">Active Modules</h3>
            <p className="text-3xl font-extrabold text-emerald-600">5</p>
            <p className="text-xs text-slate-400 mt-2">Anatomy, Physiology, Biochem...</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-1">Pomodoro Timer</h3>
            <p className="text-3xl font-extrabold text-amber-600">60m</p>
            <p className="text-xs text-slate-400 mt-2">Ready for study session</p>
          </div>
        </main>
      </div>
    );
  }

  // Modern, Polished Landing & Auth Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-between p-6">
      <div className="max-w-md w-full mx-auto pt-10 pb-6">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-inner">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">3rd MB Study Tracker</h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Your clinical-grade cloud academic suite for mastering medical examinations.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Secure Portal
            </span>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-xl text-sm border ${message.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-200' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700/60 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-indigo-300 hover:text-indigo-200 font-medium transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        {/* Footer features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
            <span className="text-xs text-slate-300 font-medium">Cloud Synced</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <span className="text-xs text-slate-300 font-medium">Syllabus Tracking</span>
          </div>
        </div>

      </div>
      <footer className="text-center text-xs text-slate-500 py-4">
        &copy; 2026 3rd MB Study Suite. Built for excellence.
      </footer>
    </div>
  );
}
