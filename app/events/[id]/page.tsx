import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import { generateTimeSlots, computeOverallRange, groupSlotsByDate } from '@/lib/utils'
import type { Event, Slot, Participant, AvailabilityRecord } from '@/lib/types'
import AvailabilityGrid from './AvailabilityGrid'
import CopyButton from './CopyButton'
import HeatmapGrid from './HeatmapGrid'

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = getSupabase()

  const [
    { data: event, error: eventError },
    { data: slots, error: slotsError },
    { data: participants, error: participantsError }
  ] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single<Event>(),
    supabase.from('slots').select('*').eq('event_id', id).order('position').returns<Slot[]>(),
    supabase.from('participants').select('*').eq('event_id', id).order('created_at').returns<Participant[]>(),
  ])

  if (eventError) console.error('events error:', eventError)
  if (slotsError) console.error('slots error:', slotsError)
  if (participantsError) console.error('participants error:', participantsError)

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

  const participantNameMap = Object.fromEntries(safeParticipants.map(p => [p.id, p.name]))

  const availMap: Record<string, Set<string>> = {}
  availability.forEach(a => {
    const key = `${a.date_label}|${a.time_start}`
    if (!availMap[key]) availMap[key] = new Set()
    availMap[key].add(a.participant_id)
  })

  // participant_id → name に変換
  const availNames: Record<string, string[]> = {}
  Object.entries(availMap).forEach(([key, idSet]) => {
    availNames[key] = Array.from(idSet).map(id => participantNameMap[id]).filter(Boolean) as string[]
  })

  const { start: overallStart, end: overallEnd } = computeOverallRange(safeSlots)
  const timeSlots = generateTimeSlots(overallStart, overallEnd)
  const dateGroups = groupSlotsByDate(safeSlots)
  const total = safeParticipants.length

  const bestSlots: string[] = []
  if (total > 0) {
    Object.entries(availMap).forEach(([key, set]) => {
      if (set.size === total) bestSlots.push(key)
    })
  }

  return (
    <main className="min-h-screen py-12 px-4" style={{ background: '#F5F2EC' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <Link href="/" className="text-xs font-semibold tracking-widest uppercase mb-4 inline-block" style={{ color: '#8C8880' }}>
            ← 新しいイベントを作成
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: '#2D2A24' }}>{event.title}</h1>
          {event.memo && (
            <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: '#8C8880' }}>{event.memo}</p>
          )}
          <CopyButton />
        </div>

        {/* ヒートマップ */}
        <div
          className="rounded-2xl border p-5"
          style={{ background: '#FDFAF5', borderColor: '#E2DDD4', boxShadow: '0 4px 24px rgba(45,42,36,0.07)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: '#2D2A24' }}>日程候補</h2>
            <span className="text-xs" style={{ color: '#8C8880' }}>{total}人が回答済み</span>
          </div>

          {bestSlots.length > 0 && (
            <div className="text-xs px-3 py-2 rounded-lg mb-4 font-medium" style={{ background: '#E8F0E9', color: '#6B8F71' }}>
              〇 全員が参加できる時間帯があります
            </div>
          )}

          <div className="flex gap-4 text-xs mb-3" style={{ color: '#8C8880' }}>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded-sm" style={{ background: '#6B8F71' }} />全員OK
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded-sm" style={{ background: 'rgba(107,143,113,0.4)' }} />一部OK
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded-sm" style={{ background: '#EEEBE4' }} />NG/対象外
            </span>
          </div>

          <HeatmapGrid
            dateGroups={dateGroups}
            timeSlots={timeSlots}
            availNames={availNames}
            allParticipantNames={safeParticipants.map(p => p.name)}
            total={total}
            bestSlots={bestSlots}
          />

          {safeParticipants.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E2DDD4' }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#8C8880' }}>回答済み</p>
              <div className="flex flex-wrap gap-2">
                {safeParticipants.map(p => (
                  <span key={p.id} className="text-xs px-2 py-1 rounded-full" style={{ background: '#E2DDD4', color: '#2D2A24' }}>
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <AvailabilityGrid eventId={id} slots={safeSlots} />
      </div>
    </main>
  )
}
