import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { db } from '../db'
import type { CustomTask } from '../types'
import { useNavigate, Link } from 'react-router-dom'

// дефолтные дела с эмодзи
const defaultTasks = [
  { id: 'vacuum', title: 'Пропылесосить', emoji: '🧹' },
  { id: 'floor', title: 'Помыть пол', emoji: '🧼' },
  { id: 'dishes', title: 'Помыть посуду', emoji: '🍽️' },
  { id: 'dust', title: 'Протереть пыль', emoji: '🪣' },
  { id: 'laundry', title: 'Постирать', emoji: '👕' },
  { id: 'plumbing', title: 'Помыть сантехнику', emoji: '🚽' },
]

export default function ConfigTasks() {
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setCustomTasks(await db.customTasks.toArray())
  }

  return (
    <Layout>
      <h2 className="text-lg font-bold mb-4">Дела</h2>

      <div className="space-y-3">
        {/* дефолтные дела */}
        {defaultTasks.map(task => (
          <Link
            key={task.id}
            to={`/config/task/${task.id}`}
            className="p-3 rounded-xl border bg-sky-50 shadow-sm flex items-center gap-3 hover:bg-sky-100"
          >
            <div className="text-3xl">{task.emoji}</div>
            <div>
              <div className="font-medium">{task.title}</div>
              <div className="text-sm text-slate-500">Баллы задаются в настройках</div>
            </div>
          </Link>
        ))}

        {/* кастомные дела */}
        {customTasks.map(ct => (
          <div
            key={ct.id}
            onClick={() => navigate(`/config/tasks/${ct.id}`)}
            className="p-3 rounded-xl border bg-white shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50"
          >
            <div className="text-3xl">{ct.emoji ?? '📝'}</div>
            <div>
              <div className="font-medium">{ct.title}</div>
              <div className="text-sm text-slate-500">{ct.points} баллов</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/config/tasks/add')}
        className="mt-4 w-full rounded-2xl py-3 bg-cyan-500 text-white font-bold"
      >
        ＋ Добавить дело
      </button>
    </Layout>
  )
}