import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useStore } from '../store'
import { db } from '../db'
import { Link, useNavigate } from 'react-router-dom'
import type { Punishment } from '../types'

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
        ${active ? 'ring-2 ring-orange-400/70' : ''}
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

export default function PunishSelect() {
  const [punishments, setPunishments] = useState<Punishment[]>([])
  const [selected, setSelected] = useState<number | null>(null) // индекс в массиве
  const ownerId = useStore(s => s.ownerId)
  const navigate = useNavigate()
  const receiverId = ownerId === 'nastya' ? 'max' : 'nastya'

  useEffect(() => {
    db.punishments.toArray().then(ps => setPunishments(ps.sort((a, b) => a.points - b.points)))
  }, [])

  return (
    <Layout>
      <h1 className="text-xl font-semibold">Выберите наказание</h1>

      <div className="space-y-3">
        {punishments.map((p, i) => (
          <SelectableRow
            key={p.id}
            active={selected === i}
            left={<span>{p.emoji ?? '⚠️'}</span>}
            title={p.title}
            subtitle={`${p.points} баллов`}
            onClick={() => setSelected(i)}
          />
        ))}
      </div>

      <button
        disabled={selected === null}
        onClick={async () => {
          if (selected === null) return
          const p = punishments[selected]
          if (!p) return

          await db.entries.add({
            id: crypto.randomUUID(),
            personId: receiverId,          // кого наказываем
            taskId: `punish-${p.id}`,      // помечаем тип записи
            amount: 1,
            multiplier: 1,
            points: -Math.abs(p.points),   // отрицательные баллы
            ts: Date.now(),
            punish: true,
            reward: false,
          } as any)

          navigate('/')
        }}
        className={`mt-6 w-full rounded-2xl py-3 text-white font-bold
          ${selected !== null ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        Подтвердить
      </button>

      <Link to="/" className="block mt-4 text-center text-violet-700">← Отмена</Link>
    </Layout>
  )
}