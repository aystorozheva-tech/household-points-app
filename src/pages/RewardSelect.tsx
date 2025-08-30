import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useStore } from '../store'
import { db } from '../db'
import { Link, useNavigate } from 'react-router-dom'
import type { Reward } from '../types'

function SelectableRow({
  active,
  left,
  title,
  subtitle,
  onClick,
}: {
  active: boolean
  left: React.ReactNode
  title: string
  subtitle?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full bg-white rounded-2xl shadow-md px-4 py-3
        flex items-center gap-3
        text-left hover:shadow-lg active:scale-[0.99] transition
        ${active ? 'ring-2 ring-rose-400/70' : ''}
      `}
    >
      <span className="text-2xl leading-none">{left}</span>
      <span className="flex flex-col">
        <span className="font-medium text-slate-900">{title}</span>
        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
      </span>
    </button>
  )
}

export default function RewardSelect() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [selected, setSelected] = useState<number | null>(null) // индекс в массиве
  const ownerId = useStore(s => s.ownerId)
  const navigate = useNavigate()
  const receiverId = ownerId === 'nastya' ? 'max' : 'nastya'

  useEffect(() => {
    db.rewards.toArray().then(rs => setRewards(rs.sort((a, b) => a.points - b.points)))
  }, [])

  return (
    <Layout>
      <h1 className="text-xl font-semibold">Выберите награду</h1>

      <div className="space-y-3">
        {rewards.map((r, i) => (
          <SelectableRow
            key={r.id}
            active={selected === i}
            left={<span>{r.emoji ?? '🎁'}</span>}
            title={r.title}
            subtitle={`${r.points} баллов`}
            onClick={() => setSelected(i)}
          />
        ))}
      </div>

      <button
        onClick={async () => {
          if (selected === null) return
          const r = rewards[selected]
          if (!r) return

          await db.entries.add({
            id: crypto.randomUUID(),
            personId: receiverId,        // кому зачесть очки
            taskId: `reward-${r.id}`,    // помечаем тип записи
            amount: 1,
            multiplier: 1,
            points: r.points,
            ts: Date.now(),
            reward: true,
            punish: false,
            // в проекте ещё используется rewardGiver:
            rewardGiver: ownerId,
          } as any)

          navigate('/')
        }}
        className={`mt-6 w-full rounded-2xl py-3 text-white font-bold
          ${selected !== null ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        Подтвердить
      </button>

      <Link to="/" className="block mt-4 text-center text-violet-700">← Отмена</Link>
    </Layout>
  )
}