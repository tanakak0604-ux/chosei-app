import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import { generateTimeSlots, formatDateLabel, getHeatColor } from '@/lib/utils'
import type { Event, Slot, Participant, AvailabilityRecord } from '@/lib/types'
import AvailabilityGrid from './AvailabilityGrid'
import CopyButton from './CopyButton'

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = getSupabase()

  const [{ data: event }, { data: slots }, { data: participants }] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single<Event>(),
    supabase.from('slots').select('*').eq('event_id', id).order('position').returns<Slot[]>(),
    supabase.from('participants').select('*').eq('event_id', id).order('created_at').returns<Participant[]>(),
  ])

  if (!event) notFound()

  const safeSlots = slots ?? []
  const safeParticipants = participants ?? []

  const { data: rawAvailability } = safeParticipants.length > 0
    ? await supabase
        .from('availability')
        .select('*')
        .in('participant_id', safeParticipants.map(p => p.id))
        .returns<AvailabilityRecord[]>()
    : { data: [] as AvailabilityRecord[] }

  const availability = rawAvailability ?? []

  // availMap[date|time] = Set<participant_id>
  const availMap: Record<string, Set<string>> = {}
  availability.forEach(a => {
    const key = `${a.date_label}|${a.time_start}`
    if (!availMap[key]) availMap[key] = new Set()
    availMap[key].add(a.participant_id)
  })

  const timeSlots = generateTimeSlots(event.day_start, event.day_end)
  const total = safeParticipants.length

  // 全員参加可能なスロットを検索
  const bestSlots = new Set<string>()
  if (total > 0) {
    Object.entries(availMap).forEach(([key, set]) => {
      if (set.size === total) bestSlots.add(key)
    })
  }

  return (
    <main className="min-h-screen py-12 px-4" style={{ background: '#F5F2EC' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ヘッダー */}
        <div>
          <Link
            href="/"
            className="text-xs font-semibold tracking-widest uppercase mb-4 inline-block"
            style={{ color: '#8C8880' }}
          >
            ← 新しいイベントを作成
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: '#2D2A24' }}>
            {event.title}
          </h1>
          {event.memo && (
            <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: '#8C8880' }}>
              {event.memo}
            </p>
          )}
          <p className="mt-1 text-xs" style={{ color: '#B0AA9E' }}>
            時間帯: {event.day_start} 〜 {event.day_end}
          </p>
          <CopyButton />
        </div>

        {/* ヒートマップ */}
        <div
          className="rounded-2xl border p-5"
          style={{
            background: '#FDFAF5',
            borderColor: '#E2DDD4',
            boxShadow: '0 4px 24px rgba(45,42,36,0.07)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: '#2D2A24' }}>
              空き時間ヒートマップ
            </h2>
            <span className="text-xs" style={{ color: '#8C8880' }}>
              {total}人が回答済み
            </span>
          </div>

          {bestSlots.size > 0 && (
            <div
              className="text-xs px-3 py-2 rounded-lg mb-4 font-medium"
              style={{ background: '#E8F0E9', color: '#6B8F71' }}
            >
              ★ 全員が参加できる時間帯があります
            </div>
          )}

          <div className="flex gap-4 text-xs mb-3" style={{ color: '#8C8880' }}>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded-sm" style={{ background: '#6B8F71' }} />
              全員OK
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded-sm" style={{ background: 'rgba(107,143,113,0.4)' }} />
              一部OK
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded-sm" style={{ background: '#EEEBE4' }} />
              NG
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block">
              {/* 日付ヘッダー */}
              <div className="flex mb-1">
                <div style={{ width: 44, flexShrink: 0 }} />
                {safeSlots.map(slot => (
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
                  {safeSlots.map(slot => {
                    const key = `${slot.date_label}|${time}`
                    const count = availMap[key]?.size ?? 0
                    const { bg, text } = getHeatColor(count, total)
                    const isBest = bestSlots.has(key)
                    return (
                      <div
                        key={slot.id}
                        className="flex-shrink-0 flex items-center justify-center text-xs font-bold relative"
                        style={{
                          width: 64,
                          height: 24,
                          background: bg,
                          color: text,
                          border: isBest ? '2px solid #6B8F71' : '1px solid #F5F2EC',
                          borderRadius: ti === 0 ? '4px 4px 0 0' : ti === timeSlots.length - 1 ? '0 0 4px 4px' : '0',
                        }}
                        title={
                          total > 0
                            ? `${count}/${total}人が参加可能`
                            : ''
                        }
                      >
                        {total > 0 && count > 0 && (
                          <span style={{ fontSize: 10 }}>
                            {isBest ? '★' : `${count}`}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* 参加者一覧 */}
          {safeParticipants.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E2DDD4' }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#8C8880' }}>
                回答済み
              </p>
              <div className="flex flex-wrap gap-2">
                {safeParticipants.map(p => (
                  <span
                    key={p.id}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ background: '#E2DDD4', color: '#2D2A24' }}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 回答フォーム */}
        <AvailabilityGrid
          eventId={id}
          slots={safeSlots}
          dayStart={event.day_start}
          dayEnd={event.day_end}
        />
      </div>
    </main>
  )
}
