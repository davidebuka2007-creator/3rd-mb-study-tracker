import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Auth } from './components/Auth'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { MobileNav } from './components/MobileNav'
import { OFFICIAL_SYLLABUS } from './data/syllabus'
import { LayoutDashboard, Layers, Star, Clock, FileText, BookMarked, Settings, Crown, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  
  // User tracking & progress state
  const [userProgress, setUserProgress] = useState({}) // { topicId: { status, is_tracked, is_favorite } }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
        fetchUserProgress(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
        fetchUserProgress(session.user.id)
      } else {
        setProfile(null)
        setUserProgress({})
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (data) setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProgress = async (userId) => {
    try {
      const { data } = await supabase.from('user_progress').select('*').eq('user_id', userId)
      if (data) {
        const progressMap = {}
        data.forEach(item => {
          progressMap[item.topic_id] = {
            status: item.status,
            is_tracked: item.is_tracked,
            is_favorite: item.is_favorite,
            notes: item.notes
          }
        })
        setUserProgress(progressMap)
      }
    } catch (err) {
      console.error('Error fetching progress:', err)
    }
  }

  const toggleTrackTopic = async (topicId) => {
    if (!session) return
    const current = userProgress[topicId] || { status: 'Not Started', is_tracked: false, is_favorite: false }
    const newTrackedState = !current.is_tracked

    // Check Free limit (max 10 active tracked topics)
    if (newTrackedState && !profile?.is_premium) {
      const trackedCount = Object.values(userProgress).filter(p => p.is_tracked).length
      if (trackedCount >= 10) {
        setUpgradeModalOpen(true)
        return
      }
    }

    const updatedProgress = { ...current, is_tracked: newTrackedState }
    setUserProgress({ ...userProgress, [topicId]: updatedProgress })

    // Upsert to Supabase
    await supabase.from('user_progress').upsert({
      user_id: session.user.id,
      topic_id: topicId,
      status: updatedProgress.status,
      is_tracked: updatedProgress.is_tracked,
      is_favorite: updatedProgress.is_favorite
    }, { onConflict: 'user_id,topic_id' })
  }

  const updateTopicStatus = async (topicId, status) => {
    if (!session) return
    const current = userProgress[topicId] || { status: 'Not Started', is_tracked: false, is_favorite: false }
    const updatedProgress = { ...current, status }
    setUserProgress({ ...userProgress, [topicId]: updatedProgress })

    await supabase.from('user_progress').upsert({
      user_id: session.user.id,
      topic_id: topicId,
      status: updatedProgress.status,
      is_tracked: updatedProgress.is_tracked,
      is_favorite: updatedProgress.is_favorite
    }, { onConflict: 'user_id,topic_id' })
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
    return <Auth onLoginSuccess={() => window.location.reload()} />
  }

  // Filter topics based on search term or active block tab
  const filteredTopics = OFFICIAL_SYLLABUS.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.code.toLowerCase().includes(searchTerm.toLowerCase())
    if (currentTab === 'block1') return t.block === 'Block One' && matchesSearch
    if (currentTab === 'block2') return t.block === 'Block Two' && matchesSearch
    if (currentTab === 'favourites') return userProgress[t.id]?.is_favorite && matchesSearch
    return matchesSearch
  })

  const trackedCount = Object.values(userProgress).filter(p => p.is_tracked).length

  return (
    <div className={`${darkMode ? 'dark' : ''} h-full`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col">
        
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
          <Sidebar 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
            isPremium={profile?.is_premium}
            onOpenUpgrade={() => setUpgradeModalOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
                  <h2 className="text-2xl sm:text-3xl font-bold">Welcome back, Doctor!</h2>
                  <p className="text-blue-100 mt-2 text-sm max-w-xl">
                    Master all 490 official Third MBBS curriculum topics seamlessly across Block One (258) and Block Two (232).
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button 
                      onClick={() => setCurrentTab('block1')}
                      className="px-4 py-2 bg-white text-blue-600 rounded-xl font-semibold text-xs shadow-md hover:bg-blue-50 transition-colors"
                    >
                      Open Block One (258)
                    </button>
                    <button 
                      onClick={() => setCurrentTab('block2')}
                      className="px-4 py-2 bg-blue-700/50 hover:bg-blue-700 text-white border border-white/20 rounded-xl font-semibold text-xs transition-colors"
                    >
                      Open Block Two (232)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan & Limit</p>
                    <h3 className="text-xl font-bold mt-2 text-slate-900 dark:text-white">
                      {profile?.is_premium ? 'Premium (Unlimited)' : `${trackedCount} / 10 Tracked`}
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Curriculum</p>
                    <h3 className="text-xl font-bold mt-2 text-slate-900 dark:text-white">490 Official Topics</h3>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Audience</p>
                    <h3 className="text-xl font-bold mt-2 text-slate-900 dark:text-white">3rd MBBS Medical Students</h3>
                  </div>
                </div>
              </div>
            )}

            {(currentTab === 'block1' || currentTab === 'block2' || currentTab === 'favourites') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {currentTab === 'block1' ? 'Block One Curriculum (258 Topics)' : currentTab === 'block2' ? 'Block Two Curriculum (232 Topics)' : 'Saved Favourites'}
                  </h2>
                  <span className="text-xs text-slate-500">{filteredTopics.length} topics shown</span>
                </div>

                <div className="space-y-3">
                  {filteredTopics.map((topic) => {
                    const prog = userProgress[topic.id] || { status: 'Not Started', is_tracked: false, is_favorite: false }
                    return (
                      <div key={topic.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold">
                              {topic.department}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{topic.code}</span>
                          </div>
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{topic.title}</h4>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <select
                            value={prog.status}
                            onChange={(e) => updateTopicStatus(topic.id, e.target.value)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>

                          <button
                            onClick={() => toggleTrackTopic(topic.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              prog.is_tracked 
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {prog.is_tracked ? 'Tracking' : 'Track'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {currentTab === 'settings' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Backup & Settings</h2>
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="font-semibold text-sm">Account Information</h3>
                  <p className="text-xs text-slate-500">Email: {session.user.email}</p>
                  <p className="text-xs text-slate-500">Account Type: {profile?.is_premium ? 'Premium (Unlimited)' : 'Free Plan (10 Active Limit)'}</p>
                  {!profile?.is_premium && (
                    <button
                      onClick={() => setUpgradeModalOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-semibold shadow-md"
                    >
                      Upgrade for ₦1,000
                    </button>
                  )}
                </div>
              </div>
            )}

          </main>
        </div>

        <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {upgradeModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-center">Unlock Unlimited Tracking</h3>
              <p className="text-xs text-slate-500 text-center">
                You have reached the Free limit of 10 active topics. Upgrade to Premium for a one-time fee of ₦1,000 to track all 490 official topics simultaneously with zero restrictions.
              </p>
              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setUpgradeModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => alert('Paystack checkout gateway initializing for ₦1,000...')}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-xs shadow-md shadow-orange-500/20"
                >
                  Pay ₦1,000 Now
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
