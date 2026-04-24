'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createEvent } from './actions'

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

  const addDate = () => setDates(d => [...d, ''])
  const removeDate = (i: number) => setDates(d => d.filter((_, j) => j !== i))
  const updateDate = (i: number, value: string) =>
    setDates(d => { const n = [...d]; n[i] = value; return n })

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
                style={{ borderColor: '#E2DDD4', background: '#F5F2EC', color: '#2D2A24' }}
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
                style={{ borderColor: '#E2DDD4', background: '#F5F2EC', color: '#2D2A24' }}
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
                {dates.map((date, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      name="dates"
                      value={date}
                      onChange={e => updateDate(i, e.target.value)}
                      placeholder="例: 5月3日 19:00"
                      className="flex-1 rounded-lg px-4 py-2.5 text-sm border outline-none"
                      style={{ borderColor: '#E2DDD4', background: '#F5F2EC', color: '#2D2A24' }}
                    />
                    {dates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDate(i)}
                        className="px-3 rounded-lg text-sm font-medium transition-colors"
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
