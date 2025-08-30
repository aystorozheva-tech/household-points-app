import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { db } from '../db'
import { Link, useNavigate } from 'react-router-dom'
import { defaultTaskMeta } from '../defaultTaskMeta'
import type { CustomTask } from '../types'

type BaseTaskKey = keyof typeof defaultTaskMeta

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
        flex items-center justify-between gap-3
        text-left hover:shadow-lg active:scale-[0.99] transition
        ${active ? 'ring-2 ring-violet-500/70' : ''}
      `}
    >
      <span className="flex items-center gap-3">
        <span className="text-2xl leading-none">{left}</span>
        <span className="flex flex-col">
          <span className="font-medium text-slate-900">{title}</span>
          {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
        </span>
      </span>
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-400" fill="none">
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

export default function ChooseTask() {
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([])
  const [selected, setSelected] = useState<string | null>(null) // base key ИЛИ `custom:{id}`
  const navigate = useNavigate()

  useEffect(() => {
    db.customTasks.toArray().then(setCustomTasks)
  }, [])

  const baseTasks = Object.entries(defaultTaskMeta) as [BaseTaskKey, typeof defaultTaskMeta[BaseTaskKey]][]

  return (
    <Layout>
      <h1 className="text-xl font-semibold">Выберите дело</h1>

      {/* Базовые дела (у них нет points -> subtitle не показываем) */}
      <div className="space-y-3">
        {baseTasks.map(([key, meta]) => (
          <SelectableRow
            key={key}
            active={selected === key}
            left={<span>{meta.emoji}</span>}
            title={meta.title}
            onClick={() => setSelected(key)}
          />
        ))}
      </div>

      {/* Кастомные дела (у них есть points -> показываем) */}
      {customTasks.length > 0 && (
        <>
          <div className="mt-6 text-sm font-semibold text-slate-600">Пользовательские дела</div>
          <div className="space-y-3 mt-2">
            {customTasks.map(t => (
              <SelectableRow
                key={t.id}
                active={selected === `custom:${t.id}`}
                left={<span>{t.emoji ?? '🧹'}</span>}
                title={t.title}
                subtitle={typeof t.points === 'number' ? `+${t.points} баллов` : undefined}
                onClick={() => setSelected(`custom:${t.id}`)}
              />
            ))}
          </div>
        </>
      )}

      {/* CTA */}
      <button
        onClick={() => {
          if (!selected) return
          if (selected.startsWith('custom:')) {
            const id = selected.split(':')[1]
            navigate(`/add/custom/${id}`)
          } else {
            navigate(`/add/${selected}`)
          }
        }}
        className={`mt-6 w-full rounded-2xl py-3 text-white font-bold
          ${selected ? 'bg-violet-600 hover:bg-violet-700' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        Подтвердить
      </button>

      <Link to="/" className="block mt-4 text-center text-violet-700">← Отмена</Link>
    </Layout>
  )
}