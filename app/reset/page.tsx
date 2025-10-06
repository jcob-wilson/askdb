'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const params = useSearchParams()

  const token = params.get('token') || ''

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
    setLoading(false)
    const data = await res.json()
    if (!res.ok) setError(data.error || 'Failed to reset password')
    else {
      setMessage('Password updated. You can sign in now.')
      setTimeout(() => router.push('/login'), 800)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-6">Set a new password</h1>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {message && <p className="text-sm text-green-600 mb-2">{message}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input className="w-full border rounded px-3 py-2" type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button disabled={loading} className="w-full bg-blue-600 text-white rounded px-3 py-2">{loading ? 'Updating...' : 'Update password'}</button>
        </form>
      </div>
    </div>
  )
}


