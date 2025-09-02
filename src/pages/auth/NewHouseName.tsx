import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function NewHouseName() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function next() {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) { setSaving(false); setError('Нужно войти'); return }
    // Generate id on client to avoid returning select under RLS
    const newId = crypto.randomUUID()
    const { error: e1 } = await supabase
      .from('households')
      .insert({ id: newId, name: trimmed })
    if (e1) { setSaving(false); setError(e1.message); return }
    // Create membership profile referencing known household id
    const { error: e2 } = await supabase.from('profiles').insert({
      user_id: u.user.id,
      household_id: newId,
      display_name: u.user.user_metadata?.username || u.user.email,
      email: u.user.email,
    })
    setSaving(false)
    if (e2) { setError(e2.message); return }
    try { sessionStorage.setItem('onboard.householdId', newId) } catch {}
    navigate('/auth/new-house-rooms', { state: { householdId: newId } })
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
      <button
        onClick={() => navigate('/auth/configure-house-1')}
        className="absolute left-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md"
        aria-label="Назад"
      >
        <span className="text-2xl">←</span>
      </button>

      <div className="w-full max-w-sm mt-20">
        <h1 className="text-3xl font-extrabold text-center text-black mb-6">Название дома</h1>
        <label className="block mb-6">
          <div className="text-sm text-slate-600 mb-1">Введите название</div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm bg-white"
            placeholder="Например: Наш дом"
          />
        </label>
        {error && <div className="text-sm text-rose-600 mb-3">{error}</div>}
        <button
          onClick={next}
          disabled={!name.trim() || saving}
          className={`w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold shadow-md active:scale-[0.99] transition ${(!name.trim() || saving) ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}`}
        >
          {saving ? 'Создание…' : 'Продолжить'}
        </button>
      </div>
    </div>
  )
}
