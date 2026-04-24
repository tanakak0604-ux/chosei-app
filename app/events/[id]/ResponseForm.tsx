'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitResponse } from '@/app/actions'
import type { Slot, Answer } from '@/lib/types'

const OPTIONS: { value: Answer; label: string; color: string; bg: string }[] = [
  { value: 'o', label: '○', color: '#6B8F71', bg: '#6B8F7122' },
  { value: 'd', label: '△', color: '#C8A84A', bg: '#C8A84A22' },
  { value: 'x', label: '×', color: '#C8694A', bg: '#C8694A22' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl font-semibold tracking-wide text-sm transition-transform active:scale-95"
      style={{
        background: '#2D2A24',
        color: '#F5F2EC',
        opacity: pending ? 0.6 : 1,
        cursor: pending ? 'not-allowed' : 'pointer',
      }}
    >
      {pending ? '送信中...' : '回答する'}
    </button>
  )
}

export default function ResponseForm({ eventId, slots }: { eventId: string; slots: Slot[] }) {
  const [answers, setAnswers] = useState<Record<string, Answer>>(
    Object.fromEntries(slots.map(s => [s.id, 'o']))
  )

  const select = (slotId: string, value: Answer) =>
    setAnswers(prev => ({ ...prev, [slotId]: value }))

  return (
    <div
      className="rounded-2xl p-6 border"
      style={{
        background: '#FDFAF5',
        borderColor: '#E2DDD4',
        boxShadow: '0 4px 24px rgba(45,42,36,0.07)',
      }}
    >
      <h2 className="font-semibold mb-5" style={{ color: '#2D2A24' }}>
        回答を追加
      </h2>
      <form action={submitResponse} className="space-y-5">
        <input type="hidden" name="event_id" value={eventId} />
        {slots.map(slot => (
          <input key={slot.id} type="hidden" name="slot_ids" value={slot.id} />
        ))}
        {Object.entries(answers).map(([slotId, ans]) => (
          <input key={slotId} type="hidden" name={`answer_${slotId}`} value={ans} />
        ))}

        <div>
          <label
            className="block text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: '#8C8880' }}
          >
            お名前 <span style={{ color: '#C8694A' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="例: 田中"
            className="w-full rounded-lg px-4 py-2.5 text-sm border outline-none"
            style={{ borderColor: '#E2DDD4', background: '#F5F2EC', color: '#2D2A24' }}
          />
        </div>

        <div>
          <div className="flex items-center mb-2">
            <p className="text-xs font-semibold tracking-widest uppercase flex-1" style={{ color: '#8C8880' }}>
              出欠
            </p>
            <div className="flex gap-4 w-36 text-center">
              {OPTIONS.map(o => (
                <span key={o.value} className="flex-1 text-xs font-bold" style={{ color: o.color }}>
                  {o.label}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {slots.map(slot => {
              const ans = answers[slot.id]
              return (
                <div key={slot.id} className="flex items-center gap-3">
                  <span className="text-sm flex-1" style={{ color: '#2D2A24' }}>
                    {slot.date_label}
                  </span>
                  <div className="flex gap-2 w-36">
                    {OPTIONS.map(o => {
                      const selected = ans === o.value
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => select(slot.id, o.value)}
                          className="flex-1 h-10 rounded-lg font-bold text-base transition-transform active:scale-90"
                          style={{
                            background: selected ? o.bg : 'transparent',
                            color: selected ? o.color : '#B0AA9E',
                            border: `2px solid ${selected ? o.color : '#E2DDD4'}`,
                          }}
                        >
                          {o.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
