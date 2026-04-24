'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSupabase } from '@/lib/supabase'

export async function createEvent(formData: FormData) {
  const supabase = getSupabase()

  const title = (formData.get('title') as string).trim()
  const memo = (formData.get('memo') as string)?.trim() || null
  const dates = formData.getAll('dates') as string[]
  const validDates = dates.map(d => d.trim()).filter(Boolean)

  if (!title || validDates.length === 0) return

  const { data: event, error } = await supabase
    .from('events')
    .insert({ title, memo })
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

export async function submitResponse(formData: FormData) {
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

  const slotIds = formData.getAll('slot_ids') as string[]

  if (slotIds.length > 0) {
    await supabase.from('answers').insert(
      slotIds.map(slotId => ({
        participant_id: participant.id,
        slot_id: slotId,
        answer: (formData.get(`answer_${slotId}`) as string) || 'x',
      }))
    )
  }

  revalidatePath(`/events/${eventId}`)
  redirect(`/events/${eventId}`)
}
