const toMins = (t: string | undefined | null) => {
  if (!t) return 9 * 60
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

const toTime = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`

export function generateTimeSlots(dayStart: string, dayEnd: string): string[] {
  const slots: string[] = []
  let cur = toMins(dayStart)
  const end = toMins(dayEnd)
  while (cur < end) {
    slots.push(toTime(cur))
    cur += 30
  }
  return slots
}

export function computeOverallRange(slots: { time_start: string; time_end: string }[]): { start: string; end: string } {
  if (slots.length === 0) return { start: '09:00', end: '18:00' }
  const minStart = Math.min(...slots.map(s => toMins(s.time_start)))
  const maxEnd = Math.max(...slots.map(s => toMins(s.time_end)))
  return { start: toTime(minStart), end: toTime(maxEnd) }
}

export function isInRange(time: string, slotStart: string, slotEnd: string): boolean {
  const t = toMins(time)
  return t >= toMins(slotStart) && t < toMins(slotEnd)
}

export function formatDateLabel(dateLabel: string): string {
  const d = new Date(dateLabel + 'T00:00:00')
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  return `${month}/${day}(${weekday})`
}

export function getHeatColor(count: number, total: number): { bg: string; text: string } {
  if (count === 0 || total === 0) return { bg: '#EEEBE4', text: '#B0AA9E' }
  if (count === total) return { bg: '#6B8F71', text: '#FFFFFF' }
  const ratio = count / total
  return {
    bg: `rgba(107, 143, 113, ${ratio * 0.65 + 0.15})`,
    text: ratio >= 0.6 ? '#FFFFFF' : '#2D2A24',
  }
}

export type DateGroup = {
  date_label: string
  ranges: { time_start: string; time_end: string }[]
}

export function groupSlotsByDate(
  slots: { date_label: string; time_start: string; time_end: string }[]
): DateGroup[] {
  const map = new Map<string, DateGroup>()
  slots.forEach(slot => {
    const existing = map.get(slot.date_label)
    if (existing) {
      existing.ranges.push({ time_start: slot.time_start, time_end: slot.time_end })
    } else {
      map.set(slot.date_label, {
        date_label: slot.date_label,
        ranges: [{ time_start: slot.time_start, time_end: slot.time_end }],
      })
    }
  })
  return Array.from(map.values())
}

export function isInAnyRange(
  time: string,
  ranges: { time_start: string; time_end: string }[]
): boolean {
  return ranges.some(r => isInRange(time, r.time_start, r.time_end))
}

export function summarizeSelected(
  selected: Set<string>,
  dateGroups: DateGroup[],
  timeSlots: string[]
): { date: string; ranges: string }[] {
  const result: { date: string; ranges: string }[] = []
  for (const dg of dateGroups) {
    const selectedTimes = timeSlots.filter(t =>
      isInAnyRange(t, dg.ranges) && selected.has(`${dg.date_label}|${t}`)
    )
    if (selectedTimes.length === 0) continue

    const rangeStrs: string[] = []
    let i = 0
    while (i < selectedTimes.length) {
      let j = i
      while (
        j + 1 < selectedTimes.length &&
        toMins(selectedTimes[j + 1]) - toMins(selectedTimes[j]) === 30
      ) j++
      rangeStrs.push(`${selectedTimes[i]}〜${toTime(toMins(selectedTimes[j]) + 30)}`)
      i = j + 1
    }
    result.push({ date: formatDateLabel(dg.date_label), ranges: rangeStrs.join('、') })
  }
  return result
}
