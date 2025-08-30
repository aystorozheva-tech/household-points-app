import Layout from '../components/Layout'
import { useStore } from '../store'
import { Link, useNavigate } from 'react-router-dom'

export default function Profile() {
  const ownerId = useStore(s=>s.ownerId)
  const setOwner = useStore(s=>s.setOwner)
  const navigate = useNavigate()

  const select = (id:'nastya'|'max')=>{
    setOwner(id)
    localStorage.setItem('ownerId', id) // сохраняем выбор
    navigate('/settings')
  }

  return (
    <Layout>
      <div className="space-y-2">
        <button
          onClick={()=>select('nastya')}
          className={`w-full rounded-2xl p-4 border shadow-sm text-lg font-medium
                      ${ownerId==='nastya'?'bg-cyan-100 border-cyan-400':'bg-white'}`}>
          Настя
        </button>
        <button
          onClick={()=>select('max')}
          className={`w-full rounded-2xl p-4 border shadow-sm text-lg font-medium
                      ${ownerId==='max'?'bg-cyan-100 border-cyan-400':'bg-white'}`}>
          Макс
        </button>
      </div>

      <Link to="/settings" className="block mt-4 text-center text-cyan-600">← Назад</Link>
    </Layout>
  )
}
