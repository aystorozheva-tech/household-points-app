// src/types.ts
export type Person = { 
  id: string
  name: string
  avatar: string
  gender: 'm' | 'f'   // 👈 добавили
}

export type Room = {
  id: string
  title: string
}


export type TaskType = {
  id: string
  title: string
  base: number
  kind: 'simple' | 'rooms' | 'plumbing'
}

export type Entry = {
  id: string
  personId: string
  taskId: string
  amount: number
  multiplier: number
  rooms?: string[]
  plumbing?: { sinks: number; toilets: number; baths: number }
  points: number
  ts: number

  reward?: boolean
  rewardGiver?: string

  punish?: boolean          // 👈 новое поле
  punishGiver?: string      // 👈 кто наказал
}

export type Archive = {
  id: string
  year: number
  month: number // 0–11
  nastya: number
  max: number
  diff: number
  ts: number // когда зафиксирован
}

export type DefaultTaskConfig =
  | { kind: 'vacuum'; emoji: string; hasRobot: boolean; base: number; roomMultiplier: number; manualMultiplier: number; robotMultiplier: number }
  | { kind: 'floor'; emoji: string; hasRobot: boolean; base: number; roomMultiplier: number; manualMultiplier: number; robotMultiplier: number }
  | { kind: 'dishes';emoji: string; hasDishwasher: boolean; base: number; manualMultiplier: number }
  | { kind: 'dust'; emoji: string; base: number; roomMultiplier: number }
  | { kind: 'laundry'; emoji: string; base: number }
  | { kind: 'plumbing'; emoji: string; toilet: number; sink: number; bath: number }

export type CustomTask = {
  id: string
  title: string
  points: number
  emoji: string
}

export type Reward = {
  id: string
  title: string
  emoji: string
  points: number
}

export type Punishment = {
  id: string
  title: string
  emoji: string
  points: number
}