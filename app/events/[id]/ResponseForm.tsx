'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitResponse } from '@/app/actions'
import type { Slot, Answer } from '@/lib/types'

const LABEL: Record<Answer, string> = { o: '○', d: '△', x: '×' }
const COLOR: Record<Answer, string> = { o: '#6B8F71', d: '#C8A84A', x: '#C8694A' }

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

  const toggle = (slotId: string) =>
    setAnswers(prev => ({
      ...prev,
      [slotId]: prev[slotId] === 'o' ? 'd' : prev[slotId] === 'd' ? 'x' : 'o',
    }))

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
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: '#8C8880' }}
          >
            出欠（タップで切替: ○→△→×）
          </p>
          <div className="space-y-2">
            {slots.map(slot => {
              const ans = answers[slot.id]
              return (
                <div key={slot.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm flex-1" style={{ color: '#2D2A24' }}>
                    {slot.date_label}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(slot.id)}
                    className="w-11 h-11 rounded-lg font-bold text-lg transition-transform active:scale-90 flex-shrink-0"
                    style={{
                      background: COLOR[ans] + '22',
                      color: COLOR[ans],
                      border: `2px solid ${COLOR[ans]}`,
                    }}
                  >
                    {LABEL[ans]}
                  </button>
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
