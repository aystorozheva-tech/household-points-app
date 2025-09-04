import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import ChevronRightIcon from '../icons/ChevronRightIcon'
import type { AppOutletCtx } from '../AppLayout'

type Entry = {
  id: string
  household_id: string
  profile_id: string
  kind: 'task' | 'reward' | 'penalty'
  title: string
  points: number
  created_at: string
}

export default function EditEntry() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { householdId } = useOutletContext<AppOutletCtx>()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [points, setPoints] = useState<number>(0)
  const [kind, setKind] = useState<'task'|'reward'|'penalty'>('task')
  const [createdAt, setCreatedAt] = useState('')
  const [profileId, setProfileId] = useState<string>('')
  const [profiles, setProfiles] = useState<Array<{id:string; display_name: string; email: string|null}>>([])
  const [authorOpen, setAuthorOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('entries')
        .select('id, household_id, profile_id, kind, title, points, created_at')
        .eq('id', id)
        .single()
      if (!mounted) return
      if (error || !data) { setError(error?.message || 'Запись не найдена'); setLoading(false); return }
      const e = data as Entry
      setTitle(e.title)
      setPoints(e.points)
      setKind(e.kind)
      try {
        const d = new Date(e.created_at)
        setCreatedAt(d.toLocaleString('ru-RU'))
      } catch { setCreatedAt(''); }
      setProfileId(e.profile_id)
      // load profiles of household for author reassignment
      const profsRes = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .eq('household_id', householdId);
      const profs = profsRes.data
      setProfiles((profs ?? []).map(p => ({ id: (p as any).id, display_name: (p as any).display_name, email: (p as any).email })))
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [id, householdId])

  async function save() {
    if (!id) return
    setError(null)
    setSaving(true)
    const payload: Partial<Entry> = {
      points: Number.isFinite(points) ? Math.trunc(points) : 0,
      profile_id: profileId,
    }
    const { data, error } = await supabase
      .from('entries')
      .update(payload)
      .eq('id', id)
      .eq('household_id', householdId)
      .select('id')
      .single()
    setSaving(false)
    if (error || !data) { setError(error?.message || 'Не удалось сохранить'); return }
    navigate('/history')
  }

  async function remove() {
    if (!id) return
    setError(null)
    setDeleting(true)
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId)
    setDeleting(false)
    if (error) { setError(error.message); return }
    navigate('/history')
  }

  if (loading) return <Layout><div className="min-h-screen flex items-center justify-center">Загрузка…</div></Layout>

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
        <div className="max-w-sm mx-auto pt-6">
          <button
            onClick={() => navigate('/history')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md mb-4"
            aria-label="Назад"
          >
            <span className="text-2xl">←</span>
          </button>

          <h1 className="text-2xl font-extrabold text-center text-black mb-6">Редактировать запись</h1>

          {error && <div className="mb-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 text-sm">{error}</div>}

          <div className="space-y-5">
            {/* Readonly info */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-slate-500">Название</div>
              <div className="text-base font-semibold text-slate-900">{title}</div>
              <div className="mt-3 text-xs text-slate-500">Тип</div>
              <div className="text-base text-slate-900">{kind === 'task' ? 'Дело' : kind === 'reward' ? 'Награда' : 'Наказание'}</div>
              <div className="mt-3 text-xs text-slate-500">Дата и время</div>
              <div className="text-base text-slate-900">{createdAt || '—'}</div>
            </div>

            {/* Editable fields */}
            <div className="block relative">
              <div className="text-sm text-slate-600 mb-1">Автор</div>
              <button
                type="button"
                onClick={() => setAuthorOpen(v => !v)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm bg-white relative"
              >
                <span className="truncate">
                  {(() => {
                    const p = profiles.find(x => x.id === profileId)
                    return p ? (p.display_name || p.email || p.id) : '—'
                  })()}
                </span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronRightIcon className={`w-5 h-5 transition-transform ${authorOpen ? 'rotate-90' : 'rotate-0'}`} />
                </span>
              </button>
              {authorOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-lg max-h-60 overflow-auto">
                  {profiles.map(p => {
                    const label = p.display_name || p.email || p.id
                    const active = p.id === profileId
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setProfileId(p.id); setAuthorOpen(false) }}
                        className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-purple-50 text-slate-900' : 'hover:bg-slate-50 text-slate-700'}`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <label className="block">
              <div className="text-sm text-slate-600 mb-1">Баллы</div>
              <input
                type="number"
                value={points}
                onChange={e => setPoints(parseInt(e.target.value) || 0)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm bg-white"
              />
            </label>

            <button
              onClick={save}
              disabled={saving}
              className={`w-full rounded-2xl text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition bg-gradient-to-r from-[#E700FD] to-[#7900FD] ${saving || !title.trim() ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}`}
            >
              {saving ? 'Сохранение…' : 'Подтвердить'}
            </button>

            <button
              onClick={remove}
              disabled={deleting || saving}
              className={`w-full rounded-2xl text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition bg-black ${deleting || saving ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              {deleting ? 'Удаление…' : 'Удалить'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
