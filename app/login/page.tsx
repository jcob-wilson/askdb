'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useSearchParams()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', { redirect: false, email, password })
    setLoading(false)
    if (res?.error) {
      setError('Invalid credentials')
    } else {
      router.push('/askdb')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-6">Login</h1>
        {params.get('error') && <p className="text-sm text-red-600 mb-2">{params.get('error') as string}</p>}
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input className="w-full border rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full border rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button disabled={loading} className="w-full bg-blue-600 text-white rounded px-3 py-2">{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <div className="my-4 text-center text-sm text-gray-500">or</div>
        <button onClick={() => signIn('google')} className="w-full border rounded px-3 py-2 mb-2">Continue with Google</button>
        <button onClick={() => signIn('github')} className="w-full border rounded px-3 py-2">Continue with GitHub</button>
        <div className="mt-4 text-sm">
          <a href="/signup" className="text-blue-600">Create account</a>
          <span className="mx-2">·</span>
          <a href="/forgot" className="text-blue-600">Forgot password?</a>
        </div>
      </div>
    </div>
  )
}


