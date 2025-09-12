import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useParams, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
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
import HeartIcon from '../icons/HeartIcon'

export default function EditRoom() {
  const navigate = useNavigate()
  const { householdId } = useOutletContext<AppOutletCtx>()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()

  const [name, setName] = useState('')
  const [iconId, setIconId] = useState<string>('')
  const [iconDirty, setIconDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const IconMap = useMemo(() => ({
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

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!id) return
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name_ru, household_id, icon_id')
        .eq('id', id)
        .single()
      if (!mounted) return
      if (error) { setError(error.message); setLoading(false); return }
      setName((data as any)?.name_ru ?? '')
      if (!iconDirty) setIconId((data as any)?.icon_id ?? '')
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [id, householdId, iconDirty])

  useEffect(() => {
    const st = (location.state as any) || {}
    if (st.iconId) { setIconId(st.iconId); setIconDirty(true) }
  }, [location.state])

  function IconPreview() {
    const Ico = (iconId && IconMap[iconId as keyof typeof IconMap]) || null
    return Ico ? <Ico className="w-8 h-8 text-[#7900FD]" /> : <HeartIcon className="w-8 h-8 text-[#7900FD]" />
  }

  async function save() {
    if (!id) return
    setError(null)
    setSaving(true)
    const { data, error } = await supabase
      .from('rooms')
      .update({ name_ru: name.trim(), icon_id: iconId || null })
      .eq('id', id)
      .eq('household_id', householdId)
      .select('id, icon_id')
      .single()
    setSaving(false)
    if (error) { setError(error.message); return }
    if (!data) { setError('Комната не найдена или нет доступа'); return }
    navigate('/config/flat')
  }

  async function removeRoom() {
    if (!id) return
    setError(null)
    setDeleting(true)
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId)
    setDeleting(false)
    if (error) { setError(error.message); return }
    navigate('/config/flat')
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">Загрузка…</div>
      </Layout>
    )
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
          <h1 className="text-3xl font-extrabold text-center text-black mb-8">Комната</h1>
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E700FD] to-[#7900FD] shadow-lg flex items-center justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                <IconPreview />
              </div>
            </div>
            <button
              onClick={() => navigate('/choose-room-icon', { state: { returnTo: `/edit-room/${id}`, current: iconId } })}
              className="text-purple-600 font-bold mb-2"
            >
              Выберите иконку
            </button>
          </div>
          <label className="w-full mb-8">
            <div className="text-sm text-slate-600 mb-1">Название комнаты</div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
              placeholder="Спальня"
            />
          </label>
          {error && <div className="w-full text-red-600 text-sm mb-2">{error}</div>}
          <button
            onClick={save}
            disabled={!name.trim() || saving}
            className={`w-full rounded-2xl text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition mb-4 bg-gradient-to-r from-[#E700FD] to-[#7900FD] hover:shadow-lg ${
              !name.trim() || saving ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
          <button
            onClick={removeRoom}
            disabled={saving || deleting}
            className={`w-full rounded-2xl text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition mb-2 bg-black ${
              saving || deleting ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {deleting ? 'Удаление…' : 'Удалить'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
