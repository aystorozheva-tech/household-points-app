import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { db } from '../db'

export default function AddReward() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('🎁')
  const [points, setPoints] = useState<number>(10)

  async function saveReward() {
    if (!title.trim()) return
    await db.rewards.add({
      id: crypto.randomUUID(),
      title: title.trim(),
      emoji,
      points,
    })
    navigate('/config/rewards')
  }

  return (
    <Layout>
      <h2 className="text-lg font-bold mb-4">Добавить награду</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Название награды</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Например: Массаж"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Эмодзи</label>
          <input
            type="text"
            value={emoji}
            onChange={e => setEmoji(e.target.value)}
            maxLength={2}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Баллы</label>
          <input
            type="number"
            value={points}
            onChange={e => setPoints(parseInt(e.target.value) || 0)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={saveReward}
          disabled={!title.trim() || points <= 0}
          className={`w-full rounded-2xl py-3 font-bold ${
            title.trim() && points > 0
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          Сохранить
        </button>
      </div>
    </Layout>
  )
}