import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useStore } from '../store'
import { db } from '../db'
import { useEffect, useState } from 'react'
import { defaultTasks } from '../defaultTasks'
import { DefaultTaskForm } from '../components/DefaultTaskForm'

export default function AddTask() {
  const { kind, id } = useParams()
  const addEntry = useStore(s => s.addEntry)
  const ownerId = useStore(s => s.ownerId)
  const navigate = useNavigate()
  const [config, setConfig] = useState<any>(null)
  const [customTask, setCustomTask] = useState<any>(null)
  const [rooms, setRooms] = useState<any[]>([])

  useEffect(() => {
    if (kind) {
      // дефолтное дело
      const saved = localStorage.getItem(`task-${kind}`)
      setConfig(saved ? JSON.parse(saved) : defaultTasks[kind])
      if (kind === 'vacuum' || kind === 'floor' || kind === 'dust') {
        db.rooms.toArray().then(setRooms)
      }
    } else if (id) {
      // кастомное дело
      db.customTasks.get(id).then(setCustomTask)
    }
  }, [kind, id])

  if (kind && !config) return <Layout>Загрузка...</Layout>
  if (id && !customTask) return <Layout>Загрузка...</Layout>

  async function handleSubmit(taskId: string, points: number) {
    await addEntry({
      personId: ownerId,
      taskId,
      amount: 1,
      multiplier: 1,
      reward: false,
      punish: false,
      points, // ⚡ теперь points передаём из формы
    })
    navigate('/')
  }

  return (
    <Layout>
      {kind && (
        <DefaultTaskForm
          kind={kind}
          config={config}
          rooms={rooms}
          onSubmit={handleSubmit}
        />
      )}
      {id && customTask && (
        <CustomTaskForm task={customTask} onSubmit={handleSubmit} />
      )}
    </Layout>
  )
}

/* ---------- Кастомные дела ---------- */
function CustomTaskForm({
  task,
  onSubmit
}: {
  task: any
  onSubmit: (taskId: string, points: number) => void
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">{task.title}</h3>
      <button
        onClick={() => onSubmit(task.id, task.points)}
        className="w-full rounded-xl p-3 bg-sky-100"
      >
        {task.title} — {task.points} баллов
      </button>
    </div>
  )
}