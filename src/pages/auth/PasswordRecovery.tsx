import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function PasswordRecovery() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onRecover() {
    setLoading(true)
    setMessage(null)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (error) setError('Ошибка. Проверьте e-mail.')
    else setMessage('Письмо отправлено!')
  }

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
        <h1 className="text-3xl font-extrabold text-center text-black mb-3">Сброс пароля</h1>
        <p className="text-center text-slate-500 mb-8 text-base">Введите e-mail, указанный при регистрации</p>
        <div className="w-full mb-8">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@email.com"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
              <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8V6a4 4 0 0 1 8 0v2" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="8" width="12" height="10" rx="2" stroke="#A3A3A3" strokeWidth="2"/></svg>
            </span>
          </div>
        </div>
        {error && <div className="text-rose-600 text-sm mb-2">{error}</div>}
        {message && <div className="text-green-600 text-sm mb-2">{message}</div>}
        <button
          onClick={onRecover}
          disabled={loading || !email}
          className="w-full rounded-2xl bg-[#6C2CF2] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition disabled:opacity-50"
        >
          Сбросить пароль
        </button>
      </div>
    </div>
  )
}
