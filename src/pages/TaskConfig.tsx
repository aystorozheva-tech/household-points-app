import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { defaultTasks } from '../defaultTasks'
import { useEffect, useState } from 'react'
import { db } from '../db'
import type { Room } from '../types'

export default function TaskConfig() {
  const { id } = useParams() // vacuum, floor, dishes, dust, laundry, plumbing
  const [config, setConfig] = useState<any>(null)
  const [savedConfig, setSavedConfig] = useState<any>(null)
  const [rooms, setRooms] = useState<Room[]>([])

    useEffect(()=>{
    if (!id) return

    const saved = localStorage.getItem(`task-${id}`)
    let baseConfig = saved ? JSON.parse(saved) : defaultTasks[id]
    setSavedConfig(baseConfig)

    db.rooms.toArray().then(rs=>{
        setRooms(rs)
        if (id==='vacuum' || id==='floor' || id==='dust') {
        const newMultipliers = {...(baseConfig.roomMultipliers || {})}
        rs.forEach(r=>{
            if (newMultipliers[r.id] === undefined) newMultipliers[r.id] = 1.00
        })
        baseConfig = {...baseConfig, roomMultipliers:newMultipliers}
        }
        setConfig(baseConfig)   // 👈 только один setConfig
    })
    },[id])

  function save() {
    if (!id || !config) return
    localStorage.setItem(`task-${id}`, JSON.stringify(config))
    setSavedConfig(config)
  }

  if (!config) return <Layout>Загрузка...</Layout>

  const isChanged = JSON.stringify(config) !== JSON.stringify(savedConfig)

  return (
    <Layout>
      <h2 className="text-lg font-bold mb-4">{getTaskTitle(id)}</h2>

      {config.kind==='vacuum' && <VacuumConfig config={config} setConfig={setConfig} rooms={rooms}/>}
      {config.kind==='floor' && <FloorConfig config={config} setConfig={setConfig} rooms={rooms}/>}
      {config.kind==='dishes' && <DishesConfig config={config} setConfig={setConfig}/>}
      {config.kind==='dust' && <DustConfig config={config} setConfig={setConfig} rooms={rooms}/>}
      {config.kind==='laundry' && <LaundryConfig config={config} setConfig={setConfig}/>}
      {config.kind==='plumbing' && <PlumbingConfig config={config} setConfig={setConfig}/>}

      <button
        onClick={save}
        disabled={!isChanged}
        className={`mt-6 w-full rounded-2xl py-3 font-bold ${
          isChanged ? 'bg-cyan-500 text-white' : 'bg-gray-300 text-slate-500 cursor-not-allowed'
        }`}
      >
        Сохранить
      </button>
    </Layout>
  )
}

function getTaskTitle(key?: string) {
  switch(key) {
    case 'vacuum': return 'Пропылесосить'
    case 'floor': return 'Помыть пол'
    case 'dishes': return 'Помыть посуду'
    case 'dust': return 'Протереть пыль'
    case 'laundry': return 'Постирать'
    case 'plumbing': return 'Помыть сантехнику'
    default: return key || ''
  }
}

/* ---------- Vacuum ---------- */
function VacuumConfig({config,setConfig,rooms}:{config:any,setConfig:any,rooms:Room[]}) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2">
        <input type="checkbox"
          checked={config.hasRobot}
          onChange={e=>setConfig({...config, hasRobot:e.target.checked})}/>
        Есть робот-пылесос
      </label>

      <NumberInput label="Базовые баллы" value={config.base} step={1}
        onChange={val=>setConfig({...config, base:val})}/>

      {config.hasRobot && (
        <>
          <div>Коэффициент за уборку роботом: <b>1.00</b></div>
          <NumberInput label="Коэффициент за уборку вручную"
            value={config.manualMultiplier} step={0.01}
            onChange={val=>setConfig({...config, manualMultiplier:val})}/>
        </>
      )}

      <RoomMultipliers config={config} setConfig={setConfig} rooms={rooms}/>
      <Calculator config={config} rooms={rooms}/>
    </div>
  )
}

