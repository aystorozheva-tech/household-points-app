import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'

type EntryRow = {
  id: string
  household_id: string
  profile_id: string
  kind: 'task' | 'reward' | 'penalty'
  title: string
  points: number
  created_at: string
  profile?: { display_name: string | null; avatar_url: string | null; email?: string | null } | Array<{ display_name: string | null; avatar_url: string | null; email?: string | null }> | null
}

export default function History() {
  const { householdId } = useOutletContext<AppOutletCtx>()
  const [items, setItems] = useState<EntryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setError(null)
      setLoading(true)
      const { data, error } = await supabase
        .from('entries')
        .select('id, household_id, profile_id, kind, title, points, created_at, profile:profiles!entries_profile_id_fkey(display_name, avatar_url, email)')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })
      if (!mounted) return
      if (error) { setError(error.message); setLoading(false); return }
      setItems((data ?? []) as EntryRow[])
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [householdId])

  return (
    <Layout>
      <h2 className="text-lg font-bold mb-4">История</h2>
      {loading && <div className="text-center py-6">Загрузка…</div>}
      {error && <div className="text-center text-red-600 py-2 text-sm">{error}</div>}
      <div className="space-y-3">
        {items.map(e => (
          <div key={e.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-md">
            {(() => {
              const prof = Array.isArray(e.profile) ? e.profile[0] : e.profile
              return <Avatar url={prof?.avatar_url || undefined} name={(prof?.display_name || prof?.email || '') as string} />
            })()}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900 truncate">{e.title}</span>
                <span className={`font-bold ${e.points >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {e.points > 0 ? '+' : ''}{e.points}
                </span>
              </div>
              <div className="text-xs text-slate-500">{new Date(e.created_at).toLocaleString('ru-RU')}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

function Avatar({ url, name }: { url?: string; name: string }) {
  if (url) return <img src={url} alt={name} className="w-12 h-12 rounded-full object-cover" />
  const base = (name ?? '').trim()
  const initials = base
    ? base.split(/\s+/).map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase()
    : ''
  return (
    <div className="w-12 h-12 rounded-full bg-slate-200 grid place-items-center text-slate-700 font-semibold">
      {initials || '🙂'}
    </div>
  )
}
