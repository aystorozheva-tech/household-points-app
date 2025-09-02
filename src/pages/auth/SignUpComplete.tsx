import { useNavigate } from 'react-router-dom'

export default function SignUpComplete() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md"
        aria-label="Назад"
      >
        <span className="text-2xl">←</span>
      </button>
      <div className="w-full max-w-sm flex flex-col items-center mt-20">
        <h1 className="text-3xl font-extrabold text-center text-black mb-3">Готово!</h1>
        <p className="text-center text-slate-600 mb-8 text-base">Вы успешно создали новый аккаунт!</p>
        <button
          onClick={() => navigate('/')}
          className="w-full rounded-2xl bg-[#6C2CF2] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition"
        >
          Ура! Вперед к приложению!
        </button>
      </div>
    </div>
  )
}
