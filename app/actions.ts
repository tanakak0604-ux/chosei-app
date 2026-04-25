'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSupabase } from '@/lib/supabase'

export async function createEvent(formData: FormData) {
  const supabase = getSupabase()

  const title = (formData.get('title') as string).trim()
  const memo = (formData.get('memo') as string)?.trim() || null
  const dates = formData.getAll('dates') as string[]
  const time_starts = formData.getAll('time_starts') as string[]
  const time_ends = formData.getAll('time_ends') as string[]

  const validSlots = dates
    .map((date, i) => ({ date, start: time_starts[i] ?? '09:00', end: time_ends[i] ?? '18:00' }))
    .filter(s => s.date)

  if (!title || validSlots.length === 0) return

  // eventsのday_start/day_endはスロット全体の最小・最大で設定
  const allStarts = validSlots.map(s => s.start).sort()
  const allEnds = validSlots.map(s => s.end).sort()
  const day_start = allStarts[0]
  const day_end = allEnds[allEnds.length - 1]

  const { data: event, error } = await supabase
    .from('events')
    .insert({ title, memo, day_start, day_end })
    .select('id')
    .single()

  if (error || !event) throw new Error('イベントの作成に失敗しました')

  await supabase.from('slots').insert(
    validSlots.map(({ date, start, end }, position) => ({
      event_id: event.id,
      date_label: date,
      time_start: start,
      time_end: end,
      position,
    }))
  )

  redirect(`/events/${event.id}`)
}

export async function submitAvailability(formData: FormData) {
  const supabase = getSupabase()

  const eventId = formData.get('event_id') as string
  const name = (formData.get('name') as string).trim()

  if (!name) return

  const { data: participant, error } = await supabase
    .from('participants')
    .insert({ event_id: eventId, name })
    .select('id')
    .single()

  if (error || !participant) throw new Error('回答の登録に失敗しました')

  const availableSlots = formData.getAll('available_slots') as string[]

  if (availableSlots.length > 0) {
    await supabase.from('availability').insert(
      availableSlots.map(slot => {
        const [date_label, time_start] = slot.split('|')
        return { participant_id: participant.id, date_label, time_start }
      })
    )
  }

  revalidatePath(`/events/${eventId}`)
  redirect(`/events/${eventId}`)
}
