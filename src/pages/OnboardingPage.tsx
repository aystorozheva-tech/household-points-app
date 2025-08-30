import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function OnboardingPage({ onReady }: { onReady: (householdId: string) => void }) {
  const [homeName, setHomeName] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [inviteToken, setInviteToken] = useState("")
  const [joinName, setJoinName] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function createHousehold() {
    setError(null)
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) { setError("Нужен вход"); return }
    const hid = crypto.randomUUID()
    const { error: e1 } = await supabase.from("households").insert({ id: hid, name: homeName || "My Home" })
    if (e1) { setError(e1.message); return }
    const { error: e2 } = await supabase.from("profiles").insert({
      id: crypto.randomUUID(),
      user_id: u.user.id,
      household_id: hid,
      display_name: displayName || "Me"
    })
    if (e2) { setError(e2.message); return }
    onReady(hid)
  }

  async function acceptInvite() {
    setError(null)
    const token = inviteToken.trim()
    if (!token) { setError("Вставь код инвайта"); return }
    const { data, error } = await supabase.rpc("accept_invite", {
      p_token: token,
      p_display_name: joinName || "Me"
    })
    if (error) { setError(error.message); return }
    const row = Array.isArray(data) ? data[0] : data
    onReady(row.household_id)
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", display: "grid", gap: 16 }}>
      <h2>Добро пожаловать 👋</h2>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>У меня ещё нет домохозяйства</h3>
        <input placeholder="Название дома" value={homeName} onChange={e => setHomeName(e.target.value)} />
        <input placeholder="Моё имя в профиле" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        <button onClick={createHousehold}>Создать дом и профиль</button>
      </div>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>Меня пригласили</h3>
        <input placeholder="Код инвайта" value={inviteToken} onChange={e => setInviteToken(e.target.value)} />
        <input placeholder="Моё имя в профиле" value={joinName} onChange={e => setJoinName(e.target.value)} />
        <button onClick={acceptInvite}>Принять приглашение</button>
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  )
}