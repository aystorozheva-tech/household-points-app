import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Load remembered credentials
    const saved = localStorage.getItem('login-remember')
    if (saved) {
      try {
        const { email, password } = JSON.parse(saved)
        setEmail(email || '')
        setPassword(password || '')
        setRemember(true)
      } catch {}
    }
  }, [])

  async function onLogin() {
    setLoading(true); setErr(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setErr('Неверный e-mail или пароль'); return }
    if (remember) {
      localStorage.setItem('login-remember', JSON.stringify({ email, password }))
    } else {
      localStorage.removeItem('login-remember')
    }
    navigate('/', { replace: true }) // AppLayout сам подхватит сессию
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
        <h1 className="text-3xl font-extrabold text-center text-black mb-8">Войти</h1>
        <form className="w-full space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@email.com"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
              {/* Mail icon */}
              <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="10" rx="2" stroke="#A3A3A3" strokeWidth="2"/><path d="M3 7l9 6 9-6" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="#A3A3A3" strokeWidth="2"/></svg>
              ) : (
                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.97 10.97 0 0 1 12 19c-7 0-11-7-11-7a21.7 21.7 0 0 1 5.06-6.06M9.53 4.06A10.97 10.97 0 0 1 12 5c7 0 11 7 11 7a21.7 21.7 0 0 1-5.06 6.06M1 1l22 22" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm text-[#6C2CF2] font-bold">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-[#6C2CF2]" />
              Запомнить меня
            </label>
            <button
              type="button"
              className="text-sm text-[#6C2CF2] font-bold hover:underline"
              onClick={() => navigate('/auth/password-recovery')}
            >
              Восстановить пароль
            </button>
          </div>
          {err && <div className="text-rose-600 text-sm mb-2">{err}</div>}
          <button
            type="button"
            onClick={onLogin}
            disabled={loading}
            className="w-full rounded-2xl shadow-md bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold hover:shadow-lg active:scale-[0.99] transition disabled:opacity-50"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  )
}