/* ---------- Floor ---------- */
function FloorConfig({config,setConfig,rooms}:{config:any,setConfig:any,rooms:Room[]}) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2">
        <input type="checkbox"
          checked={config.hasRobot}
          onChange={e=>setConfig({...config, hasRobot:e.target.checked})}/>
        Есть робот для мытья полов
      </label>

      <NumberInput label="Базовые баллы" value={config.base} step={1}
        onChange={val=>setConfig({...config, base:val})}/>

      {config.hasRobot && (
        <>
          <div>Коэффициент за уборку роботом: <b>1.00</b></div>
          <NumberInput label="Коэффициент за уборку вручную"
            value={config.manualMultiplier} step={0.01}
            onChange={val=>setConfig({...config, manualMultiplier:val})}/>
        </>
      )}

      <RoomMultipliers config={config} setConfig={setConfig} rooms={rooms}/>
      <Calculator config={config} rooms={rooms}/>
    </div>
  )
}

/* ---------- Dishes ---------- */
function DishesConfig({config,setConfig}:{config:any,setConfig:any}) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2">
        <input type="checkbox"
          checked={config.hasDishwasher}
          onChange={e=>setConfig({...config, hasDishwasher:e.target.checked})}/>
        Есть посудомоечная машина
      </label>

      {config.hasDishwasher ? (
        <>
          <NumberInput label="Баллы за мытьё в ПММ" value={config.base} step={1}
            onChange={val=>setConfig({...config, base:val})}/>
          <NumberInput label="Коэффициент за мытьё вручную"
            value={config.manualMultiplier} step={0.01}
            onChange={val=>setConfig({...config, manualMultiplier:val})}/>
        </>
      ) : (
        <NumberInput label="Баллы за мытьё вручную" value={config.base} step={1}
          onChange={val=>setConfig({...config, base:val})}/>
      )}

      <div className="mt-6">
        <h3 className="font-medium mb-2">Калькулятор</h3>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-slate-100">
              {config.hasDishwasher && <th className="border px-2 py-1">ПММ</th>}
              <th className="border px-2 py-1">Вручную</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {config.hasDishwasher && (
                <td className="border px-2 py-1 text-center">{config.base}</td>
              )}
              <td className="border px-2 py-1 text-center">
                {config.hasDishwasher
                  ? Math.round(config.base * config.manualMultiplier)
                  : config.base}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- Dust ---------- */
