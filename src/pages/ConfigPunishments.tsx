import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { db } from '../db'
import { useNavigate } from 'react-router-dom'
import type { Punishment } from '../types'

export default function ConfigPunishments() {
  const navigate = useNavigate()
  const [punishments, setPunishments] = useState<Punishment[]>([])

  useEffect(() => {
    db.punishments.toArray().then(setPunishments)
  }, [])

  return (
    <Layout>
      <h2 className="text-lg font-bold mb-4">Наказания</h2>

      <div className="space-y-3 mb-4">
        {punishments.map(p => (
            <div
            key={p.id}
            onClick={() => navigate(`/config/punishments/${p.id}`)}
            className="p-3 rounded-xl border bg-white shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50"
            >
            <span className="text-lg">{p.emoji} {p.title}</span>
            <span className="font-bold text-rose-600">-{p.points} баллов</span>
            </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/config/punishments/add')}
        className="w-full rounded-2xl py-3 bg-rose-500 text-white font-bold"
      >
        ＋ Добавить наказание
      </button>
    </Layout>
  )
}