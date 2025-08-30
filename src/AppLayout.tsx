import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'

type Stage = 'checking' | 'needAuth' | 'needOnboarding' | 'ready'
export type AppOutletCtx = { householdId: string }

export default function AppLayout() {
  const [stage, setStage] = useState<Stage>('checking')
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  async function chooseHousehold(uid: string) {
    const { data: myProfiles, error: e1 } = await supabase
      .from('profiles')
      .select('household_id, user_id, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (e1 || !myProfiles || myProfiles.length === 0) {
      setHouseholdId(null)
      setStage('needOnboarding')
      return
    }

    const myHids = Array.from(new Set(myProfiles.map(p => p.household_id)))
    const { data: allByHids } = await supabase
      .from('profiles')
      .select('household_id, user_id, created_at')
      .in('household_id', myHids)

    const score = new Map<string, { users: number; myLatest: number }>()
    for (const hid of myHids) {
      const inH = (allByHids ?? []).filter(p => p.household_id === hid)
      const users = new Set(inH.map(p => p.user_id)).size
      const myLatest = Math.max(
        ...myProfiles.filter(p => p.household_id === hid).map(p => new Date(p.created_at as string).getTime())
      )
      score.set(hid, { users, myLatest })
    }
    const withPartner = myHids
      .filter(h => (score.get(h)?.users ?? 0) >= 2)
      .sort((a, b) => (score.get(b)!.myLatest - score.get(a)!.myLatest))

    setHouseholdId((withPartner[0] ?? myProfiles[0].household_id) as string)
    setStage('ready')
  }

  async function evaluateSession() {
    const { data } = await supabase.auth.getUser()
    const uid = data.user?.id
    if (!uid) {
      setHouseholdId(null)
      setStage('needAuth')
      return
    }
    await chooseHousehold(uid)
  }

  useEffect(() => {
    evaluateSession()
    const { data: sub } = supabase.auth.onAuthStateChange(() => { evaluateSession() })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  // Управляем маршрутами для auth/onboarding
  useEffect(() => {
    if (stage === 'needAuth') {
      if (!location.pathname.startsWith('/auth')) {
        navigate('/auth/welcome', { replace: true })
      }
    } else if (stage === 'needOnboarding') {
      if (location.pathname !== '/auth/family') {
        navigate('/auth/family', { replace: true })
      }
    } else if (stage === 'ready') {
      if (location.pathname.startsWith('/auth')) {
        navigate('/', { replace: true })
      }
    }
  }, [stage, location.pathname, navigate])

  if (stage === 'checking') return null

  // В этих стадиях отдаём роутеру рисовать нужные страницы (/auth/… или /)
  if (stage === 'needAuth' || stage === 'needOnboarding') {
    return <Outlet />
  }

  // ready
  return <Outlet context={{ householdId: householdId! } satisfies AppOutletCtx} />
}