function DustConfig({config,setConfig,rooms}:{config:any,setConfig:any,rooms:Room[]}) {
  return (
    <div className="space-y-4">
      <NumberInput label="Базовые баллы" value={config.base} step={1}
        onChange={val=>setConfig({...config, base:val})}/>

      <RoomMultipliers config={config} setConfig={setConfig} rooms={rooms}/>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Калькулятор</h3>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-slate-100">
              <th className="border px-2 py-1 text-left">Комната</th>
              <th className="border px-2 py-1">Баллы</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(r=>(
              <tr key={r.id}>
                <td className="border px-2 py-1">{r.title}</td>
                <td className="border px-2 py-1 text-center">
                  {Math.round(config.base * (config.roomMultipliers?.[r.id] ?? 1))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- Laundry ---------- */
function LaundryConfig({config,setConfig}:{config:any,setConfig:any}) {
  return (
    <div className="space-y-4">
      <NumberInput label="Базовые баллы" value={config.base} step={1}
        onChange={val=>setConfig({...config, base:val})}/>
    </div>
  )
}

/* ---------- Plumbing ---------- */
function PlumbingConfig({config,setConfig}:{config:any,setConfig:any}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <NumberInput label="Баллы за унитаз" value={config.toilet} step={1}
          onChange={val=>setConfig({...config, toilet:val})}/>
        <NumberInput label="Баллы за раковину" value={config.sink} step={1}
          onChange={val=>setConfig({...config, sink:val})}/>
        <NumberInput label="Баллы за ванну" value={config.bath} step={1}
          onChange={val=>setConfig({...config, bath:val})}/>
      </div>

      <div className="space-y-2">
        <NumberInput label="Количество унитазов" value={config.toiletCount ?? 1} step={1}
          onChange={val=>setConfig({...config, toiletCount:val})}/>
        <NumberInput label="Количество раковин" value={config.sinkCount ?? 1} step={1}
          onChange={val=>setConfig({...config, sinkCount:val})}/>
        <NumberInput label="Количество ванн" value={config.bathCount ?? 1} step={1}
          onChange={val=>setConfig({...config, bathCount:val})}/>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Калькулятор</h3>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-slate-100">
              <th className="border px-2 py-1 text-left">Элемент</th>
              <th className="border px-2 py-1">Кол-во</th>
              <th className="border px-2 py-1">Баллы за 1</th>
              <th className="border px-2 py-1">Итого</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">Унитаз</td>
              <td className="border px-2 py-1 text-center">{config.toiletCount ?? 1}</td>
              <td className="border px-2 py-1 text-center">{config.toilet}</td>
              <td className="border px-2 py-1 text-center">
                {(config.toiletCount ?? 1) * config.toilet}
              </td>
            </tr>
            <tr>
              <td className="border px-2 py-1">Раковина</td>
              <td className="border px-2 py-1 text-center">{config.sinkCount ?? 1}</td>
              <td className="border px-2 py-1 text-center">{config.sink}</td>
              <td className="border px-2 py-1 text-center">
                {(config.sinkCount ?? 1) * config.sink}
              </td>
            </tr>
            <tr>
              <td className="border px-2 py-1">Ванна</td>
              <td className="border px-2 py-1 text-center">{config.bathCount ?? 1}</td>
              <td className="border px-2 py-1 text-center">{config.bath}</td>
              <td className="border px-2 py-1 text-center">
                {(config.bathCount ?? 1) * config.bath}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- Helpers ---------- */
function NumberInput({label,value,step,onChange}:{label:string,value:number,step:number,onChange:(val:number)=>void}) {
  return (
    <div>
      {label}:
      <input
        type="number"
        step={step}
        value={value}
        onChange={e=>{
          const val = step===1
            ? parseInt(e.target.value || '0', 10)
            : parseFloat(e.target.value)
          onChange(isNaN(val) ? 0 : step===1 ? val : parseFloat(val.toFixed(2)))
        }}
        className="ml-2 border px-2 rounded w-24"
      />
    </div>
  )
}

function RoomMultipliers({config,setConfig,rooms}:{config:any,setConfig:any,rooms:Room[]}) {
  return (
    <div className="mt-4 space-y-2">
      <h3 className="font-medium">Коэффициенты по комнатам</h3>
      {rooms.map(r=>(
        <div key={r.id} className="flex items-center gap-2">
          <span className="w-32">{r.title}</span>
          <input
            type="number"
            step={0.01}
            value={config.roomMultipliers?.[r.id] ?? 1.00}
            onChange={e=>{
              const val = parseFloat(e.target.value)
              const newMultipliers = {...config.roomMultipliers}
              newMultipliers[r.id] = isNaN(val) ? 1.00 : parseFloat(val.toFixed(2))
              setConfig({...config, roomMultipliers:newMultipliers})
            }}
            className="border px-2 rounded w-24"
          />
        </div>
      ))}
    </div>
  )
}

function Calculator({config,rooms}:{config:any,rooms:Room[]}) {
  return (
    <div className="mt-6">
      <h3 className="font-medium mb-2">Калькулятор</h3>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-slate-100">
            <th className="border px-2 py-1 text-left">Комната</th>
            {config.hasRobot && <th className="border px-2 py-1">Робот</th>}
            <th className="border px-2 py-1">Вручную</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(r=>(
            <tr key={r.id}>
              <td className="border px-2 py-1">{r.title}</td>
              {config.hasRobot && (
                <td className="border px-2 py-1 text-center">
                  {Math.round(config.base * (config.roomMultipliers?.[r.id] ?? 1))}
                </td>
              )}
              <td className="border px-2 py-1 text-center">
                {Math.round(config.base * (config.roomMultipliers?.[r.id] ?? 1) * (config.hasRobot ? config.manualMultiplier : 1))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}