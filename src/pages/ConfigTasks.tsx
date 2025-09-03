import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import Layout from '../components/Layout'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'
import ChevronRightIcon from '../icons/ChevronRightIcon'
import BroomIcon from '../icons/BroomIcon'
import MopIcon from '../icons/MopIcon'
import DishesIcon from '../icons/DishesIcon'
import FeatherIcon from '../icons/FeatherIcon'
import TShirtIcon from '../icons/TShirtIcon'
import ToiletIcon from '../icons/ToiletIcon'
import TrashIcon from '../icons/TrashIcon'
import VacuumIcon from '../icons/VacuumIcon'
import WindowIcon from '../icons/WindowIcon'
import CutleryIcon from '../icons/CutleryIcon'
import BathIcon from '../icons/BathIcon'
import ShowerIcon from '../icons/ShowerIcon'
import SinkIcon from '../icons/SinkIcon'
import WashmachineIcon from '../icons/WashmachineIcon'
import HanderTwoIcon from '../icons/HanderTwoIcon'
import IronIcon from '../icons/IronIcon'
import SoapIcon from '../icons/SoapIcon'
import BucketIcon from '../icons/BucketIcon'
import PetIcon from '../icons/PetIcon'
import KidsIcon from '../icons/KidsIcon'
import UnknownIcon from '../icons/UnknownIcon'

type Chore = { id: string; name_ru: string; base_points_cnt: number; settings_per_room_flg: boolean; icon_id: string | null }

export default function ConfigTasks() {
  const navigate = useNavigate()
  const { householdId } = useOutletContext<AppOutletCtx>()
  const [chores, setChores] = useState<Chore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const IconMap = useMemo(() => ({
    broom: BroomIcon,
    vacuum: VacuumIcon,
    mop: MopIcon,
    window: WindowIcon,
    cutlery: CutleryIcon,
    dishes: DishesIcon,
    dust: FeatherIcon,
    laundry: TShirtIcon,
    washmachine: WashmachineIcon,
    hanger: HanderTwoIcon,
    iron: IronIcon,
    soap: SoapIcon,
    bucket: BucketIcon,
    pet: PetIcon,
    kids: KidsIcon,
    plumbing: ToiletIcon,
    bath: BathIcon,
    toilet: ToiletIcon,
    shower: ShowerIcon,
    sink: SinkIcon,
    trash: TrashIcon,
    unknown: UnknownIcon,
  } as const), [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setError(null)
      setLoading(true)
      const { data, error } = await supabase
        .from('chores')
        .select('id, name_ru, base_points_cnt, settings_per_room_flg, icon_id')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true })
      if (!mounted) return
      if (error) { setError(error.message); setLoading(false); return }
      setChores((data ?? []) as Chore[])
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
      <h1 className="text-2xl font-extrabold text-center text-black mb-4">Дела</h1>

      {loading && <div className="text-center py-6">Загрузка…</div>}
      {error && <div className="text-center text-red-600 py-2 text-sm">{error}</div>}
      {!loading && chores.length === 0 && (
        <div className="text-center text-slate-500 mb-4">Нет дел</div>
      )}

      <div className="space-y-3 mb-6">
        {chores.map(c => {
          const Ico = (c.icon_id && (IconMap as any)[c.icon_id]) || null
          const IconComp = Ico as React.ComponentType<{ className?: string }> | null
          return (
            <button
              key={c.id}
              onClick={() => navigate(`/config/tasks/${c.id}`)}
              className="w-full bg-white rounded-2xl shadow-md px-4 py-3 flex items-center justify-between hover:shadow-lg transition text-left"
            >
              <div className="flex items-center min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center mr-3 shrink-0">
                  {IconComp ? <IconComp className="w-6 h-6 text-[#7900FD]" /> : <span className="text-lg">🧰</span>}
                </div>
                <div className="truncate">
                  <div className="text-base font-semibold text-slate-900 truncate">{c.name_ru}</div>
                  <div className="text-xs text-slate-500">{c.base_points_cnt} баллов{c.settings_per_room_flg ? ' • есть коэф. по комнатам' : ''}</div>
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-slate-300" />
            </button>
          )
        })}
      </div>

      <button
        onClick={() => navigate('/config/tasks/add')}
        className="w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition"
      >
        + Добавить дело
      </button>
    </Layout>
  )
}
