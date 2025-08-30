import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { db } from '../db'

export default function EditTask() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState<number>(1)
  const [emoji, setEmoji] = useState('📝')

  useEffect(() => {
    if (!id) return
    db.customTasks.get(id).then(t => {
      if (t) {
        setTitle(t.title)
        setPoints(t.points)
        setEmoji(t.emoji ?? '📝')
      }
    })
  }, [id])

  async function save() {
    if (!id) return
    await db.customTasks.update(id, { title, points, emoji })
    navigate('/config/tasks')
  }

  async function remove() {
    if (!id) return
    await db.customTasks.delete(id)
    navigate('/config/tasks')
  }

  return (
    <Layout>
      <h2 className="text-lg font-bold mb-4">Редактировать дело</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Название дела</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
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

        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={!title.trim() || points <= 0}
            className="flex-1 rounded-2xl py-3 font-bold bg-cyan-500 text-white"
          >
            Сохранить
          </button>
          <button
            onClick={remove}
            className="flex-1 rounded-2xl py-3 font-bold bg-rose-500 text-white"
          >
            Удалить
          </button>
        </div>
      </div>
    </Layout>
  )
}