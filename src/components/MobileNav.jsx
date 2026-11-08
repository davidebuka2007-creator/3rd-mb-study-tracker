
import React from 'react'
import { LayoutDashboard, Layers, Star, Clock, Settings } from 'lucide-react'

export function MobileNav({ currentTab, setCurrentTab }) {
  const mobileTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'block1', label: 'Block 1', icon: Layers },
    { id: 'block2', label: 'Block 2', icon: Layers },
    { id: 'favourites', label: 'Saved', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex justify-around items-center">
      {mobileTabs.map((tab) => {
        const Icon = tab.icon
        const isActive = currentTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
