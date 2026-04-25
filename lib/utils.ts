export function generateTimeSlots(dayStart: string, dayEnd: string): string[] {
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const toTime = (mins: number) =>
    `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`

  const slots: string[] = []
  let cur = toMins(dayStart)
  const end = toMins(dayEnd)
  while (cur < end) {
    slots.push(toTime(cur))
    cur += 30
  }
  return slots
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
