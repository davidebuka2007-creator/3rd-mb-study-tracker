import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Auth } from './components/Auth'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { MobileNav } from './components/MobileNav'
import { LayoutDashboard, Layers, Star, Clock, FileText, BookMarked, Settings, Crown, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return <Auth onLoginSuccess={() => fetchProfile(session?.user?.id)} />
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} h-full`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col">
        
        {/* Top Navbar */}
        <Navbar 
          user={session.user} 
          profile={profile}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={handleLogout}
          onOpenUpgrade={() => setUpgradeModalOpen(true)}
        />

        <div className="flex-1 flex overflow-hidden pb-16 lg:pb-0">
          {/* Sidebar for Desktop */}
          <Sidebar 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
            isPremium={profile?.is_premium}
            onOpenUpgrade={() => setUpgradeModalOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
                  <h2 className="text-2xl sm:text-3xl font-bold">Welcome back, Doctor!</h2>
                  <p className="text-blue-100 mt-2 text-sm max-w-xl">
                    Track your 490 official Third MBBS curriculum topics across Block One and Block Two seamlessly.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button 
                      onClick={() => setCurrentTab('block1')}
                      className="px-4 py-2 bg-white text-blue-600 rounded-xl font-semibold text-xs shadow-md hover:bg-blue-50 transition-colors"
                    >
                      View Block One (258 Topics)
                    </button>
                    <button 
                      onClick={() => setCurrentTab('block2')}
                      className="px-4 py-2 bg-blue-700/50 hover:bg-blue-700 text-white border border-white/20 rounded-xl font-semibold text-xs transition-colors"
                    >
                      View Block Two (232 Topics)
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan Status</p>
                    <h3 className="text-xl font-bold mt-2 text-slate-900 dark:text-white flex items-center gap-2">
                      {profile?.is_premium ? 'Premium ₦1,000' : 'Free Plan (10 Limit)'}
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Curriculum Scope</p>
                    <h3 className="text-xl font-bold mt-2 text-slate-900 dark:text-white">490 Official Topics</h3>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</p>
                    <h3 className="text-xl font-bold mt-2 text-slate-900 dark:text-white">Pathology & Pharmacology</h3>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'block1' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Block One Curriculum (258 Topics)</h2>
                <p className="text-sm text-slate-500">Includes Morbid Anatomy, Chemical Pathology, Medical Microbiology, Haematology, and Pharmacology.</p>
                <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-sm text-slate-500">Block One syllabus modules are ready to be fully loaded into your tracker database.</p>
                </div>
              </div>
            )}

            {currentTab === 'block2' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Block Two Curriculum (232 Topics)</h2>
                <p className="text-sm text-slate-500">Includes advanced systematic pathology, clinical chemistry, virology, and advanced therapeutics.</p>
                <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-sm text-slate-500">Block Two syllabus modules are ready to be fully loaded into your tracker database.</p>
                </div>
              </div>
            )}

            {currentTab === 'settings' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Backup & Settings</h2>
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="font-semibold text-sm">Account Information</h3>
                  <p className="text-xs text-slate-500">Email: {session.user.email}</p>
                  <p className="text-xs text-slate-500">Account Type: {profile?.is_premium ? 'Premium' : 'Free'}</p>
                </div>
              </div>
            )}

          </main>
        </div>

        {/* Mobile Bottom Bar */}
        <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Upgrade Modal */}
        {upgradeModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-center">Upgrade to Premium</h3>
              <p className="text-xs text-slate-500 text-center">
                Unlock unlimited tracking for all 490 topics, custom topic creation, and revision notes for a one-time fee of ₦1,000.
              </p>
              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setUpgradeModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => alert('Paystack integration ready for live webhook verification.')}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-xs shadow-md shadow-orange-500/20"
                Pay Now (₦1,000)</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
