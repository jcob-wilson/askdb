'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'

export default function BillingPage() {
  const { status } = useSession()
  const [plan, setPlan] = useState('free')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') signIn()
  }, [status])

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/billing/status')
      if (res.ok) {
        const data = await res.json()
        setPlan(data.plan)
      }
    })()
  }, [])

  if (status === 'unauthenticated') return null

  const startStripe = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'pro' }) })
    setLoading(false)
    const data = await res.json()
    if (res.ok && data.url) window.location.href = data.url
  }

  const startRazorpay = async () => {
    setLoading(true)
    const res = await fetch('/api/razorpay/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'pro' }) })
    setLoading(false)
    const data = await res.json()
    if (res.ok && data.order) {
      const order = data.order
      // Simple redirect flow: send to Razorpay payment page via checkout.js if available
      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string
      const r = (window as any).Razorpay ? new (window as any).Razorpay({ key, order_id: order.id }) : null
      if (r) r.open()
      else setMessage('Order created. Integrate Razorpay Checkout.js on this page to complete payment.')
    }
  }

  const cancel = async () => {
    setLoading(true)
    const res = await fetch('/api/billing/cancel', { method: 'POST' })
    setLoading(false)
    if (res.ok) setPlan('free')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-3xl grid md:grid-cols-3 gap-6">
        <div className={`bg-white p-6 rounded-lg shadow ${plan==='free'?'ring-2 ring-blue-500':''}`}>
          <h2 className="text-lg font-semibold">Free</h2>
          <p className="text-sm text-gray-500 mb-4">Basic usage</p>
          <ul className="text-sm text-gray-700 mb-6 list-disc pl-5">
            <li>Sample DB only</li>
            <li>25 queries/day</li>
          </ul>
          {plan==='free' ? <div className="text-xs text-gray-500">Current plan</div> : <button onClick={cancel} className="border rounded px-3 py-2 w-full">Downgrade</button>}
        </div>
        <div className={`bg-white p-6 rounded-lg shadow ${plan==='pro'?'ring-2 ring-blue-500':''}`}>
          <h2 className="text-lg font-semibold">Pro</h2>
          <p className="text-sm text-gray-500 mb-4">$19/month</p>
          <ul className="text-sm text-gray-700 mb-6 list-disc pl-5">
            <li>Real DB connections</li>
            <li>High query limits</li>
          </ul>
          {plan==='pro' ? <div className="text-xs text-gray-500">Current plan</div> : (
            <div className="space-y-2">
              <button disabled={loading} onClick={startStripe} className="bg-blue-600 text-white rounded px-3 py-2 w-full">Subscribe with Stripe</button>
              <button disabled={loading} onClick={startRazorpay} className="border rounded px-3 py-2 w-full">Subscribe with Razorpay</button>
            </div>
          )}
        </div>
        <div className={`bg-white p-6 rounded-lg shadow ${plan==='enterprise'?'ring-2 ring-blue-500':''}`}>
          <h2 className="text-lg font-semibold">Enterprise</h2>
          <p className="text-sm text-gray-500 mb-4">Custom</p>
          <ul className="text-sm text-gray-700 mb-6 list-disc pl-5">
            <li>SLA + SSO</li>
            <li>Unlimited usage</li>
          </ul>
          <a href="mailto:sales@example.com" className="border rounded px-3 py-2 w-full inline-block text-center">Contact sales</a>
        </div>
      </div>
      {message && <div className="fixed bottom-4 text-sm text-gray-700">{message}</div>}
    </div>
  )
}


