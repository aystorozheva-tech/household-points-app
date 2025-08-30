import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'

type Profile = {
  id: string
  user_id: string
  household_id: string
  display_name: string
  avatar_url: string | null
  created_at: string
}

type Household = {
  id: string
  name: string
  created_at: string
}

export default function Settings() {
  const navigate = useNavigate()
  const { householdId } = useOutletContext<AppOutletCtx>()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState<string>('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [household, setHousehold] = useState<Household | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    ;(async () => {
      // 1) текущий пользователь
      const { data: u } = await supabase.auth.getUser()
      if (!mounted) return
      if (!u.user) {
        setError('Не выполнен вход'); setLoading(false); return
      }
      setEmail(u.user.email ?? '')

      // 2) профиль этого пользователя в текущем household
      const { data: profs, error: e1 } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', u.user.id)
        .eq('household_id', householdId)
        .limit(1)

      if (!mounted) return
      if (e1) { setError(e1.message); setLoading(false); return }
      setProfile(profs && profs.length > 0 ? (profs[0] as Profile) : null)

      // 3) карточка household
      const { data: hh, error: e2 } = await supabase
        .from('households')
        .select('*')
        .eq('id', householdId)
        .single()

      if (!mounted) return
      if (e2) { setError(e2.message); setLoading(false); return }
      setHousehold(hh as Household)

      setLoading(false)
    })()

    return () => { mounted = false }
  }, [householdId])

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      navigate('/', { replace: true })
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-4">Загрузка…</div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 text-red-600">Ошибка: {error}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* ---- Карточка пользователя ---- */}
      <div className="bg-white rounded-3xl shadow-md p-4 flex items-center gap-4">
        <Avatar name={profile?.display_name ?? ''} src={profile?.avatar_url} size={72} />
        <div className="flex-1">
          <div className="text-xl font-semibold">{profile?.display_name ?? '—'}</div>
          <div className="text-slate-600 text-sm">{email || '—'}</div>
        </div>
      </div>

      {/* ---- Карточка семьи (кликабельная) ---- */}
      <button
        onClick={() => navigate('/settings/household')}
        className="
          w-full bg-white rounded-3xl shadow-md
          px-4 py-4 mt-4
          flex items-center justify-between
          hover:shadow-lg active:scale-[0.99] transition
          text-left
        "
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 grid place-items-center">
            <HouseIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-base font-medium text-slate-900">Семья</div>
            <div className="text-sm text-slate-600">{household?.name ?? '—'}</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </button>

      {/* ---- Большая чёрная кнопка «Выйти» ---- */}
      <div className="mt-6">
        <button
          onClick={handleSignOut}
          className="
            w-full rounded-2xl shadow-md bg-slate-900 text-white
            px-4 py-4 font-bold
            hover:shadow-lg active:scale-[0.99] transition
          "
        >
          Выйти из аккаунта
        </button>
      </div>
    </Layout>
  )
}

/* ---------- Вспомогательные компоненты ---------- */

function Avatar({ name, src, size = 64 }: { name: string; src?: string | null; size?: number }) {
  const initials = (name || '🙂')
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase())
    .slice(0, 2)
    .join('')

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="rounded-full grid place-items-center bg-slate-100 text-slate-700 font-semibold"
      style={{ width: size, height: size }}
    >
      {initials || '🙂'}
    </div>
  )
}

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