import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { db } from '../db'
import { useStore } from '../store'

type Archive = {
  id: string
  year: number
  month: number
  nastya: number
  max: number
  diff: number
  ts: number
}

const MONTHS = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
]

export default function Results() {
  const [archives, setArchives] = useState<Archive[]>([])
  const ownerId = useStore(s=>s.ownerId)

  useEffect(()=>{
    db.archives.orderBy('ts').reverse().toArray().then(setArchives)
  },[])

  return (
    <Layout>
      {archives.length === 0 && (
        <div className="text-slate-500 text-center">Архива пока нет</div>
      )}

      {archives.length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupByYear(archives)).map(([year, months])=>(
            <div key={year}>
              <h3 className="text-lg font-semibold mb-2">{year}</h3>
              <div className="space-y-2">
                {months.map(a=>(
                  <div key={a.id}
                       className="rounded-2xl p-4 bg-white border shadow-sm flex justify-between items-center">
                    <div>
                      <div className="font-medium">{MONTHS[a.month]}</div>
                      <div className="text-xs text-slate-500">
                        Настя: {a.nastya} — Макс: {a.max}
                      </div>
                    </div>
                    <div className={`font-bold ${isOwnerLeading(a,ownerId)?'text-emerald-600':'text-rose-600'}`}>
                      {a.diff>0?`+${a.diff}`:a.diff}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}

function groupByYear(list: Archive[]) {
  return list.reduce((acc,cur)=>{
    acc[cur.year] = acc[cur.year] || []
    acc[cur.year].push(cur)
    return acc
  }, {} as Record<number,Archive[]>)
}

function isOwnerLeading(a: Archive, ownerId: string) {
  if (ownerId==='nastya') return a.diff>=0
  if (ownerId==='max') return a.diff<=0
  return false
}
