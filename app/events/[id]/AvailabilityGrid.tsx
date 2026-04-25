'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useFormStatus } from 'react-dom'
import { submitAvailability } from '@/app/actions'
import { generateTimeSlots, formatDateLabel } from '@/lib/utils'
import type { Slot } from '@/lib/types'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl font-semibold tracking-wide text-sm transition-transform active:scale-95"
      style={{
        background: '#2D2A24',
        color: '#F5F2EC',
        opacity: pending ? 0.6 : 1,
        cursor: pending ? 'not-allowed' : 'pointer',
      }}
    >
      {pending ? '送信中...' : '回答する'}
    </button>
  )
}

export default function AvailabilityGrid({
  eventId,
  slots,
  dayStart,
  dayEnd,
}: {
  eventId: string
  slots: Slot[]
  dayStart: string
  dayEnd: string
}) {
  const timeSlots = generateTimeSlots(dayStart, dayEnd)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const dragModeRef = useRef<boolean | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const getKey = (date: string, time: string) => `${date}|${time}`

  const applyCell = useCallback((date: string, time: string, adding: boolean) => {
    const key = getKey(date, time)
    setSelected(prev => {
      const next = new Set(prev)
      if (adding) next.add(key)
      else next.delete(key)
      return next
    })
  }, [])

  const handleMouseDown = (date: string, time: string) => {
    const key = getKey(date, time)
    const adding = !selected.has(key)
    dragModeRef.current = adding
    applyCell(date, time, adding)
  }

  const handleMouseEnter = (date: string, time: string) => {
    if (dragModeRef.current === null) return
    applyCell(date, time, dragModeRef.current)
  }

  useEffect(() => {
    const el = gridRef.current
    if (!el) return

    const handleTouchMove = (e: TouchEvent) => {
      if (dragModeRef.current === null) return
      e.preventDefault()
      const touch = e.touches[0]
      const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement
      const date = target?.dataset.date
      const time = target?.dataset.time
      if (date && time) applyCell(date, time, dragModeRef.current)
    }

    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', handleTouchMove)
  }, [applyCell])

  useEffect(() => {
    const stop = () => { dragModeRef.current = null }
    window.addEventListener('mouseup', stop)
    window.addEventListener('touchend', stop)
    return () => {
      window.removeEventListener('mouseup', stop)
      window.removeEventListener('touchend', stop)
    }
  }, [])

  const selectAll = () => {
    const all = new Set<string>()
    slots.forEach(s => timeSlots.forEach(t => all.add(getKey(s.date_label, t))))
    setSelected(all)
  }

  return (
    <div
      className="rounded-2xl p-6 border"
      style={{
        background: '#FDFAF5',
        borderColor: '#E2DDD4',
        boxShadow: '0 4px 24px rgba(45,42,36,0.07)',
      }}
    >
      <h2 className="font-semibold mb-5" style={{ color: '#2D2A24' }}>
        回答を追加
      </h2>

      <form action={submitAvailability} className="space-y-5">
        <input type="hidden" name="event_id" value={eventId} />
        {Array.from(selected).map(key => (
          <input key={key} type="hidden" name="available_slots" value={key} />
        ))}

        <div>
          <label
            className="block text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: '#8C8880' }}
          >
            お名前 <span style={{ color: '#C8694A' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="例: 田中"
            className="w-full rounded-lg px-4 py-2.5 text-sm border outline-none"
            style={{ borderColor: '#E2DDD4', background: '#F5F2EC', color: '#2D2A24' }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#8C8880' }}>
              参加できる時間帯
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs px-2 py-1 rounded-md font-medium"
                style={{ background: '#6B8F71', color: '#fff' }}
              >
                全選択
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-xs px-2 py-1 rounded-md font-medium"
                style={{ background: '#E2DDD4', color: '#8C8880' }}
              >
                クリア
              </button>
            </div>
          </div>

          <p className="text-xs mb-3" style={{ color: '#B0AA9E' }}>
            ドラッグで複数選択できます
          </p>

          <div className="flex gap-3 text-xs mb-3" style={{ color: '#8C8880' }}>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#6B8F71' }} />
              参加できる
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#E2DDD4' }} />
              参加できない
            </span>
          </div>

          <div ref={gridRef} className="overflow-x-auto select-none">
            <div className="inline-block">
              {/* 日付ヘッダー */}
              <div className="flex mb-1">
                <div style={{ width: 44, flexShrink: 0 }} />
                {slots.map(slot => (
                  <div
                    key={slot.id}
                    className="text-center text-xs font-semibold"
                    style={{ width: 64, flexShrink: 0, color: '#2D2A24' }}
                  >
                    {formatDateLabel(slot.date_label)}
                  </div>
                ))}
              </div>

              {/* 時間行 */}
              {timeSlots.map((time, ti) => (
                <div key={time} className="flex">
                  <div
                    className="flex items-center justify-end pr-2 text-xs flex-shrink-0"
                    style={{
                      width: 44,
                      height: 24,
                      color: '#8C8880',
                      visibility: ti % 2 === 0 ? 'visible' : 'hidden',
                    }}
                  >
                    {time}
                  </div>
                  {slots.map(slot => {
                    const key = getKey(slot.date_label, time)
                    const isOn = selected.has(key)
                    return (
                      <div
                        key={slot.id}
                        data-date={slot.date_label}
                        data-time={time}
                        className="flex-shrink-0 cursor-pointer transition-colors"
                        style={{
                          width: 64,
                          height: 24,
                          background: isOn ? '#6B8F71' : '#E2DDD4',
                          border: '1px solid #F5F2EC',
                          borderRadius: ti === 0 ? '4px 4px 0 0' : ti === timeSlots.length - 1 ? '0 0 4px 4px' : '0',
                        }}
                        onMouseDown={() => handleMouseDown(slot.date_label, time)}
                        onMouseEnter={() => handleMouseEnter(slot.date_label, time)}
                        onTouchStart={() => {
                          const adding = !selected.has(key)
                          dragModeRef.current = adding
                          applyCell(slot.date_label, time, adding)
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
