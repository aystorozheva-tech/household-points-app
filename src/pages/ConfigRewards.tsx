import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'
import ChevronRightIcon from '../icons/ChevronRightIcon'
import HeartIcon from '../icons/HeartIcon'

type RewardRow = {
  id: string
  name_ru: string
  points_cnt: number
  common_for_household_flg: boolean
  author_profile_id: string
  author?: Array<{ display_name: string | null }> | null
}

export default function ConfigRewards() {
  const navigate = useNavigate()
  const { householdId } = useOutletContext<AppOutletCtx>()
  const [rewards, setRewards] = useState<RewardRow[]>([])
  const [profiles, setProfiles] = useState<Array<{id:string; display_name: string|null}>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setError(null)
      setLoading(true)
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('household_id', householdId)
      if (mounted) setProfiles((profs ?? []) as any)
      const { data, error } = await supabase
        .from('rewards')
        .select('id, name_ru, points_cnt, common_for_household_flg, author_profile_id, author:profiles!rewards_author_profile_id_fkey(display_name)')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true })
      if (!mounted) return
      if (error) { setError(error.message); setLoading(false); return }
      setRewards((data ?? []) as RewardRow[])
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [householdId])

  return (
    <Layout>
      <div className="mb-2">
        <button
          onClick={() => navigate('/household-settings')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md"
          aria-label="Назад"
        >
          <span className="text-2xl">←</span>
        </button>
      </div>
      <h1 className="text-2xl font-extrabold text-center text-black mb-4">Награды</h1>

      {loading && <div className="text-center py-6">Загрузка…</div>}
      {error && <div className="text-center text-red-600 py-2 text-sm">{error}</div>}
      {!loading && rewards.length === 0 && (
        <div className="text-center text-slate-500 mb-4">Нет наград</div>
      )}
      <div className="space-y-3 mb-6">
        {rewards.map(r => (
          <button
            key={r.id}
            onClick={() => navigate(`/config/rewards/${r.id}`)}
            className="w-full bg-white rounded-2xl shadow-md px-4 py-3 flex items-center justify-between hover:shadow-lg transition text-left"
          >
            <div className="flex items-center min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center mr-3 shrink-0">
                <HeartIcon className="w-6 h-6 text-[#7900FD]" />
              </div>
              <div className="truncate">
                <div className="text-base font-semibold text-slate-900 truncate">{r.name_ru}</div>
                <div className="text-xs text-slate-500">
                  {(() => {
                    if (r.common_for_household_flg) {
                      return `+${r.points_cnt} баллов для текущего игрока`
                    }
                    const authorName = r.author?.[0]?.display_name ?? '—'
                    const other = (profiles.find(p => p.id !== r.author_profile_id)?.display_name) ?? '—'
                    return `+${r.points_cnt} баллов от ${authorName} для ${other}`
                  })()}
                </div>
              </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-slate-300" />
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate('/config/rewards/add')}
        className="w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition"
      >
        + Добавить награду
      </button>
    </Layout>
  )
}
