import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { db } from '../db'

type Reward = {
  id: string
  title: string
  emoji: string
  points: number
}

export default function ConfigRewards() {
  const navigate = useNavigate()
  const [rewards, setRewards] = useState<Reward[]>([])

  useEffect(() => {
    db.rewards.toArray().then(setRewards)
  }, [])

  return (
    <Layout>
      <h2 className="text-lg font-bold mb-4">Награды</h2>

      <div className="space-y-3 mb-4">
        {rewards.map(r => (
            <div
            key={r.id}
            onClick={() => navigate(`/config/rewards/${r.id}`)}
            className="p-3 rounded-xl border bg-white shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50"
            >
            <span className="text-lg">{r.emoji} {r.title}</span>
            <span className="font-bold text-cyan-600">{r.points} баллов</span>
            </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/config/rewards/add')}
        className="w-full rounded-2xl py-3 bg-cyan-500 text-white font-bold"
      >
        ＋ Добавить награду
      </button>
    </Layout>
  )
}