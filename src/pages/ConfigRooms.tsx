import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import type { AppOutletCtx } from '../AppLayout'
import BedIcon from '../icons/BedIcon'
import BathIcon from '../icons/BathIcon'
import KitchenIcon from '../icons/KitchenIcon'
import SofaIcon from '../icons/SofaIcon'
import DeskIcon from '../icons/DeskIcon'
import KidsIcon from '../icons/KidsIcon'
import WardrobeIcon from '../icons/WardrobeIcon'
import BalconyIcon from '../icons/BalconyIcon'
import ChairIcon from '../icons/ChairIcon'
import ToiletIcon from '../icons/ToiletIcon'
import ShowerIcon from '../icons/ShowerIcon'
import SinkIcon from '../icons/SinkIcon'
import MixerIcon from '../icons/MixerIcon'
import CookingIcon from '../icons/CookingIcon'
import FridgeIcon from '../icons/FridgeIcon'
import FootprintIcon from '../icons/FootprintIcon'
import HangerIcon from '../icons/HangerIcon'
import CutleryIcon from '../icons/CutleryIcon'
import UnknownIcon from '../icons/UnknownIcon'
import ChevronRightIcon from '../icons/ChevronRightIcon'

export default function ConfigRooms() {
  const ctx = useOutletContext<AppOutletCtx | undefined>()
  const householdId = ctx?.householdId
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true)
      if (!householdId) return
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name_ru, icon_id')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true })
      setRooms(data ?? [])
      setLoading(false)
    }
    fetchRooms()
  }, [householdId])

  const Icon = useMemo(() => ({
    bed: BedIcon,
    bath: BathIcon,
    kitchen: KitchenIcon,
    living: SofaIcon,
    office: DeskIcon,
    kids: KidsIcon,
    wardrobe: WardrobeIcon,
    balcony: BalconyIcon,
    tv: ChairIcon,
    chair: ChairIcon,
    toilet: ToiletIcon,
    shower: ShowerIcon,
    sink: SinkIcon,
    mixer: MixerIcon,
    cooking: CookingIcon,
    fridge: FridgeIcon,
    footprint: FootprintIcon,
    hanger: HangerIcon,
    cutlery: CutleryIcon,
    unknown: UnknownIcon,
  } as const), [])

  return (
    <Layout>
      <div className="min-h-screen relative flex flex-col items-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
        <button
          onClick={() => navigate('/household-settings')}
          className="absolute left-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md"
          aria-label="Назад"
        >
          <span className="text-2xl">←</span>
        </button>
        <h1 className="text-3xl font-extrabold text-center text-black mt-10 mb-8">Комнаты</h1>
        <div className="w-full max-w-sm">
          {loading ? (
            <div className="text-center py-8">Загрузка…</div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Нет комнат</div>
          ) : (
            <div className="space-y-4 mb-8">
              {rooms.map(room => {
                const Ico = (room.icon_id && Icon[room.icon_id as keyof typeof Icon]) || null
                return (
                  <button
                    key={room.id}
                    onClick={() => navigate(`/edit-room/${room.id}`)}
                    className="w-full flex items-center justify-between bg-white rounded-2xl shadow-md px-4 py-3 text-left hover:shadow-lg transition"
                  >
                    <div className="flex items-center min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-4 shrink-0">
                        {Ico ? <Ico className="w-6 h-6 text-[#7900FD]" /> : <span className="text-xl">🏠</span>}
                      </div>
                      <div className="text-lg font-semibold text-slate-900 truncate">{room.name_ru}</div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-slate-300" />
                  </button>
                )
              })}
            </div>
          )}
          <button
            onClick={() => navigate('/new-room')}
            className="w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition mb-4"
          >
            + Добавить комнату
          </button>
        </div>
      </div>
    </Layout>
  )
}
