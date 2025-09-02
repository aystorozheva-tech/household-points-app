import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import type { ComponentType } from 'react'
import BroomIcon from '../icons/BroomIcon'
import MopIcon from '../icons/MopIcon'
import DishesIcon from '../icons/DishesIcon'
import FeatherIcon from '../icons/FeatherIcon'
import TShirtIcon from '../icons/TShirtIcon'
import ToiletIcon from '../icons/ToiletIcon'
import BedIcon from '../icons/BedIcon'
import BathIcon from '../icons/BathIcon'
import KitchenIcon from '../icons/KitchenIcon'
import SofaIcon from '../icons/SofaIcon'
import DeskIcon from '../icons/DeskIcon'
import KidsIcon from '../icons/KidsIcon'
import WardrobeIcon from '../icons/WardrobeIcon'
import BalconyIcon from '../icons/BalconyIcon'
import TVIcon from '../icons/TVIcon'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'

type Room = { id: string; name_ru: string; icon_id: string | null }

export default function ChooseRooms() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { householdId } = useOutletContext<AppOutletCtx>()
  const [rooms, setRooms] = useState<Room[]>([])
  const [chore, setChore] = useState<any>(null)
  const [iconId, setIconId] = useState<string | null>(null)
  const [meId, setMeId] = useState<string | null>(null)
  const [picked, setPicked] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setError(null)
      setLoading(true)
      const { data: u } = await supabase.auth.getUser()
      const uid = u.user?.id
      const [{ data: profs }, { data: rs }, { data: ch, error: eCh }] = await Promise.all([
        supabase.from('profiles').select('id,user_id').eq('household_id', householdId),
        supabase.from('rooms').select('id, name_ru, icon_id').eq('household_id', householdId).order('created_at', { ascending: true }),
        supabase.from('chores').select('id, name_ru, base_points_cnt, coefficient_dict, icon_id').eq('id', id!).single(),
      ])
      if (!mounted) return
      const me = (profs ?? []).find(p => p.user_id === uid) || null
      setMeId(me?.id ?? null)
      setRooms((rs ?? []) as Room[])
      if (eCh) { setError(eCh.message) }
      setChore(ch)
      setIconId(ch?.icon_id ?? null)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [householdId, id])

  const total = useMemo(() => {
    if (!chore) return 0
    const coeff: Record<string, number> = chore.coefficient_dict || {}
    const base = chore.base_points_cnt as number
    return Object.entries(picked).reduce((sum, [rid, on]) => on ? sum + base * (typeof coeff[rid] === 'number' ? coeff[rid] : 1) : sum, 0)
  }, [picked, chore])

  function toggle(roomId: string) {
    setPicked(prev => ({ ...prev, [roomId]: !prev[roomId] }))
  }

  async function confirm() {
    if (!meId || !chore) return
    if (total <= 0) { navigate('/'); return }
    const { error } = await supabase
      .from('entries')
      .insert({
        household_id: householdId,
        profile_id: meId,
        kind: 'task',
        title: chore.name_ru,
        points: total,
      })
      .select('id')
      .single()
    if (error) { setError(error.message); return }
    navigate('/')
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
        <button onClick={() => navigate('/choose')} className="absolute left-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md" aria-label="Назад">
          <span className="text-2xl">←</span>
        </button>
        <div className="w-full max-w-sm mt-20">
          <div className="flex flex-col items-center mb-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E700FD] to-[#7900FD] shadow-lg flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                {(() => {
                  const IconMap: Record<string, ComponentType<{className?:string}>> = {
                    broom: BroomIcon,
                    mop: MopIcon,
                    dishes: DishesIcon,
                    dust: FeatherIcon,
                    laundry: TShirtIcon,
                    plumbing: ToiletIcon,
                  }
                  const Ico = iconId ? IconMap[iconId] : undefined
                  return Ico ? <Ico className="w-8 h-8 text-[#7900FD]"/> : <span className="text-[#7900FD] text-xl">★</span>
                })()}
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-center text-black mb-4">Выберите комнаты</h1>
          {error && <div className="mb-3 text-sm text-rose-600">{error}</div>}
          {loading ? (
            <div className="text-center py-6">Загрузка…</div>
          ) : (
            <div className="space-y-3">
              {rooms.map(r => {
                const RoomIconMap: Record<string, (p:{className?:string})=>JSX.Element> = {
                  bed: BedIcon,
                  bath: BathIcon,
                  kitchen: KitchenIcon,
                  living: SofaIcon,
                  office: DeskIcon,
                  kids: KidsIcon,
                  wardrobe: WardrobeIcon,
                  balcony: BalconyIcon,
                  tv: TVIcon,
                }
                const RIco = r.icon_id ? RoomIconMap[r.icon_id] : undefined
                return (
                  <label key={r.id} className="flex items-center justify-between bg-white rounded-2xl shadow-md px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center shrink-0">
                        {RIco ? <RIco className="w-6 h-6 text-[#7900FD]"/> : <span className="text-lg">🏠</span>}
                      </div>
                      <span className="text-base font-semibold text-slate-900 truncate">{r.name_ru}</span>
                    </div>
                    <input type="checkbox" checked={!!picked[r.id]} onChange={() => toggle(r.id)} />
                  </label>
                )
              })}
            </div>
          )}
          <div className="mt-6 mb-2 text-right text-sm text-slate-600">Итого: <span className="font-semibold text-slate-900">{total}</span> баллов</div>
          <button
            onClick={confirm}
            className={`w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition`}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </Layout>
  )
}
