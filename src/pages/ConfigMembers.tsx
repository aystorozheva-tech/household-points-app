import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'

export default function ConfigMembers() {
  const navigate = useNavigate()
  const { householdId } = useOutletContext<AppOutletCtx>()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    ;(async () => {
      // Fetch profiles for household, now including email
      const { data: profiles, error: e1 } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, email')
        .eq('household_id', householdId)
      if (!mounted) return
      if (e1) { setError(e1.message); setLoading(false); return }
      setMembers(profiles || [])
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [householdId])

  const canAdd = members.length < 2

  return (
    <Layout>
      <div>
        <div className="flex items-center px-4 mt-8 mb-6">
          <button onClick={() => navigate(-1)} className="mr-2 text-xl">←</button>
          <h1 className="text-center text-2xl font-bold flex-1">Участники</h1>
        </div>
        <div className="px-4 space-y-4">
          {members.map((m, i) => (
            <div key={i} className="flex items-center bg-white rounded-xl shadow p-4">
              <Avatar name={(m.display_name || m.email || '')} src={m.avatar_url} size={48} />
              <div className="flex-1 ml-4">
                <div className="font-semibold text-lg">{m.display_name ?? '—'}</div>
                <div className="text-sm text-gray-500">{m.email ?? '—'}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 mt-8">
          <button
            disabled={!canAdd}
            className={`w-full rounded-full py-3 text-lg font-semibold text-white transition ${canAdd ? 'bg-gradient-to-r from-[#E700FD] to-[#7900FD] hover:opacity-90 active:scale-[0.99]' : 'bg-gray-300 cursor-not-allowed'}`}
            onClick={() => canAdd && navigate('/invite')}
          >
            + Добавить участника
          </button>
          {!canAdd && (
            <div className="text-center text-red-500 mt-2 text-sm">Можно добавить только двух участников.</div>
          )}
        </div>
      </div>
    </Layout>
  )
}

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
