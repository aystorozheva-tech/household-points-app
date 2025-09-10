import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'
import { registerForPush, unregisterFromPush } from '../lib/push'

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
  const [pushChecking, setPushChecking] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)

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

  useEffect(() => {
    // Check existing subscription
    let mounted = true
    ;(async () => {
      try {
        if (!('serviceWorker' in navigator)) { setPushEnabled(false); setPushChecking(false); return }
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (mounted) setPushEnabled(!!sub)
      } catch { /* ignore */ }
      if (mounted) setPushChecking(false)
    })()
    return () => { mounted = false }
  }, [])

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
      <div>
        <h1 className="text-center text-2xl font-bold mt-8 mb-6">Настройки</h1>
        <div className="px-4 space-y-4">
          {/* Profile Card */}
          <div className="flex items-center bg-white rounded-xl shadow p-4 mb-2 cursor-pointer" onClick={() => navigate('/profile')}>
            <Avatar name={(profile?.display_name || email || '')} src={profile?.avatar_url} size={48} />
            <div className="flex-1 ml-4">
              <div className="font-semibold text-lg">{profile?.display_name ?? '—'}</div>
              <div className="text-sm text-gray-500">{email || '—'}</div>
            </div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>
          {/* Household Card */}
          <div className="flex items-center bg-white rounded-xl shadow p-4 cursor-pointer" onClick={() => navigate('/household-settings')}>
            <div className="bg-purple-100 rounded-full p-2 mr-4">
              <HouseIcon className="w-6 h-6 text-purple-500" />
            </div>
            <div className="flex-1 font-semibold text-lg">{household?.name ?? '—'}</div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center bg-white rounded-xl shadow p-4">
            <div className="bg-purple-100 rounded-full p-2 mr-4">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-purple-500" fill="currentColor"><path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V10a6 6 0 1 0-12 0v6l-2 2v1h16v-1l-2-2Z"/></svg>
            </div>
            <div className="flex-1 font-semibold text-lg">Уведомления</div>
            <button
              disabled={pushChecking}
              onClick={async () => {
                if (!pushEnabled) {
                  try {
                    // Use the loaded profile for this household
                    if (!profile?.id) throw new Error('Нет профиля')
                    await registerForPush(profile.id)
                    setPushEnabled(true)
                  } catch (e) { console.error(e) }
                } else {
                  try { await unregisterFromPush(); setPushEnabled(false) } catch (e) { console.error(e) }
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${pushEnabled ? 'bg-purple-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${pushEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        {/* Logout Button */}
        <div className="px-4 mt-8">
          <button
            onClick={handleSignOut}
            className="w-full rounded-2xl shadow-md bg-slate-900 text-white px-4 py-4 font-bold hover:shadow-lg active:scale-[0.99] transition"
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </Layout>
  )
}

/* ---------- Вспомогательные компоненты ---------- */

function Avatar({ name, src, size = 64 }: { name: string; src?: string | null; size?: number }) {
  const base = (name ?? '').trim()
  const initials = base
    ? base.split(/\s+/).map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase()
    : ''

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
