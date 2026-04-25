'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSupabase } from '@/lib/supabase'

export async function createEvent(formData: FormData) {
  const supabase = getSupabase()

  const title = (formData.get('title') as string).trim()
  const memo = (formData.get('memo') as string)?.trim() || null
  const day_start = formData.get('day_start') as string
  const day_end = formData.get('day_end') as string
  const dates = formData.getAll('dates') as string[]
  const validDates = dates.filter(Boolean)

  if (!title || validDates.length === 0) return

  const { data: event, error } = await supabase
    .from('events')
    .insert({ title, memo, day_start, day_end })
    .select('id')
    .single()

  if (error || !event) throw new Error('イベントの作成に失敗しました')

  await supabase.from('slots').insert(
    validDates.map((date_label, position) => ({
      event_id: event.id,
      date_label,
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
