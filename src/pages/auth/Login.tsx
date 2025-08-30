import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onLogin() {
    setLoading(true); setErr(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setErr('Неверный e-mail или пароль'); return }
    navigate('/', { replace: true }) // AppLayout сам подхватит сессию
  }

  return (
    <Screen title="Вход">
      <div className="bg-white rounded-3xl shadow-md p-5 space-y-3">
        <Input label="E-mail" type="email" value={email} onChange={setEmail} />
        <Input label="Пароль" type="password" value={password} onChange={setPassword} />
        {err && <div className="text-rose-600 text-sm">{err}</div>}
        <button
          onClick={onLogin}
          disabled={loading}
          className="w-full rounded-2xl shadow-md bg-[#6C2CF2] text-white px-4 py-3 font-bold hover:shadow-lg active:scale-[0.99] transition disabled:opacity-50"
        >
          Войти
        </button>
      </div>

      <button
        onClick={() => navigate('/auth/register')}
        className="w-full rounded-2xl shadow-md bg-white text-[#6C2CF2] px-4 py-3 font-bold hover:shadow-lg active:scale-[0.99] transition mt-3"
      >
        Регистрация
      </button>
    </Screen>
  )
}

/* UI helpers */
function Screen({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#F8F9FF_0%,#EDF2FF_100%)]" />
      <div className="relative z-10 px-6 pt-16">
        <h1 className="text-3xl font-extrabold text-center text-[#6C2CF2] mb-6">{title}</h1>
        {children}
      </div>
    </div>
  )
}

function Input({
  label, type = 'text', value, onChange,
}: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-600 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
      />
    </label>
  )
}