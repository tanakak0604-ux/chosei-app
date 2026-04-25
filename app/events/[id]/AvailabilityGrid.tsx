'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useFormStatus } from 'react-dom'
import { submitAvailability } from '@/app/actions'
import {
  generateTimeSlots,
  computeOverallRange,
  isInAnyRange,
  formatDateLabel,
  groupSlotsByDate,
  summarizeSelected,
} from '@/lib/utils'
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
}: {
  eventId: string
  slots: Slot[]
}) {
  const { start: overallStart, end: overallEnd } = computeOverallRange(slots)
  const timeSlots = generateTimeSlots(overallStart, overallEnd)
  const dateGroups = groupSlotsByDate(slots)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const dragModeRef = useRef<boolean | null>(null)
  const recentTouchRef = useRef(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const getKey = (date: string, time: string) => `${date}|${time}`

  const applyCell = useCallback((date: string, time: string, adding: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (adding) next.add(getKey(date, time))
      else next.delete(getKey(date, time))
      return next
    })
  }, [])

  const handleMouseDown = (date: string, time: string) => {
    if (recentTouchRef.current) return // タッチ後の合成mousedownを無視
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
    dateGroups.forEach(dg =>
      timeSlots.forEach(t => {
        if (isInAnyRange(t, dg.ranges)) all.add(getKey(dg.date_label, t))
      })
    )
    setSelected(all)
  }

  const summary = summarizeSelected(selected, dateGroups, timeSlots)

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
          <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#8C8880' }}>
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
            <p className="text-xs font-semibold tracking-widests uppercase" style={{ color: '#8C8880' }}>
              参加できる時間帯
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={selectAll}
                className="text-xs px-2 py-1 rounded-md font-medium"
                style={{ background: '#6B8F71', color: '#fff' }}>
                全選択
              </button>
              <button type="button" onClick={() => setSelected(new Set())}
                className="text-xs px-2 py-1 rounded-md font-medium"
                style={{ background: '#E2DDD4', color: '#8C8880' }}>
                クリア
              </button>
            </div>
          </div>
          <p className="text-xs mb-3" style={{ color: '#B0AA9E' }}>タップまたはドラッグで複数選択できます</p>

          <div className="flex gap-3 text-xs mb-3" style={{ color: '#8C8880' }}>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#6B8F71' }} />参加できる
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#E2DDD4' }} />参加できない
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#F5F2EC', border: '1px solid #E2DDD4' }} />対象外
            </span>
          </div>

          <div ref={gridRef} className="overflow-x-auto select-none">
            <div className="inline-block">
              {/* 日付ヘッダー */}
              <div className="flex mb-1">
                <div style={{ width: 44, flexShrink: 0 }} />
                {dateGroups.map(dg => (
                  <div key={dg.date_label} className="text-center flex-shrink-0" style={{ width: 64 }}>
                    <div className="text-xs font-semibold" style={{ color: '#2D2A24' }}>
                      {formatDateLabel(dg.date_label)}
                    </div>
                    {dg.ranges.map((r, i) => (
                      <div key={i} className="text-xs" style={{ color: '#B0AA9E' }}>
                        {r.time_start}〜{r.time_end}
                      </div>
                    ))}
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
                      height: 'var(--cell-h)',
                      color: '#8C8880',
                      visibility: ti % 2 === 0 ? 'visible' : 'hidden',
                    }}
                  >
                    {time}
                  </div>
                  {dateGroups.map(dg => {
                    const inRange = isInAnyRange(time, dg.ranges)
                    const key = getKey(dg.date_label, time)
                    const isOn = selected.has(key)
                    return (
                      <div
                        key={dg.date_label}
                        data-date={inRange ? dg.date_label : undefined}
                        data-time={inRange ? time : undefined}
                        className="flex-shrink-0"
                        style={{
                          width: 64,
                          height: 'var(--cell-h)',
                          background: !inRange ? '#F5F2EC' : isOn ? '#6B8F71' : '#E2DDD4',
                          border: '1px solid #FDFAF5',
                          cursor: inRange ? 'pointer' : 'default',
                        }}
                        onMouseDown={inRange ? () => handleMouseDown(dg.date_label, time) : undefined}
                        onMouseEnter={inRange ? () => handleMouseEnter(dg.date_label, time) : undefined}
                        onTouchStart={inRange ? () => {
                          recentTouchRef.current = true
                          setTimeout(() => { recentTouchRef.current = false }, 500)
                          const adding = !selected.has(key)
                          dragModeRef.current = adding
                          applyCell(dg.date_label, time, adding)
                        } : undefined}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 選択中の時間テキスト表示 */}
          {summary.length > 0 && (
            <div className="mt-3 p-3 rounded-lg text-xs space-y-1" style={{ background: '#F5F2EC' }}>
              <p className="font-semibold tracking-widest uppercase" style={{ color: '#8C8880' }}>選択中</p>
              {summary.map(({ date, ranges }) => (
                <p key={date} style={{ color: '#2D2A24' }}>
                  <span className="font-medium">{date}</span>　{ranges}
                </p>
              ))}
            </div>
          )}
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
