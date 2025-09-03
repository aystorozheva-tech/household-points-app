import { useState } from 'react'
import type React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

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

type Option = { id: string; label: string; Icon: React.ComponentType<{ className?: string }> }

const OPTIONS: Option[] = [
  { id: 'bed', label: 'Спальня', Icon: BedIcon },
  { id: 'living', label: 'Гостиная', Icon: SofaIcon },
  { id: 'chair', label: 'Столовая', Icon: ChairIcon },
  { id: 'kids', label: 'Детская', Icon: KidsIcon },
  
  { id: 'bath', label: 'Ванная', Icon: BathIcon },
  { id: 'toilet', label: 'Туалет', Icon: ToiletIcon },
  { id: 'shower', label: 'Душ', Icon: ShowerIcon },
  { id: 'sink', label: 'Санузел', Icon: SinkIcon },

  { id: 'mixer', label: 'Миксер', Icon: MixerIcon },
  { id: 'cooking', label: 'Готовка', Icon: CookingIcon },
  { id: 'fridge', label: 'Холодильник', Icon: FridgeIcon },
  { id: 'kitchen', label: 'Кухня', Icon: KitchenIcon },
  
  { id: 'footprint', label: 'Следы', Icon: FootprintIcon },
  { id: 'hanger', label: 'Вешалка', Icon: HangerIcon },
  { id: 'cutlery', label: 'Приборы', Icon: CutleryIcon },
  { id: 'unknown', label: 'Неизвестно', Icon: UnknownIcon },
  
]

export default function ChooseRoomIcon() {
  const navigate = useNavigate()
  const location = useLocation()
  const initial = (location.state as any)?.current || 'bed'
  const [selected, setSelected] = useState<string>(initial)

  function confirm() {
    const returnTo = (location.state as any)?.returnTo || '/new-room'
    // Replace the chooser in history so Back from returnTo skips this screen
    navigate(returnTo, { state: { iconId: selected }, replace: true })
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
          <h1 className="text-3xl font-extrabold text-center text-black mb-6">Иконка комнаты</h1>

          <div className="grid grid-cols-4 gap-4 w-full mb-8">
            {OPTIONS.map(({ id, label, Icon }) => {
              const active = id === selected
              return (
                <button
                  key={id}
                  onClick={() => setSelected(id)}
                  className={`group flex flex-col items-center focus:outline-none`}
                  aria-pressed={active}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-md transition ` +
                    (active
                      ? 'bg-[conic-gradient(from_180deg,rgba(231,0,253,1),rgba(121,0,253,1))] p-[3px]'
                      : 'bg-white')}
                  >
                    <div className={`w-full h-full rounded-full flex items-center justify-center ` + (active ? 'bg-white' : '')}>
                      <Icon className={`w-8 h-8 ${active ? 'text-[#7900FD]' : 'text-slate-500'}`} />
                    </div>
                  </div>
                  {/* label hidden per request */}
                </button>
              )
            })}
          </div>

          <button
            onClick={confirm}
            className="w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </Layout>
  )
}
