import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function AuthPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else onLogin()
  }

  return (
    <div style={{ maxWidth: 360, margin: "40px auto", display: "grid", gap: 8 }}>
      <h2>Вход</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Войти</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  )
}