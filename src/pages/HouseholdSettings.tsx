import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import RoomsIcon from '../icons/RoomsIcon'
import TasksIcon from '../icons/CheckIcon'
import HeartIcon from '../icons/HeartIcon'
import WarningIcon from '../icons/WarningIcon'
import MembersIcon from '../icons/MembersIcon'

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
            <RoomsIcon className="w-6 h-6 bg-purple-500 rounded-full p-2 mr-4 text-white" />
            <div className="flex-1 font-semibold text-lg">Комнаты</div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>
          {/* Tasks Card */}
          <div className="flex items-center bg-white rounded-xl shadow p-4 cursor-pointer" onClick={() => navigate('/config/tasks')}>
            <TasksIcon className="w-6 h-6 bg-purple-100 rounded-full p-2 mr-4 text-purple-500" />
            <div className="flex-1 font-semibold text-lg">Хлопоты</div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>
          {/* Motivations Card */}
          <div className="flex items-center bg-white rounded-xl shadow p-4 cursor-pointer" onClick={() => navigate('/config/rewards')}>
            <HeartIcon className="w-6 h-6 bg-pink-100 rounded-full p-2 mr-4 text-pink-500" />
            <div className="flex-1 font-semibold text-lg">Мотивации</div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>
          {/* Punishments Card */}
          <div className="flex items-center bg-white rounded-xl shadow p-4 cursor-pointer" onClick={() => navigate('/config/punishments')}>
            <WarningIcon className="w-6 h-6 bg-gray-200 rounded-full p-2 mr-4 text-gray-700" />
            <div className="flex-1 font-semibold text-lg">Наказания</div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>
          {/* Participants Card */}
          <div className="flex items-center bg-white rounded-xl shadow p-4 cursor-pointer" onClick={() => navigate('/config-members')}>
            <MembersIcon className="w-6 h-6 bg-black rounded-full p-2 mr-4 text-white" />
            <div className="flex-1 font-semibold text-lg">Участники</div>
            <span className="ml-2 text-gray-400">&gt;</span>
          </div>
        </div>
      </div>
    </Layout>
  )
}