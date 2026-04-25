'use client'

export default function ErrorPage({ error }: { error: Error }) {
  return (
    <main className="min-h-screen py-12 px-4 flex items-center justify-center" style={{ background: '#F5F2EC' }}>
      <div className="max-w-lg w-full rounded-2xl border p-6" style={{ background: '#FDFAF5', borderColor: '#E2DDD4' }}>
        <h1 className="text-lg font-bold mb-3" style={{ color: '#C8694A' }}>エラーが発生しました</h1>
        <pre className="text-xs p-3 rounded-lg overflow-auto" style={{ background: '#F5F2EC', color: '#2D2A24' }}>
          {error.message}
          {'\n\n'}
          {error.stack}
        </pre>
        <a href="/" className="mt-4 inline-block text-sm font-medium" style={{ color: '#8C8880' }}>
          ← トップへ戻る
        </a>
      </div>
    </main>
  )
}
