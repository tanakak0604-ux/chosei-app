export type Answer = 'o' | 'd' | 'x'

export interface Event {
  id: string
  title: string
  memo: string | null
  created_at: string
}

export interface Slot {
  id: string
  event_id: string
  date_label: string
  position: number
}

export interface Participant {
  id: string
  event_id: string
  name: string
  created_at: string
}

export interface AnswerRecord {
  id: string
  participant_id: string
  slot_id: string
  answer: Answer
}
