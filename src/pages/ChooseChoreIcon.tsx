import { useState } from 'react'
import type React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
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

type Option = { id: string; label: string; Icon: React.ComponentType<{ className?: string }> }

const OPTIONS: Option[] = [
  { id: 'vacuum', label: 'Пылесос', Icon: VacuumIcon },
  { id: 'mop', label: 'Мытьё пола', Icon: MopIcon },  
  { id: 'window', label: 'Окно', Icon: WindowIcon },  
  { id: 'cutlery', label: 'Посуда', Icon: CutleryIcon },  

  { id: 'bath', label: 'Ванная', Icon: BathIcon },
  { id: 'toilet', label: 'Туалет', Icon: ToiletIcon },
  { id: 'shower', label: 'Душ', Icon: ShowerIcon },
  { id: 'sink', label: 'Санузел', Icon: SinkIcon },
  
  { id: 'washmachine', label: 'Стирка', Icon: WashmachineIcon },
  { id: 'hanger', label: 'Вешалка', Icon: HanderTwoIcon },
  { id: 'iron', label: 'Утюг', Icon: IronIcon },
  { id: 'soap', label: 'Мыло', Icon: SoapIcon },

  { id: 'bucket', label: 'Ведро', Icon: BucketIcon },
  { id: 'pet', label: 'Домашние животные', Icon: PetIcon },
  { id: 'kids', label: 'Дети', Icon: KidsIcon },
  { id: 'unknown', label: 'Неизвестно', Icon: UnknownIcon },
  
]

export default function ChooseChoreIcon() {
  const navigate = useNavigate()
  const location = useLocation()
  const initial = (location.state as any)?.current || OPTIONS[0].id
  const [selected, setSelected] = useState<string>(initial)

  function confirm() {
    const returnTo = (location.state as any)?.returnTo || '/config/tasks/add'
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
          <h1 className="text-3xl font-extrabold text-center text-black mb-6">Иконка дела</h1>

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
