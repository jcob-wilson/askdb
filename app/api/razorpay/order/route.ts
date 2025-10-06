import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await req.json()
    if (!plan || !['pro'].includes(plan)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const key_id = process.env.RAZORPAY_KEY_ID as string
    const key_secret = process.env.RAZORPAY_KEY_SECRET as string
    const pricePaise = Number(process.env.RAZORPAY_PRO_PRICE_PAISE || '190000')
    const rz = new Razorpay({ key_id, key_secret })
    const order = await rz.orders.create({ amount: pricePaise, currency: 'INR', receipt: `pro_${Date.now()}`, notes: { plan, email: session.user.email } })
    return NextResponse.json({ order })
}


