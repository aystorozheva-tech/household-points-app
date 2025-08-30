import type { Entry } from './types'

export function calcPoints(e: Entry, base: number, kind: 'simple'|'rooms'|'plumbing') {
  if (kind === 'simple')   return base
  if (kind === 'rooms')    return (e.rooms?.length ?? e.amount) * base * e.multiplier
  if (kind === 'plumbing') {
    const s = e.plumbing?.sinks ?? 0
    const t = e.plumbing?.toilets ?? 0
    const b = e.plumbing?.baths ?? 0
    return s*2 + t*5 + b*4
  }
  return 0
}

export const limits = { plumbing: { sinks: 3, toilets: 2, baths: 1 } }
