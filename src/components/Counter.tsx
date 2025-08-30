import { clsx } from 'clsx'
export default function Counter({value, setValue, min=0, max=999}:{value:number; setValue:(n:number)=>void; min?:number; max?:number}) {
  return (
    <div className="flex items-center gap-3">
      <button className={clsx('w-12 h-12 rounded-xl bg-cyan-100 text-2xl', value<=min && 'opacity-40')}
              disabled={value<=min}
              onClick={()=> setValue(Math.max(min, value-1))}>–</button>
      <div className="text-2xl w-10 text-center">{value}</div>
      <button className="w-12 h-12 rounded-xl bg-cyan-100 text-2xl"
              onClick={()=> setValue(Math.min(max, value+1))}>+</button>
    </div>
  )
}
