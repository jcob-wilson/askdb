'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => { if (status === 'unauthenticated') signIn() }, [status])
  useEffect(() => {
    ;(async () => {
      const s = await fetch('/api/admin/summary').then(r => r.json()).catch(() => null)
      setSummary(s)
      const u = await fetch('/api/admin/users?limit=50').then(r => r.json()).catch(() => ({ items: [] }))
      setUsers(u.items || [])
    })()
  }, [])

  if (status === 'unauthenticated') return null
  if ((session as any)?.user?.role !== 'admin') return <div className="p-6">Unauthorized</div>

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Users</div>
          <div className="text-2xl font-bold">{summary?.users ?? '-'}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Subscribers</div>
          <div className="text-2xl font-bold">{summary?.subscribers ?? '-'}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Queries (24h)</div>
          <div className="text-2xl font-bold">{summary?.queries24h ?? '-'}</div>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Recent Users</h2>
        <div className="space-y-2">
          {users.map(u => (
            <div key={u._id} className="flex justify-between text-sm border rounded p-2">
              <div>{u.email}</div>
              <div className="text-gray-500">{u.role || 'free'}</div>
            </div>
          ))}
          {users.length === 0 && <div className="text-sm text-gray-500">No data</div>}
        </div>
      </div>
    </div>
  )
}


