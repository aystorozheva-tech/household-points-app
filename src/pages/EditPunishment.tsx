import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

export default function EditPunishment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState<number>(10)
  const [isCommon, setIsCommon] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!id) return
      const { data, error } = await supabase
        .from('fines')
        .select('id, name_ru, points_cnt, common_for_household_flg')
        .eq('id', id)
        .single()
      if (!mounted) return
      if (error) { setError(error.message); setLoading(false); return }
      setTitle((data as any)?.name_ru ?? '')
      setPoints((data as any)?.points_cnt ?? 0)
      setIsCommon(!!(data as any)?.common_for_household_flg)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [id])

  async function save() {
    if (!id) return
    setError(null)
    setSaving(true)
    const { error } = await supabase
      .from('fines')
      .update({ name_ru: title.trim(), points_cnt: points, common_for_household_flg: isCommon })
      .eq('id', id)
    setSaving(false)
    if (error) { setError(error.message); return }
    navigate('/config/punishments')
  }

  async function remove() {
    if (!id) return
    setError(null)
    setDeleting(true)
    const { error } = await supabase
      .from('fines')
      .delete()
      .eq('id', id)
    setDeleting(false)
    if (error) { setError(error.message); return }
    navigate('/config/punishments')
  }

  return (
    <Layout>
      <div className="w-full max-w-sm mx-auto">
        <h1 className="text-2xl font-extrabold text-center text-black mb-6">Редактировать наказание</h1>
        {loading ? (
          <div className="text-center py-6">Загрузка…</div>
        ) : (
        <div className="space-y-6">
          <label className="block">
            <div className="text-sm text-slate-600 mb-1">Название</div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
            />
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={isCommon} onChange={e => setIsCommon(e.target.checked)} />
            <span className="text-sm text-slate-700">Общее для домохозяйства</span>
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
            onClick={save}
            disabled={!title.trim() || points <= 0 || saving}
            className={`w-full rounded-2xl text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition bg-gradient-to-r from-[#E700FD] to-[#7900FD] hover:shadow-lg ${
              (!title.trim() || points <= 0 || saving) ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>

          <button
            onClick={remove}
            disabled={deleting || saving}
            className={`w-full rounded-2xl text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition bg-black ${deleting || saving ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {deleting ? 'Удаление…' : 'Удалить'}
          </button>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
        )}
      </div>
    </Layout>
  )
}
