import type { DefaultTaskConfig } from './types'

export const defaultTasks: Record<string, DefaultTaskConfig> = {
  vacuum: { kind:'vacuum', emoji: "🧹" , hasRobot:true, base:1, roomMultiplier:1, manualMultiplier:1, robotMultiplier:1 },
  floor: { kind:'floor', emoji: "🧼", hasRobot:false, base:2, roomMultiplier:1, manualMultiplier:1, robotMultiplier:1 },
  dishes: { kind:'dishes', emoji: "🍽️" , hasDishwasher:true, base:1, manualMultiplier:1 },
  dust: { kind:'dust', base:2, emoji: "🪣" , roomMultiplier:1 },
  laundry: { kind:'laundry', emoji: "👕", base:2 },
  plumbing: { kind:'plumbing', emoji: "🚽",  toilet:5, sink:3, bath:8 }
}

