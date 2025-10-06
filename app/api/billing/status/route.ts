import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import clientPromise from '@/lib/mongodb'
import { getPlanForUser } from '@/lib/plans'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = await clientPromise
    const db = client.db()
    const user = await db.collection('users').findOne({ email: session.user.email.toLowerCase() })
    const plan = getPlanForUser(user)
    return NextResponse.json({ plan: plan.id, subscription: user?.subscription || null })
}


