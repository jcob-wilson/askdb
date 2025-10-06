'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'

export default function AccountPage() {
  const { status } = useSession()
  const [summary, setSummary] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [alert, setAlert] = useState<string | null>(null)

  useEffect(() => { if (status === 'unauthenticated') signIn() }, [status])

  useEffect(() => {
    ;(async () => {
      const s = await fetch('/api/usage/summary').then(r => r.json())
      setSummary(s)
      const h = await fetch('/api/usage/history?limit=25').then(r => r.json())
      setHistory(h.items || [])
      if (s?.limits?.perDay && s?.todayCount !== undefined) {
        const ratio = s.todayCount / s.limits.perDay
        if (ratio >= 1) setAlert('You have exceeded your daily query limit.')
        else if (ratio >= 0.8) setAlert('You are nearing your daily query limit.')
      }
    })()
  }, [])

  if (status === 'unauthenticated') return null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-semibold mb-2">Account Usage</h1>
          {summary && (
            <div className="text-sm text-gray-700">
              <div>Plan: <span className="font-medium">{summary.plan}</span></div>
              <div>Today: {summary.todayCount} / {summary.limits.perDay} queries</div>
            </div>
          )}
          {alert && <div className="mt-3 text-sm text-red-600">{alert}</div>}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Queries</h2>
          <div className="space-y-3">
            {history.map((q) => (
              <div key={q._id} className="border rounded p-3">
                <div className="text-xs text-gray-500">{new Date(q.timestamp).toLocaleString()}</div>
                <div className="text-sm">{q.query}</div>
                <div className="text-xs text-gray-500">{q.connectionType} · results: {q.resultCount}</div>
              </div>
            ))}
            {history.length === 0 && <div className="text-sm text-gray-500">No recent activity.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}


