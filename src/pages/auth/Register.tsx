import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  async function onRegister() {
    setErr(null); setInfo(null)
    if (!email || !password) { setErr('Заполни e-mail и пароль'); return }
    if (password !== password2) { setErr('Пароли не совпадают'); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) { setErr(error.message); return }

    // Пытаемся сразу войти (если авто-конфирм выключен — не войдём, покажем подсказку)
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
    if (signInErr) {
      setInfo('Регистрация прошла. Проверь почту для подтверждения, затем войди.')
      return
    }

    navigate('/auth/family', { replace: true })
  }

  return (
    <Screen title="Регистрация">
      <div className="bg-white rounded-3xl shadow-md p-5 space-y-3">
        <Input label="E-mail" type="email" value={email} onChange={setEmail} />
        <Input label="Пароль" type="password" value={password} onChange={setPassword} />
        <Input label="Подтверждение пароля" type="password" value={password2} onChange={setPassword2} />
        {err && <div className="text-rose-600 text-sm">{err}</div>}
        {info && <div className="text-emerald-700 text-sm">{info}</div>}
        <button
          onClick={onRegister}
          disabled={loading}
          className="w-full rounded-2xl shadow-md bg-[#6C2CF2] text-white px-4 py-3 font-bold hover:shadow-lg active:scale-[0.99] transition disabled:opacity-50"
        >
          Зарегистрироваться
        </button>
      </div>
    </Screen>
  )
}

/* Reuse helpers from Login */
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