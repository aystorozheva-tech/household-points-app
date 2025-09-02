import { Link, useLocation } from 'react-router-dom'
import React from 'react'

// импорт новых иконок из src/public/icons/
import HomeIcon from '../icons/HomeIcon'
import HistoryIcon from '../icons/HistoryIcon'
import SettingsIcon from '../icons/SettingsIcon'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()

  const tab = (to: string, icon: React.ReactNode, label: string) => {
    const active = pathname === to
    return (
      <Link
        to={to}
        aria-label={label}
        className={`flex items-center justify-center py-4 ${active ? 'text-violet-600' : 'text-slate-500'}`}
      >
        {/* можно подсветить активную вкладку размером */}
        {React.cloneElement(icon as any, { className: `w-6 h-6 ${active ? 'scale-110' : ''}` })}
      </Link>
    )
  }

  return (
    <div className="min-h-screen pb-[104px] text-slate-900 bg-[linear-gradient(180deg,#F8F9FF_0%,#EDF2FF_100%)]">
      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {children}
      </main>

      <nav className="fixed bottom-4 left-0 right-0">
        <div className="max-w-md mx-auto px-4">
          <div className="grid grid-cols-3 rounded-3xl border border-white/70 bg-white/95 backdrop-blur shadow-md">
            {tab('/', <HomeIcon />, 'Дом')}
            {tab('/history', <HistoryIcon />, 'История')}
            {tab('/settings', <SettingsIcon />, 'Настройки')}
          </div>
        </div>
      </nav>
    </div>
  )
}