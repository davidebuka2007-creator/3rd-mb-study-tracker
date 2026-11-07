import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  BookOpen, Lock, Mail, ArrowRight, CheckCircle2, 
  ShieldCheck, Sparkles, Timer, LayoutDashboard, 
  CheckSquare, LogOut, ChevronRight, Activity, Award 
} from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Check active session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Pomodoro Timer Effect
  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Account created successfully! You can now sign in.' });
        setIsSignUp(false);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // ==========================================
  // LOGGED-IN APP DASHBOARD VIEW
  // ==========================================
  if (session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        
        {/* Top Navigation Bar */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">3rd MB Study Suite</h1>
              <p className="text-xs text-slate-400">Clinical Academic Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              {session.user.email}
            </span>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Overview & Stats
            </button>
            <button 
              onClick={() => setActiveTab('tracker')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === 'tracker' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <CheckSquare className="w-4 h-4" /> Syllabus Tracker
            </button>
            <button 
              onClick={() => setActiveTab('pomodoro')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === 'pomodoro' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Timer className="w-4 h-4" /> Study Timer
            </button>
          </aside>

          {/* Dynamic Content Area */}
          <main className="lg:col-span-3 space-y-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-xl">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Progress</p>
                    <h3 className="text-3xl font-extrabold text-white mt-2">12<span className="text-indigo-400 text-lg">%</span></h3>
                    <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">↑ On track for MB exams</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-xl">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Subjects</p>
                    <h3 className="text-3xl font-extrabold text-white mt-2">5</h3>
                    <p className="text-xs text-slate-400 mt-2">Pathology, Pharm, Anatomy...</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-xl">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Focus Time</p>
                    <h3 className="text-3xl font-extrabold text-white mt-2">4.5<span className="text-indigo-400 text-lg">hrs</span></h3>
                    <p className="text-xs text-indigo-400 mt-2">Logged today</p>
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Clinical Posting Ready</h2>
                      <p className="text-xs text-slate-400">Your high-yield revision roadmap is active.</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Welcome to your professional medical tracking suite. Use the sidebar to log your completed syllabus topics or initiate focused Pomodoro reading intervals.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'tracker' && (
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Syllabus Master Checklist</h2>
                  <p className="text-xs text-slate-400 mt-1">Check off topics as you conquer past questions and lectures.</p>
                </div>
                <div className="space-y-3">
                  {['General Pathology & Neoplasia', 'Cardiovascular Pharmacology', 'Systemic Anatomy: Neuroanatomy', 'Medical Biochemistry: Metabolism', 'Clinical Physiology: Renal System'].map((topic, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900" />
                      <span className="text-sm font-medium text-slate-200">{topic}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'pomodoro' && (
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-center space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Pomodoro Study Session</h2>
                  <p className="text-xs text-slate-400 mt-1">1 Hour Reading / 15 Minute Break Routine</p>
                </div>
                <div className="py-10">
                  <span className="text-6xl font-mono font-extrabold text-indigo-400 tracking-wider">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-sm shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    {isTimerRunning ? 'Pause Session' : 'Start Reading'}
                  </button>
                  <button 
                    onClick={() => { setIsTimerRunning(false); setTimeLeft(3600); }}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-slate-300 text-sm transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // ==========================================
  // REFINED, HIGH-END LANDING & AUTH PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Background glowing gradients for designer feel */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full mx-auto pt-12 pb-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-2xl backdrop-blur-xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">3rd MB Study Tracker</h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            The ultimate high-yield academic suite engineered for medical excellence.
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white tracking-wide">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Secure Portal
            </span>
          </div>

          {message && (
            <div className={`mb-4 p-3.5 rounded-xl text-xs font-medium border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  required
                  placeholder="put your email here"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group disabled:opacity-50 text-sm"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
            <span className="text-xs text-slate-300 font-medium">Cloud Synchronized</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            <span className="text-xs text-slate-300 font-medium">Syllabus Tracking</span>
          </div>
        </div>

      </div>

      <footer className="text-center text-xs text-slate-600 py-4 relative z-10">
        &copy; 2026 3rd MB Study Suite. Designed for clinical precision.
      </footer>
    </div>
  );
}
