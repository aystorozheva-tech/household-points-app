import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#F8F9FF_0%,#EDF2FF_100%)]" />
      {/* Картинка-фон — замени путь при желании */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-[url('/illustrations/family.webp')] bg-cover bg-center opacity-90" />
      <div className="relative z-10 pt-24 px-6 flex flex-col min-h-screen">
        <h1 className="text-4xl font-extrabold text-center text-[#6C2CF2] drop-shadow mb-6">
          Добро пожаловать
        </h1>
        <p className="text-center text-slate-600 mb-8">Войдите или создайте аккаунт</p>

        <div className="mt-auto mb-12 space-y-3">
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full rounded-2xl shadow-md bg-[#6C2CF2] text-white px-4 py-4 font-bold hover:shadow-lg active:scale-[0.99] transition"
          >
            Войти
          </button>
          <button
            onClick={() => navigate('/auth/register')}
            className="w-full rounded-2xl shadow-md bg-white text-[#6C2CF2] px-4 py-4 font-bold hover:shadow-lg active:scale-[0.99] transition"
          >
            Регистрация
          </button>
        </div>
      </div>
    </div>
  )
}