import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'

export default function InviteScreen() {
  const navigate = useNavigate()
  const { householdId } = useOutletContext<AppOutletCtx>()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch current profile id
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return
      const { data: profs } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', u.user.id)
        .eq('household_id', householdId)
        .limit(1)
      if (!mounted) return
      setProfileId(profs && profs.length > 0 ? profs[0].id : null)
    })()
    return () => { mounted = false }
  }, [householdId])

  // Fetch active invite
  useEffect(() => {
    if (!profileId) return
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      const { data: invites, error: e1 } = await supabase
        .from('invites')
        .select('token, expires_at, used_at')
        .eq('household_id', householdId)
        .eq('issuer_profile_id', profileId)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
      if (!mounted) return
      if (e1) { setError(e1.message); setLoading(false); return }
      setInvite(invites && invites.length > 0 ? invites[0] : null)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [profileId, householdId])

  async function handleGenerateInvite() {
    if (!profileId) return
    setLoading(true)
    setError(null)
    // Insert new invite
    const { data, error } = await supabase
      .from('invites')
      .insert({ household_id: householdId, issuer_profile_id: profileId })
      .select('token, expires_at, used_at')
      .single()
    if (error) { setError(error.message); setLoading(false); return }
    setInvite(data)
    setLoading(false)
  }

  return (
    <Layout>
      <div>
        <div className="flex items-center px-4 mt-8 mb-6">
          <button onClick={() => navigate(-1)} className="mr-2 text-xl">←</button>
          <h1 className="text-center text-2xl font-bold flex-1">Приглашение</h1>
        </div>
        <div className="px-4 space-y-4">
          {/* Invite Card */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center mb-4">
            <div className="text-gray-500 mb-2">Код приглашения</div>
            <div className="text-l font-bold tracking-widest text-violet-700">{invite?.token || '—'}</div>
            {invite?.expires_at && (
              <div className="text-xs text-gray-400 mt-2">Действует до: {new Date(invite.expires_at).toLocaleString()}</div>
            )}
          </div>
          {/* Generate Invite Button */}
          <button
            className="w-full rounded-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-[#E700FD] to-[#7900FD] hover:opacity-90 active:scale-[0.99]"
            onClick={handleGenerateInvite}
            disabled={!!invite || loading}
          >
            Сгенерировать инвайт
          </button>
          {error && <div className="text-center text-red-500 mt-2 text-sm">{error}</div>}
        </div>
      </div>
    </Layout>
  )
}
