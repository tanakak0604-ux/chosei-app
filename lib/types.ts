export interface Event {
  id: string
  title: string
  memo: string | null
  day_start: string
  day_end: string
  created_at: string
}

export interface Slot {
  id: string
  event_id: string
  date_label: string
  time_start: string
  time_end: string
  position: number
}

export interface Participant {
  id: string
  event_id: string
  name: string
  created_at: string
}

export interface AvailabilityRecord {
  participant_id: string
  date_label: string
  time_start: string
}
