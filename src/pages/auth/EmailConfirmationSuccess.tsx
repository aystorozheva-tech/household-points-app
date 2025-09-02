import { useNavigate } from 'react-router-dom'

export default function EmailConfirmationSuccess() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
      <div className="w-full max-w-sm flex flex-col items-center mt-32">
        <h1 className="text-3xl font-extrabold text-center text-black mb-3">Ваш e-mail подтвержден!</h1>
        <p className="text-center text-slate-500 mb-8 text-base">Осталось буквально пару шагов.</p>
        <button
          onClick={() => navigate('/auth/home-settings-start')}
          className="w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition mt-24"
        >
          Далее
        </button>
      </div>
    </div>
  )
}
