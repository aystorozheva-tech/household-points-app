import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function FamilySetup({ onDone }: { onDone?: () => void }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'none' | 'invite' | 'create'>('none')
  const [invite, setInvite] = useState('')
  const [joinName, setJoinName] = useState('')
  const [homeName, setHomeName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function acceptInvite() {
    setErr(null)
    if (!invite.trim()) { setErr('Введи инвайт'); return }
    setLoading(true)
    const { error } = await supabase.rpc('accept_invite', {
      p_token: invite.trim(),
      p_display_name: (joinName || 'Я').trim()
    })
    setLoading(false)
    if (error) { setErr(error.message); return }
    onDone ? onDone() : navigate('/', { replace: true })
  }

  async function createHousehold() {
    setErr(null)
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) { setErr('Не выполнен вход'); return }
    const hid = crypto.randomUUID()
    const pid = crypto.randomUUID()

    setLoading(true)
    const { error: e1 } = await supabase.from('households').insert({ id: hid, name: homeName || 'Мой дом' })
    if (e1) { setLoading(false); setErr(e1.message); return }
    const { error: e2 } = await supabase.from('profiles').insert({
      id: pid, user_id: u.user.id, household_id: hid, display_name: displayName || 'Я'
    })
    setLoading(false)
    if (e2) { setErr(e2.message); return }

    onDone ? onDone() : navigate('/', { replace: true })
  }

  return (
    <Screen title="Настройка семьи">
      {/* Выбор режима */}
      <div className="space-y-3">
        <button
          onClick={() => setMode('invite')}
          className="w-full rounded-2xl shadow-md bg-white text-[#6C2CF2] px-4 py-4 font-bold hover:shadow-lg active:scale-[0.99] transition"
        >
          У меня есть инвайт
        </button>
        <button
          onClick={() => setMode('create')}
          className="w-full rounded-2xl shadow-md bg-[#6C2CF2] text-white px-4 py-4 font-bold hover:shadow-lg active:scale-[0.99] transition"
        >
          У меня нет инвайта
        </button>
      </div>

      {/* Формы */}
      {mode === 'invite' && (
        <div className="mt-4 bg-white rounded-3xl shadow-md p-5 space-y-3">
          <Input label="Код инвайта" value={invite} onChange={setInvite} />
          <Input label="Моё имя в семье" value={joinName} onChange={setJoinName} />
          {err && <div className="text-rose-600 text-sm">{err}</div>}
          <button
            onClick={acceptInvite}
            disabled={loading}
            className="w-full rounded-2xl shadow-md bg-[#6C2CF2] text-white px-4 py-3 font-bold hover:shadow-lg active:scale-[0.99] transition disabled:opacity-50"
          >
            Присоединиться
          </button>
        </div>
      )}

      {mode === 'create' && (
        <div className="mt-4 bg-white rounded-3xl shadow-md p-5 space-y-3">
          <Input label="Название семьи" value={homeName} onChange={setHomeName} />
          <Input label="Моё имя в семье" value={displayName} onChange={setDisplayName} />
          {err && <div className="text-rose-600 text-sm">{err}</div>}
          <button
            onClick={createHousehold}
            disabled={loading}
            className="w-full rounded-2xl shadow-md bg-[#6C2CF2] text-white px-4 py-3 font-bold hover:shadow-lg active:scale-[0.99] transition disabled:opacity-50"
          >
            Зарегистрировать семью
          </button>
        </div>
      )}
    </Screen>
  )
}

/* UI helpers */
function Screen({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#F8F9FF_0%,#EDF2FF_100%)]" />
      <div className="relative z-10 px-6 pt-16 pb-10">
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