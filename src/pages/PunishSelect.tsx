import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'
import { notifyEvent } from '../lib/notify'
import BrokenHeartIcon from '../icons/BrokenHeartIcon'

function SelectableRow({
  left,
  title,
  subtitle,
  onClick,
}: {
  left: React.ReactNode
  title: string
  subtitle?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full bg-white rounded-2xl shadow-md px-4 py-3
        flex items-center gap-3
        text-left hover:shadow-lg active:scale-[0.99] transition
      `}
    >
      <span className="text-2xl leading-none">{left}</span>
      <span className="flex flex-col">
        <span className="font-medium text-slate-900">{title}</span>
        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
      </span>
    </button>
  )
}

export default function PunishSelect() {
  const navigate = useNavigate()
  const { householdId } = useOutletContext<AppOutletCtx>()
  const [fines, setFines] = useState<Array<{id:string;name_ru:string;points_cnt:number}>>([])
  const [meId, setMeId] = useState<string | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setError(null)
      setLoading(true)
      const { data: u } = await supabase.auth.getUser()
      const uid = u.user?.id
      const { data: profs, error: e1 } = await supabase
        .from('profiles')
        .select('id,user_id,household_id,created_at')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true })
      if (!mounted) return
      if (e1) { setError(e1.message); setLoading(false); return }
      const me = (profs ?? []).find(p => p.user_id === uid) || null
      const partner = (profs ?? []).find(p => p.user_id !== uid) || null
      setMeId(me?.id ?? null)
      setPartnerId(partner?.id ?? null)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [householdId])

  useEffect(() => {
    if (!meId) return
    let mounted = true
    ;(async () => {
      setError(null)
      setLoading(true)
      const { data, error } = await supabase
        .from('fines')
        .select('id, name_ru, points_cnt, common_for_household_flg, author_profile_id')
        .eq('household_id', householdId)
        .or(`common_for_household_flg.eq.true,author_profile_id.eq.${meId}`)
        .order('points_cnt', { ascending: true })
      if (!mounted) return
      if (error) { setError(error.message); setLoading(false); return }
      setFines((data ?? []).map(r => ({ id: r.id as string, name_ru: r.name_ru as string, points_cnt: r.points_cnt as number })))
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [householdId, meId])

  async function applyFine(f: {id:string;name_ru:string;points_cnt:number}) {
    if (!partnerId) return
    setError(null)
    const { data, error } = await supabase
      .from('entries')
      .insert({
        household_id: householdId,
        profile_id: partnerId,
        kind: 'penalty',
        title: f.name_ru,
        points: -Math.abs(f.points_cnt),
      })
      .select('id')
      .single()
    if (error) { setError(error.message); return }
    if (data?.id) {
      // actor is meId here (giver), penalty is applied to partner
      notifyEvent({ householdId, actorProfileId: meId!, type: 'entry_created', entity: { id: data.id as string, kind: 'penalty', title: f.name_ru, points: -Math.abs(f.points_cnt) } })
    }
    navigate('/')
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
        <button onClick={() => navigate('/')} className="absolute left-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md" aria-label="Назад">
          <span className="text-2xl">←</span>
        </button>
        <div className="w-full max-w-sm mt-20">
          <h1 className="text-3xl font-extrabold text-center text-black mb-6">Выберите наказание</h1>
          {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
          {loading ? (
            <div className="text-center py-6">Загрузка…</div>
          ) : fines.length === 0 ? (
            <div className="text-center text-slate-500 py-6">Нет наказаний</div>
          ) : (
            <div className="space-y-3">
              {fines.map(f => (
                <SelectableRow
                  key={f.id}
                  left={<BrokenHeartIcon className="w-6 h-6 text-rose-500" />}
                  title={f.name_ru}
                  subtitle={`-${f.points_cnt} баллов`}
                  onClick={() => applyFine(f)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
