'use client'

import { useState } from 'react'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    const res = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    setLoading(false)
    const data = await res.json()
    if (!res.ok) setError(data.error || 'Failed to send email')
    else setMessage('If an account exists, a reset link was sent.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-6">Reset your password</h1>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {message && <p className="text-sm text-green-600 mb-2">{message}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input className="w-full border rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <button disabled={loading} className="w-full bg-blue-600 text-white rounded px-3 py-2">{loading ? 'Sending...' : 'Send reset email'}</button>
        </form>
      </div>
    </div>
  )
}


