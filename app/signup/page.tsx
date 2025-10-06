'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to create account')
    } else {
      setSuccess('Account created. You can now log in.')
      setTimeout(() => router.push('/login'), 800)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-6">Create account</h1>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-2">{success}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input className="w-full border rounded px-3 py-2" type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button disabled={loading} className="w-full bg-blue-600 text-white rounded px-3 py-2">{loading ? 'Creating...' : 'Sign up'}</button>
        </form>
        <div className="mt-4 text-sm">
          <a href="/login" className="text-blue-600">Have an account? Login</a>
        </div>
      </div>
    </div>
  )
}


