import { useEffect, useState } from 'react'
import { db } from '../db'
import { useStore } from '../store'

export default function RewardToast() {
  const [reward, setReward] = useState<any|null>(null)
  const currentUserId = useStore(s=>s.ownerId)

  useEffect(()=>{
    async function check() {
      const last = await db.entries.orderBy('ts').reverse().first()
      if (last?.reward && last.personId === currentUserId) {
        setReward(last)
      }
    }
    check()
  }, [currentUserId])

  if (!reward) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm text-center space-y-3 shadow-lg">
        <h2 className="text-lg font-bold">Ура! Вы получили награду</h2>
        <div className="text-4xl">
          {reward.taskId.startsWith('reward-') ? reward.taskId.split('-')[1] : '🎁'}
        </div>
        <div className="text-lg">{reward.points} баллов</div>
        <div className="text-cyan-600 font-bold">+{reward.points}</div>
        <button onClick={()=>setReward(null)}
          className="mt-4 rounded-xl bg-cyan-500 text-white px-4 py-2 font-bold">
          Закрыть
        </button>
      </div>
    </div>
  )
}
