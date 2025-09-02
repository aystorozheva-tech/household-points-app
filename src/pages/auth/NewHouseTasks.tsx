import { useMemo, useState } from 'react'
import type React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

import BroomIcon from '../../icons/BroomIcon'
import MopIcon from '../../icons/MopIcon'
import FeatherIcon from '../../icons/FeatherIcon'
import DishesIcon from '../../icons/DishesIcon'
import TrashIcon from '../../icons/TrashIcon'

type TaskOpt = { id: string; label: string; points: number; Icon: React.ComponentType<{className?:string}> }

const TASKS: TaskOpt[] = [
  { id: 'vacuum', label: 'Пропылесосить', points: 20, Icon: BroomIcon },
  { id: 'mop', label: 'Помыть пол', points: 20, Icon: MopIcon },
  { id: 'dust', label: 'Протереть пыль', points: 20, Icon: FeatherIcon },
  { id: 'trash', label: 'Вынести мусор', points: 15, Icon: TrashIcon },
  { id: 'dishes', label: 'Помыть посуду', points: 10, Icon: DishesIcon },
]

const iconIdMap: Record<string, string> = {
  vacuum: 'broom',
  mop: 'mop',
  dust: 'dust',
  trash: 'trash',
  dishes: 'dishes',
}

export default function NewHouseTasks() {
  const navigate = useNavigate()
  const location = useLocation()
  const [picked, setPicked] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const householdId = useMemo(() => {
    const st = (location.state as any)?.householdId
    if (st) return st as string
    try { return sessionStorage.getItem('onboard.householdId') } catch { return null }
  }, [location.state])

  function toggle(id: string) { setPicked(p => ({ ...p, [id]: !p[id] })) }

  async function next() {
    if (!householdId) { navigate('/auth/new-house-name', { replace: true }); return }
    const selected = TASKS.filter(t => picked[t.id])
    if (selected.length > 0) {
      setSaving(true)
      setError(null)
      const rows = selected.map(t => ({
        name_ru: t.label,
        household_id: householdId,
        base_points_cnt: t.points,
        settings_per_room_flg: false,
        coefficient_dict: null,
        icon_id: iconIdMap[t.id] || null,
      }))
      const { error } = await supabase.from('chores').insert(rows)
      setSaving(false)
      if (error) { setError(error.message); return }
    }
    navigate('/auth/allow-push', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
      <button
        onClick={() => navigate('/auth/new-house-rooms')}
        className="absolute left-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md"
        aria-label="Назад"
      >
        <span className="text-2xl">←</span>
      </button>

      <div className="w-full max-w-sm mt-20">
        <h1 className="text-3xl font-extrabold text-center text-black mb-6">Базовые дела</h1>
        {error && <div className="text-sm text-rose-600 mb-3">{error}</div>}
        <div className="space-y-3 mb-6">
          {TASKS.map(({ id, label, points, Icon }) => {
            const active = !!picked[id]
            return (
              <label key={id} className="flex items-center justify-between bg-white rounded-2xl shadow-md px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center">
                    <Icon className={`w-6 h-6 ${active ? 'text-[#7900FD]' : 'text-slate-500'}`} />
                  </div>
                  <div className="truncate">
                    <div className="text-base font-semibold text-slate-900 truncate">{label}</div>
                    <div className="text-xs text-slate-500">{points} баллов</div>
                  </div>
                </div>
                <input type="checkbox" checked={active} onChange={() => toggle(id)} />
              </label>
            )
          })}
        </div>
        <button
          onClick={next}
          disabled={saving}
          className={`w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}`}
        >
          {saving ? 'Сохранение…' : 'Продолжить'}
        </button>
      </div>
    </div>
  )
}
