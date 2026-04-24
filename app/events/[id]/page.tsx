import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import type { Event, Slot, Participant, AnswerRecord } from '@/lib/types'
import ResponseForm from './ResponseForm'
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

  const { data: rawAnswers } = safeParticipants.length > 0
    ? await supabase
        .from('answers')
        .select('*')
        .in('participant_id', safeParticipants.map(p => p.id))
        .returns<AnswerRecord[]>()
    : { data: [] as AnswerRecord[] }

  const answers = rawAnswers ?? []

  const answerMap: Record<string, Record<string, string>> = {}
  answers.forEach(a => {
    if (!answerMap[a.participant_id]) answerMap[a.participant_id] = {}
    answerMap[a.participant_id][a.slot_id] = a.answer
  })

  const oCounts: Record<string, number> = {}
  safeSlots.forEach(s => {
    oCounts[s.id] = safeParticipants.filter(p => answerMap[p.id]?.[s.id] === 'o').length
  })

  return (
    <main className="min-h-screen py-12 px-4" style={{ background: '#F5F2EC' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
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
          <CopyButton />
        </div>

        {/* Response table */}
        <div
          className="rounded-2xl border overflow-x-auto"
          style={{
            background: '#FDFAF5',
            borderColor: '#E2DDD4',
            boxShadow: '0 4px 24px rgba(45,42,36,0.07)',
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #E2DDD4' }}>
                <th
                  className="py-3 px-4 text-left font-semibold text-xs tracking-widest uppercase"
                  style={{ color: '#8C8880' }}
                >
                  名前
                </th>
                {safeSlots.map(slot => (
                  <th
                    key={slot.id}
                    className="py-3 px-3 text-center font-semibold min-w-[80px] text-xs"
                    style={{ color: '#2D2A24' }}
                  >
                    {slot.date_label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeParticipants.length === 0 ? (
                <tr>
                  <td
                    colSpan={safeSlots.length + 1}
                    className="py-8 text-center text-sm"
                    style={{ color: '#B0AA9E' }}
                  >
                    まだ回答がありません
                  </td>
                </tr>
              ) : (
                safeParticipants.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom:
                        i < safeParticipants.length - 1 ? '1px solid #E2DDD4' : 'none',
                    }}
                  >
                    <td className="py-3 px-4 font-medium" style={{ color: '#2D2A24' }}>
                      {p.name}
                    </td>
                    {safeSlots.map(slot => {
                      const ans = answerMap[p.id]?.[slot.id]
                      const color =
                        ans === 'o' ? '#6B8F71' : ans === 'd' ? '#C8A84A' : '#C8694A'
                      return (
                        <td key={slot.id} className="py-3 px-3 text-center font-bold">
                          <span style={{ color }}>
                            {ans === 'o' ? '○' : ans === 'd' ? '△' : '×'}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}

              {/* Count row */}
              <tr style={{ borderTop: '2px solid #E2DDD4', background: '#F5F2EC' }}>
                <td
                  className="py-3 px-4 text-xs font-semibold tracking-widest uppercase"
                  style={{ color: '#8C8880' }}
                >
                  ○の数
                </td>
                {safeSlots.map(slot => (
                  <td
                    key={slot.id}
                    className="py-3 px-3 text-center font-bold"
                    style={{ color: '#6B8F71' }}
                  >
                    {oCounts[slot.id]}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Response form */}
        <ResponseForm eventId={id} slots={safeSlots} />
      </div>
    </main>
  )
}
