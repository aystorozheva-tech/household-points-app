import { useEffect, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'
import { registerForPush, unregisterFromPush } from '../lib/push'

export default function ProfileSettings() {
  const navigate = useNavigate()
  const { householdId } = useOutletContext<AppOutletCtx>()

  const [profileId, setProfileId] = useState<string>('')
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pushChecking, setPushChecking] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setError(null)
      setLoading(true)
      const { data: u } = await supabase.auth.getUser()
      const uid = u.user?.id
      if (!uid) { setError('Не выполнен вход'); setLoading(false); return }
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('household_id', householdId)
        .eq('user_id', uid)
        .maybeSingle()
      if (!mounted) return
      if (error || !prof) { setError(error?.message || 'Профиль не найден'); setLoading(false); return }
      setProfileId(prof.id as string)
      setDisplayName(prof.display_name as string)
      setAvatarUrl((prof.avatar_url as string) || null)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [householdId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        if (!('serviceWorker' in navigator)) { setPushEnabled(false); setPushChecking(false); return }
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (mounted) setPushEnabled(!!sub)
      } catch {}
      if (mounted) setPushChecking(false)
    })()
    return () => { mounted = false }
  }, [])

  async function handlePickAvatar() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profileId) return
    try {
      setError(null)
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `profile-${profileId}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) { setError(upErr.message); return }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
    } catch (e: any) {
      setError(e?.message || 'Не удалось загрузить аватар')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function save() {
    if (!profileId) return
    setSaving(true)
    setError(null)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim(), avatar_url: avatarUrl })
      .eq('id', profileId)
    setSaving(false)
    if (error) { setError(error.message); return }
    navigate('/settings')
  }

  function AvatarView() {
    if (avatarUrl) return <img src={avatarUrl} alt={displayName} className="w-24 h-24 rounded-full object-cover" />
    const initials = (displayName || '🙂').trim().split(/\s+/).map(w=>w.charAt(0)).slice(0,2).join('').toUpperCase() || '🙂'
    return (
      <div className="w-24 h-24 rounded-full bg-slate-200 grid place-items-center text-slate-700 font-semibold text-2xl">
        {initials}
      </div>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
        <div className="max-w-sm mx-auto pt-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md mb-4" aria-label="Назад">
            <span className="text-2xl">←</span>
          </button>
          <h1 className="text-2xl font-extrabold text-center text-black mb-6">Профиль</h1>
          {loading ? (
            <div className="text-center py-6">Загрузка…</div>
          ) : (
            <div className="space-y-6">
              {error && <div className="rounded-xl bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 text-sm">{error}</div>}

              <div className="flex flex-col items-center">
                <AvatarView />
                <button onClick={handlePickAvatar} className="mt-3 text-purple-600 font-semibold">Сменить аватар</button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>

              <label className="block">
                <div className="text-sm text-slate-600 mb-1">Имя</div>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm bg-white"
                />
              </label>

              <div className="flex items-center bg-white rounded-2xl shadow p-4">
                <div className="bg-purple-100 rounded-full p-2 mr-4">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-purple-500" fill="currentColor"><path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6V10a6 6 0 1 0-12 0v6l-2 2v1h16v-1l-2-2Z"/></svg>
                </div>
                <div className="flex-1 font-semibold text-lg">Уведомления</div>
                <button
                  disabled={pushChecking}
                  onClick={async () => {
                    if (!pushEnabled) {
                      try {
                        if (!profileId) throw new Error('Нет профиля')
                        await registerForPush(profileId)
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

              <button
                onClick={save}
                disabled={saving}
                className={`w-full rounded-2xl text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition bg-gradient-to-r from-[#E700FD] to-[#7900FD] ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}`}
              >
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

