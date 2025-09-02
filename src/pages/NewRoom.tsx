import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import Layout from '../components/Layout'
import HeartIcon from '../icons/HeartIcon'
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

export default function NewRoom() {
  const navigate = useNavigate()
  const { householdId } = useOutletContext<AppOutletCtx>()
  const location = useLocation()
  const [roomName, setRoomName] = useState('')
  const [iconId, setIconId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const st = (location.state as any) || {}
    if (st.iconId) setIconId(st.iconId)
  }, [location.state])

  function IconPreview() {
    const map: Record<string, ComponentType<{ className?: string }>> = {
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
    const Comp = map[iconId]
    return Comp ? <Comp className="w-8 h-8 text-[#7900FD]" /> : <HeartIcon className="w-8 h-8 text-[#7900FD]" />
  }

  async function handleCreate() {
    if (!roomName.trim()) return
    setError(null)
    setLoading(true)
    const payload: Record<string, any> = {
      household_id: householdId,
      name_ru: roomName.trim(),
    }
    if (iconId) payload.icon_id = iconId
    const { error: e } = await supabase.from('rooms').insert(payload)
    setLoading(false)
    if (e) { setError(e.message); return }
    navigate('/config/flat')
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md"
          aria-label="Назад"
        >
          <span className="text-2xl">←</span>
        </button>
        <div className="w-full max-w-sm flex flex-col items-center mt-20">
          <h1 className="text-3xl font-extrabold text-center text-black mb-8">Новая комната</h1>
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E700FD] to-[#7900FD] shadow-lg flex items-center justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                <IconPreview />
              </div>
            </div>
            <button
              onClick={() => navigate('/choose-room-icon', { state: { returnTo: '/new-room', current: iconId } })}
              className="text-purple-600 font-bold mb-2"
            >
              Выберите иконку
            </button>
          </div>
          <label className="w-full mb-8">
            <div className="text-sm text-slate-600 mb-1">Название комнаты</div>
            <input
              type="text"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
              placeholder="Спальня"
            />
          </label>
          {error && <div className="w-full text-red-600 text-sm mb-2">{error}</div>}
          <button
            onClick={handleCreate}
            disabled={!roomName.trim() || loading}
            className={`w-full rounded-2xl text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition mb-4 bg-gradient-to-r from-[#E700FD] to-[#7900FD] hover:shadow-lg ${
              !roomName.trim() || loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Сохранение…' : 'Добавить комнату'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
