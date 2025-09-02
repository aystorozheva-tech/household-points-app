import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

import SofaIcon from '../../icons/SofaIcon'
import BedIcon from '../../icons/BedIcon'
import KitchenIcon from '../../icons/KitchenIcon'
import BathIcon from '../../icons/BathIcon'
import KidsIcon from '../../icons/KidsIcon'
import WardrobeIcon from '../../icons/WardrobeIcon'

type Opt = { id: string; label: string; Icon: React.ComponentType<{className?:string}> }

const OPTIONS: Opt[] = [
  { id: 'living', label: 'Гостиная', Icon: SofaIcon },
  { id: 'bed', label: 'Спальня', Icon: BedIcon },
  { id: 'kitchen', label: 'Кухня', Icon: KitchenIcon },
  { id: 'bath', label: 'Ванная', Icon: BathIcon },
  { id: 'wardrobe', label: 'Коридор', Icon: WardrobeIcon },
  { id: 'kids', label: 'Детская', Icon: KidsIcon },
]

export default function NewHouseRooms() {
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

  useEffect(() => {
    // preselect all by default
    setPicked(Object.fromEntries(OPTIONS.map(o => [o.id, true])))
  }, [])

  function toggle(id: string) { setPicked(p => ({ ...p, [id]: !p[id] })) }

  async function next() {
    if (!householdId) { navigate('/auth/new-house-name', { replace: true }); return }
    const selected = OPTIONS.filter(o => picked[o.id])
    if (selected.length === 0) { navigate('/auth/new-house-tasks', { state: { householdId } }); return }
    setSaving(true)
    setError(null)
    const rows = selected.map(o => ({ name_ru: o.label, icon_id: o.id, household_id: householdId }))
    const { error } = await supabase.from('rooms').insert(rows)
    setSaving(false)
    if (error) { setError(error.message); return }
    navigate('/auth/new-house-tasks', { state: { householdId } })
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
      <button
        onClick={() => navigate('/auth/new-house-name')}
        className="absolute left-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md"
        aria-label="Назад"
      >
        <span className="text-2xl">←</span>
      </button>
      <div className="w-full max-w-sm mt-20">
        <h1 className="text-3xl font-extrabold text-center text-black mb-6">Комнаты дома</h1>
        {error && <div className="text-sm text-rose-600 mb-3">{error}</div>}
        <div className="space-y-3 mb-6">
          {OPTIONS.map(({ id, label, Icon }) => {
            const active = !!picked[id]
            return (
              <label key={id} className="flex items-center justify-between bg-white rounded-2xl shadow-md px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center">
                    <Icon className={`w-6 h-6 ${active ? 'text-[#7900FD]' : 'text-slate-500'}`} />
                  </div>
                  <span className="text-base font-semibold text-slate-900 truncate">{label}</span>
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
