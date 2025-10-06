import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import clientPromise from '@/lib/mongodb'
import { sendMail, templates } from '@/lib/email'

export async function POST(req: NextRequest) {
    const payload = Buffer.from(await req.arrayBuffer())
    const signature = req.headers.get('x-razorpay-signature') as string
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    if (expected !== signature) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

    const event = JSON.parse(payload.toString())
    const client = await clientPromise
    const db = client.db()
    const users = db.collection('users')

    if (event.event === 'payment.captured') {
        const email = event.payload?.payment?.entity?.notes?.email
        if (email) {
            await users.updateOne(
                { email: email.toLowerCase() },
                { $set: { plan: 'pro', role: 'subscriber', subscription: { provider: 'razorpay', status: 'active', paymentId: event.payload.payment.entity.id } } },
                { upsert: true }
            )
            try { const t = templates.subscriptionActive(email, 'Razorpay'); await sendMail(email, t.subject, t.html, t.text) } catch { }
        }
    } else if (event.event === 'subscription.cancelled' || event.event === 'payment.failed') {
        const email = event.payload?.payment?.entity?.notes?.email
        if (email) {
            await users.updateOne(
                { email: email.toLowerCase() },
                { $set: { plan: 'free', role: 'free', subscription: { provider: 'razorpay', status: 'canceled', canceledAt: new Date() } } }
            )
            try { const t = templates.subscriptionCanceled(email, 'Razorpay'); await sendMail(email, t.subject, t.html, t.text) } catch { }
        }
    }

    return NextResponse.json({ received: true })
}


