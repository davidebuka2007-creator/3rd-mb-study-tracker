import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { OFFICIAL_SYLLABUS } from './data/syllabusData';
import { 
  BookOpen, LayoutDashboard, CheckCircle2, Clock, Circle, 
  Search, Lock, Crown, User, Moon, Sun, Bookmark, ArrowRight,
  ShieldCheck, RefreshCw, AlertCircle, LogOut, Mail, Key
} from 'lucide-react';

export default function App() {
  // Auth State
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Navigation & Theme State
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [activeBlock, setActiveBlock] = useState('block1');
  const [searchQuery, setSearchQuery] = useState('');

  // User & Plan State
  const [isPremium, setIsPremium] = useState(false);

  // Tracking States
  const [trackedTopicIds, setTrackedTopicIds] = useState([]);
  const [topicStatuses, setTopicStatuses] = useState({});

  // 1. Listen for Supabase Auth State Changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setTrackedTopicIds([]);
        setTopicStatuses({});
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch user profile and tracked topics from Supabase
  const fetchUserData = async (userId) => {
    try {
      // Fetch profile (Premium status)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', userId)
        .single();
      
      if (profileData) {
        setIsPremium(profileData.is_premium);
      }

      // Fetch tracked topics
      const { data: topicsData, error } = await supabase
        .from('user_topics')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (topicsData) {
        const tracked = [];
        const statuses = {};
        topicsData.forEach(item => {
          if (item.is_tracked) tracked.push(item.topic_key);
          statuses[item.topic_key] = item.status;
        });
        setTrackedTopicIds(tracked);
        setTopicStatuses(statuses);
      }
    } catch (err) {
      console.error('Error fetching user data:', err.message);
    }
  };

  // Handle Login / Signup submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: emailInput,
          password: passwordInput,
        });
        if (error) throw error;
        alert('Registration successful! Check your email if verification is required, or log in.');
        setAuthMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailInput,
          password: passwordInput,
        });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Helper to generate unique key for a topic
  const getTopicKey = (blockKey, deptId, topicTitle) => `${blockKey}_${deptId}_${topicTitle}`;

  // Toggle tracking & sync with Supabase
  const handleToggleTrack = async (topicKey) => {
    if (!session) return;

    const isCurrentlyTracked = trackedTopicIds.includes(topicKey);
    let updatedTracked;

    if (isCurrentlyTracked) {
      updatedTracked = trackedTopicIds.filter(id => id !== topicKey);
      setTrackedTopicIds(updatedTracked);
    } else {
      if (!isPremium && trackedTopicIds.length >= 10) {
        alert("Free Plan is limited to 10 actively tracked topics. Upgrade to Premium (₦1,000) for unlimited tracking!");
        return;
      }
      updatedTracked = [...trackedTopicIds, topicKey];
      setTrackedTopicIds(updatedTracked);
      if (!topicStatuses[topicKey]) {
        setTopicStatuses({ ...topicStatuses, [topicKey]: 'not_started' });
      }
    }

    // Upsert to Supabase
    await supabase.from('user_topics').upsert({
      user_id: session.user.id,
      topic_key: topicKey,
      is_tracked: !isCurrentlyTracked,
      status: topicStatuses[topicKey] || 'not_started',
      updated_at: new Date()
    }, { onConflict: 'user_id,topic_key' });
  };

  // Cycle status & sync with Supabase
  const handleCycleStatus = async (topicKey) => {
    if (!session) return;

    if (!trackedTopicIds.includes(topicKey) && !isPremium) {
      if (trackedTopicIds.length >= 10) {
        alert("Please select this topic into your active 10 tracked topics first!");
        return;
      }
      const newTracked = [...trackedTopicIds, topicKey];
      setTrackedTopicIds(newTracked);
    }

    const currentStatus = topicStatuses[topicKey] || 'not_started';
    let nextStatus = 'not_started';
    if (currentStatus === 'not_started') nextStatus = 'in_progress';
    else if (currentStatus === 'in_progress') nextStatus = 'completed';
    else nextStatus = 'not_started';

    const updatedStatuses = { ...topicStatuses, [topicKey]: nextStatus };
    setTopicStatuses(updatedStatuses);

    // Upsert to Supabase
    await supabase.from('user_topics').upsert({
      user_id: session.user.id,
      topic_key: topicKey,
      is_tracked: true,
      status: nextStatus,
      updated_at: new Date()
    }, { onConflict: 'user_id,topic_key' });
  };

  // Calculate stats
  const completedCount = Object.entries(topicStatuses).filter(([key, status]) => status === 'completed' && trackedTopicIds.includes(key)).length;
  const inProgressCount = Object.entries(topicStatuses).filter(([key, status]) => status === 'in_progress' && trackedTopicIds.includes(key)).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading 3rd MB Study Tracker...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show Auth screen
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-block bg-blue-600 text-white font-bold text-lg p-3 rounded-2xl mb-3 shadow-lg shadow-blue-500/20">
              3MB
            </div>
            <h1 className="text-2xl font-bold">3rd MB Study Tracker</h1>
            <p className="text-xs text-slate-400 mt-1">Cloud Academic Suite for Medical Students</p>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input 
                  type="email" 
                  required
                  placeholder="student@unth.edu.ng"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow-lg shadow-blue-500/20 transition"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-xs text-blue-400 hover:underline font-medium"
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl font-bold shadow-md shadow-blue-500/20">
            3MB
          </div>
          <div>
            <h1 className="font-bold text-base md:text-lg leading-tight">3rd MB Study Tracker</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{session.user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Plan Badge */}
          <button 
            onClick={() => setIsPremium(!isPremium)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isPremium 
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-600'
            }`}
          >
            {isPremium ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isPremium ? 'Premium Active' : 'Free Plan'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 pb-24">
        
        {/* TAB 1: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <span className="text-xs uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full font-medium">Second MB Professional Prep</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-3">Your Medical Study Overview</h2>
              <p className="text-blue-100 text-sm mt-1 max-w-xl">
                {isPremium ? "Full Official Curriculum Tracking (490 Topics)" : `Active Tracking: ${trackedTopicIds.length} / 10 Topics Allowed on Free Plan`}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                  <span className="text-blue-200 text-xs font-medium">Completed</span>
                  <div className="text-2xl md:text-3xl font-bold mt-1">{completedCount}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                  <span className="text-blue-200 text-xs font-medium">In Progress</span>
                  <div className="text-2xl md:text-3xl font-bold mt-1">{inProgressCount}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-blue-200 text-xs font-medium">Tracked Pool</span>
                  <div className="text-2xl md:text-3xl font-bold mt-1">{trackedTopicIds.length}</div>
                </div>
              </div>
            </div>

            {/* Quick Action Banner if on Free Plan */}
            {!isPremium && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Unlock Unlimited 490-Topic Tracking</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Get lifetime access to all departments, custom notes, and revision history for just ₦1,000 via Paystack.</p>
                  </div>
                </div>
                <button 
                  onClick={() => alert("Paystack Integration (₦1,000 One-Time Lifetime Access) will be fully connected in Stage 11!")}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold shrink-0 shadow-md transition"
                >
                  Upgrade ₦1,000
                </button>
              </div>
            )}

            {/* Syllabus Navigation Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Explore Official Syllabus</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Browse through Block One (258 topics) and Block Two (232 topics) across Pathology and Pharmacology departments. Select your active topics and manage your study status.
              </p>
              <button 
                onClick={() => setCurrentTab('syllabus')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition"
              >
                <span>Open Syllabus Browser</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SYLLABUS EXPLORER */}
        {currentTab === 'syllabus' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Official Syllabus Explorer</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">490 validated official lecture topics</p>
              </div>

              {/* Block Switcher */}
              <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveBlock('block1')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition ${activeBlock === 'block1' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Block One (258)
                </button>
                <button 
                  onClick={() => setActiveBlock('block2')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition ${activeBlock === 'block2' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Block Two (232)
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text"
                placeholder="Search any medical topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department Sections */}
            <div className="space-y-8">
              {OFFICIAL_SYLLABUS[activeBlock].departments.map((dept) => {
                const filteredTopics = dept.topics.filter(topic => 
                  topic.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredTopics.length === 0) return null;

                return (
                  <div key={dept.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <h3 className="font-bold text-sm md:text-base text-blue-600 dark:text-blue-400">{dept.name}</h3>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">
                        {dept.topics.length} topics
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {filteredTopics.map((topic, idx) => {
                        const topicKey = getTopicKey(activeBlock, dept.id, topic);
                        const isTracked = trackedTopicIds.includes(topicKey);
                        const status = topicStatuses[topicKey] || 'not_started';

                        return (
                          <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition">
                            <div className="flex items-start gap-3">
                              <span className="text-xs font-mono text-slate-400 mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                              <div>
                                <p className="text-sm font-medium">{topic}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                                    status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                                    status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                                    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                  }`}>
                                    {status.replace('_', ' ')}
                                  </span>
                                  {isTracked && (
                                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                                      Tracked
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                onClick={() => handleToggleTrack(topicKey)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                  isTracked 
                                    ? 'bg-indigo-600 text-white shadow-sm' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                              >
                                {isTracked ? 'Tracking' : '+ Track'}
                              </button>

                              <button
                                onClick={() => handleCycleStatus(topicKey)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                              >
                                Change Status
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 py-2 px-6 flex justify-around items-center z-40 shadow-lg">
        <button 
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition ${currentTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </button>

        <button 
          onClick={() => setCurrentTab('syllabus')}
          className={`flex flex-col items-center gap-1 transition ${currentTab === 'syllabus' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">Syllabus</span>
        </button>
      </nav>

    </div>
  );
}
