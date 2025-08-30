import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { db } from '../db'
import { useParams, useNavigate } from 'react-router-dom'

type Item = { id: string; title: string; emoji?: string; points?: number }

export default function ConfigList() {
  const { type } = useParams() // flat | tasks | rewards | punishments
  const navigate = useNavigate()
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    load()
  }, [type])

  async function load() {
    if (type === 'tasks') {
      setItems(await db.tasks.toArray())
    } else if (type === 'rewards') {
      setItems(await db.rewards.toArray())
    } else if (type === 'punishments') {
      setItems(await db.punishments.toArray())
    } else if (type === 'flat') {
      setItems([])
    }
  }

  return (
    <Layout>
      <h2 className="text-lg font-bold mb-4">
        {type === 'tasks' && 'Дела'}
        {type === 'rewards' && 'Награды'}
        {type === 'punishments' && 'Наказания'}
        {type === 'flat' && 'Квартира'}
      </h2>

      <div className="space-y-2">
        {items.map(it => (
          <div
            key={it.id}
            className="rounded-xl p-3 border bg-white shadow-sm flex justify-between"
          >
            <span>
              {it.emoji} {it.title} {it.points ? `(${it.points})` : ''}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        {type === 'rewards' && (
          <button
            onClick={() => navigate('/config/rewards/add')}
            className="w-full px-4 py-2 rounded-xl bg-cyan-500 text-white font-bold"
          >
            ＋ Добавить награду
          </button>
        )}
        {type === 'punishments' && (
          <button
            onClick={() => navigate('/config/punishments/add')}
            className="w-full px-4 py-2 rounded-xl bg-rose-500 text-white font-bold"
          >
            ＋ Добавить наказание
          </button>
        )}
        {type === 'tasks' && (
          <button
            onClick={() => navigate('/config/tasks/add')}
            className="w-full px-4 py-2 rounded-xl bg-cyan-500 text-white font-bold"
          >
            ＋ Добавить дело
          </button>
        )}
      </div>
    </Layout>
  )
}