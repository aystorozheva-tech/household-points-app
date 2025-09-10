import { useNavigate } from 'react-router-dom'
import { registerForPush } from '../../lib/push'
import { supabase } from '../../lib/supabase'

export default function AllowPush() {
  const navigate = useNavigate()
  async function handleEnablePush() {
    try {
      const { data: u } = await supabase.auth.getUser()
      const uid = u.user?.id
      let pid = ''
      if (uid) {
        const { data: profs } = await supabase.from('profiles').select('id, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(1)
        pid = (profs && profs[0]?.id) || ''
      }
      await registerForPush(pid)
    } catch (e) {
      console.error('Push registration failed', e)
    }
    navigate('/auth/sign-up-complete')
  }

  function handleLater() {
    navigate('/auth/sign-up-complete')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#F8F9FF] to-[#EDF2FF] px-6">
      <div className="w-full max-w-sm flex flex-col items-center mt-20">
        <h1 className="text-3xl font-extrabold text-center text-black mb-3">Включите уведомления</h1>
        <p className="text-center text-slate-500 mb-8 text-base">Чтобы всегда быть в курсе, что происходит в вашем доме.</p>
        <button
          onClick={handleEnablePush}
          className="w-full rounded-2xl bg-[#6C2CF2] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition mb-4"
        >
          Включить сейчас
        </button>
        <button
          onClick={handleLater}
          className="w-full rounded-2xl bg-gradient-to-r from-[#E700FD] to-[#7900FD] text-white px-4 py-4 font-bold shadow-md hover:shadow-lg active:scale-[0.99] transition"
        >
          Включу позже
        </button>
      </div>
    </div>
  )
}
