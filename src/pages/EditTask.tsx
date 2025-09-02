import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'
import BroomIcon from '../icons/BroomIcon'
import MopIcon from '../icons/MopIcon'
import DishesIcon from '../icons/DishesIcon'
import FeatherIcon from '../icons/FeatherIcon'
import TShirtIcon from '../icons/TShirtIcon'
import ToiletIcon from '../icons/ToiletIcon'

type Room = { id: string; name_ru: string }

export default function EditTask() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { householdId } = useOutletContext<AppOutletCtx>()
  const [name, setName] = useState('')
  const [basePoints, setBasePoints] = useState<number>(1)
  const [perRoom, setPerRoom] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [coeff, setCoeff] = useState<Record<string, number>>({})
  const [iconId, setIconId] = useState<string>('')
  const [iconDirty, setIconDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restore draft on return from icon chooser
  useEffect(() => {
    const st = (location.state as any) || {}
    try {
      if (id) {
        const raw = sessionStorage.getItem(`editChoreDraft:${id}`)
        if (raw) {
          const d = JSON.parse(raw)
          if (typeof d.name === 'string') setName(d.name)
          if (typeof d.basePoints === 'number') setBasePoints(d.basePoints)
          if (typeof d.perRoom === 'boolean') setPerRoom(d.perRoom)
          if (d.coeff && typeof d.coeff === 'object') setCoeff(d.coeff)
          if (typeof d.iconId === 'string') setIconId(d.iconId)
        }
      }
    } catch {}
    if (st.iconId) { setIconId(st.iconId); setIconDirty(true) }
  }, [location.state, id])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: rs } = await supabase
        .from('rooms')
        .select('id, name_ru')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true })
      if (mounted) setRooms((rs ?? []) as Room[])
    })()
    return () => { mounted = false }
  }, [householdId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!id) return
      const { data, error } = await supabase
        .from('chores')
        .select('id, name_ru, base_points_cnt, settings_per_room_flg, coefficient_dict, icon_id')
        .eq('id', id)
        .single()
      if (!mounted) return
      if (error) { setError(error.message); setLoading(false); return }
      const row: any = data
      setName(row.name_ru)
      setBasePoints(row.base_points_cnt)
      setPerRoom(!!row.settings_per_room_flg)
      setCoeff(row.coefficient_dict || {})
      if (!iconDirty) setIconId(row.icon_id || '')
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [id, iconDirty])

  const IconMap = {
    broom: BroomIcon,
    mop: MopIcon,
    dishes: DishesIcon,
    dust: FeatherIcon,
    laundry: TShirtIcon,
    plumbing: ToiletIcon,
  } as const

  function IconPreview() {
    const Cmp = (iconId && (IconMap as any)[iconId]) as (p: { className?: string }) => JSX.Element | undefined
    return (
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E700FD] to-[#7900FD] shadow-lg flex items-center justify-center mb-2">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
          {Cmp ? <Cmp className="w-8 h-8 text-[#7900FD]" /> : <span className="text-[#7900FD] text-2xl">🧰</span>}
        </div>
      </div>
    )
  }

  function persistDraft() {
    try {
      if (id) sessionStorage.setItem(`editChoreDraft:${id}`, JSON.stringify({ name, basePoints, perRoom, coeff, iconId }))
    } catch {}
  }

  async function save() {
    if (!id) return
    setError(null)
    setSaving(true)
    console.log('[EditTask] save clicked', { id, householdId, name, basePoints, perRoom, iconId, coeff })
    const payload: any = {
      name_ru: name.trim(),
      base_points_cnt: basePoints,
      settings_per_room_flg: perRoom,
      icon_id: iconId || null,
      coefficient_dict: perRoom ? coeff : null,
    }
    const { data, error } = await supabase
      .from('chores')
      .update(payload)
      .eq('id', id)
      .eq('household_id', householdId)
      .select('id, icon_id')
      .single()
    console.log('[EditTask] update result', { data, error })
    setSaving(false)
    if (error) { setError(error.message); return }
    if (!data) { setError('Не удалось обновить: запись не найдена или нет доступа'); return }
    navigate('/config/tasks')
  }

  async function remove() {
    if (!id) return
    setError(null)
    setDeleting(true)
    const { error } = await supabase
      .from('chores')
      .delete()
      .eq('id', id)
    setDeleting(false)
    if (error) { setError(error.message); return }
    navigate('/config/tasks')
  }

  if (loading) {
    return <Layout><div className="text-center py-6">Загрузка…</div></Layout>
  }

  return (
    <Layout>
      <div className="w-full max-w-sm mx-auto">
        <h1 className="text-2xl font-extrabold text-center text-black mb-2">Редактировать дело</h1>
        {error && (
          <div className="w-full mb-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 text-sm">
            Ошибка: {error}
          </div>
        )}

        <div className="flex flex-col items-center mb-6">
          <IconPreview />
          <button
            onClick={() => { persistDraft(); navigate('/choose-chore-icon', { state: { returnTo: `/config/tasks/${id}`, current: iconId } }) }}
            className="text-purple-600 font-bold mb-2"
          >
            Выберите иконку
          </button>
        </div>

        <div className="space-y-6">
          <label className="block">
            <div className="text-sm text-slate-600 mb-1">Название</div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
            />
          </label>

          <label className="block">
            <div className="text-sm text-slate-600 mb-1">Базовые баллы</div>
            <input
              type="number"
              value={basePoints}
              onChange={e => setBasePoints(parseInt(e.target.value) || 0)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
            />
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={perRoom} onChange={e => setPerRoom(e.target.checked)} />
            <span className="text-sm text-slate-700">Нужна доп. настройка по комнатам</span>
          </label>

          {perRoom && (
            <div className="space-y-3">
              {rooms.map(r => (
                <div key={r.id} className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">{r.name_ru}</div>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-base outline-none"
                    value={coeff[r.id] ?? 1}
                    onChange={e => setCoeff(prev => ({ ...prev, [r.id]: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={save}
            disabled={!name.trim() || basePoints <= 0 || saving}
            className={`w-full rounded-2xl text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition bg-gradient-to-r from-[#E700FD] to-[#7900FD] hover:shadow-lg ${
              (!name.trim() || basePoints <= 0 || saving) ? 'opacity-60 cursor-not-allowed' : ''
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
      </div>
    </Layout>
  )
}
