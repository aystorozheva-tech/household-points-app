import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import SofaIcon from '../icons/SofaIcon'
import MopIcon from '../icons/MopIcon'
import HeartIcon from '../icons/HeartIcon'
import BrokenHeartIcon from '../icons/BrokenHeartIcon'
import PeopleIcon from '../icons/PeopleIcon'

export default function HouseholdSettings() {
  const navigate = useNavigate()
  return (
    <Layout>
      <div>
        <div className="flex items-center px-4 mt-8 mb-6">
          <button onClick={() => navigate(-1)} className="mr-2 text-xl">←</button>
          <h1 className="text-center text-2xl font-bold flex-1">Настройки дома</h1>
        </div>
        <div className="px-4 space-y-4">
          {/* Rooms Card */}
          <div className="flex items-center bg-white rounded-xl shadow p-4 cursor-pointer" onClick={() => navigate('/config/flat')}>
            <SofaIcon className="w-8 h-8 mr-4 text-purple-700" />
            <div className="flex-1 font-semibold text-lg">Комнаты</div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>
          {/* Tasks Card */}
          <div className="flex items-center bg-white rounded-xl shadow p-4 cursor-pointer" onClick={() => navigate('/config/tasks')}>
            <MopIcon className="w-8 h-8 mr-4 text-purple-500" />
            <div className="flex-1 font-semibold text-lg">Хлопоты</div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>
          {/* Motivations Card */}
          <div className="flex items-center bg-white rounded-xl shadow p-4 cursor-pointer" onClick={() => navigate('/config/rewards')}>
            <HeartIcon className="w-8 h-8 mr-4 text-purple-300" />
            <div className="flex-1 font-semibold text-lg">Мотивации</div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>
          {/* Punishments Card */}
          <div className="flex items-center bg-white rounded-xl shadow p-4 cursor-pointer" onClick={() => navigate('/config/punishments')}>
            <BrokenHeartIcon className="w-8 h-8 mr-4 text-gray-400" />
            <div className="flex-1 font-semibold text-lg">Наказания</div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>
          {/* Participants Card */}
          <div className="flex items-center bg-white rounded-xl shadow p-4 cursor-pointer" onClick={() => navigate('/config-members')}>
            <PeopleIcon className="w-8 h-8 mr-4 text-black" />
            <div className="flex-1 font-semibold text-lg">Участники</div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>
        </div>
      </div>
    </Layout>
  )
}
