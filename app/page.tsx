'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createEvent } from './actions'

const TIME_OPTIONS = [
  '時間未定',
  ...Array.from({ length: 32 }, (_, i) => {
    const h = Math.floor(i / 2) + 8
    const m = i % 2 === 0 ? '00' : '30'
    return `${h}:${m}`
  }),
]

function formatSlot(date: string, time: string): string {
  if (!date) return ''
  const d = new Date(date + 'T00:00:00')
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  return time === '時間未定'
    ? `${month}月${day}日(${weekday})`
    : `${month}月${day}日(${weekday}) ${time}`
}

const inputStyle = {
  borderColor: '#E2DDD4',
  background: '#F5F2EC',
  color: '#2D2A24',
}

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
      {pending ? '作成中...' : 'イベントを作成する →'}
    </button>
  )
}

type Slot = { date: string; time: string }

export default function Home() {
  const [slots, setSlots] = useState<Slot[]>([{ date: '', time: '19:00' }])

  const addSlot = () => setSlots(s => [...s, { date: '', time: '19:00' }])
  const removeSlot = (i: number) => setSlots(s => s.filter((_, j) => j !== i))
  const updateSlot = (i: number, field: keyof Slot, value: string) =>
    setSlots(s => { const n = [...s]; n[i] = { ...n[i], [field]: value }; return n })

  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="min-h-screen py-12 px-4" style={{ background: '#F5F2EC' }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: '#2D2A24' }}>
            日程調整
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8C8880' }}>
            イベントを作成して参加者に共有しましょう
          </p>
        </div>

        <div
          className="rounded-2xl p-8 border"
          style={{
            background: '#FDFAF5',
            borderColor: '#E2DDD4',
            boxShadow: '0 4px 24px rgba(45,42,36,0.07)',
          }}
        >
          <form action={createEvent} className="space-y-6">
            {/* 送信用の隠しフィールド（日付＋時間を整形した文字列） */}
            {slots.map((slot, i) => (
              <input
                key={i}
                type="hidden"
                name="dates"
                value={formatSlot(slot.date, slot.time)}
              />
            ))}

            <div>
              <label
                className="block text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: '#8C8880' }}
              >
                イベント名 <span style={{ color: '#C8694A' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="例: チーム飲み会"
                className="w-full rounded-lg px-4 py-2.5 text-sm border outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: '#8C8880' }}
              >
                メモ
              </label>
              <textarea
                name="memo"
                rows={3}
                placeholder="備考があれば入力してください"
                className="w-full rounded-lg px-4 py-2.5 text-sm border outline-none resize-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: '#8C8880' }}
              >
                日程候補 <span style={{ color: '#C8694A' }}>*</span>
              </label>
              <div className="space-y-2">
                {slots.map((slot, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={slot.date}
                      min={today}
                      onChange={e => updateSlot(i, 'date', e.target.value)}
                      className="flex-1 rounded-lg px-3 py-2.5 text-sm border outline-none"
                      style={inputStyle}
                    />
                    <select
                      value={slot.time}
                      onChange={e => updateSlot(i, 'time', e.target.value)}
                      className="rounded-lg px-3 py-2.5 text-sm border outline-none"
                      style={{ ...inputStyle, minWidth: '100px' }}
                    >
                      {TIME_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(i)}
                        className="px-3 py-2.5 rounded-lg text-sm font-medium flex-shrink-0"
                        style={{ color: '#8C8880', background: '#E2DDD4' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSlot}
                  className="text-sm font-medium mt-1"
                  style={{ color: '#C8694A' }}
                >
                  + 日程を追加
                </button>
              </div>
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </main>
  )
}
