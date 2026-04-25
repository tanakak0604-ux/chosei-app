'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createEvent } from './actions'

const DAY_TIME_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const mins = 360 + i * 30
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h >= 24 ? '24:00' : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

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

export default function Home() {
  const [dates, setDates] = useState([''])
  const [dayStart, setDayStart] = useState('09:00')
  const [dayEnd, setDayEnd] = useState('18:00')

  const addDate = () => setDates(d => [...d, ''])
  const removeDate = (i: number) => setDates(d => d.filter((_, j) => j !== i))
  const updateDate = (i: number, value: string) =>
    setDates(d => { const n = [...d]; n[i] = value; return n })

  const today = new Date().toISOString().split('T')[0]

  const startOptions = DAY_TIME_OPTIONS.slice(0, -1)
  const endOptions = DAY_TIME_OPTIONS.slice(1)

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
            <input type="hidden" name="day_start" value={dayStart} />
            <input type="hidden" name="day_end" value={dayEnd} />

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#8C8880' }}>
                イベント名 <span style={{ color: '#C8694A' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="例: ○○打合せ"
                className="w-full rounded-lg px-4 py-2.5 text-sm border outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#8C8880' }}>
                メモ
              </label>
              <textarea
                name="memo"
                rows={2}
                placeholder="備考があれば入力してください"
                className="w-full rounded-lg px-4 py-2.5 text-sm border outline-none resize-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#8C8880' }}>
                時間帯（全日程共通） <span style={{ color: '#C8694A' }}>*</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={dayStart}
                  onChange={e => setDayStart(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2.5 text-sm border outline-none"
                  style={inputStyle}
                >
                  {startOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-sm" style={{ color: '#8C8880' }}>〜</span>
                <select
                  value={dayEnd}
                  onChange={e => setDayEnd(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2.5 text-sm border outline-none"
                  style={inputStyle}
                >
                  {endOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#8C8880' }}>
                日程候補 <span style={{ color: '#C8694A' }}>*</span>
              </label>
              <div className="space-y-2">
                {dates.map((date, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="date"
                      name="dates"
                      value={date}
                      min={today}
                      onChange={e => updateDate(i, e.target.value)}
                      className="flex-1 rounded-lg px-3 py-2.5 text-sm border outline-none"
                      style={inputStyle}
                    />
                    {dates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDate(i)}
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
                  onClick={addDate}
                  className="text-sm font-medium"
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
