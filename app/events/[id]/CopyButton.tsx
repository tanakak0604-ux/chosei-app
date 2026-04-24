'use client'

import { useState } from 'react'

export default function CopyButton() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <input
        readOnly
        value={typeof window !== 'undefined' ? window.location.href : ''}
        className="flex-1 rounded-lg px-3 py-2 text-xs border truncate outline-none"
        style={{ borderColor: '#E2DDD4', background: '#F5F2EC', color: '#8C8880' }}
      />
      <button
        type="button"
        onClick={copy}
        className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors whitespace-nowrap"
        style={{
          background: copied ? '#6B8F71' : '#2D2A24',
          color: '#F5F2EC',
        }}
      >
        {copied ? 'コピー済 ✓' : 'URLをコピー'}
      </button>
    </div>
  )
}
