import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await req.json()
    if (!plan || !['pro'].includes(plan)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' })
    const priceId = process.env.STRIPE_PRO_PRICE_ID
    if (!priceId) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

    const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const checkout = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: session.user.email,
        success_url: `${origin}/billing?success=1`,
        cancel_url: `${origin}/billing?canceled=1`,
        metadata: { plan },
    })

    return NextResponse.json({ url: checkout.url })
}


