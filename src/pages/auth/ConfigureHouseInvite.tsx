import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function ConfigureHouseInvite() {
  const navigate = useNavigate()
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    setError(null)
    setLoading(true)
    // Debug: log invite code
    console.log('[DEBUG] Invite code entered:', inviteCode)
    // Debug: fetch all invites with this token
    const { data: allInvites, error: allError } = await supabase
      .from('invites')
      .select('*')
      .eq('token', inviteCode.trim())
    console.log('[DEBUG] All invites with token:', { allInvites, allError })
    // 1. Validate invite code
    const { data: invites, error: e1 } = await supabase
      .from('invites')
      .select('token, household_id, id')
      .eq('token', inviteCode.trim())
      .is('used_at', null)
      .gte('expires_at', new Date().toISOString())
      .limit(1)
    console.log('[DEBUG] Invite query result:', { invites, error: e1 })
    const invite = invites && invites.length > 0 ? invites[0] : null
    if (e1 || !invite) {
      setError('Неверный или истёкший код приглашения'); setLoading(false); return
    }
    // 2. Get current user
    const { data: u } = await supabase.auth.getUser()
    console.log('[DEBUG] User fetch result:', u)
    if (!u.user) { setError('Ошибка авторизации'); setLoading(false); return }
    // 3. Create profile for user in household
    const { error: e2 } = await supabase.from('profiles').insert({
      user_id: u.user.id,
      household_id: invite.household_id,
      display_name: u.user.user_metadata?.username || u.user.email,
      email: u.user.email
    })
    console.log('[DEBUG] Profile insert result:', { error: e2 })
    if (e2) { setError('Ошибка создания профиля: ' + e2.message); setLoading(false); return }
    // 4. Mark invite as used
    const { error: e3 } = await supabase.from('invites').update({ used_at: new Date().toISOString(), used_by: u.user.id }).eq('id', invite.id)
    console.log('[DEBUG] Invite update result:', { error: e3 })
    setLoading(false)
    // 5. Proceed to next onboarding step
    navigate('/auth/allow-push')
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
        <h1 className="text-3xl font-extrabold text-center text-black mb-8">Настройте дом</h1>
        <label className="w-full mb-8">
          <div className="text-sm text-slate-600 mb-1">Введите код приглашения</div>
          <input
            type="text"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#6C2CF2]/30 shadow-sm"
          />
        </label>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <button
          onClick={handleContinue}
          className="w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition"
          disabled={loading}
        >
          {loading ? 'Загрузка...' : 'Продолжить'}
        </button>
      </div>
    </div>
  )
}
