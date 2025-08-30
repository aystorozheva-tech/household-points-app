import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function HouseholdSettings() {
  const navigate = useNavigate()

  return (
    <Layout>
      {/* Фоновый градиент на всю страницу */}
      <div className="relative -m-4 p-4">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#F8F9FF_0%,#EDF2FF_100%)]" />

        {/* Заголовок */}
        <h1 className="text-3xl font-extrabold text-center text-[#000000] mt-2 mb-6">
          Настройки семьи
        </h1>

        {/* Меню */}
        <div className="space-y-3">
          <MenuItem
            icon={<HouseIcon className="w-6 h-6 text-indigo-600" />}
            label="Квартира"
            onClick={() => navigate('/config/flat')}
          />
          <MenuItem
            icon={<HeartIcon className="w-6 h-6 text-rose-500" />}
            label="Мотивации"
            onClick={() => navigate('/config/rewards')}
          />
          <MenuItem
            icon={<WarnIcon className="w-6 h-6 text-orange-500" />}
            label="Штрафы"
            onClick={() => navigate('/config/punishments')}
          />
          <MenuItem
            icon={<UsersIcon className="w-6 h-6 text-violet-600" />}
            label="Участники"
            onClick={() => navigate('/settings/members')} // добавим позже
          />
        </div>
      </div>
    </Layout>
  )
}

/* ---------- Элементы UI ---------- */

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full rounded-xl bg-white shadow px-4 py-4
        flex items-center justify-between
        hover:shadow-lg active:scale-[0.99] transition
        active:bg-[#E0D5FF] focus:bg-[#E0D5FF]/80 focus:outline-none
      "
    >
      <span className="flex items-center gap-3">
        {icon}
        <span className="text-base font-medium text-slate-900">{label}</span>
      </span>
      <ChevronRight className="w-5 h-5 text-slate-400" />
    </button>
  )
}

/* ---------- Иконки (inline SVG) ---------- */

function ChevronRight({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function HouseIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 10.5V20h14v-9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function HeartIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 20s-6-4.35-8.4-7.2C1.9 8.9 3.4 5.5 6.5 5.1c1.8-.2 3.1.6 3.9 1.7.8-1.1 2.1-1.9 3.9-1.7 3.1.4 4.6 3.8 2.9 7.7C18 15.65 12 20 12 20z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function WarnIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3l9 16H3L12 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 9v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function UsersIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M2 20c0-3.314 2.686-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/>
      <path d="M13.5 20c.3-2.5 2.3-4.5 4.8-4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}