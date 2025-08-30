import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Person, TaskType, Entry, Archive } from './types'
import type { Room } from './types'
import type { CustomTask } from './types'
import type { Reward } from './types'
import type { Punishment } from './types'

export class DB extends Dexie {
  people!: Table<Person, string>
  tasks!: Table<TaskType, string>
  entries!: Table<Entry, string>
  archives!: Table<Archive, string>
  rewards!: Table<Reward, string>
  punishments!: Table<Punishment, string>
  rooms!: Table<Room, string>   // 👈 добавляем
  customTasks!: Table<CustomTask, string>

  constructor() {
    super('household_db')
    this.version(5).stores({
      people: 'id',
      tasks: 'id',
      entries: 'id, ts, personId, taskId',
      archives: 'id, year, month',
      rewards: 'id',
      punishments: 'id',
      rooms: 'id',  
      customTasks: 'id',
    })
  }

}

export const db = new DB()

// сидинг
export async function seed() {
  const peopleCount = await db.people.count()
  if (peopleCount === 0) {
    await db.people.bulkAdd([
      { id: 'nastya', name: 'Настя', avatar: '/avatars/nastya.png', gender: 'f' },
      { id: 'max',    name: 'Макс',  avatar: '/avatars/max.png',    gender: 'm' },
    ])
  }

  const tasksCount = await db.tasks.count()
  if (tasksCount === 0) {
    await db.tasks.bulkAdd([
      { id: 'vacuum', title: 'Пылесосинг', base: 5, kind: 'rooms' },
      { id: 'floor',  title: 'Мытьё пола', base: 6, kind: 'rooms' },
      { id: 'dishes', title: 'Посудa',     base: 1, kind: 'simple' },
      { id: 'dust',   title: 'Вытирка пыли', base: 2, kind: 'simple' },
      { id: 'plumb',  title: 'Санузел', base: 8, kind: 'plumbing' },
      { id: 'wash',   title: 'Стирка', base: 2, kind: 'simple' },
      { id: 'iron',   title: 'Глажка', base: 3, kind: 'simple' },
      { id: 'linen',  title: 'Смена белья', base: 2, kind: 'simple' },
    ])
  }
}
