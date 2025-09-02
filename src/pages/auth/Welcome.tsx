import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm px-6 pb-8 pt-16 rounded-b-3xl shadow-none flex flex-col items-center">
        <h1 className="text-3xl font-extrabold text-center text-black mb-6">
          Добро пожаловать!
        </h1>
        <p className="text-center text-slate-500 mb-10 text-base">
          Превращайте быт в игру вместе с нашим приложением. Вы точно не пожалеете.
        </p>
        <div className="w-full space-y-4">
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-3 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition"
          >
            Войти
          </button>
          <button
            onClick={() => navigate('/auth/register')}
            className="w-full rounded-2xl border-2 border-[#6C2CF2] text-[#6C2CF2] bg-white px-4 py-3 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition"
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  )
}