import React from 'react'
import { LayoutDashboard, BookMarked, Layers, Star, Clock, FileText, Settings, Crown } from 'lucide-react'

export function Sidebar({ currentTab, setCurrentTab, isPremium, onOpenUpgrade }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'block1', label: 'Block One (258)', icon: Layers },
    { id: 'block2', label: 'Block Two (232)', icon: Layers },
    { id: 'favourites', label: 'Favourites', icon: Star },
    { id: 'history', label: 'Study History', icon: Clock },
    { id: 'notes', label: 'Revision Notes', icon: FileText, premiumRequired: true },
    { id: 'custom', label: 'Custom Topics', icon: BookMarked, premiumRequired: true },
    { id: 'settings', label: 'Backup & Settings', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden lg:flex shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.premiumRequired && !isPremium && (
                <Crown className="w-3.5 h-3.5 text-amber-500" />
              )}
            </button>
          )
        })}
      </div>

      {!isPremium && (
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 text-center">
          <Crown className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Unlock Full Access</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Get unlimited tracking & revision notes for ₦1,000.</p>
          <button
            onClick={onOpenUpgrade}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-orange-500/20 hover:opacity-95 transition-opacity"
          >
            Upgrade Now
          </button>
        </div>
      )}
    </aside>
  )
}
