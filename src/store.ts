import { create } from 'zustand'
import { db } from './db'
import type { Entry } from './types'

type State = {
  ownerId: 'nastya' | 'max'
  setOwner: (id: 'nastya'|'max') => void

  entries: Entry[]
  loadEntries: () => Promise<void>
  addEntry: (e: Omit<Entry,'id'|'ts'>) => Promise<void>

  monthlyTotals: (ym:{year:number;month:number}) => Promise<{nastya:number;max:number}>
  addMonthlyArchive: () => Promise<void>
}

export const useStore = create<State>((set, get) => {
  const saved = localStorage.getItem('ownerId') as 'nastya'|'max'|null

  return {
    ownerId: saved || 'nastya',

    setOwner: (id) => {
      localStorage.setItem('ownerId', id)
      set({ ownerId: id })
    },

    entries: [],

    loadEntries: async () => {
      const all = await db.entries.toArray()
      set({ entries: all })
    },

    addEntry: async (e) => {
      // ⚡ Теперь points передаются напрямую из формы
      const entry: Entry = {
        ...e,
        id: crypto.randomUUID(),
        ts: Date.now(),
      }
      await db.entries.add(entry)
      set({ entries: [...get().entries, entry] })
    },

    monthlyTotals: async ({year,month}) => {
      const start = new Date(year, month, 1).getTime()
      const end   = new Date(year, month+1, 1).getTime()
      const all = await db.entries.where('ts').between(start, end).toArray()
      return {
        nastya: all.filter(e=>e.personId==='nastya').reduce((s,e)=>s+e.points,0),
        max:    all.filter(e=>e.personId==='max').reduce((s,e)=>s+e.points,0),
      }
    },

    addMonthlyArchive: async () => {
      const now = new Date()
      const prevMonth = now.getMonth()-1
      const year = prevMonth >= 0 ? now.getFullYear() : now.getFullYear()-1
      const month = prevMonth >= 0 ? prevMonth : 11

      const exists = await db.archives.where({year, month}).first()
      if (exists) return

      const start = new Date(year, month, 1).getTime()
      const end   = new Date(year, month+1, 1).getTime()
      const all = await db.entries.where('ts').between(start, end).toArray()
      const nastya = all.filter(e=>e.personId==='nastya').reduce((s,e)=>s+e.points,0)
      const max = all.filter(e=>e.personId==='max').reduce((s,e)=>s+e.points,0)
      const diff = nastya - max

      await db.archives.add({
        id: crypto.randomUUID(),
        year, month, nastya, max, diff,
        ts: Date.now()
      })
    }
  }
})