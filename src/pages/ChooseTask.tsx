import { useEffect, useMemo, useState, type ComponentType } from 'react'
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

type Chore = { id: string; name_ru: string; base_points_cnt: number; settings_per_room_flg: boolean; icon_id: string | null }

function RowButton({ title, subtitle, left, right, onClick }: { title: string; subtitle?: string; left?: React.ReactNode; right?: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full bg-white rounded-2xl shadow-md px-4 py-3 flex items-center justify-between hover:shadow-lg active:scale-[0.99] transition">
      <div className="flex items-center min-w-0 gap-3">
        {left && <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center shrink-0">{left}</div>}
        <div className="min-w-0">
          <div className="text-base font-semibold text-slate-900 truncate">{title}</div>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
      </div>
      {right}
    </button>
  )
}

export default function ChooseTask() {
  const navigate = useNavigate()
  const { householdId } = useOutletContext<AppOutletCtx>()
  const [chores, setChores] = useState<Chore[]>([])
  const [meId, setMeId] = useState<string | null>(null)
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
        .select('id,user_id,household_id')
        .eq('household_id', householdId)
      if (!mounted) return
      if (e1) { setError(e1.message); setLoading(false); return }
      const me = (profs ?? []).find(p => p.user_id === uid) || null
      setMeId(me?.id ?? null)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [householdId])

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

  async function addSimple(chore: Chore) {
    if (!meId) return
    setError(null)
    const { error } = await supabase
      .from('entries')
      .insert({
        household_id: householdId,
        profile_id: meId,
        kind: 'task',
        title: chore.name_ru,
        points: chore.base_points_cnt,
      })
      .select('id')
      .single()
    if (error) { setError(error.message); return }
    navigate('/')
  }

  const simple = useMemo(() => chores.filter(c => !c.settings_per_room_flg), [chores])
  const difficult = useMemo(() => chores.filter(c => c.settings_per_room_flg), [chores])

  const IconMap: Record<string, ComponentType<{className?:string}>> = {
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
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
        <button onClick={() => navigate('/')} className="absolute left-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md" aria-label="Назад">
          <span className="text-2xl">←</span>
        </button>
        <div className="w-full max-w-sm mt-20">
          <h1 className="text-3xl font-extrabold text-center text-black mb-6">Выберите дело</h1>
          {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
          {loading ? (
            <div className="text-center py-6">Загрузка…</div>
          ) : (
            <>
              {simple.length > 0 && (
                <div className="space-y-3 mb-6">
                  {simple.map(c => {
                    const Ico = c.icon_id ? IconMap[c.icon_id] : undefined
                    return (
                      <RowButton
                        key={c.id}
                        title={c.name_ru}
                        subtitle={`+${c.base_points_cnt} баллов`}
                        left={Ico ? <Ico className="w-6 h-6 text-[#7900FD]"/> : undefined}
                        onClick={() => addSimple(c)}
                      />
                    )
                  })}
                </div>
              )}
              {difficult.length > 0 && (
                <div className="space-y-3">
                  {difficult.map(c => {
                    const Ico = c.icon_id ? IconMap[c.icon_id] : undefined
                    return (
                      <RowButton
                        key={c.id}
                        title={c.name_ru}
                        left={Ico ? <Ico className="w-6 h-6 text-[#7900FD]"/> : undefined}
                        right={<ChevronRightIcon className="w-5 h-5 text-slate-300" />}
                        onClick={() => navigate(`/choose-rooms/${c.id}`)}
                      />
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
