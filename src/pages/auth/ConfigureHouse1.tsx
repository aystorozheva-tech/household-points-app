import { useNavigate } from 'react-router-dom'

export default function ConfigureHouse1() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
      <button
        onClick={() => navigate('/auth/welcome')}
        className="absolute left-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md"
        aria-label="Назад"
      >
        <span className="text-2xl">←</span>
      </button>
      <div className="w-full max-w-sm flex flex-col items-center mt-20">
        <h1 className="text-3xl font-extrabold text-center text-black mb-8">Настройте дом</h1>
        <button
          onClick={() => navigate('/auth/configure-house-invite')}
          className="w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition mb-4"
        >
          У меня есть приглашение
        </button>
        <button
          onClick={() => {}}
          className="w-full rounded-2xl border-2 border-[#6C2CF2] text-[#6C2CF2] bg-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition"
        >
          Настроить новый дом
        </button>
      </div>
    </div>
  )
}
