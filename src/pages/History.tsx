import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { db } from '../db'
import type { Entry, Room, Reward, Punishment } from '../types'

export default function History() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [punishments, setPunishments] = useState<Punishment[]>([])

  useEffect(() => {
    db.entries.orderBy('ts').reverse().toArray().then(setEntries)
    db.rooms.toArray().then(setRooms)
    db.rewards.toArray().then(setRewards)
    db.punishments.toArray().then(setPunishments)
  }, [])

  return (
    <Layout>
      <h2 className="text-lg font-bold mb-4">История</h2>
      <div className="space-y-3">
        {entries.map(e => (
          <div
            key={e.id}
            className="flex items-center gap-3 p-3 rounded-xl border bg-white shadow-sm"
          >
            {/* аватарка исполнителя */}
            <img
              src={e.personId === 'nastya' ? '/avatars/nastya.jpeg' : '/avatars/max.jpeg'}
              alt={e.personId === 'nastya' ? 'Настя' : 'Макс'}
              className="w-12 h-12 rounded-full object-cover"
            />

            {/* текст и баллы */}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {describeEntry(e, rooms, rewards, punishments)}
                </span>
                <span
                  className={`font-bold ${
                    e.points >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {e.points > 0 ? '+' : ''}{e.points}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {new Date(e.ts).toLocaleString('ru-RU')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

/* ---------- Хелпер ---------- */
function describeEntry(
  e: Entry,
  rooms: Room[],
  rewards: Reward[],
  punishments: Punishment[]
): string {
  if (e.taskId.startsWith('vacuum')) {
    const mode = e.taskId.includes('robot') ? 'Робот' : 'Вручную'
    const rid = e.taskId.split('-')[1]
    const roomName = rooms.find(r => r.id === rid)?.title ?? ''
    return `Пропылесосить — ${roomName} (${mode})`
  }

  if (e.taskId.startsWith('floor')) {
    const mode = e.taskId.includes('robot') ? 'Робот' : 'Вручную'
    const rid = e.taskId.split('-')[1]
    const roomName = rooms.find(r => r.id === rid)?.title ?? ''
    return `Помыть пол — ${roomName} (${mode})`
  }

  if (e.taskId.startsWith('dishes')) {
    return e.taskId.includes('dw')
      ? 'Помыть посуду — Посудомойка'
      : 'Помыть посуду — Вручную'
  }

  if (e.taskId.startsWith('dust')) {
    return 'Протереть пыль'
  }

  if (e.taskId.startsWith('laundry')) {
    return 'Постирать'
  }

  if (e.taskId.startsWith('plumbing')) {
    return 'Помыть сантехнику'
  }

  if (e.taskId.startsWith('reward')) {
    const id = e.taskId.replace('reward-', '')
    const reward = rewards.find(r => r.id === id)
    if (reward) {
      return `${reward.emoji} ${reward.title} от ${e.rewardGiver === 'nastya' ? 'Насти' : 'Макса'}`
    }
    return 'Награда'
  }

  if (e.taskId.startsWith('punish')) {
    const id = e.taskId.replace('punish-', '')
    const punish = punishments.find(p => p.id === id)
    if (punish) {
      return `${punish.emoji} ${punish.title} от ${e.rewardGiver === 'nastya' ? 'Насти' : 'Макса'}`
    }
    return 'Наказание'
  }

  return `Кастомное дело`
}