import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'

export default function AddReward() {
  const navigate = useNavigate()
  const { householdId } = useOutletContext<AppOutletCtx>()
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState<number>(10)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [isCommon, setIsCommon] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: u } = await supabase.auth.getUser()
      const uid = u.user?.id
      if (!uid) { setError('Не выполнен вход'); return }
      const { data: prof } = await supabase
        .from('profiles')
        .select('id')
        .eq('household_id', householdId)
        .eq('user_id', uid)
        .limit(1)
        .single()
      if (!mounted) return
      setProfileId(prof?.id ?? null)
    })()
    return () => { mounted = false }
  }, [householdId])

  async function saveReward() {
    if (!title.trim() || !profileId) return
    setError(null)
    setSaving(true)
    const { error } = await supabase
      .from('rewards')
      .insert({
        name_ru: title.trim(),
        points_cnt: points,
        household_id: householdId,
        author_profile_id: profileId,
        common_for_household_flg: isCommon,
      })
    setSaving(false)
    if (error) { setError(error.message); return }
    navigate('/config/rewards')
  }

  return (
    <Layout>
      <div className="w-full max-w-sm mx-auto">
        <h1 className="text-2xl font-extrabold text-center text-black mb-6">Новая награда</h1>
        <div className="space-y-6">
          <label className="block">
            <div className="text-sm text-slate-600 mb-1">Название награды</div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Например: Массаж"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
            />
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={isCommon} onChange={e => setIsCommon(e.target.checked)} />
            <span className="text-sm text-slate-700">Общая для домохозяйства</span>
          </label>

          <label className="block">
            <div className="text-sm text-slate-600 mb-1">Баллы</div>
            <input
              type="number"
              value={points}
              onChange={e => setPoints(parseInt(e.target.value) || 0)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
            />
          </label>

          <button
            onClick={saveReward}
            disabled={!title.trim() || points <= 0 || !profileId || saving}
            className={`w-full rounded-2xl text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition bg-gradient-to-r from-[#E700FD] to-[#7900FD] hover:shadow-lg ${
              (!title.trim() || points <= 0 || !profileId || saving) ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </Layout>
  )
}
