import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { db } from '../db'
import { useNavigate, useOutletContext } from 'react-router-dom'
import type { Reward } from '../types'
import CheckIcon from '../icons/CheckIcon'
import HeartIcon from '../icons/HeartIcon'
import WarningIcon from '../icons/WarningIcon'
import CrownIcon from '../icons/CrownIcon'
import { supabase } from '../lib/supabase'
import type { AppOutletCtx } from '../AppLayout'


type Entry = {
  id: string
  household_id: string
  profile_id: string
  kind: 'task' | 'reward' | 'penalty'
  title: string
  points: number
  created_at: string
}

type Profile = {
  id: string
  user_id: string
  household_id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}


export default function Home() {
  const ctx = useOutletContext<AppOutletCtx | undefined>()
  if (!ctx) return null  // контекста нет — ничего не рендерим
  const { householdId } = ctx
  
  const navigate = useNavigate()
  const [me, setMe] = useState<Profile | null>(null)
  const [partner, setPartner] = useState<Profile | null>(null)
  // «nastya» = текущий, «max» = партнёр (для совместимости с остальным кодом)
  const [totals, setTotals] = useState<{ nastya: number; max: number }>({ nastya: 0, max: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function load() {
      setError(null)
      setLoading(true)

      // 1) текущий пользователь
      const { data: u } = await supabase.auth.getUser()
      const uid = u.user?.id
      if (!uid) { setError('Не выполнен вход'); setLoading(false); return }

      // 2) все профили этого household
      const { data: profs, error: e1 } = await supabase
        .from('profiles')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true })

      if (e1) { setError(e1.message); setLoading(false); return }
      const profiles = (profs ?? []) as Profile[]

      // мой профиль — по user_id
      const meProfile = profiles.find(p => p.user_id === uid) ?? null

      // кандидаты на «партнёра» — все профили, чьи id НЕ равны моему id
      const candidates = profiles.filter(p => !meProfile || p.id !== meProfile.id)

      // сортируем по новизне (DESC)
      const byNewestDesc = [...candidates].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      // выбираем с непустым именем, иначе — просто самый свежий
      const partnerProfile =
        byNewestDesc.find(p => (p.display_name ?? '').trim().length > 0) ??
        byNewestDesc[0] ??
        null

      if (!mounted) return
      setMe(meProfile)
      setPartner(partnerProfile)

      // 3) загрузим все записи и посчитаем суммы
      const { data: ents, error: e2 } = await supabase
        .from('entries')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true })

      if (e2) { setError(e2.message); setLoading(false); return }
      if (!mounted) return
      const entries = (ents ?? []) as Entry[]
      setTotals(calcTotals(meProfile, partnerProfile, entries))
      setLoading(false)

      // 4) realtime
      channel = supabase
        .channel(`entries:${householdId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'entries', filter: `household_id=eq.${householdId}` },
          (payload: any) => {
            setTotals(prev => applyRealtimeDelta(prev, meProfile, partnerProfile, payload))
          }
        )
        .subscribe()
    }

    load()
    return () => {
      mounted = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [householdId])

  // Пересчитываем, если сменились профили (например, смена аккаунта)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!me) return
      const { data: ents, error } = await supabase
        .from('entries')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true })
      if (error) { setError(error.message); return }
      if (cancelled) return
      setTotals(calcTotals(me, partner, (ents ?? []) as Entry[]))
    })()
    return () => { cancelled = true }
  }, [me?.id, partner?.id, householdId])

  // === расчёт сумм ===
  function calcTotals(meP: Profile | null, partnerP: Profile | null, entries: Entry[]) {
    let meSum = 0
    let partnerSum = 0
    for (const e of entries) {
      if (meP && e.profile_id === meP.id) meSum += e.points
      else if (partnerP && e.profile_id === partnerP.id) partnerSum += e.points
    }
    return { nastya: meSum, max: partnerSum }
  }

  function applyRealtimeDelta(
    prev: { nastya: number; max: number },
    meP: Profile | null,
    partnerP: Profile | null,
    payload: any
  ) {
    const type = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
    const eNew = payload.new as Entry | undefined
    const eOld = payload.old as Entry | undefined

    const bucketOf = (e?: Entry) => {
      if (!e) return null
      if (meP && e.profile_id === meP.id) return 'me'
      if (partnerP && e.profile_id === partnerP.id) return 'partner'
      return null
    }

    let meSum = prev.nastya
    let partnerSum = prev.max

    if (type === 'INSERT' && eNew) {
      const b = bucketOf(eNew)
      if (b === 'me') meSum += eNew.points
      if (b === 'partner') partnerSum += eNew.points
    } else if (type === 'DELETE' && eOld) {
      const b = bucketOf(eOld)
      if (b === 'me') meSum -= eOld.points
      if (b === 'partner') partnerSum -= eOld.points
    } else if (type === 'UPDATE' && eNew && eOld) {
      const bNew = bucketOf(eNew)
      const bOld = bucketOf(eOld)
      if (bNew === bOld) {
        const diff = eNew.points - eOld.points
        if (bNew === 'me') meSum += diff
        if (bNew === 'partner') partnerSum += diff
      } else {
        if (bOld === 'me') meSum -= eOld.points
        if (bOld === 'partner') partnerSum -= eOld.points
        if (bNew === 'me') meSum += eNew.points
        if (bNew === 'partner') partnerSum += eNew.points
      }
    }

    return { nastya: meSum, max: partnerSum }
  }

  const myName = (me?.display_name ?? '').trim() || '—'
  const partnerName = (partner?.display_name ?? '').trim() || '—'

  const myPoints = totals.nastya
  const otherPoints = totals.max

  const { target, progress } = useProgress('nastya', myPoints, otherPoints)

  const leaderId = useMemo<'nastya' | 'max' | null>(() => {
    if (totals.nastya === totals.max) return null
    return totals.nastya > totals.max ? 'nastya' : 'max'
  }, [totals])

  if (loading) {
    return <Layout><div className="p-4">Загрузка…</div></Layout>
  }
  if (error) {
    return <Layout><div className="p-4 text-red-600">Ошибка: {error}</div></Layout>
  }

  return (
    <Layout>
      {/* Текущий слева (крупнее), партнёр справа */}
      <div className="grid grid-cols-2 gap-3">
        <PlayerCard
          name={myName}
          points={myPoints}
          isCurrent={true}
          isLeader={leaderId === 'nastya'}
        />
        <PlayerCard
          name={partnerName}
          points={otherPoints}
          isCurrent={false}
          isLeader={leaderId === 'max'}
        />
      </div>

      {/* Прогресс */}
      <div className="pt-2">
        <div className="w-full h-4 rounded-full bg-white/60 shadow-inner">
          <div
            className="
              h-4 rounded-full transition-all
              bg-[linear-gradient(90deg,#C084FC_0%,#7C3AED_60%,#4F46E5_100%)]
            "
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>

        {target && (
          <>
            <div className="text-sm text-slate-700 text-center mt-2">
              {Math.max(0, myPoints - otherPoints)} / {target.points}
            </div>
            <div className="text-xs text-slate-500 text-center">
              Ближайшая цель: <span className="font-medium">
                {target.emoji} {target.title}
              </span> · {target.points} баллов
            </div>
          </>
        )}
      </div>

      {/* Действия */}
      <div className="space-y-3 pt-1">
        <ActionRow
          label="Сделать"
          icon={<CheckIcon className="w-6 h-6 text-emerald-600" />}
          onClick={() => navigate('/choose')}
        />
        <ActionRow
          label="Наградить"
          icon={<HeartIcon className="w-6 h-6 text-rose-500" />}
          onClick={() => navigate('/reward')}
        />
        <ActionRow
          label="Наказать"
          icon={<WarningIcon className="w-6 h-6 text-orange-500" />}
          onClick={() => navigate('/punish')}
        />
      </div>
    </Layout>
  )
}

/* ---------- UI ---------- */

function InitialsAvatar({ name, size = 80 }: { name: string; size?: number }) {
  const initials = (name || '🙂')
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase())
    .slice(0, 2)
    .join('')

  return (
    <div
      className="rounded-full grid place-items-center bg-slate-100 text-slate-700 font-semibold"
      style={{ width: size, height: size }}
    >
      {initials || '🙂'}
    </div>
  )
}

function PlayerCard({
  name,
  points,
  isCurrent,
  isLeader,
}: {
  name: string
  points: number
  isCurrent: boolean
  isLeader: boolean
}) {
  return (
    <div
      className={`
        bg-white rounded-3xl shadow-md p-4 flex flex-col items-center relative
        transition-transform ${isCurrent ? 'scale-[1.1]' : 'scale-[0.95]'}
      `}
    >
      <div className="relative">
        <InitialsAvatar name={name} size={isCurrent ? 80 : 64} />
        {isLeader && (
          <CrownIcon className="absolute -top-6 right-6 w-8 h-8 text-yellow-400 drop-shadow" />
        )}
      </div>
      <div className="mt-2 text-xl font-semibold">{name}</div>
      <div className="text-slate-600">{points} баллов</div>
    </div>
  )
}

function ActionRow({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full bg-white rounded-2xl shadow-md
        px-4 py-4
        flex items-center justify-between
        hover:shadow-lg active:scale-[0.99] transition
      "
    >
      <span className="flex items-center gap-3">
        {icon}
        <span className="text-base font-medium text-slate-900">{label}</span>
      </span>
      <ChevronRight className="w-5 h-5 text-slate-400" />
    </button>
  )
}

function ChevronRight({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ---------- Хук прогресса (как был) ---------- */
function useProgress(
  ownerId: 'nastya' | 'max', // «nastya» = текущий, «max» = партнёр
  myPoints: number,
  otherPoints: number
) {
  const [target, setTarget] = useState<Reward | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    async function calc() {
      const rewards = await db.rewards.toArray()
      if (rewards.length === 0) {
        setTarget(null); setProgress(0); return
      }
      rewards.sort((a, b) => a.points - b.points)
      const diff = myPoints - otherPoints

      if (diff <= 0) { setTarget(rewards[0]); setProgress(0); return }

      const found = rewards.find(r => r.points > diff)
      if (found) { setTarget(found); setProgress(diff / found.points) }
      else {
        const last = rewards[rewards.length - 1]
        setTarget(last); setProgress(Math.min(1, diff / last.points))
      }
    }
    calc()
  }, [myPoints, otherPoints, ownerId])

  return { target, progress }
}