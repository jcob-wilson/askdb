import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import clientPromise from '@/lib/mongodb'
import { sendMail, templates } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    const buf = Buffer.from(await req.arrayBuffer())
    const sig = req.headers.get('stripe-signature') as string
    const secret = process.env.STRIPE_WEBHOOK_SECRET as string
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' })

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(buf, sig, secret)
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const users = db.collection('users')

    if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
        const session = event.data.object as any
        const email = session.customer_email || session.customer_details?.email
        if (email) {
            await users.updateOne(
                { email: email.toLowerCase() },
                { $set: { plan: 'pro', role: 'subscriber', subscription: { provider: 'stripe', status: 'active', currentPeriodEnd: session.current_period_end ? new Date(session.current_period_end * 1000) : undefined } } },
                { upsert: true }
            )
            try { const t = templates.subscriptionActive(email, 'Stripe'); await sendMail(email, t.subject, t.html, t.text) } catch { }
        }
    } else if (event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed') {
        const sub = event.data.object as any
        const email = sub.customer_email || sub.customer_details?.email
        if (email) {
            await users.updateOne(
                { email: email.toLowerCase() },
                { $set: { plan: 'free', role: 'free', subscription: { provider: 'stripe', status: 'canceled', canceledAt: new Date() } } }
            )
            try { const t = templates.subscriptionCanceled(email, 'Stripe'); await sendMail(email, t.subject, t.html, t.text) } catch { }
        }
    }

    return NextResponse.json({ received: true })
}


