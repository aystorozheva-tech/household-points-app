import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { db } from '../db'
import type { Room } from '../types'

export default function ConfigRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [newRoom, setNewRoom] = useState('')
  const [editRoom, setEditRoom] = useState<Room|null>(null)

  useEffect(()=>{
    load()
  },[])

  async function load() {
    setRooms(await db.rooms.toArray())
  }

  async function addRoom() {
    if (!newRoom.trim()) return
    await db.rooms.add({id: crypto.randomUUID(), title: newRoom.trim()})
    setNewRoom('')
    load()
  }

  async function renameRoom(room: Room, newTitle: string) {
    await db.rooms.update(room.id, { title: newTitle })
    setEditRoom(null)
    load()
  }

  async function deleteRoom(id: string) {
    await db.rooms.delete(id)
    load()
  }

  return (
    <Layout>
      <h2 className="text-lg font-bold mb-4">Квартира</h2>

      <div className="space-y-2 mb-4">
        {rooms.map(r => (
          <div key={r.id}>
            {editRoom?.id === r.id ? (
              <div className="flex gap-2">
                <input
                  value={editRoom.title}
                  onChange={e=>setEditRoom({...editRoom, title: e.target.value})}
                  className="flex-1 border rounded-xl px-3 py-2"
                />
                <button
                  onClick={()=>renameRoom(r, editRoom.title)}
                  className="px-3 py-2 rounded-xl bg-cyan-500 text-white">OK</button>
                <button
                  onClick={()=>setEditRoom(null)}
                  className="px-3 py-2 rounded-xl bg-slate-200">Отмена</button>
              </div>
            ) : (
              <button
                onClick={()=>setEditRoom(r)}
                className="block w-full rounded-2xl p-3 border bg-white text-left shadow-sm">
                {r.title}
              </button>
            )}
            {editRoom?.id !== r.id && (
              <div className="flex justify-end gap-2 text-sm text-slate-500 mt-1">
                <button onClick={()=>setEditRoom(r)} className="text-cyan-600">Переименовать</button>
                <button onClick={()=>deleteRoom(r.id)} className="text-rose-600">Удалить</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={newRoom}
          onChange={e=>setNewRoom(e.target.value)}
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder="Название комнаты"
        />
        <button
          onClick={addRoom}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-white font-bold">
          ＋
        </button>
      </div>
    </Layout>
  )
}