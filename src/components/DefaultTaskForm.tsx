import { useState } from 'react'
import type { Room } from '../types'

export function DefaultTaskForm({
  kind,
  config,
  rooms,
  onSubmit
}: {
  kind: string
  config: any
  rooms: Room[]
  onSubmit: (taskId: string, points: number) => void
}) 
// * ------- Vacuum ------ * //
{
  if (kind === 'vacuum') {
    const [selectedRooms, setSelectedRooms] = useState<string[]>([])
    const [mode, setMode] = useState<'robot' | 'manual'>('manual')

    // переключение выбора комнаты
    const toggleRoom = (id: string) => {
      if (selectedRooms.includes(id)) {
        setSelectedRooms(selectedRooms.filter(r => r !== id))
      } else {
        setSelectedRooms([...selectedRooms, id])
      }
    }

    // расчет баллов
    const totalPoints = selectedRooms.reduce((sum, rid) => {
      const base = config.base * (config.roomMultipliers?.[rid] ?? 1)
      if (mode === 'robot') {
        return sum + base
      } else {
        return sum + Math.round(base * (config.manualMultiplier ?? 1))
      }
    }, 0)

    return (
      <div className="space-y-4">
        <h3 className="font-medium">Пропылесосить</h3>

        {/* список комнат */}
        <div className="space-y-2">
          {rooms.map(r => (
            <label key={r.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedRooms.includes(r.id)}
                onChange={() => toggleRoom(r.id)}
              />
              {r.title}
            </label>
          ))}
        </div>

        {/* режим уборки */}
        {config.hasRobot && (
          <div className="flex gap-4 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="robot"
                checked={mode === 'robot'}
                onChange={() => setMode('robot')}
              />
              Робот
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="manual"
                checked={mode === 'manual'}
                onChange={() => setMode('manual')}
              />
              Вручную
            </label>
          </div>
        )}

        {/* итог */}
        <div className="mt-4 font-bold">
          Итого: {totalPoints} баллов
        </div>

        {/* кнопка подтвердить */}
        <button
          disabled={selectedRooms.length === 0}
          onClick={() => onSubmit(`vacuum-${mode}`, totalPoints)}
          className={`w-full rounded-2xl py-3 font-bold ${
            selectedRooms.length > 0
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          Подтвердить
        </button>
      </div>
    )
  }

    // * ------- Floor ------ * //  
  /* ---------- FLOOR ---------- */
  if (kind === 'floor') {
    const [selectedRooms, setSelectedRooms] = useState<string[]>([])
    const [mode, setMode] = useState<'robot' | 'manual'>('manual')

    // переключение выбора комнаты
    const toggleRoom = (id: string) => {
      if (selectedRooms.includes(id)) {
        setSelectedRooms(selectedRooms.filter(r => r !== id))
      } else {
        setSelectedRooms([...selectedRooms, id])
      }
    }

    // расчёт баллов
    const totalPoints = selectedRooms.reduce((sum, rid) => {
      const base = config.base * (config.roomMultipliers?.[rid] ?? 1)
      if (mode === 'robot') {
        return sum + base
      } else {
        return sum + Math.round(base * (config.manualMultiplier ?? 1))
      }
    }, 0)

    return (
      <div className="space-y-4">
        <h3 className="font-medium">Помыть пол</h3>

        {/* список комнат */}
        <div className="space-y-2">
          {rooms.map(r => (
            <label key={r.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedRooms.includes(r.id)}
                onChange={() => toggleRoom(r.id)}
              />
              {r.title}
            </label>
          ))}
        </div>

        {/* режим уборки */}
        {config.hasRobot && (
          <div className="flex gap-4 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="robot"
                checked={mode === 'robot'}
                onChange={() => setMode('robot')}
              />
              Робот
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="manual"
                checked={mode === 'manual'}
                onChange={() => setMode('manual')}
              />
              Вручную
            </label>
          </div>
        )}

        {/* итог */}
        <div className="mt-4 font-bold">Итого: {totalPoints} баллов</div>

        {/* кнопка подтвердить */}
        <button
          disabled={selectedRooms.length === 0}
          onClick={() => onSubmit(`floor-${mode}`, totalPoints)}
          className={`w-full rounded-2xl py-3 font-bold ${
            selectedRooms.length > 0
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          Подтвердить
        </button>
      </div>
    )
  }

    /* ---------- DUST ---------- */
    if (kind === 'dust') {
    const [selectedRooms, setSelectedRooms] = useState<string[]>([])

    const toggleRoom = (id: string) => {
        if (selectedRooms.includes(id)) {
        setSelectedRooms(selectedRooms.filter(r => r !== id))
        } else {
        setSelectedRooms([...selectedRooms, id])
        }
    }

    const totalPoints = selectedRooms.reduce((sum, rid) => {
        const base = config.base * (config.roomMultipliers?.[rid] ?? 1)
        return sum + Math.round(base)
    }, 0)

    return (
        <div className="space-y-4">
        <h3 className="font-medium">Протереть пыль</h3>

        {/* список комнат */}
        <div className="space-y-2">
            {rooms.map(r => (
            <label key={r.id} className="flex items-center gap-2">
                <input
                type="checkbox"
                checked={selectedRooms.includes(r.id)}
                onChange={() => toggleRoom(r.id)}
                />
                {r.title}
            </label>
            ))}
        </div>

        {/* итог */}
        <div className="mt-4 font-bold">Итого: {totalPoints} баллов</div>

        {/* кнопка подтвердить */}
        <button
            disabled={selectedRooms.length === 0}
            onClick={() => onSubmit('dust', totalPoints)}
            className={`w-full rounded-2xl py-3 font-bold ${
            selectedRooms.length > 0
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-300 text-slate-500 cursor-not-allowed'
            }`}
        >
            Подтвердить
        </button>
        </div>
    )
    }

    /* ---------- DISHES ---------- */
    if (kind === 'dishes') {
    const [mode, setMode] = useState<'dw' | 'manual'>(
        config.hasDishwasher ? 'dw' : 'manual'
    )

    const totalPoints =
        mode === 'dw'
        ? config.base
        : config.hasDishwasher
        ? Math.round(config.base * (config.manualMultiplier ?? 1))
        : config.base

    return (
        <div className="space-y-4">
        <h3 className="font-medium">Помыть посуду</h3>

        {/* выбор режима */}
        {config.hasDishwasher ? (
            <div className="flex gap-4 mt-4">
            <label className="flex items-center gap-2">
                <input
                type="radio"
                name="mode"
                value="dw"
                checked={mode === 'dw'}
                onChange={() => setMode('dw')}
                />
                Посудомойка
            </label>
            <label className="flex items-center gap-2">
                <input
                type="radio"
                name="mode"
                value="manual"
                checked={mode === 'manual'}
                onChange={() => setMode('manual')}
                />
                Вручную
            </label>
            </div>
        ) : (
            <div className="mt-2">Мытьё вручную</div>
        )}

        {/* итог */}
        <div className="mt-4 font-bold">Итого: {totalPoints} баллов</div>

        {/* кнопка подтвердить */}
        <button
            onClick={() => onSubmit(`dishes-${mode}`, totalPoints)}
            className="w-full rounded-2xl py-3 font-bold bg-cyan-500 text-white"
        >
            Подтвердить
        </button>
        </div>
    )
    }    
    /* ---------- LAUNDRY ---------- */
    if (kind === 'laundry') {
    const totalPoints = config.base

    return (
        <div className="space-y-4">
        <h3 className="font-medium">Постирать</h3>

        {/* итог */}
        <div className="mt-4 font-bold">Итого: {totalPoints} баллов</div>

        {/* кнопка подтвердить */}
        <button
            onClick={() => onSubmit('laundry', totalPoints)}
            className="w-full rounded-2xl py-3 font-bold bg-cyan-500 text-white"
        >
            Подтвердить
        </button>
        </div>
    )
    }

    /* ---------- PLUMBING (счётчики) ---------- */
    if (kind === 'plumbing') {
    const [toiletSel, setToiletSel] = useState(0)
    const [sinkSel, setSinkSel] = useState(0)
    const [bathSel, setBathSel] = useState(0)

    const toiletMax = config.toiletCount ?? 0
    const sinkMax = config.sinkCount ?? 0
    const bathMax = config.bathCount ?? 0

    const totalPoints =
        toiletSel * config.toilet +
        sinkSel * config.sink +
        bathSel * config.bath

    return (
        <div className="space-y-6">
        <h3 className="font-medium">Помыть сантехнику</h3>

        {/* Унитазы */}
        <div className="flex items-center justify-between">
            <span>
            Унитазы (макс. {toiletMax}, {config.toilet} баллов за 1)
            </span>
            <div className="flex items-center gap-2">
            <button
                onClick={() => setToiletSel(Math.max(0, toiletSel - 1))}
                disabled={toiletSel === 0}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                -
            </button>
            <span>{toiletSel}</span>
            <button
                onClick={() => setToiletSel(Math.min(toiletMax, toiletSel + 1))}
                disabled={toiletSel === toiletMax}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                +
            </button>
            </div>
        </div>

        {/* Раковины */}
        <div className="flex items-center justify-between">
            <span>
            Раковины (макс. {sinkMax}, {config.sink} баллов за 1)
            </span>
            <div className="flex items-center gap-2">
            <button
                onClick={() => setSinkSel(Math.max(0, sinkSel - 1))}
                disabled={sinkSel === 0}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                -
            </button>
            <span>{sinkSel}</span>
            <button
                onClick={() => setSinkSel(Math.min(sinkMax, sinkSel + 1))}
                disabled={sinkSel === sinkMax}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                +
            </button>
            </div>
        </div>

        {/* Ванны */}
        <div className="flex items-center justify-between">
            <span>
            Ванны (макс. {bathMax}, {config.bath} баллов за 1)
            </span>
            <div className="flex items-center gap-2">
            <button
                onClick={() => setBathSel(Math.max(0, bathSel - 1))}
                disabled={bathSel === 0}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                -
            </button>
            <span>{bathSel}</span>
            <button
                onClick={() => setBathSel(Math.min(bathMax, bathSel + 1))}
                disabled={bathSel === bathMax}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                +
            </button>
            </div>
        </div>

        {/* Итог */}
        <div className="font-bold">Итого: {totalPoints} баллов</div>

        {/* Подтвердить */}
        <button
            disabled={totalPoints === 0}
            onClick={() => onSubmit('plumbing', totalPoints)}
            className={`w-full rounded-2xl py-3 font-bold ${
            totalPoints > 0
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-300 text-slate-500 cursor-not-allowed'
            }`}
        >
            Подтвердить
        </button>
        </div>
    )
    }
  return <div>Форма для {kind} ещё не сделана</div>
}
