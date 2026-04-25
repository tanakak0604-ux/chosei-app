'use client'

import { useState } from 'react'
import { isInAnyRange, formatDateLabel, getHeatColor } from '@/lib/utils'
import type { DateGroup } from '@/lib/utils'

type Tooltip = {
  x: number
  y: number
  names: string[]
  absentNames: string[]
  count: number
  total: number
} | null

export default function HeatmapGrid({
  dateGroups,
  timeSlots,
  availNames,
  allParticipantNames,
  total,
  bestSlots,
}: {
  dateGroups: DateGroup[]
  timeSlots: string[]
  availNames: Record<string, string[]>
  allParticipantNames: string[]
  total: number
  bestSlots: string[]
}) {
  const bestSet = new Set(bestSlots)
  const [tooltip, setTooltip] = useState<Tooltip>(null)

  const showTooltip = (e: React.MouseEvent, names: string[], count: number) => {
    const absentNames = allParticipantNames.filter(n => !names.includes(n))
    setTooltip({ x: e.clientX, y: e.clientY, names, absentNames, count, total })
  }

  const moveTooltip = (e: React.MouseEvent) => {
    setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)
  }

  return (
    <div className="overflow-x-auto">
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
              style={{ width: 44, height: 'var(--cell-h)', color: '#8C8880', visibility: ti % 2 === 0 ? 'visible' : 'hidden' }}
            >
              {time}
            </div>
            {dateGroups.map(dg => {
              const inRange = isInAnyRange(time, dg.ranges)
              const key = `${dg.date_label}|${time}`
              const names = inRange ? (availNames[key] ?? []) : []
              const count = names.length
              const { bg, text } = inRange ? getHeatColor(count, total) : { bg: '#F5F2EC', text: '#B0AA9E' }
              const isBest = bestSet.has(key)
              return (
                <div
                  key={dg.date_label}
                  className="flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{
                    width: 64, height: 'var(--cell-h)', background: bg, color: text,
                    border: isBest ? '2px solid #6B8F71' : '1px solid #FDFAF5',
                  }}
                  onMouseEnter={inRange && total > 0 ? (e) => showTooltip(e, names, count) : undefined}
                  onMouseMove={inRange && total > 0 ? moveTooltip : undefined}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {inRange && total > 0 && count > 0 && (
                    <span style={{ fontSize: 10 }}>{isBest ? '〇' : count}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* ツールチップ */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl px-3 py-2.5 text-xs shadow-xl"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y,
            transform: 'translateY(-100%)',
            background: '#2D2A24',
            color: '#F5F2EC',
            minWidth: 130,
          }}
        >
          <p className="font-semibold mb-1.5" style={{ color: '#B0AA9E' }}>
            {tooltip.count}/{tooltip.total}人が参加可能
          </p>
          {tooltip.names.map(name => (
            <p key={name} className="flex items-center gap-1.5">
              <span style={{ color: '#6B8F71' }}>✓</span>{name}
            </p>
          ))}
          {tooltip.absentNames.map(name => (
            <p key={name} className="flex items-center gap-1.5" style={{ color: '#8C8880' }}>
              <span>✗</span>{name}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
